import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./auth"; // Will need to export hashPassword from auth.ts

/**
 * Get all users
 */
export const listUsers = query({
    args: {},
    handler: async (ctx) => {
        // Return all users, omitting password hashes
        const users = await ctx.db.query("users").order("desc").collect();
        return users.map(user => ({
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            assignedSchools: user.assignedSchools || [],
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            createdBy: user.createdBy,
        }));
    },
});

/**
 * Update an existing user
 */
export const updateUser = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
        role: v.union(v.literal("ADMIN"), v.literal("ANALYST"), v.literal("PRINCIPAL")),
        schoolId: v.optional(v.union(v.string(), v.null())),
        assignedSchools: v.optional(v.array(v.string())),
        isActive: v.boolean(),
        password: v.optional(v.string()), // Optional new password from admin
    },
    handler: async (ctx, args) => {
        const { userId, name, role, schoolId, assignedSchools, isActive, password } = args;

        const updateData: any = {
            name,
            role,
            schoolId: schoolId || undefined,
            assignedSchools: assignedSchools || [],
            isActive,
        };

        // If a new password is provided by the admin, hash and update it
        // We'll export hashPassword from auth.ts for this
        if (password) {
            updateData.passwordHash = await hashPassword(password);

            // If password changed or user deactivated, we should ideally invalidate their sessions.
            // But we'll keep it simple for now, or just handle invalidation manually.
            if (!isActive || password) {
                const sessions = await ctx.db
                    .query("sessions")
                    .withIndex("by_userId", (q) => q.eq("userId", userId as string))
                    .collect();

                for (const session of sessions) {
                    await ctx.db.delete(session._id);
                }
            }
        } else if (!isActive) {
            // Deactivating also invalidates sessions
            const sessions = await ctx.db
                .query("sessions")
                .withIndex("by_userId", (q) => q.eq("userId", userId as string))
                .collect();

            for (const session of sessions) {
                await ctx.db.delete(session._id);
            }
        }

        await ctx.db.patch(userId, updateData);

        return { success: true };
    },
});

/**
 * Delete a user
 */
export const deleteUser = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const { userId } = args;

        // Delete all sessions for the user
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId as string))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        // Delete the user
        await ctx.db.delete(userId);

        return { success: true };
    },
});
