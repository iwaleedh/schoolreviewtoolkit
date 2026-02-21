import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new student entry for a school
export const createStudent = mutation({
    args: {
        name: v.string(),
        grade: v.optional(v.string()),
        schoolId: v.string(),
    },
    handler: async (ctx, { name, grade, schoolId }) => {
        const studentId = `S-${Date.now()}`;
        await ctx.db.insert("students", {
            studentId,
            studentName: name,
            grade: grade || "",
            schoolId,
            created: Date.now(),
        });
        return studentId;
    },
});

// Get all student survey responses for a school
export const getAll = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const responses = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();

        // Group by studentId
        const grouped = new Map();
        responses.forEach((r) => {
            if (!grouped.has(r.studentId)) {
                grouped.set(r.studentId, {});
            }
            grouped.get(r.studentId)[r.indicatorCode] = r.rating;
        });

        return { responses: Object.fromEntries(grouped) };
    },
});

// Get responses for a specific student
export const getByStudentId = query({
    args: { studentId: v.string() },
    handler: async (ctx, { studentId }) => {
        const responses = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
            .collect();

        const ratings: Record<string, number> = {};
        responses.forEach((r) => {
            ratings[r.indicatorCode] = r.rating;
        });

        return { studentId, ratings };
    },
});

// Set a single rating (for manual entry)
export const setRating = mutation({
    args: {
        studentId: v.string(),
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
        schoolId: v.string(),
    },
    handler: async (ctx, { studentId, indicatorCode, rating, schoolId }) => {
        // Check if response already exists
        const existing = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_studentId_indicatorCode", (q) =>
                q.eq("studentId", studentId).eq("indicatorCode", indicatorCode)
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
            await ctx.db.insert("studentSurveyResponses", {
                studentId,
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
        studentId: v.string(),
        schoolId: v.string(),
        responses: v.array(
            v.object({
                indicatorCode: v.string(),
                rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
            })
        ),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, { studentId, schoolId, responses, comment }) => {
        for (const r of responses) {
            const existing = await ctx.db
                .query("studentSurveyResponses")
                .withIndex("by_studentId_indicatorCode", (q) =>
                    q.eq("studentId", studentId).eq("indicatorCode", r.indicatorCode)
                )
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    rating: r.rating,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            } else {
                await ctx.db.insert("studentSurveyResponses", {
                    studentId,
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
            const studentRecord = await ctx.db
                .query("students")
                .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
                .first();

            if (studentRecord) {
                await ctx.db.patch(studentRecord._id, { comment });
            }
        }

        return { success: true, count: responses.length };
    },
});

// Delete a student's responses
export const deleteStudent = mutation({
    args: { studentId: v.string() },
    handler: async (ctx, { studentId }) => {
        const responses = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
            .collect();

        for (const r of responses) {
            await ctx.db.delete(r._id);
        }

        return { success: true, deleted: responses.length };
    },
});

// Get all students with their comments for a school
export const getAllWithComments = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const students = await ctx.db
            .query("students")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();

        // Filter only students with comments and sort by creation date
        const studentsWithComments = students
            .filter((s) => s.comment && s.comment.trim() !== "")
            .sort((a, b) => b.created - a.created)
            .map((s) => ({
                studentId: s.studentId,
                studentName: s.studentName,
                grade: s.grade,
                comment: s.comment,
                created: s.created,
            }));

        return { students: studentsWithComments };
    },
});

// Get statistics for all responses for a school
export const getStats = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const responses = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();

        const stats = {
            totalStudents: new Set(responses.map((r) => r.studentId)).size,
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
                studentId: v.string(),
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
                .query("studentSurveyResponses")
                .withIndex("by_studentId_indicatorCode", (q) =>
                    q.eq("studentId", update.studentId).eq("indicatorCode", update.indicatorCode)
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
                await ctx.db.insert("studentSurveyResponses", {
                    studentId: update.studentId,
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
