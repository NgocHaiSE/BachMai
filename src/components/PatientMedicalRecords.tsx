import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  User,
  Stethoscope,
  Activity,
  TestTube,
  Pill,
  StickyNote,
  Calendar,
  ChevronDown,
  Search,
  Filter,
  Heart,
  AlertTriangle,
  Building2,
  ArrowLeft,
  Phone,
  Mail,
  Clock,
  TrendingUp,
  Award
} from "lucide-react";

interface PatientMedicalRecordsProps {
  patient: any;
  onBack: () => void;
}

export default function PatientMedicalRecords({ patient, onBack }: PatientMedicalRecordsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const records = useQuery(api.medicalRecords.listByPatient, { patientId: patient._id });
  const staff = useQuery(api.staff.list);
  const createRecord = useMutation(api.medicalRecords.create);
  const updateRecord = useMutation(api.medicalRecords.update);
  const deleteRecord = useMutation(api.medicalRecords.remove);

  const filteredRecords = records?.filter(record =>
    !searchTerm || 
    record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (record.diagnosis && record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRecord) {
        await updateRecord({ id: editingRecord._id, ...formData });
        toast.success("Cập nhật hồ sơ bệnh án thành công");
      } else {
        await createRecord({ ...formData, patientId: patient._id });
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

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "diagnosis": return <Activity className="w-5 h-5" />;
      case "prescription": return <Pill className="w-5 h-5" />;
      case "test-result": return <TestTube className="w-5 h-5" />;
      case "treatment": return <Stethoscope className="w-5 h-5" />;
      default: return <StickyNote className="w-5 h-5" />;
    }
  };

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "diagnosis": return "bg-red-100 text-red-800 border-red-200";
      case "prescription": return "bg-blue-100 text-blue-800 border-blue-200";
      case "test-result": return "bg-green-100 text-green-800 border-green-200";
      case "treatment": return "bg-purple-100 text-purple-800 border-purple-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecordTypeName = (type: string) => {
    switch (type) {
      case "diagnosis": return "Chẩn đoán";
      case "prescription": return "Kê đơn thuốc";
      case "test-result": return "Kết quả xét nghiệm";
      case "treatment": return "Điều trị";
      default: return "Ghi chú";
    }
  };

  // Calculate statistics
  const totalRecords = records?.length || 0;
  const recentRecords = records?.filter(r => {
    const recordDate = new Date(r._creationTime);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recordDate >= thirtyDaysAgo;
  }).length || 0;

  const recordsByType = records?.reduce((acc, record) => {
    acc[record.recordType] = (acc[record.recordType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="space-y-8">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại danh sách
        </button>
        <div className="flex items-center">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Hồ Sơ Bệnh Án</h2>
            <p className="text-gray-600">Theo dõi lịch sử y tế và điều trị</p>
          </div>
        </div>
        <div className="flex-1"></div>
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Bệnh Án
        </button>
      </div>

      {/* Patient Information Card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-8 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mr-6 border border-white/30">
                <User className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  {patient.firstName} {patient.lastName}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-indigo-100">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Sinh: {patient.dateOfBirth}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2" />
                    <span>{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      patient.gender === "male" ? "bg-blue-500/30 text-blue-100" :
                      patient.gender === "female" ? "bg-pink-500/30 text-pink-100" :
                      "bg-gray-500/30 text-gray-100"
                    }`}>
                      {patient.gender === "male" ? "Nam" : 
                       patient.gender === "female" ? "Nữ" : "Khác"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Medical Info */}
            <div className="grid grid-cols-2 gap-4 text-right">
              {patient.bloodType && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-6 h-6 text-red-200" />
                  </div>
                  <div className="text-xs text-indigo-100">Nhóm máu</div>
                  <div className="text-lg font-bold">{patient.bloodType}</div>
                </div>
              )}
              {(patient.allergies ?? []).length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex items-center justify-center mb-2">
                    <AlertTriangle className="w-6 h-6 text-orange-200" />
                  </div>
                  <div className="text-xs text-indigo-100">Dị ứng</div>
                  <div className="text-sm font-medium">{(patient.allergies ?? []).length} loại</div>
                </div>
              )}
            </div>
          </div>
          
          {/* Medical History Preview */}
          {patient.medicalHistory && (
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-sm text-indigo-100 mb-2">Tiền sử bệnh:</div>
              <div className="text-white line-clamp-2">{patient.medicalHistory}</div>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng số bệnh án</p>
              <p className="text-3xl font-bold text-gray-900">{totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bệnh án gần đây</p>
              <p className="text-3xl font-bold text-gray-900">{recentRecords}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">30 ngày qua</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Chẩn đoán</p>
              <p className="text-3xl font-bold text-gray-900">{recordsByType.diagnosis || 0}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Đơn thuốc</p>
              <p className="text-3xl font-bold text-gray-900">{recordsByType.prescription || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Pill className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, mô tả, chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>
          <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </button>
        </div>
        
        {filteredRecords && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-1" />
            Tìm thấy {filteredRecords.length} bệnh án
          </div>
        )}
      </div>

      {/* Medical Records */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-indigo-600" />
              Danh Sách Bệnh Án
            </h3>
            {filteredRecords && (
              <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                {filteredRecords.length} bệnh án
              </span>
            )}
          </div>
        </div>
        
        {filteredRecords === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "Không tìm thấy bệnh án" : "Chưa có bệnh án"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? "Không có bệnh án nào phù hợp với từ khóa tìm kiếm"
                : "Chưa có bệnh án nào cho bệnh nhân này"
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingRecord(null);
                  setShowForm(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tạo bệnh án đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredRecords.map((record) => (
              <div key={record._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRecordTypeColor(record.recordType)}`}>
                        {getRecordTypeIcon(record.recordType)}
                        <span className="ml-2">{getRecordTypeName(record.recordType)}</span>
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(record._creationTime).toLocaleDateString('vi-VN')}
                      </span>
                      <span className="text-sm text-gray-500 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(record._creationTime).toLocaleTimeString('vi-VN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{record.title}</h4>
                    <p className="text-gray-700 mb-4">{record.description}</p>
                    
                    {record.diagnosis && (
                      <div className="mb-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm font-medium text-red-900 flex items-center mb-1">
                          <Activity className="w-4 h-4 mr-1" />
                          Chẩn đoán:
                        </p>
                        <p className="text-red-800">{record.diagnosis}</p>
                      </div>
                    )}

                    {record.prescription && record.prescription.length > 0 && (
                      <div className="mb-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 flex items-center mb-2">
                          <Pill className="w-4 h-4 mr-1" />
                          Đơn thuốc:
                        </p>
                        <div className="space-y-1">
                          {record.prescription.map((med: any, index: number) => (
                            <div key={index} className="text-sm text-blue-800 bg-white p-2 rounded border border-blue-200">
                              <span className="font-medium">{med.medication}</span> - 
                              {med.dosage}, {med.frequency}, {med.duration}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {record.testResults && (
                      <div className="mb-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900 flex items-center mb-2">
                          <TestTube className="w-4 h-4 mr-1" />
                          Kết quả xét nghiệm:
                        </p>
                        <div className="text-sm text-green-800 space-y-1">
                          <div className="bg-white p-2 rounded border border-green-200">
                            <p><span className="font-medium">Xét nghiệm:</span> {record.testResults.testName}</p>
                            <p><span className="font-medium">Kết quả:</span> {record.testResults.results}</p>
                            {record.testResults.normalRange && (
                              <p><span className="font-medium">Giá trị bình thường:</span> {record.testResults.normalRange}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-500">
                        <Building2 className="w-4 h-4 mr-1" />
                        Bởi: BS. {record.staff?.firstName} {record.staff?.lastName}
                        {record.staff?.department && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{record.staff.department}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Medical Record Form Modal */}
      {showForm && (
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

  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        testResults: formData.recordType === "test-result" && testResults.testName ? testResults : undefined,
      };
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addMedication = () => {
    if (newMedication.medication && newMedication.dosage) {
      setFormData({
        ...formData,
        prescription: [...formData.prescription, newMedication]
      });
      setNewMedication({ medication: "", dosage: "", frequency: "", duration: "" });
    } else {
      toast.error("Vui lòng nhập tên thuốc và liều dùng");
    }
  };

  const removeMedication = (index: number) => {
    setFormData({
      ...formData,
      prescription: formData.prescription.filter((_: any, i: number) => i !== index)
    });
  };

  const recordTypes = [
    { value: "note", label: "Ghi chú", icon: StickyNote, color: "text-gray-600" },
    { value: "diagnosis", label: "Chẩn đoán", icon: Activity, color: "text-red-600" },
    { value: "prescription", label: "Kê đơn thuốc", icon: Pill, color: "text-blue-600" },
    { value: "test-result", label: "Kết quả xét nghiệm", icon: TestTube, color: "text-green-600" },
    { value: "treatment", label: "Điều trị", icon: Stethoscope, color: "text-purple-600" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mr-3">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record ? "Sửa Bệnh Án" : "Thêm Bệnh Án Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {record ? "Cập nhật thông tin bệnh án" : "Tạo bệnh án mới cho bệnh nhân"}
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
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-indigo-600" />
              Thông Tin Cơ Bản
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bác sĩ *
                </label>
                <div className="relative">
                  <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.staffId}
                    onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {staff.filter((s: any) => s.role === "doctor").map((doctor: any) => (
                      <option key={doctor._id} value={doctor._id}>
                        BS. {doctor.firstName} {doctor.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Loại bệnh án *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {recordTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                          formData.recordType === type.value
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="recordType"
                          value={type.value}
                          checked={formData.recordType === type.value}
                          onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                          className="sr-only"
                        />
                        <IconComponent className={`w-5 h-5 mr-3 ${type.color}`} />
                        <span className="font-medium text-gray-900">{type.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                placeholder="Nhập tiêu đề bệnh án"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={3}
                placeholder="Mô tả chi tiết về bệnh án"
              />
            </div>
          </div>

          {/* Conditional Fields */}
          {(formData.recordType === "diagnosis" || formData.recordType === "treatment") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chẩn đoán
              </label>
              <textarea
                value={formData.diagnosis}
                onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                rows={3}
                placeholder="Nhập chẩn đoán chi tiết"
              />
            </div>
          )}

          {formData.recordType === "prescription" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Đơn thuốc
              </label>
              
              {/* Current medications */}
              {formData.prescription.length > 0 && (
                <div className="mb-4 space-y-2">
                  {formData.prescription.map((med: any, index: number) => (
                    <div key={index} className="flex items-center justify-between bg-blue-50 p-3 rounded-xl border border-blue-200">
                      <div className="flex items-center">
                        <Pill className="w-5 h-5 text-blue-600 mr-3" />
                        <span className="text-sm text-blue-900">
                          <span className="font-medium">{med.medication}</span> - {med.dosage}, {med.frequency}, {med.duration}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new medication */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                <h5 className="font-medium text-gray-900">Thêm thuốc mới</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Tên thuốc"
                    value={newMedication.medication}
                    onChange={(e) => setNewMedication({ ...newMedication, medication: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Liều dùng"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Tần suất"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Thời gian"
                    value={newMedication.duration}
                    onChange={(e) => setNewMedication({ ...newMedication, duration: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={addMedication}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm thuốc
                </button>
              </div>
            </div>
          )}

          {formData.recordType === "test-result" && (
            <div className="bg-green-50 p-4 rounded-xl space-y-4">
              <h5 className="font-medium text-gray-900 flex items-center">
                <TestTube className="w-5 h-5 mr-2 text-green-600" />
                Thông tin xét nghiệm
              </h5>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên xét nghiệm
                  </label>
                  <input
                    type="text"
                    value={testResults.testName}
                    onChange={(e) => setTestResults({ ...testResults, testName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="VD: Xét nghiệm máu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kết quả
                  </label>
                  <textarea
                    value={testResults.results}
                    onChange={(e) => setTestResults({ ...testResults, results: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    rows={2}
                    placeholder="Nhập kết quả xét nghiệm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="VD: 4.5 - 5.5 triệu/μL"
                  />
                </div>
              </div>
            </div>
          )}

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
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {record ? "Cập nhật" : "Tạo"} Bệnh Án
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}