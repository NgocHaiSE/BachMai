import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import { 
  UserCheck, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  Save, 
  Loader2,
  Filter,
  Stethoscope,
  Heart,
  ShieldCheck,
  Users,
  Mail,
  Phone,
  Building2,
  Award,
  User,
  CheckCircle2,
  XCircle,
  Badge,
  Search
} from "lucide-react";

export default function StaffManagement() {
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [filterRole, setFilterRole] = useState<string>("all");

  const allStaff = useQuery(api.staff.list);
  const createStaff = useMutation(api.staff.create);
  const updateStaff = useMutation(api.staff.update);
  const deleteStaff = useMutation(api.staff.remove);

  const filteredStaff = allStaff?.filter(staff => 
    filterRole === "all" || staff.role === filterRole
  );

  const handleSubmit = async (formData: any) => {
    try {
      if (editingStaff) {
        await updateStaff({ id: editingStaff._id, ...formData });
        toast.success("Cập nhật thông tin nhân viên thành công");
      } else {
        await createStaff(formData);
        toast.success("Thêm nhân viên mới thành công");
      }
      setShowForm(false);
      setEditingStaff(null);
    } catch (error) {
      toast.error("Lưu thông tin nhân viên thất bại");
    }
  };

  const handleDelete = async (id: Id<"staff">) => {
    if (confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await deleteStaff({ id });
        toast.success("Xóa nhân viên thành công");
      } catch (error) {
        toast.error("Xóa nhân viên thất bại");
      }
    }
  };

  const handleEdit = (staff: any) => {
    setEditingStaff(staff);
    setShowForm(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor": return <Stethoscope className="w-5 h-5" />;
      case "nurse": return <Heart className="w-5 h-5" />;
      case "admin": return <ShieldCheck className="w-5 h-5" />;
      case "receptionist": return <Users className="w-5 h-5" />;
      default: return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "doctor": return "bg-blue-100 text-blue-800 border-blue-200";
      case "nurse": return "bg-green-100 text-green-800 border-green-200";
      case "admin": return "bg-purple-100 text-purple-800 border-purple-200";
      case "receptionist": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case "doctor": return "Bác sĩ";
      case "nurse": return "Y tá";
      case "admin": return "Quản trị";
      case "receptionist": return "Lễ tân";
      default: return role;
    }
  };

  const roleOptions = [
    { value: "all", label: "Tất cả chức vụ", icon: Users, count: allStaff?.length || 0 },
    { value: "doctor", label: "Bác sĩ", icon: Stethoscope, count: allStaff?.filter(s => s.role === "doctor").length || 0 },
    { value: "nurse", label: "Y tá", icon: Heart, count: allStaff?.filter(s => s.role === "nurse").length || 0 },
    { value: "admin", label: "Quản trị", icon: ShieldCheck, count: allStaff?.filter(s => s.role === "admin").length || 0 },
    { value: "receptionist", label: "Lễ tân", icon: UserCheck, count: allStaff?.filter(s => s.role === "receptionist").length || 0 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
            <UserCheck className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Quản Lý Nhân Viên</h2>
            <p className="text-gray-600">Quản lý thông tin và phân quyền nhân viên</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Thêm Nhân Viên
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-400 mr-2" />
          <label className="text-sm font-medium text-gray-700">Lọc theo chức vụ:</label>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {roleOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => setFilterRole(option.value)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  filterRole === option.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <IconComponent className={`w-5 h-5 mr-3 ${
                    filterRole === option.value ? "text-orange-600" : "text-gray-600"
                  }`} />
                  <span className={`font-medium ${
                    filterRole === option.value ? "text-orange-900" : "text-gray-700"
                  }`}>
                    {option.label}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  filterRole === option.value 
                    ? "bg-orange-200 text-orange-800" 
                    : "bg-gray-200 text-gray-600"
                }`}>
                  {option.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Staff List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredStaff === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy nhân viên</h3>
            <p className="text-gray-600 mb-6">
              {filterRole === "all" 
                ? "Chưa có nhân viên nào trong hệ thống" 
                : `Không có nhân viên nào với chức vụ ${getRoleName(filterRole)}`}
            </p>
            <button
              onClick={() => {
                setEditingStaff(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm nhân viên đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nhân Viên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên Hệ
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chức Vụ & Khoa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Chuyên Môn
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
                {filteredStaff.map((staff) => (
                  <tr key={staff._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${getRoleColor(staff.role).replace('text-', 'text-').replace('border-', '').replace('bg-', 'bg-')}`}>
                          {getRoleIcon(staff.role)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {staff.firstName} {staff.lastName}
                          </div>
                          {staff.licenseNumber && (
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <Badge className="w-4 h-4 mr-1" />
                              Giấy phép: {staff.licenseNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900 flex items-center">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {staff.phone}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {staff.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(staff.role)}`}>
                          {getRoleIcon(staff.role)}
                          <span className="ml-2">{getRoleName(staff.role)}</span>
                        </span>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Building2 className="w-4 h-4 mr-1" />
                          {staff.department}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center">
                        {staff.specialization ? (
                          <>
                            <Award className="w-4 h-4 mr-2 text-blue-500" />
                            {staff.specialization}
                          </>
                        ) : (
                          <span className="text-gray-500">Không có</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        staff.isActive 
                          ? "bg-green-100 text-green-800 border border-green-200" 
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}>
                        {staff.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Đang làm việc
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 mr-1" />
                            Ngừng làm việc
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(staff)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(staff._id)}
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

      {/* Staff Form Modal */}
      {showForm && (
        <StaffForm
          staff={editingStaff}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingStaff(null);
          }}
        />
      )}
    </div>
  );
}

function StaffForm({ staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    firstName: staff?.firstName || "",
    lastName: staff?.lastName || "",
    email: staff?.email || "",
    phone: staff?.phone || "",
    role: staff?.role || "doctor",
    department: staff?.department || "",
    specialization: staff?.specialization || "",
    licenseNumber: staff?.licenseNumber || "",
    isActive: staff?.isActive ?? true,
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

  const roleOptions = [
    { value: "doctor", label: "Bác sĩ", icon: Stethoscope, color: "text-blue-600" },
    { value: "nurse", label: "Y tá", icon: Heart, color: "text-green-600" },
    { value: "admin", label: "Quản trị", icon: ShieldCheck, color: "text-purple-600" },
    { value: "receptionist", label: "Lễ tân", icon: UserCheck, color: "text-orange-600" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mr-3">
                <UserCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {staff ? "Sửa Thông Tin Nhân Viên" : "Thêm Nhân Viên Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {staff ? "Cập nhật thông tin nhân viên" : "Nhập đầy đủ thông tin nhân viên"}
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
                <User className="w-5 h-5 mr-2 text-orange-600" />
                Thông Tin Cơ Bản
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Nhập tên"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Họ *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                    placeholder="Nhập họ"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="example@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Điện Thoại *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="0123 456 789"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Thông tin công việc */}
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Thông Tin Công Việc
              </h4>
              <div className="space-y-6">
                {/* Chức vụ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chức Vụ *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roleOptions.map((role) => {
                      const IconComponent = role.icon;
                      return (
                        <label
                          key={role.value}
                          className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                            formData.role === role.value
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="role"
                            value={role.value}
                            checked={formData.role === role.value}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                            className="sr-only"
                          />
                          <IconComponent className={`w-6 h-6 mr-3 ${role.color}`} />
                          <span className="font-medium text-gray-900">{role.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khoa/Phòng Ban *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        required
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="VD: Tim mạch, Cấp cứu, Hành chính"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Chuyên Môn
                    </label>
                    <div className="relative">
                      <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                        placeholder="VD: Can thiệp tim mạch, Chăm sóc đặc biệt"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số Giấy Phép Hành Nghề
                  </label>
                  <div className="relative">
                    <Badge className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors"
                      placeholder="Nhập số giấy phép (nếu có)"
                    />
                  </div>
                </div>

                {/* Trạng thái */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-5 w-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  {/* <label htmlFor="isActive" className="ml-3 flex items-center text-sm text-gray-900">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                    Nhân viên đang làm việc
                  </label> */}
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
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl font-medium hover:from-orange-700 hover:to-orange-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {staff ? "Cập nhật" : "Thêm"} Nhân Viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}