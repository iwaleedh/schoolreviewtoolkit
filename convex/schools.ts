import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all schools
 */
export const listSchools = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("schools").order("desc").collect();
    },
});

/**
 * Create a new school
 */
export const createSchool = mutation({
    args: {
        schoolId: v.string(),
        name: v.string(),
        nameDv: v.optional(v.string()),
        atoll: v.string(),
        island: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { schoolId, name, nameDv, atoll, island, isActive } = args;

        // Check if schoolId already exists
        const existingSchool = await ctx.db
            .query("schools")
            .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
            .first();

        if (existingSchool) {
            throw new Error(`School with ID ${schoolId} already exists.`);
        }

        const newSchoolId = await ctx.db.insert("schools", {
            schoolId,
            name,
            nameDv,
            atoll,
            island,
            isActive,
            createdAt: Date.now(),
        });

        return newSchoolId;
    },
});

/**
 * Update an existing school
 */
export const updateSchool = mutation({
    args: {
        id: v.id("schools"),
        schoolId: v.string(),
        name: v.string(),
        nameDv: v.optional(v.string()),
        atoll: v.string(),
        island: v.string(),
        isActive: v.boolean(),
    },
    handler: async (ctx, args) => {
        const { id, schoolId, name, nameDv, atoll, island, isActive } = args;

        // Verify it isn't taking another school's ID if changed
        const existingSchoolInfo = await ctx.db.get(id);
        if (!existingSchoolInfo) {
            throw new Error("School not found.");
        }

        if (existingSchoolInfo.schoolId !== schoolId) {
            const conflict = await ctx.db
                .query("schools")
                .withIndex("by_schoolId", (q) => q.eq("schoolId", schoolId))
                .first();

            if (conflict) {
                throw new Error(`School with ID ${schoolId} already exists.`);
            }
        }

        await ctx.db.patch(id, {
            schoolId,
            name,
            nameDv,
            atoll,
            island,
            isActive,
        });

        return { success: true };
    },
});

/**
 * Delete a school
 */
export const deleteSchool = mutation({
    args: {
        id: v.id("schools"),
    },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
        return { success: true };
    },
});
