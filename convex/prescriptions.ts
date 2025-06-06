import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prescriptions = await ctx.db.query("prescriptions").order("desc").collect();
    
    // Populate patient and staff data
    const prescriptionsWithData = await Promise.all(
      prescriptions.map(async (prescription) => {
        const patient = await ctx.db.get(prescription.patientId);
        const staff = await ctx.db.get(prescription.staffId);
        
        return {
          ...prescription,
          patient,
          staff,
        };
      })
    );

    return prescriptionsWithData;
  },
});

export const get = query({
  args: { id: v.id("prescriptions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const prescription = await ctx.db.get(args.id);
    if (!prescription) return null;

    const patient = await ctx.db.get(prescription.patientId);
    const staff = await ctx.db.get(prescription.staffId);

    return {
      ...prescription,
      patient,
      staff,
    };
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    diagnosis: v.string(),
    notes: v.optional(v.string()),
    medications: v.array(v.object({
      medicineCode: v.string(),
      medicineName: v.string(),
      quantity: v.number(),
      expiryDate: v.string(),
      dosage: v.string(),
      unitPrice: v.number(),
      totalPrice: v.number(),
    })),
    totalAmount: v.number(),
    insuranceAmount: v.number(),
    finalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate prescription code
    const prescriptionCode = `DT${Date.now().toString().slice(-8)}`;

    return await ctx.db.insert("prescriptions", {
      ...args,
      prescriptionCode,
      prescriptionDate: new Date().toISOString().split('T')[0],
      createdBy: userId,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("prescriptions"),
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    diagnosis: v.string(),
    notes: v.optional(v.string()),
    medications: v.array(v.object({
      medicineCode: v.string(),
      medicineName: v.string(),
      quantity: v.number(),
      expiryDate: v.string(),
      dosage: v.string(),
      unitPrice: v.number(),
      totalPrice: v.number(),
    })),
    totalAmount: v.number(),
    insuranceAmount: v.number(),
    finalAmount: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("prescriptions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
