import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Individual indicator scores (Yes/No/NR)
    indicatorScores: defineTable({
        indicatorCode: v.string(),
        value: v.union(v.literal("yes"), v.literal("no"), v.literal("nr"), v.null()),
        source: v.string(), // e.g., 'LT1', 'Principal', 'Admin'
        schoolId: v.optional(v.string()),
        sessionId: v.optional(v.string()), // For multi-session support
    })
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_sessionId", ["sessionId"])
        .index("by_schoolId", ["schoolId"]),

    // LT Scores for multi-column checklists
    // e.g., { indicatorCode: "1.1.1", ltColumn: "LT1", value: 1 }
    ltScores: defineTable({
        indicatorCode: v.string(),
        ltColumn: v.string(), // e.g., 'LT1', 'LT2', etc.
        value: v.union(v.number(), v.literal("NA"), v.literal("NR"), v.null()),
        source: v.string(),
        schoolId: v.optional(v.string()),
        sessionId: v.optional(v.string()),
    })
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_indicatorCode_ltColumn", ["indicatorCode", "ltColumn"])
        .index("by_sessionId", ["sessionId"])
        .index("by_schoolId", ["schoolId"]),

    // Comments per indicator
    indicatorComments: defineTable({
        indicatorCode: v.string(),
        comment: v.string(),
        schoolId: v.optional(v.string()),
        sessionId: v.optional(v.string()),
    })
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_sessionId", ["sessionId"])
        .index("by_schoolId", ["schoolId"]),

    // Parent Survey Responses
    // Stores ratings from 1-3 (1=Not Good, 2=Good, 3=Very Good) for each parent
    parentSurveyResponses: defineTable({
        parentId: v.string(), // e.g., "001", "002"
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)), // 1=Not Good, 2=Good, 3=Very Good
        schoolId: v.optional(v.string()),
        submittedAt: v.number(), // timestamp
        isOnline: v.boolean(), // true if submitted via online form
        status: v.optional(v.union(v.literal("accepted"), v.literal("rejected"))), // accept/reject toggle
    })
        .index("by_parentId", ["parentId"])
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_parentId_indicatorCode", ["parentId", "indicatorCode"])
        .index("by_schoolId", ["schoolId"]),

    // Parent Metadata
    parents: defineTable({
        parentId: v.string(), // e.g., "P-123"
        studentName: v.string(),
        grade: v.optional(v.string()),
        schoolId: v.optional(v.string()),
        created: v.number(),
        comment: v.optional(v.string()),
    })
        .index("by_parentId", ["parentId"])
        .index("by_schoolId", ["schoolId"]),

    // Student Survey Responses
    studentSurveyResponses: defineTable({
        studentId: v.string(), // e.g., "S-001"
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
        schoolId: v.optional(v.string()),
        submittedAt: v.number(),
        isOnline: v.boolean(),
        status: v.optional(v.union(v.literal("accepted"), v.literal("rejected"))),
    })
        .index("by_studentId", ["studentId"])
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_studentId_indicatorCode", ["studentId", "indicatorCode"])
        .index("by_schoolId", ["schoolId"]),

    // Student Metadata
    students: defineTable({
        studentId: v.string(),
        studentName: v.string(),
        grade: v.optional(v.string()),
        schoolId: v.optional(v.string()),
        created: v.number(),
        comment: v.optional(v.string()),
    })
        .index("by_studentId", ["studentId"])
        .index("by_schoolId", ["schoolId"]),

    // Teacher Survey Responses
    teacherSurveyResponses: defineTable({
        teacherId: v.string(),
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
        schoolId: v.optional(v.string()),
        submittedAt: v.number(),
        isOnline: v.boolean(),
        status: v.optional(v.union(v.literal("accepted"), v.literal("rejected"))),
    })
        .index("by_teacherId", ["teacherId"])
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_teacherId_indicatorCode", ["teacherId", "indicatorCode"])
        .index("by_schoolId", ["schoolId"]),

    // Teacher Metadata
    teachers: defineTable({
        teacherId: v.string(),
        teacherName: v.string(),
        subject: v.optional(v.string()),
        schoolId: v.optional(v.string()),
        created: v.number(),
        comment: v.optional(v.string()),
    })
        .index("by_teacherId", ["teacherId"])
        .index("by_schoolId", ["schoolId"]),

    // Global Settings
    settings: defineTable({
        key: v.string(), // e.g., 'parentSurveyEnabled'
        value: v.any(),
    })
        .index("by_key", ["key"]),

    // Users table for authentication
    users: defineTable({
        email: v.string(),              // Unique email
        passwordHash: v.string(),       // Hashed password
        name: v.string(),               // Full name
        role: v.union(v.literal("ADMIN"), v.literal("ANALYST"), v.literal("PRINCIPAL")),
        schoolId: v.optional(v.string()), // For PRINCIPAL - their school
        assignedSchools: v.optional(v.array(v.string())), // For ANALYST - assigned schools
        isActive: v.boolean(),        // Account status
        lastLogin: v.optional(v.number()), // Last login timestamp
        createdAt: v.number(),          // Creation timestamp
        createdBy: v.optional(v.string()), // Who created this user
    })
        .index("by_email", ["email"])
        .index("by_role", ["role"])
        .index("by_schoolId", ["schoolId"]),

    // Sessions table for JWT token management
    sessions: defineTable({
        userId: v.string(),             // Reference to user
        token: v.string(),             // JWT token
        expiresAt: v.number(),          // Expiry timestamp
        createdAt: v.number(),         // Creation timestamp
    })
        .index("by_userId", ["userId"])
        .index("by_token", ["token"]),

    // Password Reset Tokens
    passwordResets: defineTable({
        token: v.string(),
        email: v.string(),
        expiresAt: v.number(),
    })
        .index("by_token", ["token"])
        .index("by_email", ["email"]),

    // Schools table
    schools: defineTable({
        schoolId: v.string(),          // Unique ID (e.g., "SCH-001")
        name: v.string(),              // School name
        nameDv: v.optional(v.string()), // School name in Dhivehi
        atoll: v.string(),            // Atoll location
        island: v.string(),           // Island location
        isActive: v.boolean(),        // Active status
        createdAt: v.number(),        // Creation timestamp
    })
        .index("by_schoolId", ["schoolId"])
        .index("by_atoll", ["atoll"]),

    // School Profiles (Comprehensive Data)
    schoolProfiles: defineTable({
        schoolId: v.string(), // "SCH-001"
        data: v.any(), // Flexible schema to accommodate all 200+ profile fields
        lastUpdatedBy: v.optional(v.string()), // email or user ID
        lastUpdatedAt: v.optional(v.number()),
    })
        .index("by_schoolId", ["schoolId"]),
});
