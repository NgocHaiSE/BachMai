// convex/scheduleTemplates.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Lấy danh sách mẫu lịch làm việc
export const list = query({
  args: {
    department: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Lấy tất cả templates và filter
    let templates = await ctx.db.query("scheduleTemplates").order("desc").collect();

    // Áp dụng các filter
    if (args.department) {
      templates = templates.filter(t => t.department === args.department);
    }

    if (args.isActive !== undefined) {
      templates = templates.filter(t => t.isActive === args.isActive);
    }

    return templates;
  },
});

// Lấy chi tiết mẫu lịch làm việc
export const get = query({
  args: { id: v.id("scheduleTemplates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.get(args.id);
  },
});

// Tạo mẫu lịch làm việc
export const create = mutation({
  args: {
    name: v.string(),
    department: v.string(),
    description: v.optional(v.string()),
    schedulePattern: v.array(v.object({
      dayOfWeek: v.number(), // 0-6 (Chủ nhật - Thứ 7)
      shifts: v.array(v.object({
        shiftType: v.union(
          v.literal("morning"),
          v.literal("afternoon"), 
          v.literal("night"),
          v.literal("full-day"),
          v.literal("on-call")
        ),
        startTime: v.string(),
        endTime: v.string(),
        requiredStaffCount: v.number(),
        requiredRoles: v.array(v.string())
      }))
    })),
    validFrom: v.string(),
    validTo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("scheduleTemplates", {
      ...args,
      isActive: true,
      createdBy: userId,
    });
  },
});

// Cập nhật mẫu lịch làm việc
export const update = mutation({
  args: {
    id: v.id("scheduleTemplates"),
    name: v.string(),
    department: v.string(),
    description: v.optional(v.string()),
    schedulePattern: v.array(v.object({
      dayOfWeek: v.number(),
      shifts: v.array(v.object({
        shiftType: v.union(
          v.literal("morning"),
          v.literal("afternoon"), 
          v.literal("night"),
          v.literal("full-day"),
          v.literal("on-call")
        ),
        startTime: v.string(),
        endTime: v.string(),
        requiredStaffCount: v.number(),
        requiredRoles: v.array(v.string())
      }))
    })),
    validFrom: v.string(),
    validTo: v.optional(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Vô hiệu hóa mẫu lịch làm việc
export const deactivate = mutation({
  args: { id: v.id("scheduleTemplates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.patch(args.id, { isActive: false });
  },
});

// Xóa mẫu lịch làm việc
export const remove = mutation({
  args: { id: v.id("scheduleTemplates") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.delete(args.id);
  },
});

// Áp dụng mẫu lịch làm việc cho tuần
export const applyToWeek = mutation({
  args: {
    templateId: v.id("scheduleTemplates"),
    weekStart: v.string(), // Thứ 2 đầu tuần
    staffAssignments: v.array(v.object({
      staffId: v.id("staff"),
      assignedShifts: v.array(v.object({
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

    const createdSchedules = [];
    const startDate = new Date(args.weekStart);

    // Lấy tất cả schedules hiện tại để kiểm tra conflict
    const allSchedules = await ctx.db.query("workSchedules").collect();

    for (const staffAssignment of args.staffAssignments) {
      for (const assignedShift of staffAssignment.assignedShifts) {
        // Tìm thông tin shift trong template
        const dayPattern = template.schedulePattern.find(p => p.dayOfWeek === assignedShift.dayOfWeek);
        if (!dayPattern) continue;

        const shiftInfo = dayPattern.shifts.find(s => s.shiftType === assignedShift.shiftType);
        if (!shiftInfo) continue;

        // Tính ngày cụ thể
        const scheduleDate = new Date(startDate);
        scheduleDate.setDate(startDate.getDate() + assignedShift.dayOfWeek - 1);
        const scheduleDateStr = scheduleDate.toISOString().split('T')[0];

        // Kiểm tra xung đột
        const existingSchedule = allSchedules.find(s => 
          s.staffId === staffAssignment.staffId &&
          s.date === scheduleDateStr &&
          s.status !== "cancelled"
        );

        if (existingSchedule) {
          continue; // Bỏ qua nếu đã có lịch
        }

        // Tạo lịch làm việc
        const scheduleId = await ctx.db.insert("workSchedules", {
          staffId: staffAssignment.staffId,
          date: scheduleDateStr,
          shiftType: shiftInfo.shiftType as "morning" | "afternoon" | "night" | "full-day" | "on-call",
          startTime: shiftInfo.startTime,
          endTime: shiftInfo.endTime,
          department: template.department,
          workType: "regular",
          status: "scheduled",
          notes: `Tạo từ template: ${template.name}`,
          createdBy: userId,
        });

        createdSchedules.push(scheduleId);
      }
    }

    return {
      message: `Đã tạo ${createdSchedules.length} ca làm việc từ template`,
      scheduleIds: createdSchedules
    };
  },
});