import { useState } from "react";
import { 
  Syringe, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  User,
  Search,
  Filter,
  Phone,
  Calendar,
  Hash,
  MapPin,
  CreditCard,
  ShieldCheck,
  Users,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Package,
  DollarSign,
  RefreshCw,
  UserPlus,
  Mail,
  FileText,
  ArrowLeft
} from "lucide-react";

// Mock data cho demo
const mockVaccinationRecords = [
  {
    _id: "1",
    stt: 1,
    patientName: "Hoàng Anh Tuấn",
    vaccineType: "Vắc xin lẻ",
    vaccineName: "Vắc xin lẻ",
    registrationDate: "22/3/2025",
    vaccinationDate: "22/3/2025",
    dose: "1 ml6, 0,5 ml cho trẻ nhỏ",
    status: "completed"
  },
  {
    _id: "2", 
    stt: 2,
    patientName: "Lê Đại Dương",
    vaccineType: "Vắc xin cúm",
    vaccineName: "Vắc xin gối",
    registrationDate: "26/5/2025",
    vaccinationDate: "26/5/2025",
    dose: "3 ml6, 0,5 ml cho trẻ nhỏ",
    status: "scheduled"
  },
  {
    _id: "3",
    stt: 3,
    patientName: "Hoàng Trà My",
    vaccineType: "Vaccine Sởi - Quai bị - Rubella (MMR)",
    vaccineName: "Vắc xin gối",
    registrationDate: "26/5/2025",
    vaccinationDate: "26/5/2025",
    dose: "2 ml6, 0,5 ml cho trẻ nhỏ",
    status: "completed"
  }
];

const mockVaccines = [
  {
    id: "1",
    name: "Gói vắc xin Hexaxim - Rotarix - Synflorix (9 - 12 tháng)",
    type: "Gói vắc xin",
    doses: ["Liều 1", "Liều 2", "Liều nhắc lại"],
    price: 2433320
  },
  {
    id: "2",
    name: "Vắc xin cho trẻ em 0-9 tháng",
    type: "Vắc xin lẻ",
    doses: ["Liều duy nhất"],
    price: 250000
  },
  {
    id: "3",
    name: "Vắc xin cho người trưởng thành / 2 mũi-10 mũi",
    type: "Vắc xin lẻ", 
    doses: ["Liều 1", "Liều 2", "Liều 3"],
    price: 180000
  },
  {
    id: "4",
    name: "Vắc xin cho phụ nữ trước thai / gái 1 - 11 mũi",
    type: "Vắc xin lẻ",
    doses: ["Liều 1", "Liều 2"],
    price: 350000
  },
  {
    id: "5",
    name: "Vắc xin cho trẻ tiền học đường (4 tuổi - 6 tuổi)",
    type: "Vắc xin lẻ",
    doses: ["Liều duy nhất"],
    price: 420000
  }
];

const mockPatients = [
  {
    _id: "1",
    patientCode: "BN001",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "30/08/2003",
    gender: "Nam",
    idNumber: "094301012087817",
    insuranceNumber: "DN1234567890",
    ethnicity: "Kinh",
    phone: "0966724651",
    address: "123 Đường ABC, Quận 1, TP.HCM"
  },
  {
    _id: "2",
    patientCode: "BN002", 
    fullName: "Nguyễn Thị B",
    dateOfBirth: "24/06/2003",
    gender: "Nữ",
    idNumber: "094301012087817",
    insuranceNumber: "DN0987654321",
    ethnicity: "Kinh", 
    phone: "0966724651",
    address: "456 Đường XYZ, Quận 2, TP.HCM"
  },
  {
    _id: "3",
    patientCode: "BN003",
    fullName: "Nguyễn Văn A",
    dateOfBirth: "01/08/1995",
    gender: "Nữ",
    idNumber: "094301012087817",
    insuranceNumber: "",
    ethnicity: "Kinh",
    phone: "0966724651", 
    address: ""
  },
  {
    _id: "4",
    patientCode: "BN004",
    fullName: "Nguyễn Văn B",
    dateOfBirth: "20/03/1972",
    gender: "Nam",
    idNumber: "094301012087817",
    insuranceNumber: "",
    ethnicity: "Kinh",
    phone: "0966724651",
    address: ""
  },
  {
    _id: "5",
    patientCode: "BN005", 
    fullName: "Nguyễn Như A",
    dateOfBirth: "24/12/1984",
    gender: "Nam",
    idNumber: "094301012087817",
    insuranceNumber: "",
    ethnicity: "Kinh",
    phone: "0966724651",
    address: ""
  }
];

export default function VaccinationManagement() {
  const [records, setRecords] = useState(mockVaccinationRecords);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDetailView, setShowDetailView] = useState<any>(null);

  const filteredRecords = records.filter(record =>
    !searchTerm || 
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.vaccineType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.vaccineName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (formData: any) => {
    try {
      if (editingRecord) {
        setRecords(prev => prev.map(r => 
          r._id === editingRecord._id ? { ...r, ...formData } : r
        ));
      } else {
        const newRecord = {
          _id: Date.now().toString(),
          stt: records.length + 1,
          ...formData,
          status: "scheduled"
        };
        setRecords(prev => [...prev, newRecord]);
      }
      setShowForm(false);
      setEditingRecord(null);
      setViewMode(null);
    } catch (error) {
      console.error("Lưu thông tin thất bại");
    }
  };

  const handleDelete = (id: string) => {
    setRecords(prev => prev.filter(r => r._id !== id));
    setShowDeleteConfirm(null);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setViewMode('edit');
    setShowForm(true);
  };

  const handleViewDetail = (record: any) => {
    setShowDetailView(record);
  };

  if (showDetailView) {
    return <VaccinationDetailView 
      record={showDetailView} 
      onBack={() => setShowDetailView(null)}
      onEdit={handleEdit}
      onDelete={(id: string) => setShowDeleteConfirm(id)}
    />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <ArrowLeft className="w-6 h-6 text-gray-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Đăng ký tiêm chủng</h2>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Ngày đăng ký</span>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Ngày tiêm</span>
              <Calendar className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Lọc</span>
              <Filter className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => {
              setEditingRecord(null);
              setViewMode('add');
              setShowForm(true);
            }}
            className="inline-flex items-center px-4 py-2  text-white rounded-lg btn-primary transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới phiếu đăng ký
          </button>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Danh sách đăng ký tiêm chủng</h3>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <Syringe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phiếu đăng ký</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Không có phiếu đăng ký nào phù hợp với từ khóa tìm kiếm" : "Chưa có phiếu đăng ký tiêm chủng nào"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">STT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ và tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vắc xin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại Vắc xin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày đăng ký</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tiêm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liều tiêm</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{record.stt}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.patientName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.vaccineName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.vaccineType}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.registrationDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.vaccinationDate}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.dose}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(record)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(record._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                        >
                          Hủy đăng ký
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                1 - 5 của 56
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Trang</span>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                  <option>1</option>
                </select>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <VaccinationForm
          record={editingRecord}
          viewMode={viewMode}
          vaccines={mockVaccines}
          patients={mockPatients}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
            setViewMode(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-orange-100 rounded-full">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Bạn có chắc chắn muốn hủy đăng ký ?
            </h3>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Có
              </button>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Không
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VaccinationDetailView({ record, onBack, onEdit, onDelete }: any) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={onBack} className="mr-3">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Chi tiết phiếu đăng ký tiêm chủng</h2>
        </div>
        <div className="flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors">
            <FileText className="w-4 h-4 mr-2" />
            In phiếu
          </button>
          <button 
            onClick={() => onDelete(record._id)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hủy đăng ký
          </button>
          <button 
            onClick={onBack}
            className="inline-flex items-center px-4 py-2  text-white rounded btn-primary transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </button>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">THÔNG TIN NGƯỜI ĐƯỢC TIÊM</h3>
          <div className="flex space-x-3">
            <button className="inline-flex items-center px-4 py-2  text-white rounded border-t-cyan-50 transition-colors">
              <UserPlus className="w-4 h-4 mr-2" />
              Thêm người được tiêm
            </button>
            <button className="inline-flex items-center px-4 py-2 btn-primary text-white rounded  transition-colors">
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Họ và tên người được tiêm</label>
            <div className="text-gray-900">{record.patientName}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày sinh người được tiêm</label>
            <div className="flex items-center">
              <span className="text-gray-900">Ngày/tháng/năm</span>
              <Calendar className="w-4 h-4 ml-2 text-gray-400" />
              <ArrowLeft className="w-4 h-4 ml-2 text-gray-400 transform rotate-90" />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
            <div className="text-gray-900">Nam</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">CMND/CCCD</label>
            <div className="text-gray-900">094301012087817</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số BHYT</label>
            <div className="text-gray-900">DN4301012087817</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
            <div className="text-gray-900">0966724651</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Dân tộc</label>
            <div className="text-gray-900">Kinh</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
            <div className="text-gray-900">123 Đường ABC, Quận 1, TP.HCM</div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">THÔNG TIN LIÊN HỆ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Họ và tên người liên hệ</label>
            <div className="text-gray-900">Nguyễn Văn A</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quan hệ</label>
            <div className="text-gray-900">Vợ/Chồng</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số điện thoại liên hệ</label>
            <div className="text-gray-900">0966724651</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="text-gray-900">email@example.com</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">CMND/CCCD</label>
            <div className="text-gray-900">094301012087817</div>
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-3">Loại vắc xin muốn đăng ký</label>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Vắc xin gói</button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded">Vắc xin lẻ</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày mong muốn tiêm</label>
            <div className="flex items-center">
              <span className="text-gray-900">Ngày/tháng/năm</span>
              <Calendar className="w-4 h-4 ml-2 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-3">Loại vắc xin đăng ký</label>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm font-medium text-blue-900 mb-2">
              Gói vắc xin Hexaxim - Rotarix - Synflorix (9 - 12 tháng)
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              <div>- Vắc xin DPT 6 trong 1 đợt tiêm tổng cộ</div>
              <div>- Vắc xin rota virus 3 đợt uống hoặc tiêm</div>
              <div>- Vắc xin viêm phổi 4 đợt tiêm</div>
            </div>
          </div>
          <div className="text-red-600 text-sm mt-2">(*) Nội dung bắt buộc nhập</div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
            <CheckCircle className="w-4 h-4 mr-2 inline" />
            Lưu
          </button>
          <button 
            onClick={onBack}
            className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 inline" />
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}

function VaccinationForm({ record, viewMode, vaccines, patients, onSubmit, onCancel }: any) {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showPatientList, setShowPatientList] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState<any>(null);
  const [formData, setFormData] = useState({
    patientId: record?.patientId || "",
    fullName: record?.fullName || "",
    dateOfBirth: record?.dateOfBirth || "",
    gender: record?.gender || "Nam",
    idNumber: record?.idNumber || "",
    insuranceNumber: record?.insuranceNumber || "",
    ethnicity: record?.ethnicity || "Kinh",
    phone: record?.phone || "",
    address: record?.address || "",
    contactName: record?.contactName || "",
    relationship: record?.relationship || "",
    contactPhone: record?.contactPhone || "",
    contactEmail: record?.contactEmail || "",
    contactIdNumber: record?.contactIdNumber || "",
    vaccinePackageType: record?.vaccinePackageType || "single",
    desiredDate: record?.desiredDate || "",
    vaccineId: record?.vaccineId || "",
    dose: record?.dose || "",
    price: record?.price || 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedPatient && !formData.fullName) {
      alert("Vui lòng chọn hoặc nhập thông tin bệnh nhân");
      return;
    }
    if (!selectedVaccine) {
      alert("Vui lòng chọn vắc xin");
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        patientName: selectedPatient ? selectedPatient.fullName : formData.fullName,
        vaccineType: selectedVaccine.type,
        vaccineName: selectedVaccine.name,
        registrationDate: new Date().toLocaleDateString('vi-VN'),
        vaccinationDate: formData.desiredDate
      };
      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
    setFormData({
      ...formData,
      patientId: patient._id,
      fullName: patient.fullName,
      dateOfBirth: patient.dateOfBirth,
      gender: patient.gender,
      idNumber: patient.idNumber,
      insuranceNumber: patient.insuranceNumber,
      ethnicity: patient.ethnicity,
      phone: patient.phone,
      address: patient.address
    });
    setShowPatientList(false);
  };

  const handleVaccineSelect = (vaccine: any) => {
    setSelectedVaccine(vaccine);
    setFormData({
      ...formData,
      vaccineId: vaccine.id,
      price: vaccine.price
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ArrowLeft className="w-6 h-6 text-gray-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {viewMode === 'edit' ? "Chỉnh sửa đăng ký tiêm chủng" : "Đăng ký tiêm chủng"}
              </h3>
            </div>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Patient Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-medium text-gray-900">THÔNG TIN NGƯỜI ĐƯỢC TIÊM</h4>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(true)}
                  className="inline-flex items-center px-4 py-2  text-white rounded btn-primary transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Thêm người được tiêm
                </button>
                <button
                  type="button"
                  onClick={() => setShowPatientList(true)}
                  className="inline-flex items-center px-4 py-2 btn-primary text-white rounded  transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </button>
              </div>
            </div>

            {selectedPatient && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{selectedPatient.fullName}</div>
                      <div className="text-sm text-gray-600">{selectedPatient.phone} - {selectedPatient.patientCode}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatient(null);
                      setFormData({ ...formData, patientId: "", fullName: "", dateOfBirth: "", gender: "Nam", idNumber: "", insuranceNumber: "", ethnicity: "Kinh", phone: "", address: "" });
                    }}
                    className="p-2 text-gray-500 hover:bg-white rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Họ và tên người được tiêm</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nhập họ tên"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Ngày sinh người được tiêm</label>
                <div className="relative">
                  <input
                    type="text"
                    value="Ngày/tháng/năm"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                    readOnly
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Giới tính</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">CMND/CCCD</label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Số BHYT</label>
                <input
                  type="text"
                  value={formData.insuranceNumber}
                  onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Số điện thoại</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Dân tộc</label>
                <input
                  type="text"
                  value={formData.ethnicity}
                  onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Địa chỉ</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-lg font-medium text-gray-900 mb-6">THÔNG TIN LIÊN HỆ</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Họ và tên người liên hệ</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Quan hệ</label>
                <input
                  type="text"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*CMND/CCCD</label>
                <input
                  type="text"
                  value={formData.contactIdNumber}
                  onChange={(e) => setFormData({ ...formData, contactIdNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm text-gray-600 mb-3">*Loại vắc xin muốn đăng ký</label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vaccinePackageType: "package" })}
                    className={`px-4 py-2 rounded transition-colors ${
                      formData.vaccinePackageType === "package" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Vắc xin gói
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, vaccinePackageType: "single" })}
                    className={`px-4 py-2 rounded transition-colors ${
                      formData.vaccinePackageType === "single" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    Vắc xin lẻ
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Ngày mong muốn tiêm</label>
                <div className="relative">
                  <input
                    type="text"
                    value="Ngày/tháng/năm"
                    className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-500"
                    readOnly
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-3">*Chọn vắc xin</label>
              <div className="space-y-3">
                {vaccines.map((vaccine: any) => (
                  <div
                    key={vaccine.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedVaccine?.id === vaccine.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                    onClick={() => handleVaccineSelect(vaccine)}
                  >
                    <div className="flex items-start">
                      <div className="w-2 h-2 rounded-full border border-gray-400 mt-2 mr-3"></div>
                      <div>
                        <div className="font-medium text-gray-900">{vaccine.name}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedVaccine && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium text-blue-900 mb-2">
                    Gói vắc xin Hexaxim - Rotarix - Synflorix (9 - 12 tháng) - Liều tiêm: 24,833,320 đ
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>- Vắc xin DPT 6 trong 1 đợt tiêm hoặc 2 đợt</div>
                    <div>- Vắc xin rotavirus 3 đợt uống hoặc tiêm</div>
                    <div>- Vắc xin viêm phổi cầu khuẩn 4 đợt tiêm</div>
                    <div>- Vắc xin viêm gan B 3 đợt tiêm</div>
                  </div>
                </div>
              )}
              
              <div className="text-red-600 text-sm mt-2">(*) Nội dung bắt buộc nhập</div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                className="px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
              >
                <FileText className="w-4 h-4 mr-2 inline" />
                In phiếu
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    Đăng ký
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                disabled={isSubmitting}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient List Modal */}
      {showPatientList && (
        <PatientListModal
          patients={patients}
          onSelectPatient={handlePatientSelect}
          onCancel={() => setShowPatientList(false)}
        />
      )}

      {/* New Patient Form Modal */}
      {showNewPatientForm && (
        <NewPatientFormModal
          onSubmit={(patient: any) => {
            handlePatientSelect(patient);
            setShowNewPatientForm(false);
          }}
          onCancel={() => setShowNewPatientForm(false)}
        />
      )}
    </div>
  );
}

function PatientListModal({ patients, onSelectPatient, onCancel }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient: any) =>
    patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.patientCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Chọn người được tiêm</h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nguyễn"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã bệnh nhân</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giới tính</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số BHYT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chọn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient: any) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.patientCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.dateOfBirth}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.gender}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.insuranceNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.phone}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors"
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">1 - 5 của 67</div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Trang</span>
                <select className="border border-gray-300 rounded px-2 py-1 text-sm">
                  <option>1</option>
                </select>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-100">
                  <ArrowLeft className="w-4 h-4 transform rotate-180" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Chọn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPatientFormModal({ onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    patientCode: `BN${Date.now().toString().slice(-6)}`,
    fullName: "",
    dateOfBirth: "",
    gender: "Nam",
    idNumber: "",
    insuranceNumber: "",
    ethnicity: "Kinh",
    phone: "",
    address: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newPatient = { _id: `p${Date.now()}`, ...formData };
      await onSubmit(newPatient);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" style={{ zIndex: 60 }}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">THÊM MỚI NGƯỜI ĐƯỢC TIÊM</h3>
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-2">Mã bệnh nhân (*)</label>
              <input
                type="text"
                value={formData.patientCode}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Số CCCD/CMND (*)</label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Giới tính (*)</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">*Ngày sinh</label>
              <div className="relative">
                <input
                  type="text"
                  value="30/08/2003"
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                  readOnly
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Dân tộc</label>
              <select
                value={formData.ethnicity}
                onChange={(e) => setFormData({ ...formData, ethnicity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Kinh">Kinh</option>
                <option value="Hoa">Hoa</option>
                <option value="Tày">Tày</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Số BHYT/BHXH</label>
              <input
                type="text"
                value="DN4301012087817"
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="text-red-600 text-sm">(*) Nội dung bắt buộc nhập</div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Lưu
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}