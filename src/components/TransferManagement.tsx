import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from '../contexts/AuthContext';
import {
  useTransferRequests,
  useCreateTransferRequest,
  useUpdateTransferRequest,
  useApproveTransferRequest,
  useDeleteTransferRequest,
  useTransferRecords,
  useCreateTransferRecord,
  useUpdateTransferRecord,
  useUpdateTransferRecordStatus,
  useDeleteTransferRecord,
  useTransferRecord,
  usePatients,
  useStaff,
} from "../hooks/api";
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

function removeVietnameseTones(str: string = "") {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export default function TransferManagement() {
  const [activeTab, setActiveTab] = useState("requests");
  const {user} = useAuth();

  const tabs = [
    { 
      id: "requests", 
      name: "Phiếu Yêu Cầu Chuyển Viện", 
      color: "text-blue-600",
    },
    { 
      id: "records", 
      name: "Hồ Sơ Chuyển Viện", 
      color: "text-red-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản Lý Chuyển Viện</h2>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center p-4 rounded-xl transition-all ${
                  activeTab === tab.id
                    ? "bg-purple-50 text-[#280559] border-2 border-purple-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div className="text-left">
                  <div className="font-medium">{tab.name}</div>
                </div>
                {activeTab === tab.id && (
                  <ArrowRight className="w-5 h-5 text-[#280559] ml-auto" />
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
  const {user} = useAuth();
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: requests, refetch } = useTransferRequests({ tuNgay: startDate, denNgay: endDate });
  const { data: patients } = usePatients("");
  const { data: staff } = useStaff("doctor");
  const { mutate: createRequest } = useCreateTransferRequest();
  const { mutate: updateRequest } = useUpdateTransferRequest();
  const { mutate: updateStatus } = useApproveTransferRequest();
  const { mutate: deleteRequest } = useDeleteTransferRequest();


   const normalizedSearch = removeVietnameseTones(searchTerm);
  const filteredRequests = requests?.filter((req: any) => {
    const patient = req.patient || {};
    const fields = [
      req.requestCode,
      req.patientId,
      req.patientName || patient.HoTen,
      req.treatmentDate
        ? new Date(req.treatmentDate).toLocaleDateString("vi-VN")
        : "",
      req.idNumber || patient.CCCD,
      req.insuranceNumber || patient.BHYT,
      patient.SDT,
    ];
    return (
      !normalizedSearch ||
      fields.some((f) =>
        removeVietnameseTones(String(f ?? "")).includes(normalizedSearch)
      )
    );
  });

  const handleSubmit = async (formData: any) => {
    const payload = {
      idBenhNhan: formData.patientId,
      idBacSiPhuTrach: formData.staffId,
      NgayChuyen: formData.requestDate,
      LyDo: formData.reason,
      DiaChi: formData.destinationAddress,
      CoSoChuyenDen: formData.destinationFacility,
      MucDo: formData.priority,
      GhiChu: formData.notes,
      idNguoiDung: user?.idNguoiDung,
    };
    try {
      if (editingRequest) {
        await updateRequest({ id: editingRequest.idYeuCauChuyenVien || editingRequest._id, ...payload });
        toast.success("Cập nhật yêu cầu chuyển viện thành công");
      } else {
        await createRequest(payload);
        toast.success("Tạo yêu cầu chuyển viện thành công");
      }
      setShowForm(false);
      setEditingRequest(null);
      refetch();
    } catch (error) {
      toast.error("Lưu yêu cầu chuyển viện thất bại");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, idNguoiPheDuyet: user?.idNguoiDung, TrangThaiMoi: status });
      toast.success("Cập nhật trạng thái thành công");
      refetch();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa yêu cầu chuyển viện này?")) {
      try {
        await deleteRequest({ id });
        toast.success("Xóa yêu cầu chuyển viện thành công");
        refetch();
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
        {/* <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Phiếu Yêu Cầu Chuyển Viện</h3>
            <p className="text-gray-600">Quản lý yêu cầu chuyển viện từ bác sĩ</p>
          </div>
        </div> */}
        <button
          onClick={() => {
            setEditingRequest(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-3 btn-primary text-white font-medium rounded-xl  transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                {filteredRequests.map((request: any) => (
                  <tr key={request.requestCode} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
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
                        {request.patientId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.patientName}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(request.treatmentDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.idNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.insuranceNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <div className="relative">
                          <select
                            value={request.status}
                            onChange={(e) => handleStatusUpdate(request.requestCode, e.target.value)}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border appearance-none pr-8 ${getStatusColor(request.status)} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          >
                            <option value="Chờ xử lý">Chờ xử lý</option>
                            <option value="Đã duyệt">Đã duyệt</option>
                            <option value="Từ chối">Từ chối</option>
                            <option value="Hoàn thành">Hoàn thành</option>
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
                          onClick={() => handleDelete(request.requestCode)}
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
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);

  const { data: records, refetch } = useTransferRecords({ tuNgay: startDate, denNgay: endDate });

  const { data: patients } = usePatients("");
  const { data: staff } = useStaff("doctor");
  const { data: requests } = useTransferRequests({});
  const { mutate: createRecord } = useCreateTransferRecord();
  const { mutate: updateRecord } = useUpdateTransferRecord();
  const { mutate: updateStatus } = useUpdateTransferRecordStatus();
  const { mutate: deleteRecord } = useDeleteTransferRecord();

  const normalizedSearchRec = removeVietnameseTones(searchTerm);
  const filteredRecords = records?.filter((rec: any) => {
    const patient = rec.patient || {};
    const fields = [
      rec.transferCode,
      rec.patientId,
      rec.patientName || patient.HoTen,
      rec.treatmentDate
        ? new Date(rec.treatmentDate).toLocaleDateString("vi-VN")
        : "",
      rec.idNumber || patient.CCCD,
      rec.insuranceNumber || patient.BHYT,
      patient.SDT,
    ];
    return (
      !normalizedSearchRec ||
      fields.some((f) =>
        removeVietnameseTones(String(f ?? "")).includes(normalizedSearchRec)
      )
    );
  });

  const handleSubmit = async (formData: any) => {
    const payload = {
      idYeuCauChuyenVien: formData.idYeuCauChuyenVien,
      NgayChuyen: formData.NgayChuyen,
      ThoiGianDuKien: formData.ThoiGianDuKien,
      SDT_CoSoYTe: formData.SDT_CoSoYTe,
      YThuc: formData.YThuc,
      GhiChu: formData.GhiChu,
      idNguoiDung: formData.idNguoiDung,
    };
    try {
      if (editingRecord) {
        await updateRecord({ id: editingRecord.idChuyenVien || editingRecord._id, ...payload });
        toast.success("Cập nhật hồ sơ chuyển viện thành công");
      } else {
        await createRecord(payload);
        toast.success("Tạo hồ sơ chuyển viện thành công");
      }
      setShowForm(false);
      setEditingRecord(null);
      refetch();
    } catch (error) {
      toast.error("Lưu hồ sơ chuyển viện thất bại");
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateStatus({ id, TrangThaiMoi: status });
      toast.success("Cập nhật trạng thái thành công");
      refetch();
    } catch (error) {
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa hồ sơ chuyển viện này?")) {
      try {
        await deleteRecord({ id });
        toast.success("Xóa hồ sơ chuyển viện thành công");
        refetch();
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
        {/* <div className="flex items-center">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
            <Truck className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Hồ Sơ Chuyển Viện</h3>
            <p className="text-gray-600">Hồ sơ chuyển viện và theo dõi quá trình</p>
          </div>
        </div> */}
        <button
          onClick={() => {
            setEditingRecord(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-6 py-3 btn-primary text-white font-medium rounded-xl  transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
                {filteredRecords.map((record: any) => (
                  <tr key={record.idChuyenVien} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.transferCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.patientId || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {record.patientName} 
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(record.treatmentDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.idNumber || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.insuranceNumber || "N/A"}
                      </div>
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
                          onClick={() => handleDelete(record.transferCode)}
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
  const {user} = useAuth()
  const [formData, setFormData] = useState({
    patientId: request?.patientId || "",
    staffId: request?.doctorId ? request.doctorId.trim() : "",
    requestDate: request?.requestDate
      ? new Date(request.requestDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    treatmentDate: request?.treatmentDate
      ? new Date(request.treatmentDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    reason: request?.reason || "",
    destinationAddress: request?.destinationAddress || "",
    destinationFacility: request?.destinationFacility || "",
    priority: request?.priority || "medium",
    notes: request?.notes || "",
  });


  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPatient = patients.find(
    (p: any) => p.idBenhNhan === formData.patientId || p._id === formData.patientId
  );

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
                      <option
                        key={patient.idBenhNhan || patient._id}
                        value={patient.idBenhNhan || patient._id}
                      >
                        {(patient.idBenhNhan || patient._id)} - {patient.HoTen || `${patient.firstName} ${patient.lastName}`}
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
                    value={selectedPatient?.CCCD || selectedPatient?.idNumber || ""}
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
                      value={
                        selectedPatient.HoTen 
                      }
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
                      value={
                        selectedPatient.dateOfBirth
                          ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('vi-VN')
                          : selectedPatient.NgaySinh
                          ? new Date(selectedPatient.NgaySinh).toLocaleDateString('vi-VN')
                          : ''
                      }
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
                      value={
                        selectedPatient.gender === "male" || selectedPatient.GioiTinh === "Nam"
                          ? "Nam"
                          : selectedPatient.gender === "female" || selectedPatient.GioiTinh === "Nữ"
                            ? "Nữ"
                            : "Khác"
                      }
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
                      value={selectedPatient.phone || selectedPatient.SDT}
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
                      value={selectedPatient.department || selectedPatient.Khoa || "Chưa phân khoa"}
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
                      value={selectedPatient.insuranceType || selectedPatient.DoiTuongUuTien || "Không có"}
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
                      value={selectedPatient.address || selectedPatient.DiaChi}
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
                        value={selectedPatient.insuranceNumber || selectedPatient.BHYT || "Không có"}
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
                        <option key={doctor.idNguoiDung} value={doctor.idNguoiDung}>
                          BS. {doctor.HoTen} 
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
              className="px-6 py-3 btn-primary text-white rounded-xl font-medium  transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
  const { user } = useAuth();
  const { data: recordDetails } = useTransferRecord(record?.idChuyenVien || "");

  const [formData, setFormData] = useState({
    idYeuCauChuyenVien: "",
    NgayChuyen: new Date().toISOString().split('T')[0],
    ThoiGianDuKien: "",
    SDT_CoSoYTe: "",
    YThuc: "",
    GhiChu: "",
    idNguoiDung: user?.idNguoiDung || "",
    TrangThai: " "
  });

  useEffect(() => {
    const data = recordDetails || record;
    if (!data) return;
    setFormData({
      idYeuCauChuyenVien: data.idYeuCauChuyenVien || data.requestId || "",
      NgayChuyen: data.transferDate || new Date().toISOString().split('T')[0],
      ThoiGianDuKien: data.ThoiGianDuKien || data.estimatedTime || "",
      SDT_CoSoYTe: data.SDT_CoSoYTe || data.destinationPhone || "",
      YThuc: data.YThuc || data.consciousness || "",
      GhiChu: data.GhiChu || data.notes || "",
      idNguoiDung: user?.idNguoiDung || data.idNguoiDung || data.userId || "",
      TrangThai: data.status || " "
    });
  }, [recordDetails, record, user]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Tìm yêu cầu chuyển viện được chọn để hiển thị thông tin bệnh nhân
  const selectedRequest = requests?.find(
    (req: any) => req.idYeuCauChuyenVien === formData.idYeuCauChuyenVien
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form data being submitted:', formData);
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
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record ? "Sửa Phiếu Chuyển Viện" : "Tạo Phiếu Chuyển Viện"}
                </h3>
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
          {/* Chọn yêu cầu chuyển viện */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              Thông tin yêu cầu chuyển viện
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yêu cầu chuyển viện *
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.idYeuCauChuyenVien}
                    onChange={(e) => setFormData({ ...formData, idYeuCauChuyenVien: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn yêu cầu chuyển viện</option>
                    {requests?.map((request: any) => (
                      <option
                        key={request.idYeuCauChuyenVien}
                        value={request.idYeuCauChuyenVien}
                      >
                        {request.idYeuCauChuyenVien} - {request.LyDoChuyenVien || 'Yêu cầu chuyển viện'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhân viên xử lý *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.idNguoiDung}
                    onChange={(e) => setFormData({ ...formData, idNguoiDung: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn nhân viên</option>
                    {staff?.map((member: any) => (
                      <option
                        key={member.idNguoiDung || member._id}
                        value={member.idNguoiDung || member._id}
                      >
                        {member.HoTen || `${member.firstName || ''} ${member.lastName || ''}`}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Hiển thị thông tin yêu cầu chuyển viện được chọn */}
            {selectedRequest && (
              <div className="bg-blue-50 rounded-xl p-6 mt-6">
                <h5 className="text-md font-medium text-gray-900 mb-4">Thông tin yêu cầu</h5>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bệnh nhân
                    </label>
                    <p className="text-sm text-gray-900">{selectedRequest.patientName || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do chuyển viện
                    </label>
                    <p className="text-sm text-gray-900">{selectedRequest.reason || 'Không có thông tin'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cơ sở chuyển đến
                    </label>
                    <p className="text-sm text-gray-900">{selectedRequest.destinationFacility || 'Không có thông tin'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Thông tin chuyển viện */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              Thông tin chuyển viện
            </h4>
            
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
                value={
                  formData.NgayChuyen
                  ? new Date(formData.NgayChuyen).toISOString().split("T")[0]
                  : ""
                }
                onChange={(e) => setFormData({ ...formData, NgayChuyen: e.target.value })}
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
                  value={
                    formData.ThoiGianDuKien
                      ? new Date(formData.ThoiGianDuKien).toISOString().substr(11, 5)
                      : ""
                  }
                  onChange={(e) => setFormData({ ...formData, ThoiGianDuKien: `1970-01-01T${e.target.value}:00.000Z` })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
              </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SĐT cơ sở y tế
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.SDT_CoSoYTe}
                    onChange={(e) => setFormData({ ...formData, SDT_CoSoYTe: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="Số điện thoại liên hệ"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin lâm sàng */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              Thông tin lâm sàng
            </h4>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ý thức bệnh nhân
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.YThuc}
                    onChange={(e) => setFormData({ ...formData, YThuc: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                    placeholder="VD: Tỉnh táo, Lơ mơ, Hôn mê"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={formData.GhiChu}
                  onChange={(e) => setFormData({ ...formData, GhiChu: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows={3}
                  placeholder="Thông tin bổ sung khác"
                />
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              Trạng thái phiếu
            </h4>
            
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái hiện tại
                  </label>
                  <input
                    type="text"
                    value={formData.TrangThai || "Mới tạo"}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ngày tạo
                  </label>
                  <input
                    type="text"
                    value={record?.NgayTao || new Date().toLocaleDateString('vi-VN')}
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
              className="px-6 py-3  text-white rounded-xl font-medium btn-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {record ? "Cập nhật" : "Tạo"} Phiếu
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}