import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// Create a new student entry
export const createStudent = mutation({
    args: {
        name: v.string(),
        grade: v.optional(v.string()),
    },
    handler: async (ctx, { name, grade }) => {
        const studentId = `S-${Date.now()}`;
        await ctx.db.insert("students", {
            studentId,
            studentName: name,
            grade: grade || "",
            created: Date.now(),
        });
        return studentId;
    },
});

// Get all student survey responses
export const getAll = query({
    handler: async (ctx) => {
        const responses = await ctx.db.query("studentSurveyResponses").collect();
        
        // Group by studentId
        const grouped = new Map();
        responses.forEach((r) => {
            if (!grouped.has(r.studentId)) {
                grouped.set(r.studentId, {});
            }
            grouped.get(r.studentId)[r.indicatorCode] = r.rating;
        });
        
        return { responses: Object.fromEntries(grouped) };
    },
});

// Get responses for a specific student
export const getByStudentId = query({
    args: { studentId: v.string() },
    handler: async (ctx, { studentId }) => {
        const responses = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
            .collect();
        
        const ratings = {};
        responses.forEach((r) => {
            ratings[r.indicatorCode] = r.rating;
        });
        
        return { studentId, ratings };
    },
});

// Set a single rating (for manual entry)
export const setRating = mutation({
    args: {
        studentId: v.string(),
        indicatorCode: v.string(),
        rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
    },
    handler: async (ctx, { studentId, indicatorCode, rating }) => {
        // Check if response already exists
        const existing = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_studentId_indicatorCode", (q) =>
                q.eq("studentId", studentId).eq("indicatorCode", indicatorCode)
            )
            .first();
        
        if (existing) {
            // Update existing
            await ctx.db.patch(existing._id, {
                rating,
                submittedAt: Date.now(),
            });
        } else {
            // Create new
            await ctx.db.insert("studentSurveyResponses", {
                studentId,
                indicatorCode,
                rating,
                submittedAt: Date.now(),
                isOnline: false,
            });
        }
        
        return { success: true };
    },
});

// Submit online survey (public endpoint)
export const submitOnlineSurvey = mutation({
    args: {
        studentId: v.string(),
        responses: v.array(
            v.object({
                indicatorCode: v.string(),
                rating: v.union(v.literal(1), v.literal(2), v.literal(3)),
            })
        ),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, { studentId, responses, comment }) => {
        for (const r of responses) {
            const existing = await ctx.db
                .query("studentSurveyResponses")
                .withIndex("by_studentId_indicatorCode", (q) =>
                    q.eq("studentId", studentId).eq("indicatorCode", r.indicatorCode)
                )
                .first();
            
            if (existing) {
                await ctx.db.patch(existing._id, {
                    rating: r.rating,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            } else {
                await ctx.db.insert("studentSurveyResponses", {
                    studentId,
                    indicatorCode: r.indicatorCode,
                    rating: r.rating,
                    submittedAt: Date.now(),
                    isOnline: true,
                });
            }
        }
        
        // Save comment if provided
        if (comment !== undefined) {
            const studentRecord = await ctx.db
                .query("students")
                .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
                .first();
            
            if (studentRecord) {
                await ctx.db.patch(studentRecord._id, { comment });
            }
        }
        
        return { success: true, count: responses.length };
    },
});

// Delete a student's responses
export const deleteStudent = mutation({
    args: { studentId: v.string() },
    handler: async (ctx, { studentId }) => {
        const responses = await ctx.db
            .query("studentSurveyResponses")
            .withIndex("by_studentId", (q) => q.eq("studentId", studentId))
            .collect();
        
        for (const r of responses) {
            await ctx.db.delete(r._id);
        }
        
        return { success: true, deleted: responses.length };
    },
});

// Get all students with their comments
export const getAllWithComments = query({
    handler: async (ctx) => {
        const students = await ctx.db.query("students").collect();
        
        // Filter only students with comments and sort by creation date
        const studentsWithComments = students
            .filter((s) => s.comment && s.comment.trim() !== "")
            .sort((a, b) => b.created - a.created)
            .map((s) => ({
                studentId: s.studentId,
                studentName: s.studentName,
                grade: s.grade,
                comment: s.comment,
                created: s.created,
            }));
        
        return { students: studentsWithComments };
    },
});

// Get statistics for all responses
export const getStats = query({
    handler: async (ctx) => {
        const responses = await ctx.db.query("studentSurveyResponses").collect();
        
        const stats = {
            totalStudents: new Set(responses.map((r) => r.studentId)).size,
            totalResponses: responses.length,
            byRating: { 1: 0, 2: 0, 3: 0 },
        };
        
        responses.forEach((r) => {
            stats.byRating[r.rating]++;
        });
        
        return stats;
    },
});
