import { query } from "./_generated/server";
export default query(async (ctx) => {
    const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", "admin@qad.edu.mv"))
        .first();
    return user?.passwordHash;
});
