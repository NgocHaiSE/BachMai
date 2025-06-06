import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointments = await ctx.db.query("appointments").order("desc").collect();
    
    // Get patient and staff details for each appointment
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        const staff = await ctx.db.get(appointment.staffId);
        return {
          ...appointment,
          patient,
          staff,
        };
      })
    );

    return enrichedAppointments;
  },
});

export const listByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("appointmentDate", args.date))
      .collect();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        const staff = await ctx.db.get(appointment.staffId);
        return {
          ...appointment,
          patient,
          staff,
        };
      })
    );

    return enrichedAppointments;
  },
});

export const listByPatient = query({
  args: { patientId: v.id("patients") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        const staff = await ctx.db.get(appointment.staffId);
        return {
          ...appointment,
          staff,
        };
      })
    );

    return enrichedAppointments;
  },
});

export const get = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const appointment = await ctx.db.get(args.id);
    if (!appointment) return null;

    const patient = await ctx.db.get(appointment.patientId);
    const staff = await ctx.db.get(appointment.staffId);

    return {
      ...appointment,
      patient,
      staff,
    };
  },
});

export const create = mutation({
  args: {
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    duration: v.number(),
    type: v.union(
      v.literal("consultation"),
      v.literal("follow-up"),
      v.literal("emergency"),
      v.literal("surgery"),
      v.literal("checkup")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("appointments", {
      ...args,
      status: "scheduled",
      createdBy: userId,
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("appointments"),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no-show")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.patch(args.id, { status: args.status });
  },
});

export const update = mutation({
  args: {
    id: v.id("appointments"),
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    duration: v.number(),
    type: v.union(
      v.literal("consultation"),
      v.literal("follow-up"),
      v.literal("emergency"),
      v.literal("surgery"),
      v.literal("checkup")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});
