import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

export default function PrescriptionManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);

  const prescriptions = useQuery(api.prescriptions.list);
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const createPrescription = useMutation(api.prescriptions.create);
  const updatePrescription = useMutation(api.prescriptions.update);
  const deletePrescription = useMutation(api.prescriptions.remove);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingPrescription) {
        await updatePrescription({ id: editingPrescription._id, ...formData });
        toast.success("Cập nhật đơn thuốc thành công");
      } else {
        await createPrescription(formData);
        toast.success("Tạo đơn thuốc thành công");
      }
      setShowForm(false);
      setEditingPrescription(null);
    } catch (error) {
      toast.error("Lưu đơn thuốc thất bại");
    }
  };

  const handleDelete = async (id: Id<"prescriptions">) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn thuốc này?")) {
      try {
        await deletePrescription({ id });
        toast.success("Xóa đơn thuốc thành công");
      } catch (error) {
        toast.error("Xóa đơn thuốc thất bại");
      }
    }
  };

  const handleEdit = (prescription: any) => {
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  const handleView = (prescription: any) => {
    setEditingPrescription(prescription);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Thuốc</h2>
        <button
          onClick={() => {
            setEditingPrescription(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Tạo Đơn Thuốc Mới
        </button>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã Đơn Thuốc
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên Bệnh Nhân
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số Điện Thoại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Tạo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chẩn Đoán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bác Sĩ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ghi Chú
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prescriptions?.map((prescription) => (
                <tr key={prescription._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {prescription.prescriptionCode}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {prescription.patient?.firstName} {prescription.patient?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {prescription.patient?.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {prescription.prescriptionDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {prescription.diagnosis}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      BS. {prescription.staff?.firstName} {prescription.staff?.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {prescription.notes || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleView(prescription)}
                      className="text-green-600 hover:text-green-900 mr-3"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => handleEdit(prescription)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(prescription._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prescription Form Modal */}
      {showForm && (
        <PrescriptionForm
          prescription={editingPrescription}
          patients={patients || []}
          staff={staff || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPrescription(null);
          }}
        />
      )}
    </div>
  );
}

function PrescriptionForm({ prescription, patients, staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    patientId: prescription?.patientId || "",
    staffId: prescription?.staffId || "",
    diagnosis: prescription?.diagnosis || "",
    notes: prescription?.notes || "",
    medications: prescription?.medications || [],
  });

  const [newMedication, setNewMedication] = useState({
    medicineCode: "",
    medicineName: "",
    quantity: 1,
    expiryDate: "",
    dosage: "",
    unitPrice: 0,
    totalPrice: 0,
  });

  const [editingMedicationIndex, setEditingMedicationIndex] = useState<number | null>(null);

  const calculateTotals = (medications: any[]) => {
    const totalAmount = medications.reduce((sum, med) => sum + med.totalPrice, 0);
    const insuranceAmount = totalAmount * 0.8; // 80% bảo hiểm chi trả
    const finalAmount = totalAmount - insuranceAmount;
    return { totalAmount, insuranceAmount, finalAmount };
  };

  const addMedication = () => {
    if (!newMedication.medicineCode || !newMedication.medicineName) {
      toast.error("Vui lòng nhập mã thuốc và tên thuốc");
      return;
    }

    const totalPrice = newMedication.quantity * newMedication.unitPrice;
    const medicationToAdd = { ...newMedication, totalPrice };

    if (editingMedicationIndex !== null) {
      const updatedMedications = [...formData.medications];
      updatedMedications[editingMedicationIndex] = medicationToAdd;
      setFormData({ ...formData, medications: updatedMedications });
      setEditingMedicationIndex(null);
    } else {
      setFormData({
        ...formData,
        medications: [...formData.medications, medicationToAdd],
      });
    }

    setNewMedication({
      medicineCode: "",
      medicineName: "",
      quantity: 1,
      expiryDate: "",
      dosage: "",
      unitPrice: 0,
      totalPrice: 0,
    });
  };

  const editMedication = (index: number) => {
    setNewMedication(formData.medications[index]);
    setEditingMedicationIndex(index);
  };

  const removeMedication = (index: number) => {
    const updatedMedications = formData.medications.filter((_: any, i: number) => i !== index);
    setFormData({ ...formData, medications: updatedMedications });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.medications.length === 0) {
      toast.error("Vui lòng thêm ít nhất một loại thuốc");
      return;
    }

    const { totalAmount, insuranceAmount, finalAmount } = calculateTotals(formData.medications);
    onSubmit({ ...formData, totalAmount, insuranceAmount, finalAmount });
  };

  const { totalAmount, insuranceAmount, finalAmount } = calculateTotals(formData.medications);

  const selectedPatient = patients.find((p: any) => p._id === formData.patientId);
  const selectedStaff = staff.find((s: any) => s._id === formData.staffId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {prescription ? "Chi Tiết Đơn Thuốc" : "Tạo Đơn Thuốc Mới"}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin chung */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-4">Thông Tin Chung</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mã Đơn Thuốc
                  </label>
                  <input
                    type="text"
                    value={prescription?.prescriptionCode || "Tự động tạo"}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bác Sĩ
                  </label>
                  <select
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {staff.map((doctor: any) => (
                      <option key={doctor._id} value={doctor._id}>
                        BS. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bệnh Nhân
                  </label>
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient: any) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Bảo Hiểm
                  </label>
                  <input
                    type="text"
                    value={selectedPatient?.insuranceNumber || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số Điện Thoại
                  </label>
                  <input
                    type="text"
                    value={selectedPatient?.phone || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Địa Chỉ
                  </label>
                  <input
                    type="text"
                    value={selectedPatient?.address || ""}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chẩn Đoán
                  </label>
                  <textarea
                    required
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi Chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Danh sách thuốc */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Danh Sách Thuốc</h4>
              
              {/* Form thêm/sửa thuốc */}
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã Thuốc
                    </label>
                    <input
                      type="text"
                      value={newMedication.medicineCode}
                      onChange={(e) => setNewMedication({ ...newMedication, medicineCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên Thuốc
                    </label>
                    <input
                      type="text"
                      value={newMedication.medicineName}
                      onChange={(e) => setNewMedication({ ...newMedication, medicineName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số Lượng
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newMedication.quantity}
                      onChange={(e) => {
                        const quantity = parseInt(e.target.value);
                        setNewMedication({ 
                          ...newMedication, 
                          quantity,
                          totalPrice: quantity * newMedication.unitPrice
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hạn Sử Dụng
                    </label>
                    <input
                      type="date"
                      value={newMedication.expiryDate}
                      onChange={(e) => setNewMedication({ ...newMedication, expiryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cách Dùng
                    </label>
                    <input
                      type="text"
                      value={newMedication.dosage}
                      onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="VD: 1 viên uống 2 lần/ngày"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn Giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={newMedication.unitPrice}
                      onChange={(e) => {
                        const unitPrice = parseFloat(e.target.value);
                        setNewMedication({ 
                          ...newMedication, 
                          unitPrice,
                          totalPrice: newMedication.quantity * unitPrice
                        });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thành Tiền (VNĐ)
                    </label>
                    <input
                      type="number"
                      value={newMedication.totalPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={addMedication}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      {editingMedicationIndex !== null ? "Cập nhật" : "Thêm"} Thuốc
                    </button>
                  </div>
                </div>
              </div>

              {/* Bảng thuốc */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Mã Thuốc
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tên Thuốc
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Số Lượng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hạn SD
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cách Dùng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Đơn Giá
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thành Tiền
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thao Tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.medications.map((medication: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.medicineCode}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.medicineName}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.expiryDate}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.dosage}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.unitPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {medication.totalPrice.toLocaleString('vi-VN')} đ
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => editMedication(index)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => removeMedication(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tổng kết */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tổng Tiền
                  </label>
                  <input
                    type="text"
                    value={`${totalAmount.toLocaleString('vi-VN')} đ`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bảo Hiểm Chi Trả (80%)
                  </label>
                  <input
                    type="text"
                    value={`${insuranceAmount.toLocaleString('vi-VN')} đ`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bệnh Nhân Trả
                  </label>
                  <input
                    type="text"
                    value={`${finalAmount.toLocaleString('vi-VN')} đ`}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-bold text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {prescription ? "Cập nhật" : "Tạo"} Đơn Thuốc
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}