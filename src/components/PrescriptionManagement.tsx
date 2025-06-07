import React, { useState } from 'react';
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
  Calculator,
  Download,
  CreditCard,
  Activity
} from 'lucide-react';

// Mock data cho demo
const mockPrescriptions = [
  {
    _id: "1",
    prescriptionCode: "DT001",
    createdDate: "2025-06-07",
    patient: {
      firstName: "Nguyễn",
      lastName: "Văn A",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      insuranceNumber: "DN1234567890"
    },
    doctor: {
      firstName: "Trần",
      lastName: "Thị B",
      department: "Tim mạch"
    },
    diagnosis: "Tăng huyết áp",
    medications: [
      {
        code: "MED001",
        name: "Amlodipine 5mg",
        quantity: 30,
        expiryDate: "2026-12-31",
        dosage: "1 viên/ngày sau ăn",
        unitPrice: 15000,
        totalPrice: 450000
      }
    ],
    totalAmount: 450000,
    insuranceAmount: 360000,
    finalAmount: 90000,
    notes: "Uống đều đặn, tái khám sau 1 tháng"
  },
  {
    _id: "2", 
    prescriptionCode: "DT002",
    createdDate: "2025-06-06",
    patient: {
      firstName: "Lê",
      lastName: "Thị C",
      phone: "0987654321",
      address: "456 Đường XYZ, Quận 2, TP.HCM",
      insuranceNumber: "DN0987654321"
    },
    doctor: {
      firstName: "Nguyễn",
      lastName: "Văn D",
      department: "Nội tổng hợp"
    },
    diagnosis: "Viêm dạ dày",
    medications: [
      {
        code: "MED002",
        name: "Omeprazole 20mg",
        quantity: 20,
        expiryDate: "2026-08-31",
        dosage: "1 viên/ngày trước ăn",
        unitPrice: 8000,
        totalPrice: 160000
      }
    ],
    totalAmount: 160000,
    insuranceAmount: 128000,
    finalAmount: 32000,
    notes: "Uống trước ăn 30 phút"
  }
];

const mockMedicines = [
  { code: "MED001", name: "Amlodipine 5mg", unitPrice: 15000 },
  { code: "MED002", name: "Omeprazole 20mg", unitPrice: 8000 },
  { code: "MED003", name: "Metformin 500mg", unitPrice: 12000 },
  { code: "MED004", name: "Paracetamol 500mg", unitPrice: 5000 },
  { code: "MED005", name: "Amoxicillin 250mg", unitPrice: 18000 }
];

const mockPatients = [
  {
    _id: "1",
    firstName: "Nguyễn",
    lastName: "Văn A", 
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    insuranceNumber: "DN1234567890"
  },
  {
    _id: "2",
    firstName: "Lê", 
    lastName: "Thị C",
    phone: "0987654321",
    address: "456 Đường XYZ, Quận 2, TP.HCM", 
    insuranceNumber: "DN0987654321"
  }
];

const mockDoctors = [
  {
    _id: "1",
    firstName: "Trần",
    lastName: "Thị B",
    department: "Tim mạch"
  },
  {
    _id: "2", 
    firstName: "Nguyễn",
    lastName: "Văn D",
    department: "Nội tổng hợp"
  }
];

export default function PrescriptionManagement() {
  const [prescriptions, setPrescriptions] = useState(mockPrescriptions);
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(null); // null, 'detail', 'preview'

  const filteredPrescriptions = prescriptions.filter(prescription =>
    !searchTerm || 
    prescription.prescriptionCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${prescription.patient.firstName} ${prescription.patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient.phone.includes(searchTerm) ||
    prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (formData) => {
    try {
      if (editingPrescription) {
        setPrescriptions(prev => prev.map(p => 
          p._id === editingPrescription._id ? { ...p, ...formData } : p
        ));
      } else {
        const newPrescription = {
          _id: Date.now().toString(),
          prescriptionCode: `DT${Date.now().toString().slice(-6)}`,
          createdDate: new Date().toISOString().split('T')[0],
          ...formData
        };
        setPrescriptions(prev => [...prev, newPrescription]);
      }
      setShowForm(false);
      setEditingPrescription(null);
      setViewMode(null);
    } catch (error) {
      console.error("Error saving prescription:", error);
    }
  };

  const handleDelete = (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn thuốc này?")) {
      setPrescriptions(prev => prev.filter(p => p._id !== id));
    }
  };

  const handleEdit = (prescription) => {
    setEditingPrescription(prescription);
    setViewMode(null);
    setShowForm(true);
  };

  const handleView = (prescription, mode) => {
    setEditingPrescription(prescription);
    setViewMode(mode);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mr-4">
              <Pill className="w-7 h-7 text-pink-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Thuốc</h1>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingPrescription(null);
              setViewMode(null);
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-pink-600 to-pink-700 text-white font-semibold rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5 mr-2" />
            Thêm Đơn Thuốc Mới
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
          
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Pill className="w-4 h-4 mr-1" />
            Tìm thấy {filteredPrescriptions.length} đơn thuốc
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredPrescriptions.length === 0 ? (
            <div className="text-center py-12">
              <Pill className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy đơn thuốc</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "Không có đơn thuốc nào phù hợp với từ khóa tìm kiếm" : "Chưa có đơn thuốc nào trong hệ thống"}
              </p>
              <button
                onClick={() => {
                  setEditingPrescription(null);
                  setViewMode(null);
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
                      Mã
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên Bệnh Nhân
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SĐT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày Lập
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Chẩn Đoán
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Họ Tên Bác Sĩ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ghi Chú
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription) => (
                    <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mr-3">
                            <Hash className="w-5 h-5 text-pink-600" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {prescription.prescriptionCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {prescription.patient.firstName} {prescription.patient.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {prescription.patient.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {prescription.createdDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {prescription.diagnosis}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          BS. {prescription.doctor.firstName} {prescription.doctor.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {prescription.doctor.department}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {prescription.notes || "Không có"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(prescription, 'detail')}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleView(prescription, 'preview')}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Xem trước phiếu"
                          >
                            <FileText className="w-4 h-4" />
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

        {/* Form Modal */}
        {showForm && (
          <PrescriptionForm
            prescription={editingPrescription}
            viewMode={viewMode}
            patients={mockPatients}
            doctors={mockDoctors}
            medicines={mockMedicines}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPrescription(null);
              setViewMode(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

function PrescriptionForm({ prescription, viewMode, patients, doctors, medicines, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    doctorId: prescription?.doctor?._id || "",
    patientId: prescription?.patient?._id || "",
    diagnosis: prescription?.diagnosis || "",
    notes: prescription?.notes || "",
    medications: prescription?.medications || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMedicineSearch, setShowMedicineSearch] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [newMedication, setNewMedication] = useState({
    code: "",
    name: "",
    quantity: 1,
    expiryDate: "",
    dosage: "",
    unitPrice: 0,
    totalPrice: 0,
  });

  const selectedPatient = patients.find(p => p._id === formData.patientId);
  const selectedDoctor = doctors.find(d => d._id === formData.doctorId);

  const calculateTotals = (medications) => {
    const totalAmount = medications.reduce((sum, med) => sum + med.totalPrice, 0);
    const insuranceAmount = totalAmount * 0.8; // 80% bảo hiểm chi trả
    const finalAmount = totalAmount - insuranceAmount;
    return { totalAmount, insuranceAmount, finalAmount };
  };

  const { totalAmount, insuranceAmount, finalAmount } = calculateTotals(formData.medications);

  const filteredMedicines = medicines.filter(med =>
    med.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
    med.code.toLowerCase().includes(medicineSearchTerm.toLowerCase())
  );

  const addMedication = () => {
    if (!newMedication.code || !newMedication.name) {
      alert("Vui lòng nhập mã thuốc và tên thuốc");
      return;
    }

    const totalPrice = newMedication.quantity * newMedication.unitPrice;
    const medicationToAdd = { ...newMedication, totalPrice };

    setFormData({
      ...formData,
      medications: [...formData.medications, medicationToAdd],
    });

    setNewMedication({
      code: "",
      name: "",
      quantity: 1,
      expiryDate: "",
      dosage: "",
      unitPrice: 0,
      totalPrice: 0,
    });
    setShowMedicineSearch(false);
    setMedicineSearchTerm("");
  };

  const removeMedication = (index) => {
    const updatedMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: updatedMedications });
  };

  const selectMedicine = (medicine) => {
    setNewMedication({
      ...newMedication,
      code: medicine.code,
      name: medicine.name,
      unitPrice: medicine.unitPrice,
      totalPrice: newMedication.quantity * medicine.unitPrice
    });
    setShowMedicineSearch(false);
    setMedicineSearchTerm("");
  };

  const handleSubmit = () => {
    if (viewMode) return; // Không submit khi ở chế độ xem
    
    if (formData.medications.length === 0) {
      alert("Vui lòng thêm ít nhất một loại thuốc");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        patient: selectedPatient,
        doctor: selectedDoctor,
        totalAmount,
        insuranceAmount,
        finalAmount
      };
      onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = viewMode === 'detail' || viewMode === 'preview';

  if (viewMode === 'preview') {
    return <PrintPreview prescription={{ ...prescription, ...formData }} onCancel={onCancel} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center mr-3">
                <Pill className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {viewMode === 'detail' ? "Chi Tiết Đơn Thuốc" : 
                   prescription ? "Sửa Đơn Thuốc" : "Thêm Đơn Thuốc Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {viewMode === 'detail' ? "Xem thông tin chi tiết đơn thuốc" :
                   prescription ? "Cập nhật thông tin đơn thuốc" : "Tạo đơn kê thuốc mới cho bệnh nhân"}
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
        
        <div className="p-6">
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
                    Họ Tên Bác Sĩ *
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      required
                      value={formData.doctorId}
                      onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                      disabled={isReadOnly}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors appearance-none disabled:bg-gray-100"
                    >
                      <option value="">Chọn bác sĩ</option>
                      {doctors.map((doctor) => (
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
                    Họ Tên Bệnh Nhân *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                      disabled={isReadOnly}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors appearance-none disabled:bg-gray-100"
                    >
                      <option value="">Chọn bệnh nhân</option>
                      {patients.map((patient) => (
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
                      Số BHYT
                    </label>
                    <div className="relative">
                      <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={selectedPatient.insuranceNumber || "Không có"}
                        readOnly
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điện Thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={selectedPatient.phone}
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
                        value={selectedPatient.address}
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
                    Chẩn Đoán Bệnh *
                  </label>
                  <textarea
                    required
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    disabled={isReadOnly}
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
                    disabled={isReadOnly}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors disabled:bg-gray-100"
                    rows={3}
                    placeholder="Ghi chú thêm"
                  />
                </div>
              </div>
            </div>

            {/* Danh sách thuốc */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900 flex items-center">
                  <Package className="w-5 h-5 mr-2 text-pink-600" />
                  Danh Sách Thuốc
                </h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setShowMedicineSearch(true)}
                    className="inline-flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm Thuốc
                  </button>
                )}
              </div>

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
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STT</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số Lượng</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hạn SD</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liều Dùng</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đơn Giá</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng Tiền</th>
                          {!isReadOnly && (
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao Tác</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.medications.map((medication, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{medication.code}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{medication.name}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{medication.quantity}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{medication.expiryDate || "N/A"}</td>
                            <td className="px-4 py-4 text-sm text-gray-900">{medication.dosage}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {medication.unitPrice.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {medication.totalPrice.toLocaleString('vi-VN')} đ
                            </td>
                            {!isReadOnly && (
                              <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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

              {/* Tổng tiền */}
              <div className="mt-6 bg-gray-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-xl border">
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
                  <div className="bg-white p-4 rounded-xl border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Số Tiền BHYT Trả</p>
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
                        <p className="text-sm text-pink-600">Thành Tiền</p>
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
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              {isReadOnly ? "Đóng" : "Hủy"}
            </button>
            {viewMode === 'detail' && (
              <button
                type="button"
                onClick={() => {
                  onCancel();
                  setTimeout(() => {
                    handleView(prescription, 'preview');
                  }, 100);
                }}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center"
              >
                <FileText className="w-5 h-5 mr-2" />
                Xem Trước Phiếu
              </button>
            )}
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSubmit}
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
            )}
          </div>
        </div>
      </div>

      {/* Medicine Search Modal */}
      {showMedicineSearch && (
        <MedicineSearchModal
          medicines={filteredMedicines}
          searchTerm={medicineSearchTerm}
          onSearchChange={setMedicineSearchTerm}
          newMedication={newMedication}
          setNewMedication={setNewMedication}
          onSelectMedicine={selectMedicine}
          onAddMedication={addMedication}
          onCancel={() => {
            setShowMedicineSearch(false);
            setMedicineSearchTerm("");
          }}
        />
      )}
    </div>
  );
}

function MedicineSearchModal({ medicines, searchTerm, onSearchChange, newMedication, setNewMedication, onSelectMedicine, onAddMedication, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Tìm Kiếm Thuốc</h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm thuốc theo tên hoặc mã..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
            />
          </div>

          {/* Medicine List */}
          <div className="border rounded-xl overflow-hidden max-h-60 overflow-y-auto">
            {medicines.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Không tìm thấy thuốc phù hợp
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {medicines.map((medicine) => (
                  <button
                    key={medicine.code}
                    onClick={() => onSelectMedicine(medicine)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-gray-900">{medicine.name}</div>
                        <div className="text-sm text-gray-500">Mã: {medicine.code}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {medicine.unitPrice.toLocaleString('vi-VN')} đ
                        </div>
                        <div className="text-sm text-gray-500">Đơn giá</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Medicine */}
          <div className="bg-pink-50 rounded-xl p-6">
            <h4 className="font-medium text-gray-900 mb-4">Thông tin thuốc</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Thuốc *</label>
                <input
                  type="text"
                  value={newMedication.code}
                  onChange={(e) => setNewMedication({ ...newMedication, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="VD: MED001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên Thuốc *</label>
                <input
                  type="text"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="Tên thuốc"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số Lượng *</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn Sử Dụng</label>
                <input
                  type="date"
                  value={newMedication.expiryDate}
                  onChange={(e) => setNewMedication({ ...newMedication, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Liều Dùng</label>
                <input
                  type="text"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                  placeholder="VD: 1 viên uống 2 lần/ngày"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn Giá (VNĐ)</label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng Tiền</label>
              <input
                type="text"
                value={`${newMedication.totalPrice.toLocaleString('vi-VN')} đ`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onAddMedication}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                Thêm Thuốc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PrintPreview({ prescription, onCancel }) {
  const handlePrint = () => {
    alert("Chức năng in sẽ được thực hiện trong môi trường thực tế");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Xem Trước Phiếu Kê Đơn Thuốc</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              In Phiếu
            </button>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="max-w-full mx-auto bg-white">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">BỆNH VIỆN BẠCH MAI</h1>
              <p className="text-gray-600 mb-1">Địa chỉ: 78 Đường Giải Phóng, Đống Đa, Hà Nội</p>
              <p className="text-gray-600 mb-6">Điện thoại: (024) 3869 3731</p>
              <h2 className="text-xl font-bold text-gray-900">PHIẾU KÊ ĐỖN THUỐC</h2>
            </div>

            {/* Patient Info */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="mb-2"><strong>Mã đơn thuốc:</strong> {prescription.prescriptionCode}</p>
                <p className="mb-2"><strong>Họ tên bệnh nhân:</strong> {prescription.patient?.firstName} {prescription.patient?.lastName}</p>
                <p className="mb-2"><strong>Số BHYT:</strong> {prescription.patient?.insuranceNumber || "Không có"}</p>
                <p className="mb-2"><strong>Điện thoại:</strong> {prescription.patient?.phone}</p>
              </div>
              <div>
                <p className="mb-2"><strong>Ngày kê đơn:</strong> {prescription.createdDate || new Date().toISOString().split('T')[0]}</p>
                <p className="mb-2"><strong>Bác sĩ:</strong> BS. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</p>
                <p className="mb-2"><strong>Khoa:</strong> {prescription.doctor?.department}</p>
                <p className="mb-2"><strong>Chẩn đoán:</strong> {prescription.diagnosis}</p>
              </div>
            </div>

            {/* Medicine Table */}
            <table className="w-full border-collapse border border-gray-300 mb-6">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-3 py-2 text-left">STT</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Tên thuốc</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Số lượng</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Cách dùng</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Đơn giá</th>
                  <th className="border border-gray-300 px-3 py-2 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications?.map((med, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-3 py-2">{med.name}</td>
                    <td className="border border-gray-300 px-3 py-2">{med.quantity}</td>
                    <td className="border border-gray-300 px-3 py-2">{med.dosage}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {med.unitPrice.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {med.totalPrice.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-6">
              <div className="w-1/2">
                <div className="flex justify-between py-2">
                  <span><strong>Tổng tiền:</strong></span>
                  <span>{prescription.totalAmount?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between py-2">
                  <span><strong>Số tiền BHYT trả:</strong></span>
                  <span>{prescription.insuranceAmount?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between py-2 border-t font-bold">
                  <span><strong>Thành tiền:</strong></span>
                  <span>{prescription.finalAmount?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {prescription.notes && (
              <div className="mb-6">
                <p><strong>Ghi chú:</strong> {prescription.notes}</p>
              </div>
            )}

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 mt-12">
              <div className="text-center">
                <p className="mb-16"><strong>Người bệnh</strong></p>
                <p>(Ký và ghi rõ họ tên)</p>
              </div>
              <div className="text-center">
                <p className="mb-16"><strong>Bác sĩ kê đơn</strong></p>
                <p>BS. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}