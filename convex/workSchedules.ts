// convex/workSchedules.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Lấy danh sách lịch làm việc
export const list = query({
  args: {
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    staffId: v.optional(v.id("staff")),
    department: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("transferred")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Lấy tất cả schedules và filter trong memory để tránh type issues
    let schedules = await ctx.db.query("workSchedules").order("desc").collect();

    // Áp dụng các filter
    if (args.startDate && args.endDate) {
      schedules = schedules.filter(s => 
        s.date >= args.startDate! && s.date <= args.endDate!
      );
    }

    if (args.staffId) {
      schedules = schedules.filter(s => s.staffId === args.staffId);
    }

    if (args.department) {
      schedules = schedules.filter(s => s.department === args.department);
    }

    if (args.status) {
      schedules = schedules.filter(s => s.status === args.status);
    }

    // Populate thông tin nhân viên
    const enrichedSchedules = await Promise.all(
      schedules.map(async (schedule) => {
        const staff = await ctx.db.get(schedule.staffId);
        const confirmedBy = schedule.confirmedBy ? await ctx.db.get(schedule.confirmedBy) : null;
        return {
          ...schedule,
          staff,
          confirmedBy,
        };
      })
    );

    return enrichedSchedules;
  },
});

// Lấy lịch làm việc theo tuần
export const getWeeklySchedule = query({
  args: {
    weekStart: v.string(), // Thứ 2 đầu tuần
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Tính toán ngày kết thúc tuần (Chủ nhật)
    const startDate = new Date(args.weekStart);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    const endDateStr = endDate.toISOString().split('T')[0];

    // Lấy tất cả schedules trong tuần
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const schedules = allSchedules.filter(s => 
      s.date >= args.weekStart && s.date <= endDateStr &&
      (!args.department || s.department === args.department)
    );

    // Group theo nhân viên và ngày
    const groupedSchedules: Record<string, Record<string, any[]>> = {};

    for (const schedule of schedules) {
      const staff = await ctx.db.get(schedule.staffId);
      if (!staff) continue;

      const staffKey = `${staff.firstName} ${staff.lastName}`;
      if (!groupedSchedules[staffKey]) {
        groupedSchedules[staffKey] = {};
      }

      if (!groupedSchedules[staffKey][schedule.date]) {
        groupedSchedules[staffKey][schedule.date] = [];
      }

      groupedSchedules[staffKey][schedule.date].push({
        ...schedule,
        staff,
      });
    }

    return groupedSchedules;
  },
});

// Tạo lịch làm việc mới
export const create = mutation({
  args: {
    staffId: v.id("staff"),
    date: v.string(),
    shiftType: v.union(
      v.literal("morning"),
      v.literal("afternoon"),
      v.literal("night"),
      v.literal("full-day"),
      v.literal("on-call")
    ),
    startTime: v.string(),
    endTime: v.string(),
    department: v.string(),
    ward: v.optional(v.string()),
    workType: v.union(
      v.literal("regular"),
      v.literal("overtime"),
      v.literal("holiday"),
      v.literal("emergency")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clean optional fields - convert empty strings to undefined
    const ward = args.ward && args.ward.trim() !== "" ? args.ward : undefined;
    const notes = args.notes && args.notes.trim() !== "" ? args.notes : undefined;

    // Kiểm tra xung đột lịch làm việc
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const existingSchedule = allSchedules.find(s => 
      s.staffId === args.staffId && 
      s.date === args.date && 
      s.status !== "cancelled"
    );

    if (existingSchedule) {
      throw new Error("Nhân viên đã có lịch làm việc trong ngày này");
    }

    return await ctx.db.insert("workSchedules", {
      staffId: args.staffId,
      date: args.date,
      shiftType: args.shiftType,
      startTime: args.startTime,
      endTime: args.endTime,
      department: args.department,
      ward, // Use cleaned value
      workType: args.workType,
      notes, // Use cleaned value
      status: "scheduled",
      createdBy: userId,
    });
  },
});

// Tạo lịch làm việc theo template
export const createFromTemplate = mutation({
  args: {
    templateId: v.id("scheduleTemplates"),
    weekStart: v.string(),
    staffAssignments: v.array(v.object({
      staffId: v.id("staff"),
      shifts: v.array(v.object({
        dayOfWeek: v.number(),
        shiftType: v.string(),
      }))
    })),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const template = await ctx.db.get(args.templateId);
    if (!template) throw new Error("Template không tồn tại");

    const schedules = [];
    const startDate = new Date(args.weekStart);

    for (const assignment of args.staffAssignments) {
      for (const shift of assignment.shifts) {
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(startDate.getDate() + shift.dayOfWeek);

        const templateShift = template.schedulePattern
          .find(p => p.dayOfWeek === shift.dayOfWeek)
          ?.shifts.find(s => s.shiftType === shift.shiftType);

        if (!templateShift) continue;

        const scheduleId = await ctx.db.insert("workSchedules", {
          staffId: assignment.staffId,
          date: scheduleDate.toISOString().split('T')[0],
          shiftType: templateShift.shiftType as any,
          startTime: templateShift.startTime,
          endTime: templateShift.endTime,
          department: template.department,
          workType: "regular",
          status: "scheduled",
          createdBy: userId,
        });

        schedules.push(scheduleId);
      }
    }

    return schedules;
  },
});

// Cập nhật lịch làm việc
export const update = mutation({
  args: {
    id: v.id("workSchedules"),
    staffId: v.id("staff"),
    date: v.string(),
    shiftType: v.union(
      v.literal("morning"),
      v.literal("afternoon"),
      v.literal("night"),
      v.literal("full-day"),
      v.literal("on-call")
    ),
    startTime: v.string(),
    endTime: v.string(),
    department: v.string(),
    ward: v.optional(v.string()),
    workType: v.union(
      v.literal("regular"),
      v.literal("overtime"),
      v.literal("holiday"),
      v.literal("emergency")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;

    // Clean optional fields - convert empty strings to undefined
    const ward = updates.ward && updates.ward.trim() !== "" ? updates.ward : undefined;
    const notes = updates.notes && updates.notes.trim() !== "" ? updates.notes : undefined;

    // Kiểm tra quyền sửa
    const schedule = await ctx.db.get(id);
    if (!schedule) throw new Error("Lịch làm việc không tồn tại");

    if (schedule.status === "completed") {
      throw new Error("Không thể sửa lịch làm việc đã hoàn thành");
    }

    return await ctx.db.patch(id, {
      staffId: updates.staffId,
      date: updates.date,
      shiftType: updates.shiftType,
      startTime: updates.startTime,
      endTime: updates.endTime,
      department: updates.department,
      ward, // Use cleaned value
      workType: updates.workType,
      notes, // Use cleaned value
    });
  },
});

// Xác nhận lịch làm việc
export const confirm = mutation({
  args: {
    id: v.id("workSchedules"),
    staffId: v.id("staff"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.patch(args.id, {
      status: "confirmed",
      confirmedBy: args.staffId,
      confirmedAt: new Date().toISOString(),
    });
  },
});

// Hủy lịch làm việc
export const cancel = mutation({
  args: {
    id: v.id("workSchedules"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.patch(args.id, {
      status: "cancelled",
      notes: args.reason,
    });
  },
});

// Xóa lịch làm việc
export const remove = mutation({
  args: { id: v.id("workSchedules") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const schedule = await ctx.db.get(args.id);
    if (!schedule) throw new Error("Lịch làm việc không tồn tại");

    if (schedule.status === "completed") {
      throw new Error("Không thể xóa lịch làm việc đã hoàn thành");
    }

    return await ctx.db.delete(args.id);
  },
});

// Lấy thống kê lịch làm việc
export const getStats = query({
  args: {
    month: v.string(), // YYYY-MM
    department: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const startDate = `${args.month}-01`;
    const endDate = `${args.month}-31`;

    // Lấy tất cả schedules và filter
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const schedules = allSchedules.filter(s => 
      s.date >= startDate && 
      s.date <= endDate &&
      (!args.department || s.department === args.department)
    );

    const stats = {
      totalSchedules: schedules.length,
      confirmedSchedules: schedules.filter(s => s.status === "confirmed").length,
      completedSchedules: schedules.filter(s => s.status === "completed").length,
      cancelledSchedules: schedules.filter(s => s.status === "cancelled").length,
      transferredSchedules: schedules.filter(s => s.status === "transferred").length,
      overtimeSchedules: schedules.filter(s => s.workType === "overtime").length,
      holidaySchedules: schedules.filter(s => s.workType === "holiday").length,
      shiftDistribution: {
        morning: schedules.filter(s => s.shiftType === "morning").length,
        afternoon: schedules.filter(s => s.shiftType === "afternoon").length,
        night: schedules.filter(s => s.shiftType === "night").length,
        fullDay: schedules.filter(s => s.shiftType === "full-day").length,
        onCall: schedules.filter(s => s.shiftType === "on-call").length,
      }
    };

    return stats;
  },
});