import React, { useState, useEffect } from 'react';
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
  Activity,
  Receipt,
  Shield,
  CheckCircle,
  XCircle,
  MoreVertical
} from 'lucide-react';

// Import API hooks
import { 
  usePrescriptions, 
  usePrescriptionDoctors, 
  usePrescriptionPatients,
  useMedicines,
  useCreatePrescription,
  useUpdatePrescription,
  useDeletePrescription,
  useAddMedicineToPrescription,
  useConfirmPrescriptionPayment,
  usePrescriptionDetails
  
} from '../hooks/api';

export default function PrescriptionManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams, setSearchParams] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [viewMode, setViewMode] = useState(null); // null, 'detail', 'preview', 'invoice'
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  

  // API calls
  const { data: prescriptions = [], loading: prescriptionsLoading, error: prescriptionsError, refetch: refetchPrescriptions } = usePrescriptions(searchParams);
  const { data: doctors = [], loading: doctorsLoading } = usePrescriptionDoctors();
  const { data: patients = [], loading: patientsLoading } = usePrescriptionPatients();
  const { data: medicines = [], loading: medicinesLoading } = useMedicines();

  // Mutations
  const createPrescription = useCreatePrescription();
  const updatePrescription = useUpdatePrescription();
  const deletePrescription = useDeletePrescription();
  const confirmPayment = useConfirmPrescriptionPayment();

  // Search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params: any = {};
      if (searchTerm.trim()) params.Keyword = searchTerm.trim();
      if (startDate) params.TuNgay = startDate;
      if (endDate) params.DenNgay = endDate;
      setSearchParams(params);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, startDate, endDate]);

  const filteredPrescriptions = prescriptions.filter(prescription =>
    !searchTerm || 
    prescription.prescriptionCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${prescription.patient?.firstName} ${prescription.patient?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.patient?.phone?.includes(searchTerm) ||
    prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (formData) => {
    try {
      if (editingPrescription) {
        await updatePrescription.mutate({
          id: editingPrescription._id,
          ...formData
        });
      } else {
        await createPrescription.mutate(formData);
      }
      
      setShowForm(false);
      setEditingPrescription(null);
      setViewMode(null);
      refetchPrescriptions();
    } catch (error) {
      console.error("Error saving prescription:", error);
      alert("Có lỗi xảy ra khi lưu đơn thuốc: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Bạn có chắc chắn muốn xóa đơn thuốc này?")) {
      try {
        await deletePrescription.mutate(id);
        refetchPrescriptions();
      } catch (error) {
        console.error("Error deleting prescription:", error);
        alert("Có lỗi xảy ra khi xóa đơn thuốc: " + error.message);
      }
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

  const handleConfirmPayment = async (id) => {
    if (confirm("Xác nhận thanh toán đơn thuốc này?")) {
      try {
        await confirmPayment.mutate(id);
        refetchPrescriptions();
        alert("Xác nhận thanh toán thành công!");
      } catch (error) {
        console.error("Error confirming payment:", error);
        alert("Có lỗi xảy ra khi xác nhận thanh toán: " + error.message);
      }
    }
  };

  if (prescriptionsError) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">{prescriptionsError}</p>
            <button
              onClick={() => refetchPrescriptions()}
              className="inline-flex items-center px-4 py-2 btn-primary rounded-lg transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center">
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
            className="inline-flex items-center px-4 py-3 btn-primary font-semibold rounded-xl hover:from-pink-700 hover:to-pink-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 transition-colors"
              />
            </div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
            <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-5 h-5 mr-2" />
              Bộ lọc
            </button>
          </div>
          
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Pill className="w-4 h-4 mr-1" />
            {prescriptionsLoading ? "Đang tải..." : `Tìm thấy ${filteredPrescriptions.length} đơn thuốc`}
          </div>
        </div>

        {/* Prescriptions List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {prescriptionsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 text-gray-400 mx-auto mb-4 animate-spin" />
              <p className="text-gray-600">Đang tải danh sách đơn thuốc...</p>
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
                  setViewMode(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 rounded-lg btn-primary transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo đơn thuốc đầu tiên
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Mã Đơn Thuốc
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Tên Bệnh Nhân
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      SĐT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Ngày Lập
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-64">
                      Chẩn Đoán
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                      Bác Sĩ
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                      BHYT
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">
                      Thành Tiền
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Hành Động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPrescriptions.map((prescription) => (
                    <tr key={prescription._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                            {prescription.prescriptionCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 whitespace-nowrap">
                          {prescription.patient?.firstName} {prescription.patient?.lastName}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 whitespace-nowrap">
                          {prescription.patient?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 whitespace-nowrap">
                          {prescription.createdDate}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900" style={{ maxWidth: '250px' }}>
                          <div className="truncate" title={prescription.diagnosis}>
                            {prescription.diagnosis}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 whitespace-nowrap">
                          BS. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {prescription.doctor?.department}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {prescription.hasInsurance ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                              <Shield className="w-3 h-3 mr-1" />
                              Có BHYT
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 whitespace-nowrap">
                              Không BHYT
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold whitespace-nowrap">
                          {prescription.finalAmount?.toLocaleString('vi-VN')} đ
                        </div>
                        {prescription.hasInsurance && (
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            Tổng: {prescription.totalAmount?.toLocaleString('vi-VN')} đ
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionDropdown
                          prescription={prescription}
                          onView={handleView}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onConfirmPayment={handleConfirmPayment}
                        />
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
            patients={patients}
            doctors={doctors}
            medicines={medicines}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingPrescription(null);
              setViewMode(null);
            }}
            isLoading={createPrescription.loading || updatePrescription.loading}
          />
        )}
      </div>
    </div>
  );
}

function ActionDropdown({ prescription, onView, onEdit, onDelete, onConfirmPayment }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);
  const buttonRef = React.useRef(null);

  // Đóng dropdown khi click ra ngoài
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    {
      icon: Eye,
      label: "Xem chi tiết",
      onClick: () => onView(prescription, 'detail'),
      color: "text-green-600 hover:bg-green-50"
    },
    {
      icon: Receipt,
      label: "In hóa đơn",
      onClick: () => onView(prescription, 'invoice'),
      color: "text-blue-600 hover:bg-blue-50"
    },
    {
      icon: FileText,
      label: "Xem trước phiếu",
      onClick: () => onView(prescription, 'preview'),
      color: "text-purple-600 hover:bg-purple-50"
    }
  ];

  // Add conditional actions based on prescription status
  if (prescription.status !== 'Đã thanh toán') {
    menuItems.push({
      icon: CreditCard,
      label: "Xác nhận thanh toán",
      onClick: () => onConfirmPayment(prescription._id),
      color: "text-green-600 hover:bg-green-50"
    });
  }

  if (prescription.status !== 'Đã thanh toán') {
    menuItems.push({
      icon: Edit3,
      label: "Chỉnh sửa",
      onClick: () => onEdit(prescription),
      color: "text-orange-600 hover:bg-orange-50"
    });
  }

  menuItems.push({
    icon: Trash2,
    label: "Xóa",
    onClick: () => onDelete(prescription._id),
    color: "text-red-600 hover:bg-red-50"
  });

  const handleMenuItemClick = (item) => {
    item.onClick();
    setIsOpen(false);
  };

  // Tính toán vị trí dropdown
  const getDropdownPosition = () => {
    if (!buttonRef.current) return {};
    
    const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = menuItems.length * 40 + 8; // Estimate height
    const viewportHeight = window.innerHeight;
    
    // Kiểm tra có đủ không gian phía trên không
    const spaceAbove = buttonRect.top;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    
    // Nếu không đủ không gian phía trên, hiển thị bên dưới
    const showAbove = spaceAbove > dropdownHeight && spaceAbove > spaceBelow;
    
    return {
      position: 'fixed',
      right: `${window.innerWidth - buttonRect.right}px`,
      [showAbove ? 'bottom' : 'top']: showAbove 
        ? `${viewportHeight - buttonRect.top + 4}px`
        : `${buttonRect.bottom + 4}px`,
      zIndex: 1000
    };
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Hành động"
        type="button"
      >
        <MoreVertical className="w-5 h-5" />
      </button>
      
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-transparent"
            style={{ zIndex: 999 }}
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div 
            className="w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1"
            style={getDropdownPosition()}
          >
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleMenuItemClick(item)}
                  className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${item.color}`}
                  type="button"
                >
                  <IconComponent className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function PrescriptionForm({ prescription, viewMode, patients, doctors, medicines, onSubmit, onCancel, isLoading }) {
  const { data: prescriptionDetails, loading: detailsLoading } = usePrescriptionDetails(prescription?._id || "");

  const [formData, setFormData] = useState({
    doctorId: prescription?.doctor?._id || "",
    patientId: prescription?.patient?._id || "",
    diagnosis: prescription?.diagnosis || "",
    notes: prescription?.notes || "",
    medications: prescription?.medications || [],
    hasInsurance: prescription?.hasInsurance || false,
  });
  
  useEffect(() => {
    // When opening the form, populate fields from the provided prescription
    if (!prescription) return;
    setFormData({
      doctorId: prescription.doctor?._id || "",
      patientId: prescription.patient?._id || "",
      diagnosis: prescription.diagnosis || "",
      notes: prescription.notes || "",
      medications: prescription.medications || [],
      hasInsurance: prescription.hasInsurance || false,
    });
  }, [prescription]);

  useEffect(() => {
    // Once full details are loaded, update medications and other fields without clearing existing values
    if (!prescriptionDetails) return;
    
    // Handle the new API response format with success wrapper
    const details = prescriptionDetails.success ? prescriptionDetails : prescriptionDetails;
    const medications = details.data || details.medications || [];
    
    setFormData(prev => ({
      ...prev,
      doctorId: details.doctor?._id ?? prev.doctorId,
      patientId: details.patient?._id ?? prev.patientId,
      diagnosis: details.diagnosis ?? prev.diagnosis,
      notes: details.notes ?? prev.notes,
      medications: medications,
      hasInsurance: details.hasInsurance ?? prev.hasInsurance,
    }));
  }, [prescriptionDetails]);
  

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

  const calculateTotals = (medications, hasInsurance) => {
    const totalAmount = medications.reduce((sum, med) => sum + (med.totalPrice || 0), 0);
    const insuranceAmount = hasInsurance ? totalAmount * 0.8 : 0; // 80% bảo hiểm chi trả
    const finalAmount = totalAmount - insuranceAmount;
    return { totalAmount, insuranceAmount, finalAmount };
  };

  const { totalAmount, insuranceAmount, finalAmount } = calculateTotals(formData.medications, formData.hasInsurance);

  const filteredMedicines = medicines.filter(med =>
    med.TenDuocPham?.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
    med.idDuocPham?.toLowerCase().includes(medicineSearchTerm.toLowerCase())
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

  const formLoading = isLoading || detailsLoading;
  const removeMedication = (index) => {
    const updatedMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: updatedMedications });
  };

  const selectMedicine = (medicine) => {
    setNewMedication({
      ...newMedication,
      code: medicine.idDuocPham,
      name: medicine.TenDuocPham,
      unitPrice: medicine.DonGiaBan || 0,
      totalPrice: newMedication.quantity * (medicine.DonGiaBan || 0)
    });
    setMedicineSearchTerm("");
  };

  const toggleInsurance = () => {
    setFormData({ ...formData, hasInsurance: !formData.hasInsurance });
  };

  const handleSubmit = () => {
    if (viewMode) return; // Không submit khi ở chế độ xem
    
    if (formData.medications.length === 0) {
      alert("Vui lòng thêm ít nhất một loại thuốc");
      return;
    }

    const submitData = {
      ...formData,
      patient: selectedPatient,
      doctor: selectedDoctor,
      totalAmount,
      insuranceAmount,
      finalAmount
    };
    onSubmit(submitData);
  };

  const isReadOnly = viewMode === 'detail';

  if (viewMode === 'preview') {
    return <PrintPreview prescription={{ ...prescription, ...formData }} onCancel={onCancel} />;
  }

  if (viewMode === 'invoice') {
    return <InvoicePreview prescription={{ ...prescription, ...formData }} onCancel={onCancel} />;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3">
                <Pill className="w-6 h-6 text-[#280559]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#280559]">
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
                <FileText className="w-5 h-5 mr-2 text-[#280559]" />
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
                  <Package className="w-5 h-5 mr-2 " />
                  Danh Sách Thuốc
                </h4>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => setShowMedicineSearch(true)}
                    className="inline-flex items-center px-4 py-2 rounded-xl btn-primary transition-colors"
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
                              {medication.unitPrice?.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {medication.totalPrice?.toLocaleString('vi-VN')} đ
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

              {/* Insurance toggle và tính toán */}
              <div className="mt-6 space-y-6">
                {/* Insurance Toggle */}
                {!isReadOnly && selectedPatient?.insuranceNumber && (
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="w-6 h-6 text-blue-600 mr-3" />
                        <div>
                          <h5 className="font-medium text-gray-900">Áp dụng Bảo hiểm Y tế</h5>
                          <p className="text-sm text-gray-600">
                            Bệnh nhân có số BHYT: {selectedPatient.insuranceNumber}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={toggleInsurance}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                          ${formData.hasInsurance ? 'bg-blue-600' : 'bg-gray-200'}
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                            ${formData.hasInsurance ? 'translate-x-6' : 'translate-x-1'}
                          `}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tổng tiền */}
                <div className="bg-gray-50 rounded-xl p-6">
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
                          <p className="text-sm text-green-600">Số Tiền BHYT Trả</p>
                          <p className={`text-2xl font-bold ${formData.hasInsurance ? 'text-green-600' : 'text-gray-400'}`}>
                            {insuranceAmount.toLocaleString('vi-VN')} đ
                          </p>
                          {formData.hasInsurance && (
                            <p className="text-xs text-green-600">80% tổng tiền</p>
                          )}
                        </div>
                        <ShieldCheck className={`w-8 h-8 ${formData.hasInsurance ? 'text-green-600' : 'text-gray-400'}`} />
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl border border-[#280559]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-[#280559]">Thành Tiền</p>
                          <p className="text-3xl font-bold text-[#280559]">
                            {finalAmount.toLocaleString('vi-VN')} đ
                          </p>
                          {formData.hasInsurance && (
                            <p className="text-xs text-[#280559]">Sau trừ BHYT</p>
                          )}
                        </div>
                        <Calculator className="w-8 h-8 text-[#280559]" />
                      </div>
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
              <>
                <button
                  type="button"
                  onClick={() => {
                    onCancel();
                    setTimeout(() => {
                      handleView(prescription, 'invoice');
                    }, 100);
                  }}
                  className="px-6 py-3 btn-primary rounded-xl font-medium transition-colors flex items-center"
                >
                  <Receipt className="w-5 h-5 mr-2" />
                  In Hóa Đơn
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onCancel();
                    setTimeout(() => {
                      handleView(prescription, 'preview');
                    }, 100);
                  }}
                  className="px-6 py-3 btn-primary rounded-xl font-medium flex items-center"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Xem Trước Phiếu
                </button>
              </>
            )}
            
            {!isReadOnly && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={formLoading}
                className="px-6 py-3 bg-gradient-to-r btn-primary rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {formLoading ? (
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Tìm Kiếm & Thêm Thuốc</h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex flex-col h-full max-h-[calc(90vh-80px)]">
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm thuốc theo tên hoặc mã để hiển thị danh sách..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border  rounded-xl  transition-colors"
                autoFocus
              />
            </div>

            {/* Medicine List */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-medium text-gray-900 mb-3">
                {searchTerm
                  ? `Kết quả tìm kiếm (${medicines.length} thuốc)`
                  : `Danh sách thuốc (${medicines.length} thuốc)`}
              </h4>
              <div className="border rounded-xl overflow-hidden bg-white max-h-64 overflow-y-auto">
                {medicines.length === 0 ? (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p>
                      {searchTerm
                        ? `Không tìm thấy thuốc phù hợp với "${searchTerm}"`
                        : 'Không có thuốc trong hệ thống'}
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {medicines.map((medicine) => (
                      <button
                        key={medicine.idDuocPham}
                        onClick={() => onSelectMedicine(medicine)}
                        className="w-full p-4 text-left hover:bg-blue-50 transition-colors group"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 group-hover:text-blue-600">
                              {medicine.TenDuocPham}
                            </div>
                            <div className="text-sm text-gray-500">Mã: {medicine.idDuocPham}</div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="font-medium text-gray-900">
                              {medicine.DonGiaBan?.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="text-sm text-gray-500">Đơn giá</div>
                          </div>
                          <div className="ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Add Medicine Form */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-medium text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Thông Tin Thuốc Cần Thêm
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã Thuốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMedication.code}
                    onChange={(e) => setNewMedication({ ...newMedication, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="VD: MED001"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên Thuốc <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Tên thuốc"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newMedication.quantity}
                    onChange={(e) => {
                      const quantity = parseInt(e.target.value) || 1;
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hạn Sử Dụng
                  </label>
                  <input
                    type="date"
                    value={newMedication.expiryDate}
                    onChange={(e) => setNewMedication({ ...newMedication, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đơn Giá (VNĐ) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={newMedication.unitPrice}
                    onChange={(e) => {
                      const unitPrice = parseFloat(e.target.value) || 0;
                      setNewMedication({ 
                        ...newMedication, 
                        unitPrice,
                        totalPrice: newMedication.quantity * unitPrice
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tổng Tiền
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={`${newMedication.totalPrice.toLocaleString('vi-VN')} đ`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-medium"
                    />
                    <Calculator className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Liều Dùng & Cách Sử Dụng
                </label>
                <textarea
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2"
                  rows={2}
                  placeholder="VD: 1 viên uống 2 lần/ngày sau ăn"
                />
              </div>

              {/* Validation */}
              {(!newMedication.code || !newMedication.name || !newMedication.unitPrice) && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-sm text-yellow-700">
                      Vui lòng điền đầy đủ mã thuốc, tên thuốc và đơn giá
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={onAddMedication}
                disabled={!newMedication.code || !newMedication.name || !newMedication.unitPrice}
                className="px-6 py-2 bg-gradient-to-r btn-primary rounded-lg font-mediumtransition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Thuốc Vào Đơn
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
              className="inline-flex items-center px-4 py-2 btn-primary rounded-lg transition-colors"
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
                  <th className="border border-gray-300 px-3 py-2 text-left">Mã thuốc</th>
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
                    <td className="border border-gray-300 px-3 py-2">{med.code}</td>
                    <td className="border border-gray-300 px-3 py-2">{med.name}</td>
                    <td className="border border-gray-300 px-3 py-2">{med.quantity}</td>
                    <td className="border border-gray-300 px-3 py-2">{med.dosage}</td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {med.unitPrice?.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right">
                      {med.totalPrice?.toLocaleString('vi-VN')} đ
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

function InvoicePreview({ prescription, onCancel }) {
  const handlePrint = () => {
    alert("Chức năng in hóa đơn sẽ được thực hiện trong môi trường thực tế");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Hóa Đơn Thanh Toán</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center px-4 py-2 btn-primary rounded-xl transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              In Hóa Đơn
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
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">BỆNH VIỆN BẠCH MAI</h1>
              <h2 className="text-lg font-medium text-gray-700 mb-1">NHA THUOC SO 02</h2>
              <p className="text-sm text-gray-600 mb-6">78 Đường Giải Phóng, Đống Đa, Hà Nội - ĐT: (024) 3869 3731</p>
              <h2 className="text-xl font-bold text-gray-900 mb-2">HÓA ĐƠN THANH TOÁN</h2>
              <p className="text-sm text-gray-600">(Biên nhận có BHTT)</p>
            </div>

            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-8 mb-6">
              <div>
                <p className="mb-2 text-sm">Người mua hàng: <strong>{prescription.patient?.firstName} {prescription.patient?.lastName}</strong></p>
                <p className="mb-2 text-sm">Địa chỉ: {prescription.patient?.address}</p>
                <p className="mb-2 text-sm">Số BHYT: <strong>{prescription.patient?.insuranceNumber}</strong></p>
                <p className="mb-2 text-sm">ĐT: {prescription.patient?.phone}</p>
              </div>
              <div>
                <p className="mb-2 text-sm">Mã đơn thuốc: <strong>#{prescription.prescriptionCode}</strong></p>
                <p className="mb-2 text-sm">Ngày: {prescription.createdDate || new Date().toISOString().split('T')[0]}</p>
                <p className="mb-2 text-sm">Bác sĩ phụ trách: <strong>BS. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</strong></p>
                <p className="mb-2 text-sm">Chẩn đoán bệnh: {prescription.diagnosis}</p>
              </div>
            </div>

            {/* Medicine Table */}
            <table className="w-full border-collapse border border-gray-300 mb-6 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-2 py-2 text-left w-10">STT</th>
                  <th className="border border-gray-300 px-2 py-2 text-left">Tên hàng</th>
                  <th className="border border-gray-300 px-2 py-2 text-center w-16">Số lượng</th>
                  <th className="border border-gray-300 px-2 py-2 text-right w-24">Đơn giá (VND)</th>
                  <th className="border border-gray-300 px-2 py-2 text-right w-24">Thành tiền (VND)</th>
                </tr>
              </thead>
              <tbody>
                {prescription.medications?.map((med, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                    <td className="border border-gray-300 px-2 py-2">
                      <div>
                        <div className="font-medium">{med.name}</div>
                        <div className="text-xs text-gray-600">Mã: {med.code}</div>
                        <div className="text-xs text-gray-600">{med.dosage}</div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{med.quantity}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">
                      {med.unitPrice?.toLocaleString('vi-VN')}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-right font-medium">
                      {med.totalPrice?.toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
                
                {/* Empty rows to fill space */}
                {[...Array(Math.max(0, 5 - (prescription.medications?.length || 0)))].map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td className="border border-gray-300 px-2 py-2 text-center">&nbsp;</td>
                    <td className="border border-gray-300 px-2 py-2">&nbsp;</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">&nbsp;</td>
                    <td className="border border-gray-300 px-2 py-2">&nbsp;</td>
                    <td className="border border-gray-300 px-2 py-2">&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mb-6">
              <div className="flex justify-between items-center py-2 text-sm">
                <span>Tổng cộng:</span>
                <span className="font-bold">{prescription.totalAmount?.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between items-center py-2 text-sm">
                <span>Số tiền BHYT đã trả:</span>
                <span className="font-bold text-green-600">{prescription.insuranceAmount?.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t-2 border-gray-300 text-base">
                <span className="font-bold">Thành tiền:</span>
                <span className="font-bold text-lg">{prescription.finalAmount?.toLocaleString('vi-VN')} VND</span>
              </div>
            </div>

            {/* Footer notes */}
            <div className="text-xs text-gray-600 mb-6">
              <p className="mb-1">Lưu ý: Phiếu hóa đơn này có hiệu lực trong 03 tháng kể từ ngày khám bệnh.</p>
              <p className="mb-1">Trân trọng cảm ơn Quý khách đã sử dụng dịch vụ của Bệnh viện.</p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-3 gap-8 mt-8 text-center text-sm">
              <div>
                <p className="mb-12 font-medium">Người bệnh</p>
                <p className="text-xs">(Ký và ghi rõ họ tên)</p>
              </div>
              <div>
                <p className="mb-12 font-medium">Thu ngân</p>
                <p className="text-xs">Thái Thị Minh Tú</p>
              </div>
              <div>
                <p className="mb-12 font-medium">Bác sĩ</p>
                <p className="text-xs">BS. {prescription.doctor?.firstName} {prescription.doctor?.lastName}</p>
              </div>
            </div>

            {/* Date and time stamp */}
            <div className="text-center mt-8 text-xs text-gray-500">
              <p>Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</p>
              <p>THU NGAN</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}