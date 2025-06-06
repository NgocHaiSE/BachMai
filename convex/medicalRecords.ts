import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const records = await ctx.db
      .query("medicalRecords")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    const enrichedRecords = await Promise.all(
      records.map(async (record) => {
        const staff = await ctx.db.get(record.staffId);
        return {
          ...record,
          staff,
        };
      })
    );

    return enrichedRecords;
  },
});

export const get = query({
  args: { id: v.id("medicalRecords") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const record = await ctx.db.get(args.id);
    if (!record) return null;

    const patient = await ctx.db.get(record.patientId);
    const staff = await ctx.db.get(record.staffId);

    return {
      ...record,
      patient,
      staff,
    };
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    appointmentId: v.optional(v.id("appointments")),
    recordType: v.union(
      v.literal("diagnosis"),
      v.literal("prescription"),
      v.literal("test-result"),
      v.literal("treatment"),
      v.literal("note")
    ),
    title: v.string(),
    description: v.string(),
    diagnosis: v.optional(v.string()),
    prescription: v.optional(v.array(v.object({
      medication: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.string(),
    }))),
    testResults: v.optional(v.object({
      testName: v.string(),
      results: v.string(),
      normalRange: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("medicalRecords", {
      ...args,
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("medicalRecords"),
    title: v.string(),
    description: v.string(),
    diagnosis: v.optional(v.string()),
    prescription: v.optional(v.array(v.object({
      medication: v.string(),
      dosage: v.string(),
      frequency: v.string(),
      duration: v.string(),
    }))),
    testResults: v.optional(v.object({
      testName: v.string(),
      results: v.string(),
      normalRange: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("medicalRecords") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
