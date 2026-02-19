import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Get all parent survey responses
export const getAll = query({
    handler: async (ctx) => {
        const responses = await ctx.db.query("parentSurveyResponses").collect();

        // Group by parentId
        const grouped = new Map<string, Record<string, number>>();
        const statuses = new Map<string, string | undefined>();
        responses.forEach((r) => {
            if (!grouped.has(r.parentId)) {
                grouped.set(r.parentId, {});
            }
            grouped.get(r.parentId)![r.indicatorCode] = r.rating;
            // Use the status from the first record we encounter for this parent
            if (!statuses.has(r.parentId)) {
                statuses.set(r.parentId, r.status);
            }
        });

        const statusMap: Record<string, string | undefined> = Object.fromEntries(statuses);
        return { responses: Object.fromEntries(grouped), statuses: statusMap };
    },
});

// Get responses for a specific parent
export const getByParentId = query({
    args: { parentId: v.string() },
    handler: async (ctx, { parentId }) => {
        const responses = await ctx.db
            .query("parentSurveyResponses")
            .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
            .collect();

        const ratings: Record<string, number> = {};
        responses.forEach((r) => {
            ratings[r.indicatorCode] = r.rating;
        });

        return { parentId, ratings };
    },
});

// Set a single rating (for manual entry)
export const setRating = mutation({
    args: {
        parentId: v.string(),
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
    },
    handler: async (ctx, { parentId, indicatorCode, rating }) => {
        // Check if response already exists
        const existing = await ctx.db
            .query("parentSurveyResponses")
            .withIndex("by_parentId_indicatorCode", (q) =>
                q.eq("parentId", parentId).eq("indicatorCode", indicatorCode)
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
            await ctx.db.insert("parentSurveyResponses", {
                parentId,
                indicatorCode,
                rating,
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
        parentId: v.string(),
        responses: v.array(
            v.object({
                indicatorCode: v.string(),
                rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
            })
        ),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, { parentId, responses, comment }) => {
        for (const r of responses) {
            const existing = await ctx.db
                .query("parentSurveyResponses")
                .withIndex("by_parentId_indicatorCode", (q) =>
                    q.eq("parentId", parentId).eq("indicatorCode", r.indicatorCode)
                )
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    rating: r.rating,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            } else {
                await ctx.db.insert("parentSurveyResponses", {
                    parentId,
                    indicatorCode: r.indicatorCode,
                    rating: r.rating,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            }
        }

        // Save comment if provided
        if (comment !== undefined) {
            const parentRecord = await ctx.db
                .query("parents")
                .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
                .first();

            if (parentRecord) {
                await ctx.db.patch(parentRecord._id, { comment });
            }
        }

        return { success: true, count: responses.length };
    },
});

// Delete a parent's responses
export const deleteParent = mutation({
    args: { parentId: v.string() },
    handler: async (ctx, { parentId }) => {
        const responses = await ctx.db
            .query("parentSurveyResponses")
            .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
            .collect();

        for (const r of responses) {
            await ctx.db.delete(r._id);
        }

        return { success: true, deleted: responses.length };
    },
});

// Get all parents with their comments
export const getAllWithComments = query({
    handler: async (ctx) => {
        const parents = await ctx.db.query("parents").collect();

        // Filter only parents with comments and sort by creation date
        const parentsWithComments = parents
            .filter((p) => p.comment && p.comment.trim() !== "")
            .sort((a, b) => b.created - a.created)
            .map((p) => ({
                parentId: p.parentId,
                studentName: p.studentName,
                comment: p.comment,
                created: p.created,
            }));

        return { parents: parentsWithComments };
    },
});

// Get statistics for all responses
export const getStats = query({
    handler: async (ctx) => {
        const responses = await ctx.db.query("parentSurveyResponses").collect();

        const stats = {
            totalParents: new Set(responses.map((r) => r.parentId)).size,
            totalResponses: responses.length,
            byRating: { 1: 0, 2: 0, 3: 0 },
        };

        responses.forEach((r) => {
            stats.byRating[r.rating]++;
        });

        return stats;
    },
});

// Set accept/reject status for a parent
export const setParentStatus = mutation({
    args: {
        parentId: v.string(),
        status: v.union(v.literal("accepted"), v.literal("rejected"), v.null()),
    },
    handler: async (ctx, { parentId, status }) => {
        const responses = await ctx.db
            .query("parentSurveyResponses")
            .withIndex("by_parentId", (q) => q.eq("parentId", parentId))
            .collect();

        for (const r of responses) {
            await ctx.db.patch(r._id, {
                status: status ?? undefined,
            });
        }

        return { success: true, updated: responses.length };
    },
});

// Save manual responses (bulk update)
// Sets isOnline: false for new entries
export const saveManualResponses = mutation({
    args: {
        updates: v.array(
            v.object({
                parentId: v.string(),
                indicatorCode: v.string(),
                rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
            })
        ),
    },
    handler: async (ctx, { updates }) => {
        let count = 0;
        for (const update of updates) {
            const existing = await ctx.db
                .query("parentSurveyResponses")
                .withIndex("by_parentId_indicatorCode", (q) =>
                    q.eq("parentId", update.parentId).eq("indicatorCode", update.indicatorCode)
                )
                .first();

            if (existing) {
                // Update existing - preserve isOnline status or force to false?
                // For manual entry, we probably want to keep it as is or mark as manual?
                // Let's preserve isOnline status to respect source.
                await ctx.db.patch(existing._id, {
                    rating: update.rating,
                    submittedAt: Date.now(),
                });
            } else {
                // Create new
                await ctx.db.insert("parentSurveyResponses", {
                    parentId: update.parentId,
                    indicatorCode: update.indicatorCode,
                    rating: update.rating,
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

// Create a new parent record
export const createParent = mutation({
    args: {
        studentName: v.string(),
        grade: v.optional(v.string()),
    },
    handler: async (ctx, { studentName, grade }) => {
        // Generate a random ID part
        const randomPart = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const timestamp = Date.now();
        // ID format: P-{timestamp part}-{random}
        const timePart = timestamp.toString().slice(-6);
        const parentId = `P-${timePart}-${randomPart}`;

        await ctx.db.insert("parents", {
            parentId,
            studentName,
            grade,
            created: timestamp,
        });

        return parentId;
    },
});

// Get all parents for admin view
export const getParents = query({
    handler: async (ctx) => {
        return await ctx.db.query("parents").collect();
    },
});
