import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];

    // Get today's appointments
    const todayAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("appointmentDate", today))
      .collect();

    // Get total patients
    const totalPatients = await ctx.db.query("patients").collect();

    // Get active staff
    const activeStaff = await ctx.db
      .query("staff")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get pending appointments (scheduled status)
    const pendingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();

    // Get completed appointments today
    const completedToday = todayAppointments.filter(apt => apt.status === "completed");

    return {
      todayAppointments: todayAppointments.length,
      totalPatients: totalPatients.length,
      activeStaff: activeStaff.length,
      pendingAppointments: pendingAppointments.length,
      completedToday: completedToday.length,
    };
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Get recent appointments
    const recentAppointments = await ctx.db
      .query("appointments")
      .order("desc")
      .take(5);

    // Get recent patients
    const recentPatients = await ctx.db
      .query("patients")
      .order("desc")
      .take(5);

    const enrichedAppointments = await Promise.all(
      recentAppointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        const staff = await ctx.db.get(appointment.staffId);
        return {
          ...appointment,
          patient,
          staff,
        };
      })
    );

    return {
      recentAppointments: enrichedAppointments,
      recentPatients,
    };
  },
});
