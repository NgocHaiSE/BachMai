import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const requests = await ctx.db.query("transferRequests").order("desc").collect();
    
    // Populate patient and staff data
    const requestsWithData = await Promise.all(
      requests.map(async (request) => {
        const patient = await ctx.db.get(request.patientId);
        const staff = await ctx.db.get(request.staffId);
        const approvedBy = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
        
        return {
          ...request,
          patient,
          staff,
          approvedBy,
        };
      })
    );

    return requestsWithData;
  },
});

export const get = query({
  args: { id: v.id("transferRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.id);
    if (!request) return null;

    const patient = await ctx.db.get(request.patientId);
    const staff = await ctx.db.get(request.staffId);
    const approvedBy = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;

    return {
      ...request,
      patient,
      staff,
      approvedBy,
    };
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    treatmentDate: v.string(),
    reason: v.string(),
    requestDate: v.string(),
    destinationAddress: v.string(),
    destinationFacility: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate request code
    const requestCode = `YC${Date.now().toString().slice(-8)}`;

    return await ctx.db.insert("transferRequests", {
      ...args,
      requestCode,
      status: "pending",
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transferRequests"),
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    treatmentDate: v.string(),
    reason: v.string(),
    requestDate: v.string(),
    destinationAddress: v.string(),
    destinationFacility: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("urgent")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("transferRequests"),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("completed")),
    approvedBy: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const updates: any = {
      status: args.status,
    };

    if (args.status === "approved" || args.status === "rejected") {
      updates.approvalDate = new Date().toISOString().split('T')[0];
      if (args.approvedBy) {
        updates.approvedBy = args.approvedBy;
      }
    }

    return await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("transferRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
