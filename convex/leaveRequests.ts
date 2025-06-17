// convex/leaveRequests.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Lấy danh sách đơn xin nghỉ
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("cancelled")
    )),
    staffId: v.optional(v.id("staff")),
    leaveType: v.optional(v.union(
      v.literal("sick"),
      v.literal("vacation"),
      v.literal("personal"),
      v.literal("emergency"),
      v.literal("maternity"),
      v.literal("bereavement"),
      v.literal("annual"),
      v.literal("unpaid")
    )),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Bắt đầu với query cơ bản
    let requests = await ctx.db.query("leaveRequests").order("desc").collect();

    // Áp dụng các filter
    if (args.status) {
      requests = requests.filter(r => r.status === args.status);
    }

    if (args.staffId) {
      requests = requests.filter(r => r.staffId === args.staffId);
    }

    if (args.leaveType) {
      requests = requests.filter(r => r.leaveType === args.leaveType);
    }

    if (args.startDate && args.endDate) {
      requests = requests.filter(r => 
        r.startDate >= args.startDate! && r.endDate <= args.endDate!
      );
    }

    // Populate thông tin liên quan
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const staff = await ctx.db.get(request.staffId);
        const approvedBy = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
        const replacementStaff = request.replacementStaffId ? await ctx.db.get(request.replacementStaffId) : null;

        // Lấy thông tin lịch làm việc bị ảnh hưởng
        const affectedSchedules = await Promise.all(
          request.affectedScheduleIds.map(async (scheduleId) => {
            return await ctx.db.get(scheduleId);
          })
        );

        return {
          ...request,
          staff,
          approvedBy,
          replacementStaff,
          affectedSchedules: affectedSchedules.filter(Boolean),
        };
      })
    );

    return enrichedRequests;
  },
});

// Lấy chi tiết đơn xin nghỉ
export const get = query({
  args: { id: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.id);
    if (!request) return null;

    const staff = await ctx.db.get(request.staffId);
    const approvedBy = request.approvedBy ? await ctx.db.get(request.approvedBy) : null;
    const replacementStaff = request.replacementStaffId ? await ctx.db.get(request.replacementStaffId) : null;

    // Lấy thông tin lịch làm việc bị ảnh hưởng
    const affectedSchedules = await Promise.all(
      request.affectedScheduleIds.map(async (scheduleId) => {
        return await ctx.db.get(scheduleId);
      })
    );

    return {
      ...request,
      staff,
      approvedBy,
      replacementStaff,
      affectedSchedules: affectedSchedules.filter(Boolean),
    };
  },
});

// Tạo đơn xin nghỉ
export const create = mutation({
  args: {
    staffId: v.id("staff"),
    leaveType: v.union(
      v.literal("sick"),
      v.literal("vacation"),
      v.literal("personal"),
      v.literal("emergency"),
      v.literal("maternity"),
      v.literal("bereavement"),
      v.literal("annual"),
      v.literal("unpaid")
    ),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    isFullDay: v.boolean(),
    reason: v.string(),
    replacementStaffId: v.optional(v.string()), // Changed to string to handle empty values
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string()
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Convert empty string to undefined for replacementStaffId
    const replacementStaffId = args.replacementStaffId && args.replacementStaffId.trim() !== "" 
      ? args.replacementStaffId as any // Cast to Id<"staff">
      : undefined;

    // Validate replacementStaffId if provided
    if (replacementStaffId) {
      const replacementStaff = await ctx.db.get(replacementStaffId);
      if (!replacementStaff) {
        throw new Error("Nhân viên thay thế không tồn tại");
      }
    }

    // Filter out empty emergency contact
    const emergencyContact = args.emergencyContact?.name?.trim() 
      ? args.emergencyContact 
      : undefined;

    // Tính số ngày nghỉ
    const startDate = new Date(args.startDate);
    const endDate = new Date(args.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Tìm các lịch làm việc bị ảnh hưởng
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const affectedSchedules = allSchedules.filter(s => 
      s.staffId === args.staffId &&
      s.date >= args.startDate &&
      s.date <= args.endDate &&
      s.status !== "cancelled"
    );

    // Kiểm tra xung đột với đơn nghỉ khác
    const allRequests = await ctx.db.query("leaveRequests").collect();
    const conflictingRequest = allRequests.find(r => 
      r.staffId === args.staffId &&
      r.status === "approved" &&
      ((r.startDate <= args.startDate && r.endDate >= args.startDate) ||
       (r.startDate <= args.endDate && r.endDate >= args.endDate))
    );

    if (conflictingRequest) {
      throw new Error("Đã có đơn nghỉ được duyệt trong khoảng thời gian này");
    }

    // Tạo mã đơn xin nghỉ
    const requestCode = `DN${Date.now().toString().slice(-8)}`;

    const requestId = await ctx.db.insert("leaveRequests", {
      staffId: args.staffId,
      leaveType: args.leaveType,
      startDate: args.startDate,
      endDate: args.endDate,
      startTime: args.startTime,
      endTime: args.endTime,
      isFullDay: args.isFullDay,
      reason: args.reason,
      replacementStaffId, // Use processed value
      emergencyContact, // Use processed value
      notes: args.notes,
      requestCode,
      totalDays,
      status: "pending",
      requestDate: new Date().toISOString().split('T')[0],
      affectedScheduleIds: affectedSchedules.map(s => s._id),
      createdBy: userId,
    });

    return requestId;
  },
});

// Cập nhật đơn xin nghỉ
export const update = mutation({
  args: {
    id: v.id("leaveRequests"),
    leaveType: v.union(
      v.literal("sick"),
      v.literal("vacation"),
      v.literal("personal"),
      v.literal("emergency"),
      v.literal("maternity"),
      v.literal("bereavement"),
      v.literal("annual"),
      v.literal("unpaid")
    ),
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    isFullDay: v.boolean(),
    reason: v.string(),
    replacementStaffId: v.optional(v.string()), // Changed to string to handle empty values
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string()
    })),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { id, ...updates } = args;

    const request = await ctx.db.get(id);
    if (!request) throw new Error("Đơn xin nghỉ không tồn tại");

    if (request.status !== "pending") {
      throw new Error("Chỉ có thể sửa đơn xin nghỉ đang chờ xử lý");
    }

    // Convert empty string to undefined for replacementStaffId
    const replacementStaffId = updates.replacementStaffId && updates.replacementStaffId.trim() !== "" 
      ? updates.replacementStaffId as any // Cast to Id<"staff">
      : undefined;

    // Validate replacementStaffId if provided
    if (replacementStaffId) {
      const replacementStaff = await ctx.db.get(replacementStaffId);
      if (!replacementStaff) {
        throw new Error("Nhân viên thay thế không tồn tại");
      }
    }

    // Filter out empty emergency contact
    const emergencyContact = updates.emergencyContact?.name?.trim() 
      ? updates.emergencyContact 
      : undefined;

    // Tính lại số ngày nghỉ
    const startDate = new Date(updates.startDate);
    const endDate = new Date(updates.endDate);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Tìm lại các lịch làm việc bị ảnh hưởng
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const affectedSchedules = allSchedules.filter(s => 
      s.staffId === request.staffId &&
      s.date >= updates.startDate &&
      s.date <= updates.endDate &&
      s.status !== "cancelled"
    );

    return await ctx.db.patch(id, {
      leaveType: updates.leaveType,
      startDate: updates.startDate,
      endDate: updates.endDate,
      startTime: updates.startTime,
      endTime: updates.endTime,
      isFullDay: updates.isFullDay,
      reason: updates.reason,
      replacementStaffId, // Use processed value
      emergencyContact, // Use processed value
      notes: updates.notes,
      totalDays,
      affectedScheduleIds: affectedSchedules.map(s => s._id),
    });
  },
});

// Phê duyệt đơn xin nghỉ
export const approve = mutation({
  args: {
    id: v.id("leaveRequests"),
    approvedBy: v.id("staff"),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Đơn xin nghỉ không tồn tại");

    if (request.status !== "pending") {
      throw new Error("Chỉ có thể phê duyệt đơn xin nghỉ đang chờ xử lý");
    }

    // Cập nhật trạng thái các lịch làm việc bị ảnh hưởng
    for (const scheduleId of request.affectedScheduleIds) {
      const schedule = await ctx.db.get(scheduleId);
      if (schedule) {
        await ctx.db.patch(scheduleId, {
          status: "cancelled",
          notes: `Nghỉ ${request.leaveType} - ${request.reason}`,
        });
      }
    }

    // Tạo lịch làm việc cho nhân viên thay thế (nếu có)
    if (request.replacementStaffId) {
      for (const scheduleId of request.affectedScheduleIds) {
        const originalSchedule = await ctx.db.get(scheduleId);
        if (originalSchedule) {
          await ctx.db.insert("workSchedules", {
            staffId: request.replacementStaffId,
            date: originalSchedule.date,
            shiftType: originalSchedule.shiftType,
            startTime: originalSchedule.startTime,
            endTime: originalSchedule.endTime,
            department: originalSchedule.department,
            ward: originalSchedule.ward,
            workType: originalSchedule.workType,
            status: "confirmed",
            notes: `Thay ca cho nhân viên nghỉ - ${request.reason}`,
            createdBy: userId,
          });
        }
      }
    }

    return await ctx.db.patch(args.id, {
      status: "approved",
      approvedBy: args.approvedBy,
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes: args.approvalNotes,
    });
  },
});

// Từ chối đơn xin nghỉ
export const reject = mutation({
  args: {
    id: v.id("leaveRequests"),
    approvedBy: v.id("staff"),
    approvalNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Đơn xin nghỉ không tồn tại");

    if (request.status !== "pending") {
      throw new Error("Chỉ có thể từ chối đơn xin nghỉ đang chờ xử lý");
    }

    return await ctx.db.patch(args.id, {
      status: "rejected",
      approvedBy: args.approvedBy,
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes: args.approvalNotes,
    });
  },
});

// Hủy đơn xin nghỉ
export const cancel = mutation({
  args: { id: v.id("leaveRequests") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const request = await ctx.db.get(args.id);
    if (!request) throw new Error("Đơn xin nghỉ không tồn tại");

    if (request.status !== "pending") {
      throw new Error("Chỉ có thể hủy đơn xin nghỉ đang chờ xử lý");
    }

    return await ctx.db.patch(args.id, {
      status: "cancelled",
    });
  },
});

// Lấy số ngày nghỉ đã sử dụng của nhân viên
export const getUsedLeaveDays = query({
  args: {
    staffId: v.id("staff"),
    year: v.string(), // YYYY
    leaveType: v.optional(v.union(
      v.literal("sick"),
      v.literal("vacation"),
      v.literal("personal"),
      v.literal("emergency"),
      v.literal("maternity"),
      v.literal("bereavement"),
      v.literal("annual"),
      v.literal("unpaid")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const startDate = `${args.year}-01-01`;
    const endDate = `${args.year}-12-31`;

    // Lấy tất cả requests và filter
    const allRequests = await ctx.db.query("leaveRequests").collect();
    const approvedRequests = allRequests.filter(r => 
      r.staffId === args.staffId &&
      r.status === "approved" &&
      r.startDate >= startDate &&
      r.endDate <= endDate &&
      (!args.leaveType || r.leaveType === args.leaveType)
    );

    const totalUsedDays = approvedRequests.reduce((sum, request) => sum + request.totalDays, 0);

    const byType = approvedRequests.reduce((acc: Record<string, number>, request) => {
      acc[request.leaveType] = (acc[request.leaveType] || 0) + request.totalDays;
      return acc;
    }, {});

    return {
      totalUsedDays,
      byType,
      requests: approvedRequests.length,
    };
  },
});

// Lấy thống kê đơn xin nghỉ
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

    // Lấy tất cả requests và filter
    const allRequests = await ctx.db.query("leaveRequests").collect();
    const requests = allRequests.filter(r => 
      r.startDate >= startDate && r.endDate <= endDate
    );

    const stats = {
      totalRequests: requests.length,
      pendingRequests: requests.filter(r => r.status === "pending").length,
      approvedRequests: requests.filter(r => r.status === "approved").length,
      rejectedRequests: requests.filter(r => r.status === "rejected").length,
      totalLeaveDays: requests
        .filter(r => r.status === "approved")
        .reduce((sum, r) => sum + r.totalDays, 0),
      leaveTypeDistribution: requests.reduce((acc: Record<string, number>, request) => {
        acc[request.leaveType] = (acc[request.leaveType] || 0) + 1;
        return acc;
      }, {}),
      approvalRate: requests.length > 0 
        ? Math.round((requests.filter(r => r.status === "approved").length / requests.length) * 100)
        : 0,
    };

    return stats;
  },
});