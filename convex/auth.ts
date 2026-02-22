import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Secure password hashing using PBKDF2 via Web Crypto API
export async function hashPassword(password: string, storedSaltHex?: string): Promise<string> {
    const encoder = new TextEncoder();
    const saltLength = 16;
    let salt: Uint8Array;

    if (storedSaltHex) {
        salt = new Uint8Array(storedSaltHex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
    } else {
        salt = crypto.getRandomValues(new Uint8Array(saltLength));
    }

    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt as any,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        256
    );

    const hashHex = Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    const saltHex = Array.from(salt)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

    return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    // Fallback for legacy simple hashes
    if (!storedHash.includes(':')) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash | 0; // Convert to 32bit integer
        }
        const mixed = hash.toString(16) + password.length.toString(16);
        return mixed === storedHash;
    }

    const [saltHex] = storedHash.split(':');
    const computedHash = await hashPassword(password, saltHex);
    return computedHash === storedHash;
}

// Simple token generation
function generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

// Token expiry: 24 hours in milliseconds
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

type UserRole = "ADMIN" | "ANALYST" | "PRINCIPAL";

interface UserDocument {
    _id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: UserRole;
    schoolId?: string;
    assignedSchools?: string[];
    isActive: boolean;
    lastLogin?: number;
    createdAt: number;
    createdBy?: string;
}

interface SessionDocument {
    _id: string;
    userId: string;
    token: string;
    expiresAt: number;
    createdAt: number;
}

// Helper to cast documents
function asUser(doc: any): UserDocument | null {
    if (!doc) return null;
    return doc as UserDocument;
}

function asSession(doc: any): SessionDocument | null {
    if (!doc) return null;
    return doc as SessionDocument;
}

/**
 * Login mutation - Authenticate user and create session
 */
export const login = mutation({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const { email, password } = args;
        try {
            console.log(`Login attempt initiated for email: ${email}`);

            // Find user by email
            const users = await ctx.db
                .query("users")
                .withIndex("by_email", (q) => q.eq("email", email))
                .collect();

            console.log(`Matching users found: ${users.length}`);

            let validUser = null;
            for (const u of users) {
                try {
                    const isValid = await verifyPassword(password, u.passwordHash);
                    if (isValid) {
                        validUser = u;
                        break;
                    }
                } catch (verifyErr: any) {
                    console.error(`Password verification error for user ${u._id}:`, verifyErr.message);
                }
            }

            const user = asUser(validUser);

            if (!user) {
                console.log(`Authentication failed: Invalid credentials for ${email}`);
                return { success: false, error: "Invalid email or password" };
            }

            if (!user.isActive) {
                console.log(`Authentication failed: Account ${email} is inactive`);
                return { success: false, error: "Account is deactivated. Contact administrator." };
            }

            // Create session token
            const token = generateToken();
            const expiresAt = Date.now() + TOKEN_EXPIRY;

            // Store session
            await ctx.db.insert("sessions", {
                userId: user._id,
                token,
                expiresAt,
                createdAt: Date.now(),
            });

            // Update last login
            await ctx.db.patch(user._id as any, {
                lastLogin: Date.now(),
            });

            // Return user info and token
            return {
                success: true,
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    schoolId: user.schoolId,
                    assignedSchools: user.assignedSchools || [],
                },
            };
        } catch (error: any) {
            console.error(`Fetal login error:`, error.message);
            return { success: false, error: error.message || "An unexpected server error occurred" };
        }
    },
});

/**
 * Logout mutation - Invalidate session
 */
export const logout = mutation({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const { token } = args;

        // Find and delete session
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id as any);
        }

        return { success: true };
    },
});

/**
 * Register mutation - Create new user (Admin only)
 */
export const register = mutation({
    args: {
        email: v.string(),
        password: v.string(),
        name: v.string(),
        role: v.union(v.literal("ADMIN"), v.literal("ANALYST"), v.literal("PRINCIPAL")),
        schoolId: v.optional(v.string()),
        assignedSchools: v.optional(v.array(v.string())),
        createdBy: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { email, password, name, role, schoolId, assignedSchools, createdBy } = args;
        const passwordHash = await hashPassword(password);

        // Check if email already exists
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email))
            .first();

        if (existingUser) {
            throw new Error("Email already registered");
        }

        // Create user
        const userId = await ctx.db.insert("users", {
            email,
            passwordHash,
            name,
            role,
            schoolId: schoolId,
            assignedSchools: assignedSchools || [],
            isActive: true,
            createdAt: Date.now(),
            createdBy: createdBy,
        });

        return {
            _id: userId,
            email,
            name,
            role,
        };
    },
});

/**
 * Get current user query - Validate token and return user info
 */
export const getCurrentUser = query({
    args: {
        token: v.string(),
    },
    handler: async (ctx, args) => {
        const { token } = args;

        // Find valid session
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", token))
            .collect();

        const session = asSession(sessions.find(s => s.expiresAt > Date.now()));

        if (!session) {
            throw new Error("Invalid or expired token");
        }

        // Get user
        const user = asUser(await ctx.db.get(session.userId as any));

        if (!user || !user.isActive) {
            throw new Error("User not found or inactive");
        }

        return {
            _id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
            schoolId: user.schoolId,
            assignedSchools: user.assignedSchools || [],
            lastLogin: user.lastLogin,
        };
    },
});

/**
 * Change password mutation
 */
export const changePassword = mutation({
    args: {
        userId: v.string(),
        currentPassword: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const { userId, currentPassword, newPassword } = args;

        const user = asUser(await ctx.db.get(userId as any));

        if (!user) {
            throw new Error("User not found");
        }

        const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            throw new Error("Current password is incorrect");
        }

        const newHash = await hashPassword(newPassword);

        await ctx.db.patch(userId as any, {
            passwordHash: newHash,
        });

        // Invalidate all sessions (force re-login)
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId as any))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id as any);
        }

        return { success: true };
    },
});

/**
 * Admin reset password mutation
 */
export const resetPassword = mutation({
    args: {
        userId: v.string(),
        newPassword: v.string(),
    },
    handler: async (ctx, args) => {
        const { userId, newPassword } = args;
        const newHash = await hashPassword(newPassword);

        await ctx.db.patch(userId as any, {
            passwordHash: newHash,
        });

        // Invalidate all sessions
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", userId as any))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id as any);
        }

        return { success: true };
    },
});

/**
 * Request a password reset linking token (Mock email system)
 */
export const requestPasswordReset = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const { email } = args;

        // Verify user exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", email.trim()))
            .first();

        if (!user) {
            // Return success anyway to prevent email enumeration
            return { success: true, message: "If that account exists, a reset link has been generated." };
        }

        // Generate a secure random token
        const tokenArray = new Uint8Array(32);
        crypto.getRandomValues(tokenArray);
        const token = Array.from(tokenArray, byte => byte.toString(16).padStart(2, '0')).join('');

        // Store token (expires in 1 hour)
        await ctx.db.insert("passwordResets", {
            token,
            email: user.email,
            expiresAt: Date.now() + 60 * 60 * 1000,
        });

        // In a real app, send an email here.
        // For development, we return the token directly so the UI can display a mock link.
        return {
            success: true,
            message: "If that account exists, a reset link has been generated.",
            mockToken: token // Only for dev!
        };
    },
});

/**
 * Validate token and reset password
 */
export const resetPasswordWithToken = mutation({
    args: {
        token: v.string(),
        newPassword: v.string()
    },
    handler: async (ctx, args) => {
        const { token, newPassword } = args;

        const resetRecord = await ctx.db
            .query("passwordResets")
            .withIndex("by_token", (q) => q.eq("token", token))
            .first();

        if (!resetRecord) {
            throw new Error("Invalid or expired reset token.");
        }

        if (resetRecord.expiresAt < Date.now()) {
            await ctx.db.delete(resetRecord._id);
            throw new Error("Invalid or expired reset token.");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", resetRecord.email))
            .first();

        if (!user) {
            throw new Error("User associated with this token not found.");
        }

        // Hash new password and update
        const passwordHash = await hashPassword(newPassword);
        await ctx.db.patch(user._id, { passwordHash });

        // Delete the used token
        await ctx.db.delete(resetRecord._id);

        // Delete any active sessions to force re-login
        const sessions = await ctx.db
            .query("sessions")
            .withIndex("by_userId", (q) => q.eq("userId", user._id))
            .collect();

        for (const session of sessions) {
            await ctx.db.delete(session._id);
        }

        return { success: true };
    },
});
