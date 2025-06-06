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

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
