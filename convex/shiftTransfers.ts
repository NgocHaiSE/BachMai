// convex/shiftTransfers.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Lấy danh sách yêu cầu chuyển ca
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("completed")
    )),
    fromStaffId: v.optional(v.id("staff")),
    toStaffId: v.optional(v.id("staff")),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Lấy tất cả transfers và filter
    let transfers = await ctx.db.query("shiftTransfers").order("desc").collect();

    // Áp dụng các filter
    if (args.status) {
      transfers = transfers.filter(t => t.status === args.status);
    }

    if (args.fromStaffId) {
      transfers = transfers.filter(t => t.fromStaffId === args.fromStaffId);
    }

    if (args.toStaffId) {
      transfers = transfers.filter(t => t.toStaffId === args.toStaffId);
    }

    if (args.startDate && args.endDate) {
      transfers = transfers.filter(t => 
        t.transferDate >= args.startDate! && t.transferDate <= args.endDate!
      );
    }

    // Populate thông tin liên quan
    const enrichedTransfers = await Promise.all(
      transfers.map(async (transfer) => {
        const fromStaff = await ctx.db.get(transfer.fromStaffId);
        const toStaff = await ctx.db.get(transfer.toStaffId);
        const originalSchedule = await ctx.db.get(transfer.originalScheduleId);
        const approvedBy = transfer.approvedBy ? await ctx.db.get(transfer.approvedBy) : null;
        const newSchedule = transfer.newScheduleId ? await ctx.db.get(transfer.newScheduleId) : null;

        return {
          ...transfer,
          fromStaff,
          toStaff,
          originalSchedule,
          approvedBy,
          newSchedule,
        };
      })
    );

    return enrichedTransfers;
  },
});

// Lấy chi tiết yêu cầu chuyển ca
export const get = query({
  args: { id: v.id("shiftTransfers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transfer = await ctx.db.get(args.id);
    if (!transfer) return null;

    const fromStaff = await ctx.db.get(transfer.fromStaffId);
    const toStaff = await ctx.db.get(transfer.toStaffId);
    const originalSchedule = await ctx.db.get(transfer.originalScheduleId);
    const approvedBy = transfer.approvedBy ? await ctx.db.get(transfer.approvedBy) : null;
    const newSchedule = transfer.newScheduleId ? await ctx.db.get(transfer.newScheduleId) : null;

    return {
      ...transfer,
      fromStaff,
      toStaff,
      originalSchedule,
      approvedBy,
      newSchedule,
    };
  },
});

// Tạo yêu cầu chuyển ca
export const create = mutation({
  args: {
    fromStaffId: v.id("staff"),
    toStaffId: v.id("staff"),
    originalScheduleId: v.id("workSchedules"),
    transferDate: v.string(),
    reason: v.string(),
    compensationRequired: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Clean notes - convert empty string to undefined
    const notes = args.notes && args.notes.trim() !== "" ? args.notes : undefined;

    // Kiểm tra lịch làm việc gốc
    const originalSchedule = await ctx.db.get(args.originalScheduleId);
    if (!originalSchedule) {
      throw new Error("Lịch làm việc không tồn tại");
    }

    if (originalSchedule.status !== "scheduled" && originalSchedule.status !== "confirmed") {
      throw new Error("Chỉ có thể chuyển ca đã được xếp lịch hoặc xác nhận");
    }

    // Kiểm tra nhân viên nhận ca có trống không
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const conflictingSchedule = allSchedules.find(s => 
      s.staffId === args.toStaffId && 
      s.date === originalSchedule.date && 
      s.status !== "cancelled"
    );

    if (conflictingSchedule) {
      throw new Error("Nhân viên nhận ca đã có lịch làm việc trong ngày này");
    }

    // Tạo mã chuyển ca
    const transferCode = `CT${Date.now().toString().slice(-8)}`;

    const transferId = await ctx.db.insert("shiftTransfers", {
      transferCode,
      fromStaffId: args.fromStaffId,
      toStaffId: args.toStaffId,
      originalScheduleId: args.originalScheduleId,
      transferDate: args.transferDate,
      reason: args.reason,
      compensationRequired: args.compensationRequired,
      notes, // Use cleaned notes
      status: "pending",
      requestDate: new Date().toISOString().split('T')[0],
      createdBy: userId,
    });

    // Cập nhật trạng thái lịch làm việc gốc
    await ctx.db.patch(args.originalScheduleId, {
      status: "transferred",
    });

    return transferId;
  },
});

// Phê duyệt yêu cầu chuyển ca
export const approve = mutation({
  args: {
    id: v.id("shiftTransfers"),
    approvedBy: v.id("staff"),
    approvalNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transfer = await ctx.db.get(args.id);
    if (!transfer) throw new Error("Yêu cầu chuyển ca không tồn tại");

    if (transfer.status !== "pending") {
      throw new Error("Chỉ có thể phê duyệt yêu cầu đang chờ xử lý");
    }

    const originalSchedule = await ctx.db.get(transfer.originalScheduleId);
    if (!originalSchedule) throw new Error("Lịch làm việc gốc không tồn tại");

    // Tạo lịch làm việc mới cho nhân viên nhận ca
    const newScheduleId = await ctx.db.insert("workSchedules", {
      staffId: transfer.toStaffId,
      date: originalSchedule.date,
      shiftType: originalSchedule.shiftType,
      startTime: originalSchedule.startTime,
      endTime: originalSchedule.endTime,
      department: originalSchedule.department,
      ward: originalSchedule.ward,
      workType: originalSchedule.workType,
      status: "confirmed",
      notes: `Nhận ca từ nhân viên khác - ${transfer.reason}`,
      createdBy: userId,
      confirmedBy: args.approvedBy,
      confirmedAt: new Date().toISOString(),
    });

    // Cập nhật yêu cầu chuyển ca
    await ctx.db.patch(args.id, {
      status: "approved",
      approvedBy: args.approvedBy,
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes: args.approvalNotes,
      newScheduleId,
    });

    // Tạo lịch bù ca nếu cần
    if (transfer.compensationRequired) {
      // Logic tạo lịch bù ca có thể được thêm vào đây
    }

    return newScheduleId;
  },
});

// Từ chối yêu cầu chuyển ca
export const reject = mutation({
  args: {
    id: v.id("shiftTransfers"),
    approvedBy: v.id("staff"),
    approvalNotes: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transfer = await ctx.db.get(args.id);
    if (!transfer) throw new Error("Yêu cầu chuyển ca không tồn tại");

    if (transfer.status !== "pending") {
      throw new Error("Chỉ có thể từ chối yêu cầu đang chờ xử lý");
    }

    // Khôi phục trạng thái lịch làm việc gốc
    await ctx.db.patch(transfer.originalScheduleId, {
      status: "confirmed",
    });

    // Cập nhật yêu cầu chuyển ca
    return await ctx.db.patch(args.id, {
      status: "rejected",
      approvedBy: args.approvedBy,
      approvalDate: new Date().toISOString().split('T')[0],
      approvalNotes: args.approvalNotes,
    });
  },
});

// Hoàn thành chuyển ca
export const complete = mutation({
  args: { id: v.id("shiftTransfers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transfer = await ctx.db.get(args.id);
    if (!transfer) throw new Error("Yêu cầu chuyển ca không tồn tại");

    if (transfer.status !== "approved") {
      throw new Error("Chỉ có thể hoàn thành yêu cầu đã được phê duyệt");
    }

    return await ctx.db.patch(args.id, {
      status: "completed",
    });
  },
});

// Hủy yêu cầu chuyển ca
export const cancel = mutation({
  args: { id: v.id("shiftTransfers") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const transfer = await ctx.db.get(args.id);
    if (!transfer) throw new Error("Yêu cầu chuyển ca không tồn tại");

    if (transfer.status !== "pending") {
      throw new Error("Chỉ có thể hủy yêu cầu đang chờ xử lý");
    }

    // Khôi phục trạng thái lịch làm việc gốc
    await ctx.db.patch(transfer.originalScheduleId, {
      status: "confirmed",
    });

    return await ctx.db.delete(args.id);
  },
});

// Tìm nhân viên có thể nhận ca
export const findAvailableStaff = query({
  args: {
    date: v.string(),
    department: v.string(),
    shiftType: v.string(),
    excludeStaffId: v.optional(v.id("staff")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Lấy tất cả nhân viên trong khoa
    const allStaff = await ctx.db.query("staff").collect();
    const departmentStaff = allStaff.filter(s => 
      s.department === args.department && s.isActive
    );

    // Lấy tất cả schedules trong ngày
    const allSchedules = await ctx.db.query("workSchedules").collect();
    const daySchedules = allSchedules.filter(s => 
      s.date === args.date && s.status !== "cancelled"
    );

    // Lọc ra nhân viên chưa có lịch làm việc trong ngày
    const availableStaff = [];

    for (const staff of departmentStaff) {
      if (args.excludeStaffId && staff._id === args.excludeStaffId) {
        continue;
      }

      const hasSchedule = daySchedules.some(s => s.staffId === staff._id);
      if (!hasSchedule) {
        availableStaff.push(staff);
      }
    }

    return availableStaff;
  },
});

// Lấy thống kê chuyển ca
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

    // Lấy tất cả transfers và filter
    const allTransfers = await ctx.db.query("shiftTransfers").collect();
    const transfers = allTransfers.filter(t => 
      t.transferDate >= startDate && t.transferDate <= endDate
    );

    const stats = {
      totalRequests: transfers.length,
      pendingRequests: transfers.filter(t => t.status === "pending").length,
      approvedRequests: transfers.filter(t => t.status === "approved").length,
      rejectedRequests: transfers.filter(t => t.status === "rejected").length,
      completedRequests: transfers.filter(t => t.status === "completed").length,
      approvalRate: transfers.length > 0 
        ? Math.round((transfers.filter(t => t.status === "approved").length / transfers.length) * 100)
        : 0,
    };

    return stats;
  },
});