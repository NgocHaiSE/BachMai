import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { 
  ClipboardList, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  User,
  Search,
  Filter,
  ChevronDown,
  Phone,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Hash,
  MapPin,
  CreditCard,
  ShieldCheck,
  Users,
  Eye,
  UserPlus,
  Stethoscope,
  Activity
} from "lucide-react";

// Mock data structures - replace with actual Convex queries
interface ExaminationRecord {
  _id: string;
  _creationTime: number;
  recordNumber: string;
  registrationTime: string;
  patientName: string;
  dateOfBirth: string;
  gender: string;
  examType: string;
  reason: string;
  priority: string;
  patientId?: string;
  department: string;
  roomNumber: string;
  symptomStartTime?: string;
  createdBy: string;
}

interface Patient {
  _id: string;
  patientCode: string;
  fullName: string;
  idNumber: string;
  dateOfBirth: string;
  gender: string;
  occupation: string;
  ethnicity: string;
  phone: string;
  address: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  insurance: {
    number: string;
    type: string;
    validUntil: string;
    coverage: string;
    priority: string;
  };
}

export default function ExaminationRegistration() {
  const [showForm, setShowForm] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data - replace with actual Convex queries
  const records: ExaminationRecord[] = [
    {
      _id: "1",
      _creationTime: Date.now(),
      recordNumber: "DK001",
      registrationTime: "08:30 - 06/06/2025",
      patientName: "Nguyễn Văn A",
      dateOfBirth: "15/03/1985",
      gender: "Nam",
      examType: "Khám tổng quát",
      reason: "Đau bụng, sốt",
      priority: "Bình thường",
      department: "Nội tổng hợp",
      roomNumber: "101",
      createdBy: "user1"
    },
    {
      _id: "2", 
      _creationTime: Date.now() - 3600000,
      recordNumber: "DK002",
      registrationTime: "09:15 - 06/06/2025",
      patientName: "Trần Thị B",
      dateOfBirth: "22/07/1990",
      gender: "Nữ",
      examType: "Khám chuyên khoa",
      reason: "Khám định kỳ",
      priority: "Ưu tiên",
      department: "Tim mạch",
      roomNumber: "205",
      createdBy: "user1"
    }
  ];

  const patients: Patient[] = [
    {
      _id: "p1",
      patientCode: "BN001",
      fullName: "Nguyễn Văn A",
      idNumber: "123456789",
      dateOfBirth: "15/03/1985",
      gender: "Nam",
      occupation: "Kỹ sư",
      ethnicity: "Kinh",
      phone: "0123456789",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      emergencyContact: {
        name: "Nguyễn Thị C",
        relationship: "Vợ",
        phone: "0987654321"
      },
      insurance: {
        number: "DN1234567890",
        type: "BHYT",
        validUntil: "31/12/2025",
        coverage: "80%",
        priority: "Bình thường"
      }
    }
  ];

  const filteredRecords = records.filter(record =>
    !searchTerm || 
    record.recordNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (formData: any) => {
    try {
      // Mock save - replace with actual Convex mutation
      toast.success("Đăng ký khám bệnh thành công");
      setShowForm(false);
      setEditingRecord(null);
      setSelectedPatient(null);
    } catch (error) {
      toast.error("Đăng ký khám bệnh thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phiếu đăng ký này?")) {
      try {
        // Mock delete - replace with actual Convex mutation
        toast.success("Xóa phiếu đăng ký thành công");
      } catch (error) {
        toast.error("Xóa phiếu đăng ký thất bại");
      }
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientList(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "khẩn cấp": return "bg-red-100 text-red-800 border-red-200";
      case "ưu tiên": return "bg-orange-100 text-orange-800 border-orange-200";
      case "bình thường": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getExamTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "khám tổng quát": return "bg-blue-100 text-blue-800";
      case "khám chuyên khoa": return "bg-purple-100 text-purple-800";
      case "cấp cứu": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
        <ClipboardList className="w-6 h-6 text-green-600" />
        </div>
        <div>
        <h2 className="text-2xl font-bold text-gray-900">Đăng Ký Khám Bệnh</h2>
        <p className="text-gray-600">Quản lý phiếu đăng ký khám bệnh của bệnh nhân</p>
        </div>
      </div>
      <button
        onClick={() => {
        setEditingRecord(null);
        setSelectedPatient(null);
        setShowForm(true);
        }}
        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-medium rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
      >
        <Plus className="w-5 h-5 mr-2" />
        Đăng Ký Khám Bệnh
      </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo số phiếu, tên bệnh nhân, lý do khám..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
        />
        </div>
        <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
        <Filter className="w-5 h-5 mr-2" />
        Bộ lọc
        </button>
      </div>
      
      {filteredRecords && (
        <div className="mt-4 flex items-center text-sm text-gray-600">
        <ClipboardList className="w-4 h-4 mr-1" />
        Tìm thấy {filteredRecords.length} phiếu đăng ký
        </div>
      )}
      </div>

      {/* Records List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
        <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phiếu đăng ký</h3>
        <p className="text-gray-600 mb-6">
          {searchTerm ? "Không có phiếu đăng ký nào phù hợp với từ khóa tìm kiếm" : "Chưa có phiếu đăng ký khám bệnh nào"}
        </p>
        <button
          onClick={() => {
          setEditingRecord(null);
          setSelectedPatient(null);
          setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Đăng ký khám bệnh đầu tiên
        </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Thông Tin Phiếu
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Bệnh Nhân
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Loại Khám
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Lý Do Khám
            </th>
            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Mức Độ Ưu Tiên
            </th>
            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Thao Tác
            </th>
          </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {filteredRecords.map((record: ExaminationRecord) => (
            <tr key={record._id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4">
              <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900 flex items-center">
                <Hash className="w-4 h-4 mr-1 text-gray-400" />
                {record.recordNumber}
                </div>
                <div className="text-sm text-gray-500 flex items-center mt-1">
                <Clock className="w-4 h-4 mr-1" />
                {record.registrationTime}
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
                {record.patientName}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                {record.dateOfBirth} - {record.gender}
                </div>
              </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getExamTypeColor(record.examType)}`}>
              {record.examType}
              </span>
              <div className="text-sm text-gray-500 mt-1 flex items-center">
              <Building2 className="w-4 h-4 mr-1" />
              {record.department} - P.{record.roomNumber}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="text-sm text-gray-900 max-w-xs">
              {record.reason}
              </div>
            </td>
            <td className="px-6 py-4">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(record.priority)}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {record.priority}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => handleEdit(record)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(record._id)}
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

      {/* Registration Form Modal */}
      {showForm && (
      <RegistrationForm
        record={editingRecord}
        selectedPatient={selectedPatient}
        onSubmit={handleSubmit}
        onCancel={() => {
        setShowForm(false);
        setEditingRecord(null);
        setSelectedPatient(null);
        }}
        onSelectPatient={() => setShowPatientList(true)}
      />
      )}

      {/* Patient List Modal */}
      {showPatientList && (
      <PatientListModal
        patients={patients}
        onSelectPatient={handleSelectPatient}
        onAddNewPatient={() => {
        setShowPatientList(false);
        setShowNewPatientForm(true);
        }}
        onCancel={() => setShowPatientList(false)}
      />
      )}

      {/* New Patient Form Modal */}
      {showNewPatientForm && (
      <NewPatientForm
        onSubmit={(patient: Patient) => {
        setSelectedPatient(patient);
        setShowNewPatientForm(false);
        }}
        onCancel={() => setShowNewPatientForm(false)}
      />
      )}
    </div>
  );
}

function RegistrationForm({ record, selectedPatient, onSubmit, onCancel, onSelectPatient }: any) {
  const [formData, setFormData] = useState({
    examType: record?.examType || "Khám tổng quát",
    reason: record?.reason || "",
    symptomStartTime: record?.symptomStartTime || "",
    department: record?.department || "",
    roomNumber: record?.roomNumber || "",
    priority: record?.priority || "Bình thường"
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        patientId: selectedPatient._id,
        recordNumber: record?.recordNumber || `DK${Date.now().toString().slice(-6)}`,
        registrationTime: new Date().toLocaleString('vi-VN'),
        createdBy: "current-user"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const examTypes = [
    { value: "Khám tổng quát", label: "Khám tổng quát" },
    { value: "Khám chuyên khoa", label: "Khám chuyên khoa" },
    { value: "Cấp cứu", label: "Cấp cứu" },
    { value: "Khám định kỳ", label: "Khám định kỳ" }
  ];

  const departments = [
    "Nội tổng hợp", "Ngoại tổng hợp", "Tim mạch", "Tiêu hóa", 
    "Hô hấp", "Thần kinh", "Cơ xương khớp", "Da liễu",
    "Mắt", "Tai mũi họng", "Sản phụ khoa", "Nhi khoa"
  ];

  const priorities = [
    { value: "Bình thường", label: "Bình thường", color: "text-green-600" },
    { value: "Ưu tiên", label: "Ưu tiên", color: "text-orange-600" },
    { value: "Khẩn cấp", label: "Khẩn cấp", color: "text-red-600" }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <ClipboardList className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record ? "Sửa Phiếu Đăng Ký" : "Đăng Ký Khám Bệnh Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {record ? "Cập nhật thông tin phiếu đăng ký" : "Tạo phiếu đăng ký khám bệnh mới"}
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* A. Thông tin phiếu */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              A. Thông tin phiếu
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số phiếu
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={record?.recordNumber || "Tự động tạo"}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian đăng ký
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={new Date().toLocaleString('vi-VN')}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Người lập
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value="Lê Thị Thủy Nga"
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn loại hình đăng ký khám bệnh *
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.examType}
                    onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                  >
                    {examTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu triệu chứng
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="datetime-local"
                    value={formData.symptomStartTime}
                    onChange={(e) => setFormData({ ...formData, symptomStartTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chỉ định khoa khám *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn khoa khám</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng khám số *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="VD: 101, 205"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Mức độ ưu tiên *
                </label>
                <div className="space-y-2">
                  {priorities.map((priority) => (
                    <label
                      key={priority.value}
                      className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                        formData.priority === priority.value
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={priority.value}
                        checked={formData.priority === priority.value}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                        className="sr-only"
                      />
                      <AlertTriangle className={`w-5 h-5 mr-3 ${priority.color}`} />
                      <span className="font-medium text-gray-900">{priority.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do khám *
              </label>
              <textarea
                required
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                rows={3}
                placeholder="Mô tả triệu chứng, lý do khám bệnh..."
              />
            </div>
          </div>

          {/* B. Thông tin bệnh nhân */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-green-600" />
                B. Thông tin bệnh nhân
              </h4>
              <button
                type="button"
                onClick={onSelectPatient}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Search className="w-4 h-4 mr-2" />
                Chọn bệnh nhân
              </button>
            </div>

            {selectedPatient ? (
              <PatientInfoDisplay patient={selectedPatient} />
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Vui lòng chọn bệnh nhân để tiếp tục</p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
              disabled={isSubmitting || !selectedPatient}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {record ? "Cập nhật" : "Đăng ký"} khám bệnh
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PatientInfoDisplay({ patient }: { patient: Patient }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Thông tin hành chính */}
        <div>
          <h5 className="text-md font-medium text-gray-900 mb-4">1. Thông tin hành chính</h5>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mã bệnh nhân</label>
                <div className="text-sm font-medium text-gray-900">{patient.patientCode}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
                <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số CCCD/CMND</label>
                <div className="text-sm font-medium text-gray-900">{patient.idNumber}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ngày sinh</label>
                <div className="text-sm font-medium text-gray-900">{patient.dateOfBirth}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
                <div className="text-sm font-medium text-gray-900">{patient.gender}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nghề nghiệp</label>
                <div className="text-sm font-medium text-gray-900">{patient.occupation}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dân tộc</label>
                <div className="text-sm font-medium text-gray-900">{patient.ethnicity}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Điện thoại</label>
                <div className="text-sm font-medium text-gray-900">{patient.phone}</div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
              <div className="text-sm font-medium text-gray-900">{patient.address}</div>
            </div>
          </div>
        </div>

        {/* 2. Người liên hệ khẩn cấp + 3. Thông tin bảo hiểm */}
        <div className="space-y-6">
          {/* 2. Người liên hệ khẩn cấp */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-4">2. Người liên hệ khẩn cấp</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
                <div className="text-sm font-medium text-gray-900">{patient.emergencyContact.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mối quan hệ</label>
                  <div className="text-sm font-medium text-gray-900">{patient.emergencyContact.relationship}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                  <div className="text-sm font-medium text-gray-900">{patient.emergencyContact.phone}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Thông tin bảo hiểm y tế và ưu tiên */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-4">3. Thông tin bảo hiểm y tế và ưu tiên</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số thẻ BHYT/BHXH</label>
                <div className="text-sm font-medium text-gray-900">{patient.insurance.number}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Loại BHYT/BHXH</label>
                  <div className="text-sm font-medium text-gray-900">{patient.insurance.type}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Thời hạn thẻ</label>
                  <div className="text-sm font-medium text-gray-900">{patient.insurance.validUntil}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mức hưởng</label>
                  <div className="text-sm font-medium text-gray-900">{patient.insurance.coverage}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Đối tượng ưu tiên</label>
                  <div className="text-sm font-medium text-gray-900">{patient.insurance.priority}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientListModal({ patients, onSelectPatient, onAddNewPatient, onCancel }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient: Patient) =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Danh sách bệnh nhân</h3>
                <p className="text-sm text-gray-600">Chọn bệnh nhân để đăng ký khám</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onAddNewPatient}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm bệnh nhân mới
              </button>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã bệnh nhân, họ tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã BN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giới tính</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số BHYT/BHXH</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ ưu tiên</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chọn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient: Patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.patientCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.dateOfBirth}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.gender}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.insurance.number}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.phone}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        patient.insurance.priority === "Ưu tiên" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                      }`}>
                        {patient.insurance.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPatientForm({ onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    patientCode: `BN${Date.now().toString().slice(-6)}`,
    fullName: "",
    idNumber: "",
    dateOfBirth: "",
    gender: "Nam",
    occupation: "",
    ethnicity: "Kinh",
    phone: "",
    address: "",
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    },
    insurance: {
      number: "",
      type: "BHYT",
      validUntil: "",
      coverage: "80%",
      priority: "Bình thường"
    }
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newPatient = { _id: `p${Date.now()}`, ...formData };
      await onSubmit(newPatient);
      toast.success("Thêm bệnh nhân mới thành công");
    } catch (error) {
      toast.error("Thêm bệnh nhân thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thêm Bệnh Nhân Mới</h3>
                <p className="text-sm text-gray-600">Nhập đầy đủ thông tin bệnh nhân</p>
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* 1. Thông tin hành chính */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              1. Thông tin hành chính
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã bệnh nhân</label>
                <input
                  type="text"
                  value={formData.patientCode}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số CCCD/CMND *</label>
                <input
                  type="text"
                  required
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nghề nghiệp</label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dân tộc</label>
                <input
                  type="text"
                  value={formData.ethnicity}
                  onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                rows={3}
              />
            </div>
          </div>

          {/* 2. Người liên hệ khẩn cấp */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-green-600" />
              2. Người liên hệ khẩn cấp
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên</label>
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, name: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mối quan hệ</label>
                <input
                  type="text"
                  value={formData.emergencyContact.relationship}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, relationship: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại người thân</label>
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    emergencyContact: { ...formData.emergencyContact, phone: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3. Thông tin bảo hiểm y tế và ưu tiên */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ShieldCheck className="w-5 h-5 mr-2 text-green-600" />
              3. Thông tin bảo hiểm y tế và ưu tiên
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ BHYT/BHXH</label>
                <input
                  type="text"
                  value={formData.insurance.number}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurance: { ...formData.insurance, number: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại BHYT/BHXH</label>
                <select
                  value={formData.insurance.type}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurance: { ...formData.insurance, type: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="BHYT">BHYT</option>
                  <option value="BHXH">BHXH</option>
                  <option value="Không có">Không có</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn thẻ BHYT/BHXH</label>
                <input
                  type="date"
                  value={formData.insurance.validUntil}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurance: { ...formData.insurance, validUntil: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mức hưởng</label>
                <select
                  value={formData.insurance.coverage}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurance: { ...formData.insurance, coverage: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="100%">100%</option>
                  <option value="80%">80%</option>
                  <option value="60%">60%</option>
                  <option value="40%">40%</option>
                </select>
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Đối tượng ưu tiên</label>
                <select
                  value={formData.insurance.priority}
                  onChange={(e) => setFormData({
                    ...formData,
                    insurance: { ...formData.insurance, priority: e.target.value }
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Bình thường">Bình thường</option>
                  <option value="Ưu tiên">Ưu tiên</option>
                  <option value="Khẩn cấp">Khẩn cấp</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-medium hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Thêm bệnh nhân
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}