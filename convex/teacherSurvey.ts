import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new teacher entry for a school
export const createTeacher = mutation({
    args: {
        name: v.string(),
        subject: v.optional(v.string()),
        schoolId: v.string(),
    },
    handler: async (ctx, { name, subject, schoolId }) => {
        const teacherId = `T-${Date.now()}`;
        await ctx.db.insert("teachers", {
            teacherId,
            teacherName: name,
            subject: subject || "",
            schoolId,
            created: Date.now(),
        });
        return teacherId;
    },
});

// Get all teacher survey responses for a school
export const getAll = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const responses = await ctx.db
            .query("teacherSurveyResponses")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();

        // Group by teacherId
        const grouped = new Map();
        responses.forEach((r) => {
            if (!grouped.has(r.teacherId)) {
                grouped.set(r.teacherId, {});
            }
            grouped.get(r.teacherId)[r.indicatorCode] = r.rating;
        });

        return { responses: Object.fromEntries(grouped) };
    },
});

// Get responses for a specific teacher
export const getByTeacherId = query({
    args: { teacherId: v.string() },
    handler: async (ctx, { teacherId }) => {
        const responses = await ctx.db
            .query("teacherSurveyResponses")
            .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
            .collect();

        const ratings: Record<string, number> = {};
        responses.forEach((r) => {
            ratings[r.indicatorCode] = r.rating;
        });

        return { teacherId, ratings };
    },
});

// Set a single rating (for manual entry)
export const setRating = mutation({
    args: {
        teacherId: v.string(),
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
        schoolId: v.string(),
    },
    handler: async (ctx, { teacherId, indicatorCode, rating, schoolId }) => {
        // Check if response already exists
        const existing = await ctx.db
            .query("teacherSurveyResponses")
            .withIndex("by_teacherId_indicatorCode", (q) =>
                q.eq("teacherId", teacherId).eq("indicatorCode", indicatorCode)
            )
            .first();

        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                rating,
                submittedAt: Date.now(),
            });
        } else {
            // Create new
            await ctx.db.insert("teacherSurveyResponses", {
                teacherId,
                indicatorCode,
                rating,
                schoolId,
                submittedAt: Date.now(),
                isOnline: false,
            });
        }

        return { success: true };
    },
});

// Submit online survey (public endpoint)
export const submitOnlineSurvey = mutation({
    args: {
        teacherId: v.string(),
        schoolId: v.string(),
        responses: v.array(
            v.object({
                indicatorCode: v.string(),
                rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
            })
        ),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, { teacherId, schoolId, responses, comment }) => {
        for (const r of responses) {
            const existing = await ctx.db
                .query("teacherSurveyResponses")
                .withIndex("by_teacherId_indicatorCode", (q) =>
                    q.eq("teacherId", teacherId).eq("indicatorCode", r.indicatorCode)
                )
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    rating: r.rating,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            } else {
                await ctx.db.insert("teacherSurveyResponses", {
                    teacherId,
                    indicatorCode: r.indicatorCode,
                    rating: r.rating,
                    schoolId,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            }
        }

        // Save comment if provided
        if (comment !== undefined) {
            const teacherRecord = await ctx.db
                .query("teachers")
                .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
                .first();

            if (teacherRecord) {
                await ctx.db.patch(teacherRecord._id, { comment });
            }
        }

        return { success: true, count: responses.length };
    },
});

// Delete a teacher's responses
export const deleteTeacher = mutation({
    args: { teacherId: v.string() },
    handler: async (ctx, { teacherId }) => {
        const responses = await ctx.db
            .query("teacherSurveyResponses")
            .withIndex("by_teacherId", (q) => q.eq("teacherId", teacherId))
            .collect();

        for (const r of responses) {
            await ctx.db.delete(r._id);
        }

        return { success: true, deleted: responses.length };
    },
});

// Get all teachers with their comments for a school
export const getAllWithComments = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const teachers = await ctx.db
            .query("teachers")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();

        // Filter only teachers with comments and sort by creation date
        const teachersWithComments = teachers
            .filter((t) => t.comment && t.comment.trim() !== "")
            .sort((a, b) => b.created - a.created)
            .map((t) => ({
                teacherId: t.teacherId,
                teacherName: t.teacherName,
                subject: t.subject,
                comment: t.comment,
                created: t.created,
            }));

        return { teachers: teachersWithComments };
    },
});

// Get statistics for all responses for a school
export const getStats = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const responses = await ctx.db
            .query("teacherSurveyResponses")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();

        const stats = {
            totalTeachers: new Set(responses.map((r) => r.teacherId)).size,
            totalResponses: responses.length,
            byRating: { 1: 0, 2: 0, 3: 0 },
        };

        responses.forEach((r) => {
            // @ts-ignore
            stats.byRating[r.rating]++;
        });

        return stats;
    },
});
// Save manual responses (bulk update)
// Sets isOnline: false for new entries
export const saveManualResponses = mutation({
    args: {
        updates: v.array(
            v.object({
                teacherId: v.string(),
                indicatorCode: v.string(),
                rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
            })
        ),
        schoolId: v.string(),
    },
    handler: async (ctx, { updates, schoolId }) => {
        let count = 0;
        for (const update of updates) {
            const existing = await ctx.db
                .query("teacherSurveyResponses")
                .withIndex("by_teacherId_indicatorCode", (q) =>
                    q.eq("teacherId", update.teacherId).eq("indicatorCode", update.indicatorCode)
                )
                .first();

            if (existing) {
                // Update existing
                await ctx.db.patch(existing._id, {
                    rating: update.rating,
                    submittedAt: Date.now(),
                });
            } else {
                // Create new
                await ctx.db.insert("teacherSurveyResponses", {
                    teacherId: update.teacherId,
                    indicatorCode: update.indicatorCode,
                    rating: update.rating,
                    schoolId,
                    submittedAt: Date.now(),
                    isOnline: false,
                });
            }
            count++;
        }
        return { success: true, count };
    },
});

// Get a setting value
export const getSetting = query({
    args: { key: v.string() },
    handler: async (ctx, { key }) => {
        const setting = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first();
        return setting?.value;
    },
});

// Update a setting value
export const updateSetting = mutation({
    args: {
        key: v.string(),
        value: v.any(),
    },
    handler: async (ctx, { key, value }) => {
        const existing = await ctx.db
            .query("settings")
            .withIndex("by_key", (q) => q.eq("key", key))
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, { value });
        } else {
            await ctx.db.insert("settings", { key, value });
        }
        return { success: true };
    },
});
