import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get a school profile by school ID
 */
export const getBySchool = query({
    args: { schoolId: v.string() },
    handler: async (ctx, args) => {
        const profile = await ctx.db
            .query("schoolProfiles")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .first();

        return profile;
    },
});

/**
 * Patch update a school profile (creates if it doesn't exist)
 */
export const updateFields = mutation({
    args: {
        schoolId: v.string(),
        updates: v.any(), // Object containing field: value pairs to update
        updatedBy: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("schoolProfiles")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", args.schoolId))
            .first();

        const now = Date.now();

        if (existing) {
            // Merge existing data with updates
            const mergedData = {
                ...existing.data,
                ...args.updates
            };

            await ctx.db.patch(existing._id, {
                data: mergedData,
                lastUpdatedBy: args.updatedBy,
                lastUpdatedAt: now
            });

            return existing._id;
        } else {
            // Create new profile record
            const newId = await ctx.db.insert("schoolProfiles", {
                schoolId: args.schoolId,
                data: args.updates,
                lastUpdatedBy: args.updatedBy,
                lastUpdatedAt: now
            });
            return newId;
        }
    },
});
