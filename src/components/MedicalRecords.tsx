import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function MedicalRecords() {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const patients = useQuery(api.patients.list);
  const records = useQuery(
    api.medicalRecords.listByPatient,
    selectedPatientId ? { patientId: selectedPatientId as Id<"patients"> } : "skip"
  );
  const staff = useQuery(api.staff.list);
  const createRecord = useMutation(api.medicalRecords.create);
  const updateRecord = useMutation(api.medicalRecords.update);
  const deleteRecord = useMutation(api.medicalRecords.remove);

  const selectedPatient = patients?.find(p => p._id === selectedPatientId);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRecord) {
        await updateRecord({ id: editingRecord._id, ...formData });
        toast.success("Cập nhật hồ sơ bệnh án thành công");
      } else {
        await createRecord({ ...formData, patientId: selectedPatientId as Id<"patients"> });
        toast.success("Tạo hồ sơ bệnh án thành công");
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error("Lưu hồ sơ bệnh án thất bại");
    }
  };

  const handleDelete = async (id: Id<"medicalRecords">) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ bệnh án này?")) {
      try {
        await deleteRecord({ id });
        toast.success("Xóa hồ sơ bệnh án thành công");
      } catch (error) {
        toast.error("Xóa hồ sơ bệnh án thất bại");
      }
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Hồ Sơ Bệnh Án</h2>
        {selectedPatientId && (
          <button
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thêm Hồ Sơ Bệnh Án
          </button>
        )}
      </div>

      {/* Patient Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Chọn bệnh nhân:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Chọn một bệnh nhân</option>
            {patients?.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.firstName} {patient.lastName} - {patient.phone}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPatient && (
        <>
          {/* Patient Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông Tin Bệnh Nhân</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Họ và tên</p>
                <p className="font-medium">{selectedPatient.firstName} {selectedPatient.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Ngày sinh</p>
                <p className="font-medium">{selectedPatient.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Nhóm máu</p>
                <p className="font-medium">{selectedPatient.bloodType || "Chưa xác định"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dị ứng</p>
                <p className="font-medium">
                  {selectedPatient.allergies?.length ? selectedPatient.allergies.join(", ") : "Không có"}
                </p>
              </div>
            </div>
          </div>

          {/* Medical Records */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Hồ Sơ Bệnh Án</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {records?.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  Chưa có hồ sơ bệnh án cho bệnh nhân này.
                </div>
              ) : (
                records?.map((record) => (
                  <div key={record._id} className="p-6 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            record.recordType === "diagnosis" ? "bg-red-100 text-red-800" :
                            record.recordType === "prescription" ? "bg-blue-100 text-blue-800" :
                            record.recordType === "test-result" ? "bg-green-100 text-green-800" :
                            record.recordType === "treatment" ? "bg-purple-100 text-purple-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {record.recordType === "diagnosis" ? "Chẩn đoán" :
                             record.recordType === "prescription" ? "Kê đơn thuốc" :
                             record.recordType === "test-result" ? "Kết quả xét nghiệm" :
                             record.recordType === "treatment" ? "Điều trị" :
                             "Ghi chú"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(record._creationTime).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{record.title}</h4>
                        <p className="text-gray-700 mb-3">{record.description}</p>
                        
                        {record.diagnosis && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">Chẩn đoán:</p>
                            <p className="text-gray-700">{record.diagnosis}</p>
                          </div>
                        )}

                        {record.prescription && record.prescription.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">Đơn thuốc:</p>
                            <div className="space-y-1">
                              {record.prescription.map((med: any, index: number) => (
                                <div key={index} className="text-sm text-gray-700">
                                  <span className="font-medium">{med.medication}</span> - 
                                  {med.dosage}, {med.frequency}, {med.duration}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.testResults && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-gray-900">Kết quả xét nghiệm:</p>
                            <div className="text-sm text-gray-700">
                              <p><span className="font-medium">Xét nghiệm:</span> {record.testResults.testName}</p>
                              <p><span className="font-medium">Kết quả:</span> {record.testResults.results}</p>
                              {record.testResults.normalRange && (
                                <p><span className="font-medium">Giá trị bình thường:</span> {record.testResults.normalRange}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-500">
                          Bởi: BS. {record.staff?.firstName} {record.staff?.lastName}
                        </p>
                      </div>
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(record._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Medical Record Form Modal */}
      {showForm && selectedPatientId && (
        <MedicalRecordForm
          record={editingRecord}
          staff={staff || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
        />
      )}
    </div>
  );
}

function MedicalRecordForm({ record, staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    staffId: record?.staffId || "",
    recordType: record?.recordType || "note",
    title: record?.title || "",
    description: record?.description || "",
    diagnosis: record?.diagnosis || "",
    prescription: record?.prescription || [],
    testResults: record?.testResults || null,
  });

  const [newMedication, setNewMedication] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
  });

  const [testResults, setTestResults] = useState({
    testName: record?.testResults?.testName || "",
    results: record?.testResults?.results || "",
    normalRange: record?.testResults?.normalRange || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      testResults: formData.recordType === "test-result" && testResults.testName ? testResults : undefined,
    };
    onSubmit(submitData);
  };

  const addMedication = () => {
    if (newMedication.medication && newMedication.dosage) {
      setFormData({
        ...formData,
        prescription: [...formData.prescription, newMedication]
      });
      setNewMedication({ medication: "", dosage: "", frequency: "", duration: "" });
    }
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      prescription: formData.prescription.filter((_: any, i: number) => i !== index)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {record ? "Sửa Hồ Sơ Bệnh Án" : "Thêm Hồ Sơ Bệnh Án Mới"}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bác sĩ
                </label>
                <select
                  required
                  value={formData.staffId}
                  onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Chọn bác sĩ</option>
                  {staff.filter((s: any) => s.role === "doctor").map((doctor: any) => (
                    <option key={doctor._id} value={doctor._id}>
                      BS. {doctor.firstName} {doctor.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại hồ sơ
                </label>
                <select
                  value={formData.recordType}
                  onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="note">Ghi chú</option>
                  <option value="diagnosis">Chẩn đoán</option>
                  <option value="prescription">Kê đơn thuốc</option>
                  <option value="test-result">Kết quả xét nghiệm</option>
                  <option value="treatment">Điều trị</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            {(formData.recordType === "diagnosis" || formData.recordType === "treatment") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chẩn đoán
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            )}

            {formData.recordType === "prescription" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn thuốc
                </label>
                
                {/* Current medications */}
                {formData.prescription.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {formData.prescription.map((med: any, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">
                          {med.medication} - {med.dosage}, {med.frequency}, {med.duration}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add new medication */}
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Tên thuốc"
                    value={newMedication.medication}
                    onChange={(e) => setNewMedication({ ...newMedication, medication: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Liều dùng"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Tần suất"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Thời gian"
                    value={newMedication.duration}
                    onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMedication}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Thêm thuốc
                </button>
              </div>
            )}

            {formData.recordType === "test-result" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên xét nghiệm
                  </label>
                  <input
                    type="text"
                    value={testResults.testName}
                    onChange={(e) => setTestResults({ ...testResults, testName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết quả
                  </label>
                  <textarea
                    value={testResults.results}
                    onChange={(e) => setTestResults({ ...testResults, results: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị bình thường
                  </label>
                  <input
                    type="text"
                    value={testResults.normalRange}
                    onChange={(e) => setTestResults({ ...testResults, normalRange: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {record ? "Cập nhật" : "Tạo"} Hồ Sơ
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}