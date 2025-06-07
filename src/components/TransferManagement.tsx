import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";
import { 
  Truck, 
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
  Search,
  Filter,
  ChevronDown,
  Phone,
  Building2,
  MapPin,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Hash,
  Activity,
  Heart,
  Thermometer,
  Monitor,
  Clipboard,
  Eye,
  ArrowRight,
  CreditCard,
  IdCard,
  ShieldCheck
} from "lucide-react";

export default function TransferManagement() {
  const [activeTab, setActiveTab] = useState("requests");

  const tabs = [
    { 
      id: "requests", 
      name: "Phiếu Yêu Cầu Chuyển Viện", 
      icon: FileText, 
      color: "text-blue-600",
      description: "Quản lý yêu cầu chuyển viện từ bác sĩ"
    },
    { 
      id: "records", 
      name: "Hồ Sơ Chuyển Viện", 
      icon: Truck, 
      color: "text-red-600",
      description: "Hồ sơ chuyển viện và theo dõi quá trình"
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center">
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
          <Truck className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Chuyển Viện</h2>
          <p className="text-gray-600">Quản lý yêu cầu và hồ sơ chuyển viện</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center p-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-red-50 text-red-700 border-2 border-red-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <IconComponent className={`w-6 h-6 mr-3 ${
                  activeTab === tab.id ? "text-red-600" : "text-gray-400"
                }`} />
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                  <div className="text-sm text-gray-500">{tab.description}</div>
                </div>
                {activeTab === tab.id && (
                  <ArrowRight className="w-5 h-5 text-red-600 ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "requests" && <TransferRequests />}
      {activeTab === "records" && <TransferRecords />}
    </div>
  );
}

function TransferRequests() {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const requests = useQuery(api.transferRequests.list);
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const createRequest = useMutation(api.transferRequests.create);
  const updateRequest = useMutation(api.transferRequests.update);
  const updateStatus = useMutation(api.transferRequests.updateStatus);
  const deleteRequest = useMutation(api.transferRequests.remove);

  const filteredRequests = requests?.filter(request =>
    !searchTerm || 
    request.requestCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${request.patient?.firstName} ${request.patient?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.patient?.phone?.includes(searchTerm) ||
    request.patient?.idNumber?.includes(searchTerm) ||
    request.patient?.insuranceNumber?.includes(searchTerm)
  );

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRequest) {
        await updateRequest({ id: editingRequest._id, ...formData });
        toast.success("Cập nhật yêu cầu chuyển viện thành công");
      } else {
        await createRequest(formData);
        toast.success("Tạo yêu cầu chuyển viện thành công");
      }
      setShowForm(false);
      setEditingRequest(null);
    } catch (error) {
      toast.error("Lưu yêu cầu chuyển viện thất bại");
    }
  };

  const handleStatusUpdate = async (id: Id<"transferRequests">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: Id<"transferRequests">) => {
    if (confirm("Bạn có chắc chắn muốn xóa yêu cầu chuyển viện này?")) {
      try {
        await deleteRequest({ id });
        toast.success("Xóa yêu cầu chuyển viện thành công");
      } catch (error) {
        toast.error("Xóa yêu cầu chuyển viện thất bại");
      }
    }
  };

  const handleEdit = (request: any) => {
    setEditingRequest(request);
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case "urgent": return "Khẩn cấp";
      case "high": return "Cao";
      case "medium": return "Trung bình";
      case "low": return "Thấp";
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case "completed": return "Hoàn thành";
      case "approved": return "Đã duyệt";
      case "pending": return "Chờ xử lý";
      case "rejected": return "Từ chối";
      default: return status;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Phiếu Yêu Cầu Chuyển Viện</h3>
            <p className="text-gray-600">Quản lý yêu cầu chuyển viện từ bác sĩ</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingRequest(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo Yêu Cầu
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã YC, họ tên, số CCCD/CMND, số BHYT/BHXH..."
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
        
        {filteredRequests && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-1" />
            Tìm thấy {filteredRequests.length} yêu cầu chuyển viện
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredRequests === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy yêu cầu</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Không có yêu cầu nào phù hợp với từ khóa tìm kiếm" : "Chưa có yêu cầu chuyển viện nào"}
            </p>
            <button
              onClick={() => {
                setEditingRequest(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã YC_chuyển viện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã bệnh nhân
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày điều trị
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số CCCD/CMND
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số BHYT/BHXH
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <Hash className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {request.requestCode}
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {getPriorityName(request.priority)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.patient?._id?.slice(-8) || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.patient?.firstName} {request.patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {request.patient?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.treatmentDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.patient?.idNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.patient?.insuranceNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="relative">
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusUpdate(request._id, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border appearance-none pr-8 ${getStatusColor(request.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                            <option value="completed">Hoàn thành</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
                        <button
                          onClick={() => handleEdit(request)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(request._id)}
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

      {showForm && (
        <TransferRequestForm
          request={editingRequest}
          patients={patients || []}
          staff={staff || []}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRequest(null);
          }}
        />
      )}
    </div>
  );
}

function TransferRecords() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const records = useQuery(api.transferRecords.list);
  const patients = useQuery(api.patients.list);
  const staff = useQuery(api.staff.listByRole, { role: "doctor" });
  const requests = useQuery(api.transferRequests.list);
  const createRecord = useMutation(api.transferRecords.create);
  const updateRecord = useMutation(api.transferRecords.update);
  const updateStatus = useMutation(api.transferRecords.updateStatus);
  const deleteRecord = useMutation(api.transferRecords.remove);

  const filteredRecords = records?.filter(record =>
    !searchTerm || 
    record.transferCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${record.patient?.firstName} ${record.patient?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.patient?.phone?.includes(searchTerm) ||
    record.patient?.idNumber?.includes(searchTerm) ||
    record.patient?.insuranceNumber?.includes(searchTerm)
  );

  const handleSubmit = async (formData: any) => {
    try {
      if (editingRecord) {
        await updateRecord({ id: editingRecord._id, ...formData });
        toast.success("Cập nhật hồ sơ chuyển viện thành công");
      } else {
        await createRecord(formData);
        toast.success("Tạo hồ sơ chuyển viện thành công");
      }
      setShowForm(false);
      setEditingRecord(null);
    } catch (error) {
      toast.error("Lưu hồ sơ chuyển viện thất bại");
    }
  };

  const handleStatusUpdate = async (id: Id<"transferRecords">, status: string) => {
    try {
      await updateStatus({ id, status: status as any });
      toast.success("Cập nhật trạng thái thành công");
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: Id<"transferRecords">) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ chuyển viện này?")) {
      try {
        await deleteRecord({ id });
        toast.success("Xóa hồ sơ chuyển viện thành công");
      } catch (error) {
        toast.error("Xóa hồ sơ chuyển viện thất bại");
      }
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "approved": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <Truck className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hồ Sơ Chuyển Viện</h3>
            <p className="text-gray-600">Hồ sơ chuyển viện và theo dõi quá trình</p>
          </div>
        </div>
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Tạo Hồ Sơ
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã chuyển viện, họ tên, số CCCD/CMND, số BHYT/BHXH..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            />
          </div>
          <button className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Bộ lọc
          </button>
        </div>
        
        {filteredRecords && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Truck className="w-4 h-4 mr-1" />
            Tìm thấy {filteredRecords.length} hồ sơ chuyển viện
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredRecords === undefined ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-red-600" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy hồ sơ</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Không có hồ sơ nào phù hợp với từ khóa tìm kiếm" : "Chưa có hồ sơ chuyển viện nào"}
            </p>
            <button
              onClick={() => {
                setEditingRecord(null);
                setShowForm(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo hồ sơ đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã chuyển viện
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã bệnh nhân
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Họ tên
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày điều trị
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số CCCD/CMND
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số BHYT/BHXH
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <Truck className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.transferCode}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.transferDate}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.patient?._id?.slice(-8) || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.patient?.firstName} {record.patient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.patient?.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.treatmentDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.patient?.idNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.patient?.insuranceNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="relative">
                          <select
                            value={record.status}
                            onChange={(e) => handleStatusUpdate(record._id, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border appearance-none pr-8 ${getStatusColor(record.status)} focus:outline-none focus:ring-2 focus:ring-red-500`}
                          >
                            <option value="pending">Chờ xử lý</option>
                            <option value="approved">Đã duyệt</option>
                            <option value="rejected">Từ chối</option>
                            <option value="completed">Hoàn thành</option>
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-3 h-3 pointer-events-none" />
                        </div>
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

      {showForm && (
        <TransferRecordForm
          record={editingRecord}
          patients={patients || []}
          staff={staff || []}
          requests={requests || []}
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

function TransferRequestForm({ request, patients, staff, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    patientId: request?.patientId || "",
    staffId: request?.staffId || "",
    treatmentDate: request?.treatmentDate || new Date().toISOString().split('T')[0],
    reason: request?.reason || "",
    requestDate: request?.requestDate || new Date().toISOString().split('T')[0],
    destinationAddress: request?.destinationAddress || "",
    destinationFacility: request?.destinationFacility || "",
    priority: request?.priority || "medium",
    notes: request?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPatient = patients.find((p: any) => p._id === formData.patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions = [
    { value: "low", label: "Thấp", color: "text-green-600" },
    { value: "medium", label: "Trung bình", color: "text-yellow-600" },
    { value: "high", label: "Cao", color: "text-orange-600" },
    { value: "urgent", label: "Khẩn cấp", color: "text-red-600" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {request ? "Sửa Phiếu Yêu Cầu Chuyển Viện" : "Tạo Phiếu Yêu Cầu Chuyển Viện"}
                </h3>
                <p className="text-sm text-gray-600">
                  {request ? "Cập nhật thông tin yêu cầu chuyển viện" : "Tạo phiếu yêu cầu chuyển viện mới"}
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
          {/* Thông tin bệnh nhân */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin bệnh nhân
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã bệnh nhân *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient: any) => (
                      <option key={patient._id} value={patient._id}>
                        {patient._id.slice(-8)} - {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số CCCD/CMND
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={selectedPatient?.idNumber || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    placeholder="Sẽ hiển thị khi chọn bệnh nhân"
                  />
                </div>
              </div>
            </div>

            {selectedPatient && (
              <div className="bg-blue-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên bệnh nhân
                    </label>
                    <input
                      type="text"
                      value={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.dateOfBirth}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.gender === "male" ? "Nam" : selectedPatient.gender === "female" ? "Nữ" : "Khác"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điện thoại
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.phone}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khoa
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.department || "Chưa phân khoa"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại BHYT/BHXH
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.insuranceType || "Không có"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      value={selectedPatient.address}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số thẻ BHYT/BHXH
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày điều trị
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.treatmentDate}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin yêu cầu */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Thông tin chuyển viện
            </h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do chuyển viện *
                </label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả lý do cần chuyển viện"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày yêu cầu chuyển viện *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      required
                      value={formData.requestDate}
                      onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bác sĩ phụ trách *
                  </label>
                  <div className="relative">
                    <Stethoscope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      required
                      value={formData.staffId}
                      onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none"
                    >
                      <option value="">Chọn bác sĩ</option>
                      {staff.map((doctor: any) => (
                        <option key={doctor._id} value={doctor._id}>
                          BS. {doctor.firstName} {doctor.lastName}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ cơ sở chuyển đến *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    required
                    value={formData.destinationAddress}
                    onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={2}
                    placeholder="Địa chỉ đầy đủ của cơ sở y tế"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cơ sở y tế chuyển đến *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.destinationFacility}
                    onChange={(e) => setFormData({ ...formData, destinationFacility: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Tên bệnh viện/cơ sở y tế"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Mức độ ưu tiên *
                  </label>
                  <div className="space-y-2">
                    {priorityOptions.map((priority) => (
                      <label
                        key={priority.value}
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                          formData.priority === priority.value
                            ? "border-blue-500 bg-blue-50"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú (nếu có)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    rows={6}
                    placeholder="Ghi chú thêm về yêu cầu chuyển viện"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Chi tiết phê duyệt */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-600" />
              Chi tiết phê duyệt
            </h4>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <input
                    type="text"
                    value="Chờ xử lý"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày phê duyệt
                  </label>
                  <input
                    type="text"
                    value="Chưa phê duyệt"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
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
                  {request ? "Cập nhật" : "Tạo"} Yêu Cầu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TransferRecordForm({ record, patients, staff, requests, onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    requestId: record?.requestId || "",
    patientId: record?.patientId || "",
    staffId: record?.staffId || "",
    treatmentDate: record?.treatmentDate || new Date().toISOString().split('T')[0],
    reason: record?.reason || "",
    transferDate: record?.transferDate || new Date().toISOString().split('T')[0],
    estimatedTime: record?.estimatedTime || "",
    destinationAddress: record?.destinationAddress || "",
    destinationFacility: record?.destinationFacility || "",
    destinationPhone: record?.destinationPhone || "",
    diagnosis: record?.diagnosis || "",
    icd10Code: record?.icd10Code || "",
    pulse: record?.pulse || "",
    bloodPressure: record?.bloodPressure || "",
    respiratoryRate: record?.respiratoryRate || "",
    temperature: record?.temperature || "",
    consciousness: record?.consciousness || "",
    clinicalProgress: record?.clinicalProgress || "",
    treatmentPerformed: record?.treatmentPerformed || "",
    accompaniedPersonId: record?.accompaniedPersonId || "",
    notes: record?.notes || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPatient = patients.find((p: any) => p._id === formData.patientId);

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
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mr-3">
                <Truck className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record ? "Sửa Hồ Sơ Chuyển Viện" : "Tạo Hồ Sơ Chuyển Viện"}
                </h3>
                <p className="text-sm text-gray-600">
                  {record ? "Cập nhật thông tin hồ sơ chuyển viện" : "Tạo hồ sơ chuyển viện chi tiết"}
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
          {/* Thông tin bệnh nhân */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-red-600" />
              Thông tin bệnh nhân
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã bệnh nhân *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.patientId}
                    onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn bệnh nhân</option>
                    {patients.map((patient: any) => (
                      <option key={patient._id} value={patient._id}>
                        {patient._id.slice(-8)} - {patient.firstName} {patient.lastName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số CCCD/CMND
                </label>
                <div className="relative">
                  <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={selectedPatient?.idNumber || ""}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    placeholder="Sẽ hiển thị khi chọn bệnh nhân"
                  />
                </div>
              </div>
            </div>

            {selectedPatient && (
              <div className="bg-red-50 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ tên bệnh nhân
                    </label>
                    <input
                      type="text"
                      value={`${selectedPatient.firstName} ${selectedPatient.lastName}`}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày sinh
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.dateOfBirth}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.gender === "male" ? "Nam" : selectedPatient.gender === "female" ? "Nữ" : "Khác"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Điện thoại
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.phone}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Khoa
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.department || "Chưa phân khoa"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Loại BHYT/BHXH
                    </label>
                    <input
                      type="text"
                      value={selectedPatient.insuranceType || "Không có"}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Địa chỉ
                    </label>
                    <textarea
                      value={selectedPatient.address}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số thẻ BHYT/BHXH
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
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày điều trị
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={formData.treatmentDate}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin yêu cầu */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-red-600" />
              Thông tin yêu cầu
            </h4>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do chuyển viện *
                </label>
                <textarea
                  required
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả lý do cần chuyển viện"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày chuyển viện *
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      required
                      value={formData.transferDate}
                      onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian dự kiến
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      value={formData.estimatedTime}
                      onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại cơ sở chuyển đến
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={formData.destinationPhone}
                      onChange={(e) => setFormData({ ...formData, destinationPhone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="Số điện thoại liên hệ"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ cơ sở chuyển đến *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <textarea
                    required
                    value={formData.destinationAddress}
                    onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    rows={2}
                    placeholder="Địa chỉ đầy đủ của cơ sở y tế"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cơ sở y tế chuyển đến *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    value={formData.destinationFacility}
                    onChange={(e) => setFormData({ ...formData, destinationFacility: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Tên bệnh viện/cơ sở y tế"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chẩn đoán *
                  </label>
                  <textarea
                    required
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    rows={3}
                    placeholder="Chẩn đoán chi tiết"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mã ICD10
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.icd10Code}
                      onChange={(e) => setFormData({ ...formData, icd10Code: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                      placeholder="VD: I21.9"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dấu hiệu sinh tồn */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Dấu hiệu sinh tồn
            </h4>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mạch (lần/phút)
                </label>
                <div className="relative">
                  <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.pulse}
                    onChange={(e) => setFormData({ ...formData, pulse: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="VD: 80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Huyết áp (mmHg)
                </label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.bloodPressure}
                    onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="VD: 120/80"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhịp thở (lần/phút)
                </label>
                <div className="relative">
                  <Activity className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.respiratoryRate}
                    onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="VD: 20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhiệt độ (°C)
                </label>
                <div className="relative">
                  <Thermometer className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="VD: 36.5"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ý thức
              </label>
              <input
                type="text"
                value={formData.consciousness}
                onChange={(e) => setFormData({ ...formData, consciousness: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                placeholder="VD: Tỉnh táo, Lơ mơ, Hôn mê"
              />
            </div>
          </div>

          {/* Thông tin lâm sàng */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clipboard className="w-5 h-5 mr-2 text-red-600" />
              Thông tin lâm sàng
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diễn biến lâm sàng
                </label>
                <textarea
                  value={formData.clinicalProgress}
                  onChange={(e) => setFormData({ ...formData, clinicalProgress: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả diễn biến tình trạng bệnh nhân"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điều trị đã thực hiện
                </label>
                <textarea
                  value={formData.treatmentPerformed}
                  onChange={(e) => setFormData({ ...formData, treatmentPerformed: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows={3}
                  placeholder="Các biện pháp điều trị đã áp dụng"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mã người đi cùng
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.accompaniedPersonId}
                    onChange={(e) => setFormData({ ...formData, accompaniedPersonId: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Mã định danh người đi cùng"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú (nếu có)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows={3}
                  placeholder="Thông tin bổ sung khác"
                />
              </div>
            </div>
          </div>

          {/* Chi tiết phê duyệt */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-red-600" />
              Chi tiết phê duyệt
            </h4>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <input
                    type="text"
                    value="Chờ xử lý"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày phê duyệt
                  </label>
                  <input
                    type="text"
                    value="Chưa phê duyệt"
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
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
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {record ? "Cập nhật" : "Tạo"} Hồ Sơ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}