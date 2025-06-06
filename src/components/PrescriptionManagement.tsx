import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import { 
  Pill, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  User,
  Stethoscope,
  Calendar,
  FileText,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Phone,
  Building2,
  DollarSign,
  ShieldCheck,
  MapPin,
  Hash,
  Clock,
  AlertCircle,
  Package,
  Calculator
} from "lucide-react";

export default function PrescriptionManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewMode, setIsViewMode] = useState(false);

  const prescriptions = useQuery(api.prescriptions.list);
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const createPrescription = useMutation(api.prescriptions.create);
  const updatePrescription = useMutation(api.prescriptions.update);
  const deletePrescription = useMutation(api.prescriptions.remove);

  const filteredPrescriptions = prescriptions?.filter(prescription =>
    !searchTerm || 
    prescription.prescriptionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${prescription.patient?.firstName} ${prescription.patient?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient?.phone.includes(searchTerm) ||
    prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      setIsViewMode(false);
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
    setIsViewMode(false);
    setShowForm(true);
  };

  const handleView = (prescription: any) => {
    setEditingPrescription(prescription);
    setIsViewMode(true);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mr-3">
            <Pill className="w-6 h-6 text-pink-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Đơn Thuốc</h2>
            <p className="text-gray-600">Quản lý kê đơn và theo dõi thuốc cho bệnh nhân</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingPrescription(null);
            setIsViewMode(false);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-medium rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo Đơn Thuốc Mới
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn, tên bệnh nhân, số điện thoại, chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>
          <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </button>
        </div>
        
        {filteredPrescriptions && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Pill className="w-4 h-4 mr-1" />
            Tìm thấy {filteredPrescriptions.length} đơn thuốc
          </div>
        )}
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredPrescriptions === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="text-center py-12">
            <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn thuốc</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Không có đơn thuốc nào phù hợp với từ khóa tìm kiếm" : "Chưa có đơn thuốc nào trong hệ thống"}
            </p>
            <button
              onClick={() => {
                setEditingPrescription(null);
                setIsViewMode(false);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo đơn thuốc đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông Tin Đơn Thuốc
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh Nhân
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bác Sĩ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chẩn Đoán
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng Tiền
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrescriptions.map((prescription) => (
                  <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mr-4">
                          <Pill className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Hash className="w-4 h-4 mr-1 text-gray-400" />
                            {prescription.prescriptionCode}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            {prescription.prescriptionDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.patient?.firstName} {prescription.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Phone className="w-4 h-4 mr-1" />
                            {prescription.patient?.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Stethoscope className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            BS. {prescription.staff?.firstName} {prescription.staff?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Building2 className="w-4 h-4 mr-1" />
                            {prescription.staff?.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate" title={prescription.diagnosis}>
                          {prescription.diagnosis}
                        </div>
                        {prescription.notes && (
                          <div className="text-sm text-gray-500 truncate mt-1" title={prescription.notes}>
                            Ghi chú: {prescription.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 flex items-center justify-end">
                          <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                          {prescription.finalAmount.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Tổng: {prescription.totalAmount.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleView(prescription)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(prescription)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(prescription._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Prescription Form Modal */}
      {showForm && (
        <PrescriptionForm
          prescription={editingPrescription}
          patients={patients || []}
          staff={staff || []}
          isViewMode={isViewMode}
          setIsViewMode={setIsViewMode}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPrescription(null);
            setIsViewMode(false);
          }}
        />
      )}
    </div>
  );
}
function PrescriptionForm({ prescription, patients, staff, isViewMode, setIsViewMode, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    patientId: prescription?.patientId || "",
    staffId: prescription?.staffId || "",
    diagnosis: prescription?.diagnosis || "",
    notes: prescription?.notes || "",
    medications: prescription?.medications || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.medications.length === 0) {
      toast.error("Vui lòng thêm ít nhất một loại thuốc");
      return;
    }

    setIsSubmitting(true);
    try {
      const { totalAmount, insuranceAmount, finalAmount } = calculateTotals(formData.medications);
      await onSubmit({ ...formData, totalAmount, insuranceAmount, finalAmount });
    } finally {
      setIsSubmitting(false);
    }
  };

  const { totalAmount, insuranceAmount, finalAmount } = calculateTotals(formData.medications);
  const selectedPatient = patients.find((p: any) => p._id === formData.patientId);
  const selectedStaff = staff.find((s: any) => s._id === formData.staffId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mr-3">
                <Pill className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {isViewMode ? "Chi Tiết Đơn Thuốc" : prescription ? "Sửa Đơn Thuốc" : "Tạo Đơn Thuốc Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {isViewMode ? "Xem thông tin chi tiết đơn thuốc" : prescription ? "Cập nhật thông tin đơn thuốc" : "Tạo đơn kê thuốc mới cho bệnh nhân"}
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-8">
            {/* Thông tin chung */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-pink-600" />
                Thông Tin Chung
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã Đơn Thuốc
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={prescription?.prescriptionCode || "Tự động tạo"}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bác Sĩ *
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      required
                      value={formData.staffId}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      disabled={isViewMode}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors appearance-none disabled:bg-gray-100"
                    >
                      <option value="">Chọn bác sĩ</option>
                      {staff.map((doctor: any) => (
                        <option key={doctor._id} value={doctor._id}>
                          BS. {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bệnh Nhân *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      disabled={isViewMode}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors appearance-none disabled:bg-gray-100"
                    >
                      <option value="">Chọn bệnh nhân</option>
                      {patients.map((patient: any) => (
                        <option key={patient._id} value={patient._id}>
                          {patient.firstName} {patient.lastName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {selectedPatient && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Bảo Hiểm
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={selectedPatient?.insuranceNumber || "Không có"}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số Điện Thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={selectedPatient?.phone || ""}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa Chỉ
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        value={selectedPatient?.address || ""}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600 resize-none"
                        rows={1}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chẩn Đoán *
                  </label>
                  <textarea
                    required
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    disabled={isViewMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-100"
                    rows={3}
                    placeholder="Nhập chẩn đoán"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi Chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    disabled={isViewMode}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-100"
                    rows={3}
                    placeholder="Ghi chú thêm"
                  />
                </div>
              </div>
            </div>

            {/* Danh sách thuốc */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-pink-600" />
                Danh Sách Thuốc
              </h4>
              
              {/* Form thêm/sửa thuốc */}
              {!isViewMode && (
                <div className="bg-pink-50 rounded-2xl p-6 mb-6">
                  <h5 className="font-medium text-gray-900 mb-4">
                    {editingMedicationIndex !== null ? "Sửa thuốc" : "Thêm thuốc mới"}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mã Thuốc *
                      </label>
                      <input
                        type="text"
                        value={newMedication.medicineCode}
                        onChange={(e) => setNewMedication({ ...newMedication, medicineCode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="VD: MED001"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên Thuốc *
                      </label>
                      <input
                        type="text"
                        value={newMedication.medicineName}
                        onChange={(e) => setNewMedication({ ...newMedication, medicineName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                        placeholder="Tên thuốc"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số Lượng *
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cách Dùng
                      </label>
                      <input
                        type="text"
                        value={newMedication.dosage}
                        onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
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
                  </div>
                  <button
                    type="button"
                    onClick={addMedication}
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {editingMedicationIndex !== null ? "Cập nhật" : "Thêm"} Thuốc
                  </button>
                  {editingMedicationIndex !== null && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMedicationIndex(null);
                        setNewMedication({
                          medicineCode: "",
                          medicineName: "",
                          quantity: 1,
                          expiryDate: "",
                          dosage: "",
                          unitPrice: 0,
                          totalPrice: 0,
                        });
                      }}
                      className="ml-3 inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Hủy sửa
                    </button>
                  )}
                </div>
              )}

              {/* Bảng thuốc */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {formData.medications.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Chưa có thuốc nào trong đơn</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            STT
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Mã & Tên Thuốc
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
                          {!isViewMode && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Thao Tác
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.medications.map((medication: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {index + 1}
                            </td>
                            <td className="px-4 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {medication.medicineName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Mã: {medication.medicineCode}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {medication.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {medication.expiryDate || "N/A"}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-900">
                              {medication.dosage || "N/A"}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {medication.unitPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {medication.totalPrice.toLocaleString('vi-VN')} đ
                            </td>
                            {!isViewMode && (
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Tổng kết */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-pink-600" />
                Tổng Kết
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Tổng Tiền</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {totalAmount.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Bảo Hiểm (80%)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {insuranceAmount.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-pink-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-pink-600">Bệnh Nhân Trả</p>
                      <p className="text-3xl font-bold text-pink-600">
                        {finalAmount.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <Calculator className="w-8 h-8 text-pink-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          {!isViewMode && (
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white rounded-xl font-medium hover:from-pink-700 hover:to-pink-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    {prescription ? "Cập nhật" : "Tạo"} Đơn Thuốc
                  </>
                )}
              </button>
            </div>
          )}
          
          {isViewMode && (
            <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsViewMode(false);
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Chỉnh sửa
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}