import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all comments for a school
export const getAll = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("indicatorComments")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();
        // Transform to { [indicatorCode]: comment } format
        const result: Record<string, string> = {};

        for (const item of comments) {
            result[item.indicatorCode] = item.comment;
        }

        return result;
    },
});

// Set a comment for an indicator
export const set = mutation({
    args: {
        indicatorCode: v.string(),
        comment: v.string(),
        schoolId: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("indicatorComments")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .filter((q) => q.eq(q.field("indicatorCode"), args.indicatorCode))
            .first();

        if (existing) {
            if (args.comment === "") {
                // Delete if empty comment
                await ctx.db.delete(existing._id);
            } else {
                await ctx.db.patch(existing._id, { comment: args.comment });
            }
        } else if (args.comment !== "") {
            await ctx.db.insert("indicatorComments", {
                indicatorCode: args.indicatorCode,
                comment: args.comment,
                schoolId: args.schoolId,
            });
        }
    },
});

// Clear all comments for a school
export const clearAll = mutation({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const allComments = await ctx.db
            .query("indicatorComments")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .collect();
        for (const comment of allComments) {
            await ctx.db.delete(comment._id);
        }
    },
});
