import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  patients: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.optional(v.string()),
    phone: v.string(),
    dateOfBirth: v.string(),
    gender: v.union(v.literal("male"), v.literal("female"), v.literal("other")),
    address: v.string(),
    emergencyContact: v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    }),
    bloodType: v.optional(v.string()),
    allergies: v.optional(v.array(v.string())),
    medicalHistory: v.optional(v.string()),
    createdBy: v.id("users"),
    // Additional fields for transfer management
    idNumber: v.optional(v.string()), // CCCD/CMND
    insuranceNumber: v.optional(v.string()), // BHYT/BHXH
    insuranceType: v.optional(v.union(v.literal("BHYT"), v.literal("BHXH"), v.literal("none"))),
    department: v.optional(v.string()),
  })
    .index("by_name", ["lastName", "firstName"])
    .index("by_email", ["email"])
    .index("by_id_number", ["idNumber"])
    .searchIndex("search_patients", {
      searchField: "lastName",
      filterFields: ["firstName"],
    }),

  staff: defineTable({
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("doctor"),
      v.literal("nurse"),
      v.literal("admin"),
      v.literal("receptionist")
    ),
    department: v.string(),
    specialization: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    isActive: v.boolean(),
    createdBy: v.id("users"),
  })
    .index("by_role", ["role"])
    .index("by_department", ["department"])
    .index("by_email", ["email"]),

  appointments: defineTable({
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    appointmentDate: v.string(),
    appointmentTime: v.string(),
    duration: v.number(), // in minutes
    type: v.union(
      v.literal("consultation"),
      v.literal("follow-up"),
      v.literal("emergency"),
      v.literal("surgery"),
      v.literal("checkup")
    ),
    status: v.union(
      v.literal("scheduled"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no-show")
    ),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_staff", ["staffId"])
    .index("by_date", ["appointmentDate"])
    .index("by_status", ["status"]),

  medicalRecords: defineTable({
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
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_staff", ["staffId"])
    .index("by_type", ["recordType"]),

  transferRequests: defineTable({
    requestCode: v.string(), // Mã YC_chuyển viện
    patientId: v.id("patients"),
    staffId: v.id("staff"), // Bác sĩ phụ trách
    treatmentDate: v.string(), // Ngày điều trị
    reason: v.string(), // Lý do chuyển viện
    requestDate: v.string(), // Ngày yêu cầu chuyển viện
    destinationAddress: v.string(), // Địa chỉ cơ sở chuyển đến
    destinationFacility: v.string(), // Cơ sở y tế chuyển đến
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent")
    ), // Mức độ ưu tiên
    notes: v.optional(v.string()), // Ghi chú
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("completed")
    ), // Trạng thái
    approvalDate: v.optional(v.string()), // Ngày phê duyệt
    approvedBy: v.optional(v.id("staff")), // Người phê duyệt
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_staff", ["staffId"])
    .index("by_status", ["status"])
    .index("by_request_code", ["requestCode"]),

  transferRecords: defineTable({
    transferCode: v.string(), // Mã chuyển viện
    requestId: v.optional(v.id("transferRequests")), // Liên kết với yêu cầu
    patientId: v.id("patients"),
    staffId: v.id("staff"), // Bác sĩ phụ trách
    treatmentDate: v.string(), // Ngày điều trị
    reason: v.string(), // Lý do chuyển viện
    transferDate: v.string(), // Ngày chuyển viện
    estimatedTime: v.optional(v.string()), // Thời gian dự kiến
    destinationAddress: v.string(), // Địa chỉ cơ sở chuyển đến
    destinationFacility: v.string(), // Cơ sở y tế chuyển đến
    destinationPhone: v.optional(v.string()), // Số điện thoại cơ sở chuyển đến
    diagnosis: v.string(), // Chẩn đoán
    icd10Code: v.optional(v.string()), // Mã ICD10
    // Vital signs
    pulse: v.optional(v.string()), // Mạch
    bloodPressure: v.optional(v.string()), // Huyết áp
    respiratoryRate: v.optional(v.string()), // Nhịp thở
    temperature: v.optional(v.string()), // Nhiệt độ
    consciousness: v.optional(v.string()), // Ý thức
    clinicalProgress: v.optional(v.string()), // Diễn biến lâm sàng
    treatmentPerformed: v.optional(v.string()), // Điều trị đã thực hiện
    accompaniedPersonId: v.optional(v.string()), // Mã người đi cùng
    notes: v.optional(v.string()), // Ghi chú
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("completed")
    ), // Trạng thái
    approvalDate: v.optional(v.string()), // Ngày phê duyệt
    approvedBy: v.optional(v.id("staff")), // Người phê duyệt
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_staff", ["staffId"])
    .index("by_status", ["status"])
    .index("by_transfer_code", ["transferCode"])
    .index("by_request", ["requestId"]),

  prescriptions: defineTable({
    prescriptionCode: v.string(),
    patientId: v.id("patients"),
    staffId: v.id("staff"),
    prescriptionDate: v.string(),
    diagnosis: v.string(),
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
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_patient", ["patientId"])
    .index("by_staff", ["staffId"])
    .index("by_prescription_code", ["prescriptionCode"])
    .index("by_date", ["prescriptionDate"]),

};

const workManagementTables = {
  // Bảng lịch làm việc
  workSchedules: defineTable({
    staffId: v.id("staff"),
    date: v.string(), // YYYY-MM-DD
    shiftType: v.union(
      v.literal("morning"), // Ca sáng (6:00-14:00)
      v.literal("afternoon"), // Ca chiều (14:00-22:00) 
      v.literal("night"), // Ca đêm (22:00-6:00)
      v.literal("full-day"), // Ca ngày (8:00-17:00)
      v.literal("on-call") // Ca trực
    ),
    startTime: v.string(), // HH:mm
    endTime: v.string(), // HH:mm
    department: v.string(), // Khoa phòng
    ward: v.optional(v.string()), // Phòng/khu vực cụ thể
    status: v.union(
      v.literal("scheduled"), // Đã xếp lịch
      v.literal("confirmed"), // Đã xác nhận
      v.literal("completed"), // Đã hoàn thành
      v.literal("cancelled"), // Đã hủy
      v.literal("transferred") // Đã chuyển ca
    ),
    workType: v.union(
      v.literal("regular"), // Làm việc thường
      v.literal("overtime"), // Tăng ca
      v.literal("holiday"), // Làm ngày lễ
      v.literal("emergency") // Trực cấp cứu
    ),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
    confirmedBy: v.optional(v.id("staff")), // Người xác nhận ca làm
    confirmedAt: v.optional(v.string()),
  })
    .index("by_staff", ["staffId"])
    .index("by_date", ["date"])
    .index("by_staff_date", ["staffId", "date"])
    .index("by_department", ["department", "date"])
    .index("by_status", ["status"])
    .index("by_shift_type", ["shiftType", "date"]),

  // Bảng chuyển ca làm việc
  shiftTransfers: defineTable({
    transferCode: v.string(), // Mã chuyển ca
    fromStaffId: v.id("staff"), // Nhân viên chuyển ca
    toStaffId: v.id("staff"), // Nhân viên nhận ca
    originalScheduleId: v.id("workSchedules"), // Lịch làm gốc
    transferDate: v.string(), // Ngày chuyển ca
    reason: v.string(), // Lý do chuyển ca
    status: v.union(
      v.literal("pending"), // Chờ xử lý
      v.literal("approved"), // Đã duyệt
      v.literal("rejected"), // Từ chối
      v.literal("completed") // Đã hoàn thành
    ),
    requestDate: v.string(), // Ngày yêu cầu
    approvedBy: v.optional(v.id("staff")), // Người phê duyệt
    approvalDate: v.optional(v.string()), // Ngày phê duyệt
    approvalNotes: v.optional(v.string()), // Ghi chú phê duyệt
    newScheduleId: v.optional(v.id("workSchedules")), // Lịch làm mới sau khi chuyển
    compensationRequired: v.boolean(), // Có cần bù ca không
    compensationScheduleId: v.optional(v.id("workSchedules")), // Lịch bù ca
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_from_staff", ["fromStaffId"])
    .index("by_to_staff", ["toStaffId"])
    .index("by_status", ["status"])
    .index("by_transfer_date", ["transferDate"])
    .index("by_transfer_code", ["transferCode"]),

  // Bảng đơn xin nghỉ ca làm
  leaveRequests: defineTable({
    requestCode: v.string(), // Mã đơn xin nghỉ
    staffId: v.id("staff"), // Nhân viên xin nghỉ
    leaveType: v.union(
      v.literal("sick"), // Nghỉ ốm
      v.literal("vacation"), // Nghỉ phép
      v.literal("personal"), // Nghỉ việc riêng
      v.literal("emergency"), // Nghỉ khẩn cấp
      v.literal("maternity"), // Nghỉ thai sản
      v.literal("bereavement"), // Nghỉ tang
      v.literal("annual"), // Nghỉ phép năm
      v.literal("unpaid") // Nghỉ không lương
    ),
    startDate: v.string(), // Ngày bắt đầu nghỉ
    endDate: v.string(), // Ngày kết thúc nghỉ
    startTime: v.optional(v.string()), // Giờ bắt đầu (nếu nghỉ theo giờ)
    endTime: v.optional(v.string()), // Giờ kết thúc (nếu nghỉ theo giờ)
    isFullDay: v.boolean(), // Nghỉ cả ngày hay theo giờ
    totalDays: v.number(), // Tổng số ngày nghỉ
    reason: v.string(), // Lý do nghỉ
    status: v.union(
      v.literal("pending"), // Chờ xử lý
      v.literal("approved"), // Đã duyệt
      v.literal("rejected"), // Từ chối
      v.literal("cancelled") // Đã hủy
    ),
    requestDate: v.string(), // Ngày yêu cầu
    approvedBy: v.optional(v.id("staff")), // Người phê duyệt
    approvalDate: v.optional(v.string()), // Ngày phê duyệt
    approvalNotes: v.optional(v.string()), // Ghi chú phê duyệt
    affectedScheduleIds: v.array(v.id("workSchedules")), // Danh sách lịch làm bị ảnh hưởng
    replacementStaffId: v.optional(v.id("staff")), // Nhân viên thay thế
    attachmentFileId: v.optional(v.string()), // File đính kèm (giấy bác sĩ, etc.)
    emergencyContact: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string()
    })),
    notes: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_staff", ["staffId"])
    .index("by_status", ["status"])
    .index("by_leave_type", ["leaveType"])
    .index("by_date_range", ["startDate", "endDate"])
    .index("by_request_code", ["requestCode"]),

  // Bảng mẫu lịch làm việc (template)
  scheduleTemplates: defineTable({
    name: v.string(), // Tên mẫu
    department: v.string(), // Khoa phòng áp dụng
    description: v.optional(v.string()),
    isActive: v.boolean(),
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
        requiredStaffCount: v.number(), // Số nhân viên cần thiết
        requiredRoles: v.array(v.string()) // Vai trò cần thiết
      }))
    })),
    validFrom: v.string(), // Hiệu lực từ ngày
    validTo: v.optional(v.string()), // Hiệu lực đến ngày
    createdBy: v.id("users"),
  })
    .index("by_department", ["department"])
    .index("by_active", ["isActive"]),

  // Bảng theo dõi giờ làm việc
};




export default defineSchema({
  ...authTables,
  ...applicationTables,
  ...workManagementTables,
});
