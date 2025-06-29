import { useState, useEffect } from "react";
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

// API Base URL
const API_BASE_URL = 'http://localhost:3000/api/tiem-chung';

// Mock data cho vaccines và patients (giữ nguyên vì chưa có API)
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

// API Functions
const apiService = {
  // Lấy tất cả phiếu đăng ký
  async getAllRecords() {
    try {
      const response = await fetch(API_BASE_URL);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Lỗi khi lấy danh sách phiếu đăng ký');
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  },

  // Lấy chi tiết phiếu đăng ký
  async getRecordDetail(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`);
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      throw new Error(result.message || 'Lỗi khi lấy chi tiết phiếu đăng ký');
    } catch (error) {
      console.error('Error fetching record detail:', error);
      throw error;
    }
  },

  // Thêm mới phiếu đăng ký
  async createRecord(data) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        return result;
      }
      throw new Error(result.message || 'Lỗi khi tạo phiếu đăng ký');
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  },

  // Sửa phiếu đăng ký
  async updateRecord(id, data) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        return result;
      }
      throw new Error(result.message || 'Lỗi khi cập nhật phiếu đăng ký');
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  },

  // Hủy phiếu đăng ký
  async deleteRecord(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (result.success) {
        return result;
      }
      throw new Error(result.message || 'Lỗi khi hủy phiếu đăng ký');
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }
};

export default function VaccinationManagement() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showDetailView, setShowDetailView] = useState(null);

  // Load dữ liệu khi component mount
  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAllRecords();
      setRecords(data || []);
    } catch (error) {
      console.error('Lỗi khi tải danh sách:', error);
      alert('Lỗi khi tải danh sách phiếu đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    !searchTerm || 
    (record.HoTenNguoiLienHe && record.HoTenNguoiLienHe.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (record.TrangThai && record.TrangThai.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSubmit = async (formData) => {
    try {
      // Chuyển đổi dữ liệu form thành format API
      const apiData = {
        idDKTiemChung: formData.idDKTiemChung || `PDK${Date.now()}`,
        NgayLap: new Date().toISOString(),
        NgayTiem: formData.desiredDate || new Date().toISOString().split('T')[0],
        HoTenNguoiLienHe: formData.contactName || '',
        QuanHe: formData.relationship || '',
        SDT_LienHe: formData.contactPhone || '',
        Email: formData.contactEmail || '',
        ThoiGianTiem: '08:00',
        LieuTiem: formData.dose || '1 liều',
        GhiChu: formData.note || '',
        TrangThai: 'Đã đăng ký',
        idVacXin: formData.vaccineId || 'VX001',
        idNguoiDung: 'ND001',
        idBenhNhan: formData.patientId || 'BN001'
      };

      if (editingRecord) {
        await apiService.updateRecord(editingRecord.idDKTiemChung, apiData);
        alert('Cập nhật thành công!');
      } else {
        await apiService.createRecord(apiData);
        alert('Thêm mới thành công!');
      }
      
      setShowForm(false);
      setEditingRecord(null);
      setViewMode(null);
      await loadRecords(); // Reload danh sách
    } catch (error) {
      console.error("Lưu thông tin thất bại:", error);
      alert('Lưu thông tin thất bại: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await apiService.deleteRecord(id);
      alert('Hủy đăng ký thành công!');
      setShowDeleteConfirm(null);
      await loadRecords(); // Reload danh sách
    } catch (error) {
      console.error('Lỗi khi hủy:', error);
      alert('Lỗi khi hủy phiếu đăng ký: ' + error.message);
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setViewMode('edit');
    setShowForm(true);
  };

  const handleViewDetail = async (record) => {
    try {
      const detail = await apiService.getRecordDetail(record.idDKTiemChung);
      setShowDetailView(detail);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết:', error);
      alert('Lỗi khi lấy chi tiết phiếu đăng ký');
    }
  };

  if (showDetailView) {
    return <VaccinationDetailView 
      record={showDetailView} 
      onBack={() => setShowDetailView(null)}
      onEdit={handleEdit}
      onDelete={(id) => setShowDeleteConfirm(id)}
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
            className="inline-flex items-center px-4 py-2 btn-primary text-white rounded-lg transition-colors"
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
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Đang tải dữ liệu...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã ĐK</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người liên hệ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quan hệ</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SĐT</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày lập</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tiêm</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record, index) => (
                  <tr key={record.idDKTiemChung || index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{record.idDKTiemChung}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.HoTenNguoiLienHe}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.QuanHe}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{record.SDT_LienHe}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.NgayLap ? new Date(record.NgayLap).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.NgayTiem ? new Date(record.NgayTiem).toLocaleDateString('vi-VN') : ''}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        record.TrangThai === 'Đã hủy' ? 'bg-red-100 text-red-800' :
                        record.TrangThai === 'Đã tiêm' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.TrangThai}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetail(record)}
                          className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                        >
                          Chi tiết
                        </button>
                        {record.TrangThai !== 'Đã hủy' && (
                          <button
                            onClick={() => setShowDeleteConfirm(record.idDKTiemChung)}
                            className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                          >
                            Hủy đăng ký
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {filteredRecords.length} phiếu đăng ký
              </div>
              <button
                onClick={loadRecords}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Làm mới</span>
              </button>
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

function VaccinationDetailView({ record, onBack, onEdit, onDelete }) {
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
            onClick={() => onDelete(record.idDKTiemChung)}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hủy đăng ký
          </button>
          <button 
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Họ và tên người được tiêm</label>
            <div className="text-gray-900">{record.TenBenhNhan || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày sinh người được tiêm</label>
            <div className="flex items-center">
              <span className="text-gray-900">
                {record.NgaySinh ? new Date(record.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
            <div className="text-gray-900">{record.GioiTinh || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
            <div className="text-gray-900">{record.DiaChi || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-6">THÔNG TIN LIÊN HỆ</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Họ và tên người liên hệ</label>
            <div className="text-gray-900">{record.HoTenNguoiLienHe || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Quan hệ</label>
            <div className="text-gray-900">{record.QuanHe || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Số điện thoại liên hệ</label>
            <div className="text-gray-900">{record.SDT_LienHe || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <div className="text-gray-900">{record.Email || 'N/A'}</div>
          </div>
        </div>
      </div>

      {/* Service Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày đăng ký</label>
            <div className="text-gray-900">
              {record.NgayLap ? new Date(record.NgayLap).toLocaleDateString('vi-VN') : 'N/A'}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ngày mong muốn tiêm</label>
            <div className="text-gray-900">
              {record.NgayTiem ? new Date(record.NgayTiem).toLocaleDateString('vi-VN') : 'N/A'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Thời gian tiêm</label>
            <div className="text-gray-900">{record.ThoiGianTiem || 'N/A'}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Liều tiêm</label>
            <div className="text-gray-900">{record.LieuTiem || 'N/A'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Trạng thái</label>
            <div className="text-gray-900">
              <span className={`px-2 py-1 rounded-full text-xs ${
                record.TrangThai === 'Đã hủy' ? 'bg-red-100 text-red-800' :
                record.TrangThai === 'Đã tiêm' ? 'bg-green-100 text-green-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {record.TrangThai}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Ghi chú</label>
            <div className="text-gray-900">{record.GhiChu || 'N/A'}</div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
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

function VaccinationForm({ record, viewMode, vaccines, patients, onSubmit, onCancel }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showPatientList, setShowPatientList] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [formData, setFormData] = useState({
    idDKTiemChung: record?.idDKTiemChung || '',
    patientId: record?.idBenhNhan || "",
    fullName: record?.TenBenhNhan || "",
    dateOfBirth: record?.NgaySinh || "",
    gender: record?.GioiTinh || "Nam",
    idNumber: record?.idNumber || "",
    insuranceNumber: record?.insuranceNumber || "",
    ethnicity: record?.ethnicity || "Kinh",
    phone: record?.phone || "",
    address: record?.DiaChi || "",
    contactName: record?.HoTenNguoiLienHe || "",
    relationship: record?.QuanHe || "",
    contactPhone: record?.SDT_LienHe || "",
    contactEmail: record?.Email || "",
    contactIdNumber: record?.contactIdNumber || "",
    vaccinePackageType: record?.vaccinePackageType || "single",
    desiredDate: record?.NgayTiem || "",
    vaccineId: record?.idVacXin || "",
    dose: record?.LieuTiem || "",
    note: record?.GhiChu || "",
    price: record?.price || 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.contactName) {
      alert("Vui lòng nhập tên người liên hệ");
      return;
    }
    if (!formData.contactPhone) {
      alert("Vui lòng nhập số điện thoại liên hệ");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatientSelect = (patient) => {
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

  const handleVaccineSelect = (vaccine) => {
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
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
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
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Quan hệ</label>
                <input
                  type="text"
                  required
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">*Số điện thoại liên hệ</label>
                <input
                  type="tel"
                  required
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Ngày mong muốn tiêm</label>
                <input
                  type="date"
                  value={formData.desiredDate}
                  onChange={(e) => setFormData({ ...formData, desiredDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Ghi chú</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 btn-primary text-white rounded  transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 inline animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2 inline" />
                    {viewMode === 'edit' ? 'Cập nhật' : 'Đăng ký'}
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
          onSubmit={(patient) => {
            handlePatientSelect(patient);
            setShowNewPatientForm(false);
          }}
          onCancel={() => setShowNewPatientForm(false)}
        />
      )}
    </div>
  );
}

function PatientListModal({ patients, onSelectPatient, onCancel }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient) =>
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
                placeholder="Tìm theo tên, mã bệnh nhân hoặc số điện thoại"
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chọn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.patientCode}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.fullName}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.dateOfBirth}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.gender}</td>
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
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={onCancel}
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPatientFormModal({ onSubmit, onCancel }) {
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
    if (!formData.fullName || !formData.phone) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

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
              <label className="block text-sm text-gray-600 mb-2">*Họ và tên</label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">*Ngày sinh</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
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
              <label className="block text-sm text-gray-600 mb-2">*Điện thoại</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">Địa chỉ</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
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