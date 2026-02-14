import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Individual indicator scores (Yes/No/NR)
    indicatorScores: defineTable({
        indicatorCode: v.string(),
        value: v.union(v.literal("yes"), v.literal("no"), v.literal("nr"), v.null()),
        source: v.string(), // e.g., 'LT1', 'Principal', 'Admin'
        sessionId: v.optional(v.string()), // For multi-session support
    })
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_sessionId", ["sessionId"]),

    // LT Scores for multi-column checklists
    // e.g., { indicatorCode: "1.1.1", ltColumn: "LT1", value: 1 }
    ltScores: defineTable({
        indicatorCode: v.string(),
        ltColumn: v.string(), // e.g., 'LT1', 'LT2', etc.
        value: v.union(v.number(), v.literal("NA"), v.literal("NR"), v.null()),
        source: v.string(),
        sessionId: v.optional(v.string()),
    })
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_indicatorCode_ltColumn", ["indicatorCode", "ltColumn"])
        .index("by_sessionId", ["sessionId"]),

    // Comments per indicator
    indicatorComments: defineTable({
        indicatorCode: v.string(),
        comment: v.string(),
        sessionId: v.optional(v.string()),
    })
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_sessionId", ["sessionId"]),

    // Parent Survey Responses
    // Stores ratings from 1-3 (1=Not Good, 2=Good, 3=Very Good) for each parent
    parentSurveyResponses: defineTable({
        parentId: v.string(), // e.g., "001", "002"
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)), // 1=Not Good, 2=Good, 3=Very Good
        submittedAt: v.number(), // timestamp
        isOnline: v.boolean(), // true if submitted via online form
        status: v.optional(v.union(v.literal("accepted"), v.literal("rejected"))), // accept/reject toggle
    })
        .index("by_parentId", ["parentId"])
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_parentId_indicatorCode", ["parentId", "indicatorCode"]),

    // Parent Metadata
    parents: defineTable({
        parentId: v.string(), // e.g., "P-123"
        studentName: v.string(),
        grade: v.optional(v.string()),
        created: v.number(),
        comment: v.optional(v.string()),
    })
        .index("by_parentId", ["parentId"]),

    // Student Survey Responses
    studentSurveyResponses: defineTable({
        studentId: v.string(), // e.g., "S-001"
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
        submittedAt: v.number(),
        isOnline: v.boolean(),
        status: v.optional(v.union(v.literal("accepted"), v.literal("rejected"))),
    })
        .index("by_studentId", ["studentId"])
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_studentId_indicatorCode", ["studentId", "indicatorCode"]),

    // Student Metadata
    students: defineTable({
        studentId: v.string(),
        studentName: v.string(),
        grade: v.optional(v.string()),
        created: v.number(),
        comment: v.optional(v.string()),
    })
        .index("by_studentId", ["studentId"]),

    // Teacher Survey Responses
    teacherSurveyResponses: defineTable({
        teacherId: v.string(),
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
        submittedAt: v.number(),
        isOnline: v.boolean(),
        status: v.optional(v.union(v.literal("accepted"), v.literal("rejected"))),
    })
        .index("by_teacherId", ["teacherId"])
        .index("by_indicatorCode", ["indicatorCode"])
        .index("by_teacherId_indicatorCode", ["teacherId", "indicatorCode"]),

    // Teacher Metadata
    teachers: defineTable({
        teacherId: v.string(),
        teacherName: v.string(),
        subject: v.optional(v.string()),
        created: v.number(),
        comment: v.optional(v.string()),
    })
        .index("by_teacherId", ["teacherId"]),

    // Global Settings
    settings: defineTable({
        key: v.string(), // e.g., 'parentSurveyEnabled'
        value: v.any(),
    })
        .index("by_key", ["key"]),
});
