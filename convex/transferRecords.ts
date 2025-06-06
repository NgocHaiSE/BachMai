import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const records = await ctx.db.query("transferRecords").order("desc").collect();
    
    // Populate patient and staff data
    const recordsWithData = await Promise.all(
      records.map(async (record) => {
        const patient = await ctx.db.get(record.patientId);
        const staff = await ctx.db.get(record.staffId);
        const approvedBy = record.approvedBy ? await ctx.db.get(record.approvedBy) : null;
        const request = record.requestId ? await ctx.db.get(record.requestId) : null;
        
        return {
          ...record,
          patient,
          staff,
          approvedBy,
          request,
        };
      })
    );

    return recordsWithData;
  },
});

export const get = query({
  args: { id: v.id("transferRecords") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const record = await ctx.db.get(args.id);
    if (!record) return null;

    const patient = await ctx.db.get(record.patientId);
    const staff = await ctx.db.get(record.staffId);
    const approvedBy = record.approvedBy ? await ctx.db.get(record.approvedBy) : null;
    const request = record.requestId ? await ctx.db.get(record.requestId) : null;

    return {
      ...record,
      patient,
      staff,
      approvedBy,
      request,
    };
  },
});

export const create = mutation({
  args: {
    requestId: v.optional(v.id("transferRequests")),
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    treatmentDate: v.string(),
    reason: v.string(),
    transferDate: v.string(),
    estimatedTime: v.optional(v.string()),
    destinationAddress: v.string(),
    destinationFacility: v.string(),
    destinationPhone: v.optional(v.string()),
    diagnosis: v.string(),
    icd10Code: v.optional(v.string()),
    pulse: v.optional(v.string()),
    bloodPressure: v.optional(v.string()),
    respiratoryRate: v.optional(v.string()),
    temperature: v.optional(v.string()),
    consciousness: v.optional(v.string()),
    clinicalProgress: v.optional(v.string()),
    treatmentPerformed: v.optional(v.string()),
    accompaniedPersonId: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate transfer code
    const transferCode = `CV${Date.now().toString().slice(-8)}`;

    return await ctx.db.insert("transferRecords", {
      ...args,
      transferCode,
      status: "pending",
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("transferRecords"),
    requestId: v.optional(v.id("transferRequests")),
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    treatmentDate: v.string(),
    reason: v.string(),
    transferDate: v.string(),
    estimatedTime: v.optional(v.string()),
    destinationAddress: v.string(),
    destinationFacility: v.string(),
    destinationPhone: v.optional(v.string()),
    diagnosis: v.string(),
    icd10Code: v.optional(v.string()),
    pulse: v.optional(v.string()),
    bloodPressure: v.optional(v.string()),
    respiratoryRate: v.optional(v.string()),
    temperature: v.optional(v.string()),
    consciousness: v.optional(v.string()),
    clinicalProgress: v.optional(v.string()),
    treatmentPerformed: v.optional(v.string()),
    accompaniedPersonId: v.optional(v.string()),
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
    id: v.id("transferRecords"),
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
  args: { id: v.id("transferRecords") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
