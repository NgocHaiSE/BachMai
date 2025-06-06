import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.query("patients").order("desc").collect();
  },
});

export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!args.searchTerm) {
      return await ctx.db.query("patients").order("desc").take(20);
    }

    return await ctx.db
      .query("patients")
      .withSearchIndex("search_patients", (q) =>
        q.search("lastName", args.searchTerm)
      )
      .take(20);
  },
});

export const get = query({
  args: { id: v.id("patients") },
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
    email: v.optional(v.string()),
    phone: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.string(),
    emergencyContact: v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    }),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("patients", {
      ...args,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("patients"),
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.string(),
    emergencyContact: v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    }),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
