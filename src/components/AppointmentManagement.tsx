import { useState } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  Stethoscope, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  Filter,
  ChevronDown,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Timer,
  AlertTriangle
} from "lucide-react";
import { 
  useAppointments, 
  useCreateAppointment, 
  useUpdateAppointment, 
  useUpdateAppointmentStatus,
  useDeleteAppointment,
  usePatients,
  useStaff
} from "../hooks/api";

export default function AppointmentManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  // Get appointments for selected date
  const { data: appointments, loading, error, refetch } = useAppointments({
    TuNgay: selectedDate,
    DenNgay: selectedDate
  });

  const { data: patients } = usePatients('');
  const { data: staff } = useStaff('doctor');
  
  const { mutate: createAppointment } = useCreateAppointment();
  const { mutate: updateAppointment } = useUpdateAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: deleteAppointment } = useDeleteAppointment();

  const handleSubmit = async (formData: any) => {
    try {
      if (editingAppointment) {
        await updateAppointment({ id: editingAppointment.idDKKhambenh, ...formData });
        toast.success("Cập nhật lịch khám thành công");
      } else {
        await createAppointment(formData);
        toast.success("Tạo lịch khám thành công");
      }
      setShowForm(false);
      setEditingAppointment(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Lưu lịch khám thất bại");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, TrangThaiMoi: status });
      toast.success("Cập nhật trạng thái thành công");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa lịch khám này?")) {
      try {
        await deleteAppointment(id);
        toast.success("Xóa lịch khám thành công");
        refetch();
      } catch (error: any) {
        toast.error(error.message || "Xóa lịch khám thất bại");
      }
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "đã hoàn thành": return <CheckCircle className="w-4 h-4" />;
      case "đã xác nhận": return <CheckCircle className="w-4 h-4" />;
      case "đang chờ": return <Clock className="w-4 h-4" />;
      case "đã hủy": return <XCircle className="w-4 h-4" />;
      case "vắng mặt": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "đã hoàn thành": return "bg-green-100 text-green-800 border-green-200";
      case "đã xác nhận": return "bg-blue-100 text-blue-800 border-blue-200";
      case "đang chờ": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "đã hủy": return "bg-red-100 text-red-800 border-red-200";
      case "vắng mặt": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "khám tổng quát": return "bg-blue-100 text-blue-800";
      case "tái khám": return "bg-green-100 text-green-800";
      case "cấp cứu": return "bg-red-100 text-red-800";
      case "phẫu thuật": return "bg-purple-100 text-purple-800";
      case "kiểm tra": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Lịch Khám</h2>
            <p className="text-gray-600">Quản lý và theo dõi lịch hẹn của bệnh nhân</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingAppointment(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-medium rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Đặt Lịch Khám
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
            <label className="text-sm font-medium text-gray-700">Lọc theo ngày:</label>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </button>
          </div>
        </div>
        
        {appointments && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            {appointments.length} lịch khám trong ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : !appointments || appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không có lịch khám</h3>
            <p className="text-gray-600 mb-6">Chưa có lịch hẹn nào trong ngày này</p>
            <button
              onClick={() => {
                setEditingAppointment(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Đặt lịch khám đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh Nhân
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khoa/Phòng
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lý Do Khám
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment: any) => (
                  <tr key={appointment.idDKKhambenh} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.NgayLap ? new Date(appointment.NgayLap).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Timer className="w-4 h-4 mr-1" />
                            30 phút
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
                            {appointment.BenhNhan?.HoTen || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {appointment.BenhNhan?.SDT || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.TenKhoa || 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Phòng: {appointment.PhongKhamSo || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {appointment.LyDoKham || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={appointment.TrangThai || 'Đang chờ'}
                          onChange={(e) => handleStatusUpdate(appointment.idDKKhambenh, e.target.value)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border appearance-none pr-8 ${getStatusColor(appointment.TrangThai || 'Đang chờ')} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="Đang chờ">Đang chờ</option>
                          <option value="Đã xác nhận">Đã xác nhận</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                          <option value="Đã hủy">Đã hủy</option>
                          <option value="Vắng mặt">Vắng mặt</option>
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(appointment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.idDKKhambenh)}
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

      {/* Appointment Form Modal */}
      {showForm && (
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients || []}
          staff={staff || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingAppointment(null);
          }}
        />
      )}
    </div>
  );
}

function AppointmentForm({ appointment, patients, staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    idBenhNhan: appointment?.idBenhNhan || "",
    idKhoa: appointment?.idKhoa || "",
    NgayLap: appointment?.NgayLap ? new Date(appointment.NgayLap).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    LyDoKham: appointment?.LyDoKham || "",
    PhongKhamSo: appointment?.PhongKhamSo || "",
    ThoiGianBatDauTrieuChung: appointment?.ThoiGianBatDauTrieuChung || "",
    TienSuBenhLyBanThan: appointment?.TienSuBenhLyBanThan || "",
    TienSuBenhLyGiaDinh: appointment?.TienSuBenhLyGiaDinh || "",
    ThuocDangSuDung: appointment?.ThuocDangSuDung || "",
    KhamBHYT: appointment?.KhamBHYT || false,
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

  const departments = [
    "Nội tổng hợp", "Ngoại tổng hợp", "Tim mạch", "Tiêu hóa", 
    "Hô hấp", "Thần kinh", "Cơ xương khớp", "Da liễu",
    "Mắt", "Tai mũi họng", "Sản phụ khoa", "Nhi khoa"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mr-3">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {appointment ? "Sửa Lịch Khám" : "Đặt Lịch Khám Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {appointment ? "Cập nhật thông tin lịch hẹn" : "Tạo lịch hẹn mới cho bệnh nhân"}
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
          <div className="space-y-6">
            {/* Bệnh nhân và Khoa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bệnh Nhân *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.idBenhNhan}
                    onChange={(e) => setFormData({ ...formData, idBenhNhan: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient: any) => (
                      <option key={patient.idBenhNhan} value={patient.idBenhNhan}>
                        {patient.HoTen} - {patient.SDT}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khoa Khám *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.idKhoa}
                    onChange={(e) => setFormData({ ...formData, idKhoa: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
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
            </div>

            {/* Ngày khám và Phòng */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày Khám *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    required
                    value={formData.NgayLap}
                    onChange={(e) => setFormData({ ...formData, NgayLap: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng Khám
                </label>
                <input
                  type="text"
                  value={formData.PhongKhamSo}
                  onChange={(e) => setFormData({ ...formData, PhongKhamSo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="VD: 101, 205"
                />
              </div>
            </div>

            {/* Thời gian triệu chứng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời Gian Bắt Đầu Triệu Chứng
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  value={formData.ThoiGianBatDauTrieuChung}
                  onChange={(e) => setFormData({ ...formData, ThoiGianBatDauTrieuChung: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Lý do khám */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý Do Khám *
              </label>
              <textarea
                required
                value={formData.LyDoKham}
                onChange={(e) => setFormData({ ...formData, LyDoKham: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                rows={3}
                placeholder="Mô tả triệu chứng, lý do khám bệnh..."
              />
            </div>

            {/* Tiền sử bệnh lý */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền Sử Bệnh Lý Bản Thân
                </label>
                <textarea
                  value={formData.TienSuBenhLyBanThan}
                  onChange={(e) => setFormData({ ...formData, TienSuBenhLyBanThan: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả tiền sử bệnh lý..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền Sử Bệnh Lý Gia Đình
                </label>
                <textarea
                  value={formData.TienSuBenhLyGiaDinh}
                  onChange={(e) => setFormData({ ...formData, TienSuBenhLyGiaDinh: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả tiền sử gia đình..."
                />
              </div>
            </div>

            {/* Thuốc đang sử dụng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thuốc Đang Sử Dụng
              </label>
              <textarea
                value={formData.ThuocDangSuDung}
                onChange={(e) => setFormData({ ...formData, ThuocDangSuDung: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                rows={2}
                placeholder="Liệt kê các loại thuốc đang sử dụng..."
              />
            </div>

            {/* Khám BHYT */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khám BHYT
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="KhamBHYT"
                    checked={formData.KhamBHYT === true}
                    onChange={() => setFormData({ ...formData, KhamBHYT: true })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Có</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="KhamBHYT"
                    checked={formData.KhamBHYT === false}
                    onChange={() => setFormData({ ...formData, KhamBHYT: false })}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Không</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
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
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:from-purple-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {appointment ? "Cập nhật" : "Đặt"} Lịch Khám
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}