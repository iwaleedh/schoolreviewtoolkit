import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all indicator scores for a school
export const getAll = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const scores = await ctx.db
            .query("indicatorScores")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();
        // Transform to { [indicatorCode]: value } format for frontend compatibility
        const result: Record<string, string | null> = {};
        const sources: Record<string, string> = {};

        for (const score of scores) {
            result[score.indicatorCode] = score.value;
            sources[score.indicatorCode] = score.source;
        }

        return { scores: result, sources };
    },
});

// Set a single indicator score
export const set = mutation({
    args: {
        indicatorCode: v.string(),
        value: v.union(v.literal("yes"), v.literal("no"), v.literal("nr"), v.null()),
        source: v.string(),
        schoolId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if score already exists for this school
        const existing = await ctx.db
            .query("indicatorScores")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .filter((q) => q.eq(q.field("indicatorCode"), args.indicatorCode))
            .first();

        if (existing) {
            // Update existing score
            await ctx.db.patch(existing._id, {
                value: args.value,
                source: args.source,
            });
        } else {
            // Create new score
            await ctx.db.insert("indicatorScores", {
                indicatorCode: args.indicatorCode,
                value: args.value,
                source: args.source,
                schoolId: args.schoolId,
            });
        }
    },
});

// Set multiple indicator scores at once
export const setMultiple = mutation({
    args: {
        scores: v.array(
            v.object({
                indicatorCode: v.string(),
                value: v.union(v.literal("yes"), v.literal("no"), v.literal("nr"), v.null()),
            })
        ),
        source: v.string(),
        schoolId: v.string(),
    },
    handler: async (ctx, args) => {
        for (const score of args.scores) {
            const existing = await ctx.db
                .query("indicatorScores")
                .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
                .filter((q) => q.eq(q.field("indicatorCode"), score.indicatorCode))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    value: score.value,
                    source: args.source,
                });
            } else {
                await ctx.db.insert("indicatorScores", {
                    indicatorCode: score.indicatorCode,
                    value: score.value,
                    source: args.source,
                    schoolId: args.schoolId,
                });
            }
        }
    },
});

// Clear all indicator scores for a school
export const clearAll = mutation({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const allScores = await ctx.db
            .query("indicatorScores")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();
        for (const score of allScores) {
            await ctx.db.delete(score._id);
        }
    },
});
