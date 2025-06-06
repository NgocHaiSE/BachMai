import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
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
  Timer
} from "lucide-react";

export default function AppointmentManagement() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);

  const appointments = useQuery(api.appointments.listByDate, { date: selectedDate });
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const createAppointment = useMutation(api.appointments.create);
  const updateAppointment = useMutation(api.appointments.update);
  const updateStatus = useMutation(api.appointments.updateStatus);
  const deleteAppointment = useMutation(api.appointments.remove);

  const handleSubmit = async (formData: any) => {
    try {
      if (editingAppointment) {
        await updateAppointment({ id: editingAppointment._id, ...formData });
        toast.success("Cập nhật lịch khám thành công");
      } else {
        await createAppointment(formData);
        toast.success("Tạo lịch khám thành công");
      }
      setShowForm(false);
      setEditingAppointment(null);
    } catch (error) {
      toast.error("Lưu lịch khám thất bại");
    }
  };

  const handleStatusUpdate = async (id: Id<"appointments">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: Id<"appointments">) => {
    if (confirm("Bạn có chắc chắn muốn xóa lịch khám này?")) {
      try {
        await deleteAppointment({ id });
        toast.success("Xóa lịch khám thành công");
      } catch (error) {
        toast.error("Xóa lịch khám thất bại");
      }
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setShowForm(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "confirmed": return <CheckCircle className="w-4 h-4" />;
      case "scheduled": return <Clock className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      case "no-show": return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "confirmed": return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      case "no-show": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "consultation": return "bg-blue-100 text-blue-800";
      case "follow-up": return "bg-green-100 text-green-800";
      case "emergency": return "bg-red-100 text-red-800";
      case "surgery": return "bg-purple-100 text-purple-800";
      case "checkup": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

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
        {appointments === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : appointments.length === 0 ? (
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
                    Bác Sĩ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại Khám
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
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.appointmentTime}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Timer className="w-4 h-4 mr-1" />
                            {appointment.duration} phút
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
                            {appointment.patient?.firstName} {appointment.patient?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            {appointment.patient?.phone}
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
                            BS. {appointment.staff?.firstName} {appointment.staff?.lastName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {appointment.staff?.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(appointment.type)}`}>
                        {appointment.type === "consultation" ? "Tư vấn" :
                         appointment.type === "follow-up" ? "Tái khám" :
                         appointment.type === "emergency" ? "Cấp cứu" :
                         appointment.type === "surgery" ? "Phẫu thuật" :
                         "Kiểm tra"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusUpdate(appointment._id, e.target.value)}
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border appearance-none pr-8 ${getStatusColor(appointment.status)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          <option value="scheduled">Đã lên lịch</option>
                          <option value="confirmed">Đã xác nhận</option>
                          <option value="completed">Hoàn thành</option>
                          <option value="cancelled">Đã hủy</option>
                          <option value="no-show">Vắng mặt</option>
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
                          onClick={() => handleDelete(appointment._id)}
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
    patientId: appointment?.patientId || "",
    staffId: appointment?.staffId || "",
    appointmentDate: appointment?.appointmentDate || new Date().toISOString().split('T')[0],
    appointmentTime: appointment?.appointmentTime || "",
    duration: appointment?.duration || 30,
    type: appointment?.type || "consultation",
    notes: appointment?.notes || "",
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

  const appointmentTypes = [
    { value: "consultation", label: "Tư vấn", icon: Stethoscope, color: "text-blue-600" },
    { value: "follow-up", label: "Tái khám", icon: Clock, color: "text-green-600" },
    { value: "emergency", label: "Cấp cứu", icon: AlertCircle, color: "text-red-600" },
    { value: "surgery", label: "Phẫu thuật", icon: Timer, color: "text-purple-600" },
    { value: "checkup", label: "Kiểm tra", icon: CheckCircle, color: "text-orange-600" },
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
            {/* Bệnh nhân và Bác sĩ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient: any) => (
                      <option key={patient._id} value={patient._id}>
                        {patient.firstName} {patient.lastName} - {patient.phone}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn bác sĩ</option>
                    {staff.map((doctor: any) => (
                      <option key={doctor._id} value={doctor._id}>
                        BS. {doctor.firstName} {doctor.lastName} - {doctor.department}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Ngày và Thời gian */}
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
                    value={formData.appointmentDate}
                    onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giờ Khám *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    required
                    value={formData.appointmentTime}
                    onChange={(e) => setFormData({ ...formData, appointmentTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Thời gian và Loại khám */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời Gian (phút) *
                </label>
                <div className="relative">
                  <Timer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="number"
                    required
                    min="15"
                    max="240"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                    placeholder="30"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại Khám *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {appointmentTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <label
                        key={type.value}
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                          formData.type === type.value
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="type"
                          value={type.value}
                          checked={formData.type === type.value}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
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

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi Chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                rows={4}
                placeholder="Ghi chú thêm về lịch hẹn..."
              />
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