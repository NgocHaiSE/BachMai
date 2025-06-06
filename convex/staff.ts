import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("staff").order("desc").collect();
  },
});

export const listByRole = query({
  args: { role: v.union(v.literal("doctor"), v.literal("nurse"), v.literal("admin"), v.literal("receptionist")) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db
      .query("staff")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("doctor"), v.literal("nurse"), v.literal("admin"), v.literal("receptionist")),
    department: v.string(),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("staff", {
      ...args,
      isActive: true,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("staff"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(v.literal("doctor"), v.literal("nurse"), v.literal("admin"), v.literal("receptionist")),
    department: v.string(),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
