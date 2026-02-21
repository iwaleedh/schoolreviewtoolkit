import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all LT scores for a school
export const getAll = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const scores = await ctx.db
            .query("ltScores")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();
        // Transform to { [indicatorCode]: { [ltColumn]: value } } format
        const result: Record<string, Record<string, number | string | null>> = {};

        for (const score of scores) {
            if (!result[score.indicatorCode]) {
                result[score.indicatorCode] = {};
            }
            result[score.indicatorCode][score.ltColumn] = score.value;
        }

        return result;
    },
});

// Set a single LT score
export const set = mutation({
    args: {
        indicatorCode: v.string(),
        ltColumn: v.string(),
        value: v.union(v.number(), v.literal("NA"), v.literal("NR"), v.null()),
        source: v.string(),
        schoolId: v.string(),
    },
    handler: async (ctx, args) => {
        // Check if score already exists for this school
        const existing = await ctx.db
            .query("ltScores")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .filter((q) =>
                q.and(
                    q.eq(q.field("indicatorCode"), args.indicatorCode),
                    q.eq(q.field("ltColumn"), args.ltColumn)
                )
            )
            .first();

        if (existing) {
            await ctx.db.patch(existing._id, {
                value: args.value,
                source: args.source,
            });
        } else {
            await ctx.db.insert("ltScores", {
                indicatorCode: args.indicatorCode,
                ltColumn: args.ltColumn,
                value: args.value,
                source: args.source,
                schoolId: args.schoolId,
            });
        }
    },
});

// Set multiple LT scores at once (batch save)
export const setMultiple = mutation({
    args: {
        scores: v.array(v.object({
            indicatorCode: v.string(),
            ltColumn: v.string(),
            value: v.union(v.number(), v.literal("NA"), v.literal("NR"), v.null()),
        })),
        source: v.string(),
        schoolId: v.string(),
    },
    handler: async (ctx, args) => {
        for (const score of args.scores) {
            // Check if score already exists for this school
            const existing = await ctx.db
                .query("ltScores")
                .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
                .filter((q) =>
                    q.and(
                        q.eq(q.field("indicatorCode"), score.indicatorCode),
                        q.eq(q.field("ltColumn"), score.ltColumn)
                    )
                )
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, {
                    value: score.value,
                    source: args.source,
                });
            } else {
                await ctx.db.insert("ltScores", {
                    indicatorCode: score.indicatorCode,
                    ltColumn: score.ltColumn,
                    value: score.value,
                    source: args.source,
                    schoolId: args.schoolId,
                });
            }
        }
        return { count: args.scores.length };
    },
});

// Clear all LT scores for a school
export const clearAll = mutation({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const allScores = await ctx.db
            .query("ltScores")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();
        for (const score of allScores) {
            await ctx.db.delete(score._id);
        }
    },
});
