import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all indicator scores
export const getAll = query({
    args: {},
    handler: async (ctx) => {
        const scores = await ctx.db.query("indicatorScores").collect();
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
    },
    handler: async (ctx, args) => {
        // Check if score already exists
        const existing = await ctx.db
            .query("indicatorScores")
            .withIndex("by_indicatorCode", (q) => q.eq("indicatorCode", args.indicatorCode))
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
    },
    handler: async (ctx, args) => {
        for (const score of args.scores) {
            const existing = await ctx.db
                .query("indicatorScores")
                .withIndex("by_indicatorCode", (q) => q.eq("indicatorCode", score.indicatorCode))
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
                });
            }
        }
    },
});

// Clear all indicator scores
export const clearAll = mutation({
    args: {},
    handler: async (ctx) => {
        const allScores = await ctx.db.query("indicatorScores").collect();
        for (const score of allScores) {
            await ctx.db.delete(score._id);
        }
    },
});
