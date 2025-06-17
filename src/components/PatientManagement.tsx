import { useState } from "react";
import { toast } from "sonner";
import { 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Heart, 
  AlertTriangle,
  X,
  Save,
  Loader2,
  Users,
  Filter,
  FileText,
  Eye,
  ChevronRight,
  Activity,
  Clock,
  Stethoscope
} from "lucide-react";
import { 
  usePatients, 
  useCreatePatient, 
  useUpdatePatient, 
  useDeletePatient 
} from "../hooks/api";

interface PatientManagementProps {
  onViewMedicalRecords: (patient: any) => void;
}

export default function PatientManagement({ onViewMedicalRecords }: PatientManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<any>(null);

  const { data: patients, loading, error, refetch } = usePatients(searchTerm);
  const { mutate: createPatient } = useCreatePatient();
  const { mutate: updatePatient } = useUpdatePatient();
  const { mutate: deletePatient } = useDeletePatient();

  const handleSubmit = async (formData: any) => {
    try {
      if (editingPatient) {
        await updatePatient({ id: editingPatient.idBenhNhan, ...formData });
        toast.success("Cập nhật thông tin bệnh nhân thành công");
      } else {
        await createPatient(formData);
        toast.success("Thêm bệnh nhân mới thành công");
      }
      setShowForm(false);
      setEditingPatient(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lưu thông tin bệnh nhân thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bệnh nhân này?")) {
      try {
        await deletePatient(id);
        toast.success("Xóa bệnh nhân thành công");
        refetch();
      } catch (error: any) {
        toast.error(error.message || "Xóa bệnh nhân thất bại");
      }
    }
  };

  const handleEdit = (patient: any) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Bệnh Nhân</h2>
            <p className="text-gray-600">Quản lý thông tin và hồ sơ bệnh nhân</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingPatient(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Bệnh Nhân
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm bệnh nhân theo họ tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </button>
        </div>
        
        {Array.isArray(patients) && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            Tìm thấy {patients.length} bệnh nhân
          </div>
        )}
      </div>

      {/* Patient List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : !Array.isArray(patients) || patients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy bệnh nhân</h3>
            <p className="text-gray-600 mb-6">Thử thay đổi từ khóa tìm kiếm hoặc thêm bệnh nhân mới</p>
            <button
              onClick={() => {
                setEditingPatient(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm bệnh nhân đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh Nhân
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên Hệ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thông Tin Y Tế
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên Hệ Khẩn Cấp
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hồ Sơ Bệnh Án
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patients.map((patient: any) => (
                  <tr key={patient.idBenhNhan} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {patient.HoTen}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar className="w-4 h-4 mr-1" />
                            Sinh: {patient.NgaySinh ? new Date(patient.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {patient.SDT || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {patient.Email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            patient.GioiTinh === "Nam" ? "bg-blue-100 text-blue-800" :
                            patient.GioiTinh === "Nữ" ? "bg-pink-100 text-pink-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {patient.GioiTinh || "N/A"}
                          </span>
                        </div>
                        {patient.DiUng && (
                          <div className="flex items-center text-sm text-orange-600">
                            <AlertTriangle className="w-4 h-4 mr-1" />
                            Dị ứng: {patient.DiUng}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{patient.HoTenThanNhan || 'N/A'}</div>
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-1" />
                          {patient.SDTThanNhan || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {patient.MoiQuanHe || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        // onClick={() => onViewMedicalRecords(patient)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all duration-200 shadow-sm hover:shadow-md group"
                        title="Xem hồ sơ bệnh án"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Hồ sơ bệnh án</span>
                        <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </button>
                      <div className="mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <Activity className="w-3 h-3 mr-1" />
                          <span>Cập nhật gần đây</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>N/A</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(patient.idBenhNhan)}
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

      {/* Patient Form Modal */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPatient(null);
          }}
        />
      )}
    </div>
  );
}

function PatientForm({ patient, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    HoTen: patient?.HoTen || "",
    NgaySinh: patient?.NgaySinh ? new Date(patient.NgaySinh).toISOString().split('T')[0] : "",
    GioiTinh: patient?.GioiTinh || "Nam",
    NgheNghiep: patient?.NgheNghiep || "",
    DanToc: patient?.DanToc || "",
    SDT: patient?.SDT || "",
    DiaChi: patient?.DiaChi || "",
    CCCD: patient?.CCCD || "",
    BHYT: patient?.BHYT || "",
    ThoiHanBHYT: patient?.ThoiHanBHYT ? new Date(patient.ThoiHanBHYT).toISOString().split('T')[0] : "",
    DoiTuongUuTien: patient?.DoiTuongUuTien || "",
    HoTenThanNhan: patient?.HoTenThanNhan || "",
    MoiQuanHe: patient?.MoiQuanHe || "",
    SDTThanNhan: patient?.SDTThanNhan || "",
    BenhManTinh: patient?.BenhManTinh || "",
    DiUng: patient?.DiUng || "",
    PhauThuatDaLam: patient?.PhauThuatDaLam || "",
    TrangThai: patient?.TrangThai || "Đang điều trị",
    idLoaiBHYT: patient?.idLoaiBHYT || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
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
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {patient ? "Sửa Thông Tin Bệnh Nhân" : "Thêm Bệnh Nhân Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {patient ? "Cập nhật thông tin bệnh nhân" : "Nhập đầy đủ thông tin bệnh nhân"}
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
            {/* Thông tin cơ bản */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Thông Tin Cơ Bản
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.HoTen}
                    onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày Sinh
                  </label>
                  <input
                    type="date"
                    value={formData.NgaySinh}
                    onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giới Tính
                  </label>
                  <select
                    value={formData.GioiTinh}
                    onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nghề Nghiệp
                  </label>
                  <input
                    type="text"
                    value={formData.NgheNghiep}
                    onChange={(e) => setFormData({ ...formData, NgheNghiep: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập nghề nghiệp"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dân Tộc
                  </label>
                  <input
                    type="text"
                    value={formData.DanToc}
                    onChange={(e) => setFormData({ ...formData, DanToc: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập dân tộc"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.SDT}
                    onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0123 456 789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CCCD/CMND
                  </label>
                  <input
                    type="text"
                    value={formData.CCCD}
                    onChange={(e) => setFormData({ ...formData, CCCD: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập số CCCD/CMND"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số BHYT
                  </label>
                  <input
                    type="text"
                    value={formData.BHYT}
                    onChange={(e) => setFormData({ ...formData, BHYT: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập số thẻ BHYT"
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4">Địa Chỉ</h4>
              <textarea
                value={formData.DiaChi}
                onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                rows={3}
                placeholder="Nhập địa chỉ đầy đủ..."
              />
            </div>

            {/* Liên hệ khẩn cấp */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-orange-600" />
                Liên Hệ Khẩn Cấp
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ Tên Thân Nhân
                  </label>
                  <input
                    type="text"
                    value={formData.HoTenThanNhan}
                    onChange={(e) => setFormData({ ...formData, HoTenThanNhan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Nhập họ tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại
                  </label>
                  <input
                    type="tel"
                    value={formData.SDTThanNhan}
                    onChange={(e) => setFormData({ ...formData, SDTThanNhan: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="0123 456 789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mối Quan Hệ
                  </label>
                  <input
                    type="text"
                    value={formData.MoiQuanHe}
                    onChange={(e) => setFormData({ ...formData, MoiQuanHe: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="VD: Vợ/Chồng, Con, Cha/Mẹ"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin y tế */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-600" />
                Thông Tin Y Tế
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bệnh Mãn Tính
                  </label>
                  <textarea
                    value={formData.BenhManTinh}
                    onChange={(e) => setFormData({ ...formData, BenhManTinh: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={3}
                    placeholder="Mô tả các bệnh mãn tính..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dị Ứng
                  </label>
                  <textarea
                    value={formData.DiUng}
                    onChange={(e) => setFormData({ ...formData, DiUng: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={3}
                    placeholder="Mô tả các chất dị ứng..."
                  />
                </div>
              </div>
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phẫu Thuật Đã Làm
                </label>
                <textarea
                  value={formData.PhauThuatDaLam}
                  onChange={(e) => setFormData({ ...formData, PhauThuatDaLam: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả các phẫu thuật đã thực hiện..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {patient ? "Cập nhật" : "Thêm"} Bệnh Nhân
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}