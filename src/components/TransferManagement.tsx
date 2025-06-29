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
  ShieldCheck,
  AlertCircle, FileCheck, Lock,
  Users,
  Printer

} from "lucide-react";

import { VitalSignsDisplay } from './VitalSignsDisplay';
import { ClinicalInformationDisplay } from './ClinicalInformationDisplay';
import { AccompanyingDocuments } from './AccompanyingDocuments';

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
  const { user } = useAuth();

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
  // ✅ THÊM VÀO ĐẦU FILE - SAU IMPORT



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
                className={`flex items-center p-4 rounded-xl transition-all ${activeTab === tab.id
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
const parseError = (error: any): { title: string, message: string } => {
  console.log('🔍 Full error structure:', error);

  let title = 'Lỗi hệ thống';
  let message = 'Có lỗi xảy ra';

  // ✅ XỬ LÝ CÁC LOẠI ERROR KHÁC NHAU
  if (error?.code === 'P2010' && error?.meta?.message) {
    // Prisma constraint error
    title = 'Không thể thực hiện';
    message = error.meta.message;
  } else if (error?.meta?.message) {
    // Database/Business logic error
    title = 'Không thể thực hiện';
    message = error.meta.message;
  } else if (error?.response?.data?.message) {
    // Axios HTTP error
    title = 'Lỗi từ server';
    message = error.response.data.message;
  } else if (error?.data?.message) {
    // API response error
    title = 'Lỗi dữ liệu';
    message = error.data.message;
  } else if (error?.data?.error) {
    // Alternative error field
    title = 'Lỗi dữ liệu';
    message = error.data.error;
  } else if (error?.message) {
    // Generic error message
    title = 'Lỗi hệ thống';
    message = error.message;
  }

  return { title, message };
};

function ErrorPopup({ errorPopup, setErrorPopup, onClose }: any) {
  if (!errorPopup || !errorPopup.show) return null;

  const handleClose = () => {
    // ✅ CLEAR ERROR STATE
    if (setErrorPopup) {
      setErrorPopup({ show: false, message: '', title: '' });
    }

    // ✅ GỌI CALLBACK ĐỂ ĐÓNG FORM (NẾU CÓ)
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {errorPopup.title || 'Lỗi'}
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed">
            {errorPopup.message || 'Có lỗi xảy ra'}
          </p>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
interface PrintPreviewModalProps {
  data: any;
  type: 'request' | 'record';
  onClose: () => void;
  onPrint: () => void;
}

function PrintPreviewModal({ data, type, onClose, onPrint }: PrintPreviewModalProps) {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();

  // ✅ ĐỊNH NGHĨA calculateAge TRƯỚC KHI SỬ DỤNG
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ✅ BÂY GIỜ MỚI SỬ DỤNG calculateAge
  const patientInfo = {
    name: data?.patientName || "Chưa có thông tin",
    age: data?.dateOfBirth ? calculateAge(data.dateOfBirth) : "Chưa có thông tin",
    gender: data?.gender || "Chưa có thông tin",
    insurance: data?.insuranceNumber || "Chưa có thông tin",
    idNumber: data?.idNumber || "Chưa có thông tin",
    phone: data?.phone || "Chưa có thông tin",
    address: data?.address || "Chưa có thông tin"
  };

  const transferInfo = {
    reason: data?.reason || "Chưa có thông tin",
    destination: data?.destinationFacility || "Chưa có thông tin",
    address: data?.destinationAddress || "Chưa có thông tin",
    transferDate: data?.transferDate || "Chưa có thông tin",
    doctor: data?.doctorName || "Chưa có thông tin",
    notes: data?.notes || "Chưa có thông tin",
    priority: data?.priority || "Chưa có thông tin"
  };

  const approvalInfo = {
    createdBy: data?.createdByName || "Chưa có thông tin",
    approvedBy: data?.approverName || "Chưa có thông tin",
    approvalDate: data?.approvalDate || "Chưa có thông tin",
    approvalNotes: data?.approvalNotes || ""
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Rest of your JSX remains the same */}
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Printer className="w-6 h-6 text-purple-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Xem trước biểu mẫu {type === "request" ? "Yêu cầu" : "Hồ sơ"} chuyển viện
                </h3>
                <p className="text-sm text-gray-600">
                  Kiểm tra thông tin trước khi in
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={onPrint}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                In biểu mẫu
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Print Content */}
        <div id="print-content" className="p-8 bg-white">
          {/* Header Form */}
          <div className="text-center mb-8">
            <div className="flex justify-between items-start mb-4">
              <div className="text-left">
                <p className="text-sm font-medium">BỘ Y TẾ</p>
                <p className="text-sm font-bold">BỆNH VIỆN ĐA KHOA TỈNH</p>
                <p className="text-sm">KHOA: {patientInfo.name ? "NỘI KHOA" : "___________"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">Số: {data?.requestCode || "___________"}</p>
                <p className="text-sm">
                  Ngày {day} tháng {month} năm {year}
                </p>
              </div>
            </div>

            <h1 className="text-xl font-bold uppercase mb-2">
              {type === "request" ? "PHIẾU YÊU CẦU CHUYỂN VIỆN" : "HỒ SƠ CHUYỂN VIỆN"}
            </h1>
            <p className="text-sm italic">(Ban hành kèm theo Thông tư số 56/2017/TT-BYT ngày 25/12/2017 của Bộ Y tế)</p>
          </div>

          {/* Patient Information */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-3 uppercase">I. THÔNG TIN BỆNH NHÂN</h3>
            <div className="text-sm space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-32">Họ và tên:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {patientInfo.name}
                </span>
                <span className="font-medium ml-8 w-16">Tuổi:</span>
                <span className="border-b border-dotted border-gray-400 w-20 px-2 pb-1">
                  {patientInfo.age}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-32">Giới tính:</span>
                <span className="border-b border-dotted border-gray-400 w-32 px-2 pb-1">
                  {patientInfo.gender}
                </span>
                <span className="font-medium ml-8 w-32">Số CMND/CCCD:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {patientInfo.idNumber}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-32">Số điện thoại:</span>
                <span className="border-b border-dotted border-gray-400 w-40 px-2 pb-1">
                  {patientInfo.phone}
                </span>
                <span className="font-medium ml-8 w-24">Số thẻ BHYT:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {patientInfo.insurance}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-32">Địa chỉ:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {patientInfo.address}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-32">Mức hưởng BHYT:</span>
                <span className="border-b border-dotted border-gray-400 w-20 px-2 pb-1">
                  {data?.mucHuong || "___"}
                </span>
                <span className="ml-1">%</span>
              </div>
            </div>
          </div>

          {/* Transfer Information */}
          <div className="mb-6">
            <h3 className="font-bold text-sm mb-3 uppercase">II. THÔNG TIN CHUYỂN VIỆN</h3>
            <div className="text-sm space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-40">Lý do chuyển viện:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {transferInfo.reason}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-40">Cơ sở y tế chuyển đến:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {transferInfo.destination}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-40">Địa chỉ cơ sở y tế:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {transferInfo.address}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-40">Ngày chuyển:</span>
                <span className="border-b border-dotted border-gray-400 w-40 px-2 pb-1">
                  {transferInfo.transferDate}
                </span>
                <span className="font-medium ml-8 w-32">Mức độ ưu tiên:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {transferInfo.priority}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-40">Bác sĩ phụ trách:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {transferInfo.doctor}
                </span>
              </div>

              {transferInfo.notes && transferInfo.notes !== "Chưa có thông tin" && (
                <div className="flex items-start">
                  <span className="font-medium w-40">Ghi chú:</span>
                  <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1 min-h-[24px]">
                    {transferInfo.notes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Approval Information */}
          <div className="mb-8">
            <h3 className="font-bold text-sm mb-3 uppercase">III. THÔNG TIN PHÊ DUYỆT</h3>
            <div className="text-sm space-y-3">
              <div className="flex items-center">
                <span className="font-medium w-32">Người tạo phiếu:</span>
                <span className="border-b border-dotted border-gray-400 w-48 px-2 pb-1">
                  {approvalInfo.createdBy}
                </span>
                <span className="font-medium ml-8 w-32">Ngày tạo:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {data?.requestDate || "___________"}
                </span>
              </div>

              <div className="flex items-center">
                <span className="font-medium w-32">Người phê duyệt:</span>
                <span className="border-b border-dotted border-gray-400 w-48 px-2 pb-1">
                  {approvalInfo.approvedBy}
                </span>
                <span className="font-medium ml-8 w-32">Ngày phê duyệt:</span>
                <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1">
                  {approvalInfo.approvalDate}
                </span>
              </div>

              {approvalInfo.approvalNotes && approvalInfo.approvalNotes !== "Chưa có thông tin" && (
                <div className="flex items-start">
                  <span className="font-medium w-32">Ý kiến phê duyệt:</span>
                  <span className="border-b border-dotted border-gray-400 flex-1 px-2 pb-1 min-h-[48px]">
                    {approvalInfo.approvalNotes}
                  </span>
                </div>
              )}
            </div>
          </div>


          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12">
            <div className="text-center">
              <p className="font-bold text-sm mb-16">NGƯỜI LẬP PHIẾU</p>
              <p className="text-sm">{approvalInfo.createdBy}</p>
            </div>
            <div className="text-center">
              <p className="font-bold text-sm mb-16">NGƯỜI PHÊ DUYỆT</p>
              <p className="text-sm">{approvalInfo.approvedBy}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


function TransferRequests() {
  const [showForm, setShowForm] = useState(false);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
<<<<<<< HEAD
  const { user } = useAuth();
=======
  const {user} = useAuth();
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

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
<<<<<<< HEAD

=======
   
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
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

    // ✅ BỎ TRY-CATCH - ĐỂ ERROR THROW LÊN FORM
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

  const handleDeleteClick = (request: any) => {
    setRequestToDelete(request);
    setShowDeleteModal(true);
  };
<<<<<<< HEAD
  // ✅ THAY THẾ HÀM NÀY
  const [errorPopup, setErrorPopup] = useState({
    show: false,
    message: '',
    title: ''
  });

  // ✅ Trong TransferRequests component
  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;

    setDeleteLoading(true);
    try {
      await deleteRequest({ id: requestToDelete.requestCode });

      // ✅ SUCCESS: CLEAR STATE VÀ REFETCH
      toast.success("Xóa yêu cầu chuyển viện thành công");

      // ✅ CLEAR STATE NGAY LẬP TỨC
      setRequestToDelete(null);
      setShowDeleteModal(false);

      // ✅ REFETCH DATA
      await refetch();

    } catch (error: any) {
      console.log('🔍 Delete error:', error);

      // ✅ SỬA: Dùng parseError function
      const { title, message } = parseError(error);

      // ✅ HIỆN ERROR POPUP
      setErrorPopup({
        show: true,
        title,
        message
      });

      // ✅ CLEAR DELETE STATE NGAY CẢ KHI LỖI
      setRequestToDelete(null);
      setShowDeleteModal(false);

    } finally {
      // ✅ LUÔN CLEAR LOADING
=======

  const handleConfirmDelete = async () => {
    if (!requestToDelete) return;
    
    setDeleteLoading(true);
    try {
      await deleteRequest({ id: requestToDelete.requestCode });
      toast.success("Xóa yêu cầu chuyển viện thành công");
      refetch();
      setShowDeleteModal(false);
      setRequestToDelete(null);
    } catch (error) {
      toast.error("Xóa yêu cầu chuyển viện thất bại");
    } finally {
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
      setDeleteLoading(false);
    }
  };

<<<<<<< HEAD



=======
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  const handleEdit = (request: any) => {
    console.log("Editing request:", request);
    setEditingRequest(request);
    setShowForm(true);
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Khẩn cấp": return "bg-red-100 text-red-800 border-red-200";
      case "Thường": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityName = (priority: string) => {
    switch (priority) {
      case "Khẩn cấp": return "Khẩn cấp";
      case "Thường": return "Thường";
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
      // case "completed": return "Hoàn thành";
      case "approved": return "Đã duyệt";
      case "pending": return "Chờ xử lý";
      case "rejected": return "Từ chối";
      default: return status;
    }
  };
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printData, setPrintData] = useState(null);

  // ✅ ĐỔI TÊN THÀNH handlePrintRequest
  const handlePrintRequest = (request: any) => {
    setPrintData(request);
    setShowPrintModal(true);
  };
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    Ngày lập yêu cầu
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
                          <span className={`inline-flex items-center px-2 py-1 whitespace-nowrap w-fit rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
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
                            {/* <option value="Hoàn thành">Hoàn thành</option> */}
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
                          onClick={() => handleDeleteClick(request)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrintRequest(request)} // hoặc handlePrint(record)
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="In biểu mẫu"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* ✅ Print Modal cho Requests */}
            {showPrintModal && printData && (
              <PrintPreviewModal
                data={printData}
                type="request"
                onClose={() => {
                  setShowPrintModal(false);
                  setPrintData(null);
                }}
                onPrint={() => {
                  window.print();
                }}
              />
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && requestToDelete && (
        <DeleteConfirmationModal
          title="Bạn có chắc chắn muốn xóa dữ liệu này không?"
          message={
            <div className="space-y-2">
              <p>Bạn đang xóa yêu cầu chuyển viện:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><strong>Mã yêu cầu:</strong> {requestToDelete.requestCode}</p>
                <p><strong>Bệnh nhân:</strong> {requestToDelete.patientName}</p>
<<<<<<< HEAD
                <p><strong>Ngày lập yêu cầu:</strong> {new Date(requestToDelete.treatmentDate).toLocaleDateString('vi-VN')}</p>
=======
                <p><strong>Ngày điều trị:</strong> {new Date(requestToDelete.treatmentDate).toLocaleDateString('vi-VN')}</p>
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
              </div>
              <p className="text-red-600 font-medium">Hành động này không thể hoàn tác!</p>
            </div>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={deleteLoading}
        />
      )}
<<<<<<< HEAD
=======
      );
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53

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
      <ErrorPopup
        errorPopup={errorPopup}
        setErrorPopup={setErrorPopup}
      // ✅ BỎ onClose - chỉ đóng popup
      />
    </div>
<<<<<<< HEAD

=======
  
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
  );
}


function TransferRecords() {
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [startDate, setStartDate] = useState("2020-01-01");
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });

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

    // ✅ THROW ERROR ĐỂ FORM COMPONENT XỬ LÝ
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

  const handleDeleteClick = (record: any) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

<<<<<<< HEAD
  // ✅ THÊM STATE VÀ SỬA HÀM TƯƠNG TỰ
  const [errorPopup, setErrorPopup] = useState({
    show: false,
    message: '',
    title: ''
  });

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;

=======
  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
    setDeleteLoading(true);
    try {
      await deleteRecord({ id: recordToDelete.transferCode });
      toast.success("Xóa hồ sơ chuyển viện thành công");
      refetch();
      setShowDeleteModal(false);
      setRecordToDelete(null);
<<<<<<< HEAD
    } catch (error: any) {
      console.error('Delete error:', error);

      // ✅ SỬA: Dùng parseError function
      const { title, message } = parseError(error);

      setErrorPopup({
        show: true,
        title,
        message
      });

      // ✅ CLEAR DELETE STATE NGAY CẢ KHI LỖI
      setRecordToDelete(null);
      setShowDeleteModal(false);
=======
    } catch (error) {
      toast.error("Xóa hồ sơ chuyển viện thất bại");
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRecordToDelete(null);
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
  // ✅ THÊM VÀO COMPONENT TransferRequests



  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
                    Ngày lập yêu cầu
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
                          onClick={() => handleDeleteClick(record)}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && recordToDelete && (
        <DeleteConfirmationModal
          title="Bạn có chắc chắn muốn xóa dữ liệu này không?"
          message={
            <div className="space-y-2">
              <p>Bạn đang xóa hồ sơ chuyển viện:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <p><strong>Mã chuyển viện:</strong> {recordToDelete.transferCode}</p>
                <p><strong>Bệnh nhân:</strong> {recordToDelete.patientName}</p>
<<<<<<< HEAD
                <p><strong>Ngày lập yêu cầu:</strong> {new Date(recordToDelete.treatmentDate).toLocaleDateString('vi-VN')}</p>
=======
                <p><strong>Ngày điều trị:</strong> {new Date(recordToDelete.treatmentDate).toLocaleDateString('vi-VN')}</p>
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
              </div>
              <p className="text-red-600 font-medium">Hành động này không thể hoàn tác!</p>
            </div>
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={deleteLoading}
        />
      )}

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
      <ErrorPopup
        errorPopup={errorPopup}
        setErrorPopup={setErrorPopup}
      // ✅ BỎ onClose - chỉ đóng popup
      />
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ title, message, onConfirm, onCancel, isLoading }: {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
            {title}
          </h3>

          {/* Message */}
          <div className="text-gray-600 text-center mb-6">
            {message}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ title, message, onConfirm, onCancel, isLoading }: {
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          {/* Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
            {title}
          </h3>
          
          {/* Message */}
          <div className="text-gray-600 text-center mb-6">
            {message}
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TransferRequestForm({ request, patients, staff, onSubmit, onCancel }: any) {
  console.log('Request data received in form:', request);
<<<<<<< HEAD
  const { user } = useAuth()
=======
  const {user} = useAuth()
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
  const [formData, setFormData] = useState({
    patientId: request?.patientId || "",
    staffId: request?.doctorId || "",
    requestDate: request?.requestDate
      ? new Date(request.requestDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    transferDate: request?.transferDate
      ? new Date(request.transferDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    reason: request?.reason || "",
    treatmentDate: request?.treatmentDate || request?.requestDate
      ? new Date(request.treatmentDate || request.requestDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    destinationAddress: request?.destinationAddress || "",
    destinationFacility: request?.destinationFacility || "",
    priority: request?.priority || "Thường",
    notes: request?.notes || "",
    status: request?.status || "",
    approvalDate: request?.approvalDate
      ? new Date(request.approvalDate).toISOString().split("T")[0]
      : "",
  });
<<<<<<< HEAD
  console.log(formData.staffId)
=======
  console.log( formData.staffId)
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53

  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedPatient = patients.find(
    (p: any) => p.idBenhNhan === formData.patientId || p._id === formData.patientId
  );
<<<<<<< HEAD
  const selectedDoctor = staff.find(
=======
    const selectedDoctor = staff.find(
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
    (doctor: any) => doctor?.idNguoiDung === formData.staffId || doctor?._id === formData.staffId
  );


<<<<<<< HEAD
  const [errorPopup, setErrorPopup] = useState({
    show: false,
    message: '',
    title: ''
  });
  const [error, setError] = useState<string>('');

  const handleCloseError = () => {
    setErrorPopup({
      show: false,
      title: '',
      message: ''
    });
    onCancel(); // ✅ ĐÓNG FORM KHI ĐÓNG ERROR
  };
=======
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      const { title, message } = parseError(error);

      setErrorPopup({
        show: true,
        title,
        message
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // const priorityOptions = [
  //   { value: "low", label: "Thường", color: "text-green-600" },
  //   { value: "urgent", label: "Khẩn cấp", color: "text-red-600" },
  // ];
  const priorityOptions = [
    {
      value: "Thường",
      label: "Thường",
      color: "text-green-600",
      bgColor: "border-green-500 bg-green-50",
      hoverColor: "hover:bg-green-50"
    },
    {
      value: "Khẩn cấp",
      label: "Khẩn cấp",
      color: "text-red-600",
      bgColor: "border-red-500 bg-red-50",
      hoverColor: "hover:bg-red-50"
    },
  ];


  // ✅ THÊM HÀM NÀY VÀO COMPONENT TransferRequests

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
                    Ngày lập yêu cầu
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
                      value={formData.transferDate}
                      onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })}
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
                        className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${formData.priority === priority.value
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
                    value={formData?.status || "Chưa phê duyệt"}
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
                    value={formData?.approvalDate
                      ? new Date(formData.approvalDate).toLocaleDateString('vi-VN')
                      : "Chưa phê duyệt"}
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
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {request ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {request ? "Cập nhật" : "Tạo yêu cầu"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {/* ✅ CHỈ RENDER KHI CÓ ERROR */}
      {/* ✅ SỬA: Truyền thêm onClose */}
      {errorPopup.show && (
        <ErrorPopup
          errorPopup={errorPopup}
          setErrorPopup={setErrorPopup}
          onClose={onCancel} // ✅ THÊM DÒNG NÀY
        />
      )}


    </div>
  );
}

function TransferRecordForm({ record, patients, staff, requests, onSubmit, onCancel }: any) {
<<<<<<< HEAD
  const { user } = useAuth();
  const [formData, setFormData] = useState(() => {
    if (record) {
      console.log('🔍 Processing transfer record:', record);

      // ✅ Tìm request theo requesttransferCode
      const matchingRequest = requests?.find((req: any) => {
        const requestCode = req.requestCode || req.MaYeuCau || req.transferCode;
        const recordRequestCode = record.requesttransferCode?.trim();

        console.log('🔍 Comparing codes:', {
          requestCode: requestCode?.trim(),
          recordRequestCode: recordRequestCode,
          match: requestCode?.trim() === recordRequestCode
        });

        return requestCode?.trim() === recordRequestCode;

      });

      // ✅ Fallback: tìm theo patient nếu không match được code
      const fallbackRequest = !matchingRequest ? requests?.find((req: any) => {
        return req.patientId?.trim() === record.patientId?.trim() ||
          req.patientName === record.patientName;
      }) : null;

      const finalRequest = matchingRequest || fallbackRequest;

      console.log('🔍 Found request:', {
        byCode: matchingRequest ? 'Yes' : 'No',
        byPatient: fallbackRequest ? 'Yes' : 'No',
        finalRequest: finalRequest
      });

      const requestId = finalRequest?.idYeuCauChuyenVien ||
        finalRequest?._id ||
        finalRequest?.id ||
        "";

      return {
        idYeuCauChuyenVien: requestId,
        NgayChuyen: record.transferDate
          ? new Date(record.transferDate).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        ThoiGianDuKien: record.estimatedTime && record.estimatedTime !== "1970-01-01T15:00:00.000Z"
          ? new Date(record.estimatedTime).toTimeString().slice(0, 5)
          : "",
        SDT_CoSoYTe: record.destinationPhone || "",
        YThuc: record.consciousness || "Tỉnh táo",
        GhiChu: record.notes || "",
        Phuongtien: record.transportMethod || record.Phuongtien || "Xe cứu thương",

        idNguoiDung: user?.idNguoiDung || "",
        pulse: record.pulse || 80,
        bloodPressure: record.bloodPressure || "120/80",
        respiratoryRate: record.respiratoryRate || 20,
        temperature: record.temperature || 36.5,

        // ✅ Thêm các field mới cho thông tin lâm sàng
        clinicalProgress: record.clinicalProgress || '',
        treatmentPerformed: record.treatmentPerformed || '',
        companionId: record.companionId || '',
      };
    }

    return {
      idYeuCauChuyenVien: "",
      NgayChuyen: new Date().toISOString().split("T")[0],
      ThoiGianDuKien: "",
      SDT_CoSoYTe: "",
      YThuc: "Tỉnh táo",
      GhiChu: "",
      Phuongtien: "Xe cứu thương",
      idNguoiDung: user?.idNguoiDung || "",
    };
  });
=======
  const {user} = useAuth();
  const [formData, setFormData] = useState({
    idYeuCauChuyenVien: record?.idYeuCauChuyenVien || "",
    NgayChuyen: record?.NgayChuyen
      ? new Date(record.NgayChuyen).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    ThoiGianDuKien: record?.ThoiGianDuKien || "",
    SDT_CoSoYTe: record?.SDT_CoSoYTe || "",
    YThuc: record?.YThuc || "Tỉnh táo",
    GhiChu: record?.GhiChu || "",
    idNguoiDung: user?.idNguoiDung || "",
  });

>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
  const [isSubmitting, setIsSubmitting] = useState(false);
  const selectedRequest = requests.find(
    (r: any) => r.idYeuCauChuyenVien === formData.idYeuCauChuyenVien || r._id === formData.idYeuCauChuyenVien
  );
  // ✅ Debug logs
  console.log('🔍 Debug TransferRecordForm:', {
    record,
    formData,
    requests: requests?.length,
    selectedRequest,
    idYeuCauChuyenVien: formData.idYeuCauChuyenVien
  });
  const [errorPopup, setErrorPopup] = useState({
    show: false,
    message: '',
    title: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error: any) {
      let errorMessage = 'Có lỗi xảy ra khi lưu hồ sơ';
      let errorTitle = 'Lỗi lưu dữ liệu';

      // ✅ XỬ LÝ ERROR ĐƠN GIẢN
      if (error?.meta?.message) {
        errorTitle = 'Không thể sửa';
        errorMessage = error.meta.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setErrorPopup({
        show: true,
        title: errorTitle,
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

<<<<<<< HEAD

=======
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
  const consciousnessOptions = [
    "Tỉnh táo",
    "Lơ mơ",
    "Hôn mê",
    "Kích thích",
    "Khác"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Truck className="w-6 h-6 text-red-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record ? "Sửa Hồ Sơ Chuyển Viện" : "Tạo Hồ Sơ Chuyển Viện"}
                </h3>
                <p className="text-sm text-gray-600">
                  {record ? "Cập nhật thông tin hồ sơ chuyển viện" : "Tạo hồ sơ chuyển viện mới"}
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
          {/* ✅ Hiển thị thông tin Transfer Record hiện tại khi edit */}
          {record && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileCheck className="w-5 h-5 mr-2 text-green-600" />
                Thông tin hồ sơ chuyển viện hiện tại
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  {record.status}
                </span>
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mã chuyển viện</label>
                  <p className="text-sm font-medium text-gray-900 ">{record.transferCode?.trim()}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Mã yêu cầu gốc</label>
                  <p className="text-sm font-medium text-blue-600">{record.requesttransferCode?.trim()}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Bệnh nhân</label>
                  <p className="text-sm font-medium text-gray-900">{record.patientName}</p>
                </div>
              </div>
            </div>
          )}

          {/* ✅ Yêu cầu chuyển viện - Conditional rendering */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Yêu cầu chuyển viện
<<<<<<< HEAD
              {record && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center">
                  <Eye className="w-3 h-3 mr-1" />
                  Chỉ xem
                </span>
              )}
            </h4>

            {/* ✅ Chỉ hiển thị dropdown khi KHÔNG có record (tạo mới) */}
            {!record ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn yêu cầu chuyển viện *
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.idYeuCauChuyenVien}
                    onChange={(e) => setFormData({ ...formData, idYeuCauChuyenVien: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn yêu cầu chuyển viện</option>
                    {requests
                      ?.filter((req: any) => req.status === "Đã duyệt")
                      .map((request: any) => (
                        <option
                          key={request.idYeuCauChuyenVien || request._id}
                          value={request.idYeuCauChuyenVien || request._id}
                        >
                          {request.requestCode} - {request.patientName} ({new Date(request.treatmentDate).toLocaleDateString('vi-VN')})
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              /* ✅ Khi edit: Hiển thị thông tin readonly */
              <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Hash className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {record.requesttransferCode?.trim()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {record.patientName} • {record.destinationFacility}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    Không thể thay đổi
                  </span>
                </div>
                {/* ✅ Hidden input để giữ giá trị */}
                <input type="hidden" name="idYeuCauChuyenVien" value={formData.idYeuCauChuyenVien} />
=======
            </h4>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn yêu cầu chuyển viện *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  required
                  value={formData.idYeuCauChuyenVien}
                  onChange={(e) => setFormData({ ...formData, idYeuCauChuyenVien: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                >
                  <option value="">Chọn yêu cầu chuyển viện</option>
                  {requests
                    .filter((req: any) => req.status === "Đã duyệt")
                    .map((request: any) => (
                    <option
                      key={request.idYeuCauChuyenVien || request._id}
                      value={request.idYeuCauChuyenVien || request._id}
                    >
                      {request.requestCode} - {request.patientName} ({new Date(request.treatmentDate).toLocaleDateString('vi-VN')})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
              </div>
            )}

<<<<<<< HEAD
            {/* ✅ Chỉ hiển thị selected request info khi tạo mới */}
            {!record && selectedRequest && (
=======
            {selectedRequest && (
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
              <div className="mt-6 bg-blue-50 rounded-xl p-6">
                <h5 className="font-medium text-gray-900 mb-4">Thông tin yêu cầu đã chọn</h5>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mã yêu cầu
                    </label>
                    <input
                      type="text"
                      value={selectedRequest.requestCode}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bệnh nhân
                    </label>
                    <input
                      type="text"
                      value={selectedRequest.patientName}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cơ sở chuyển đến
                    </label>
                    <input
                      type="text"
                      value={selectedRequest.destinationFacility}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mức độ ưu tiên
                    </label>
                    <input
                      type="text"
                      value={
                        selectedRequest.priority === "urgent" ? "Khẩn cấp" :
<<<<<<< HEAD
                          selectedRequest.priority === "high" ? "Cao" :
                            selectedRequest.priority === "medium" ? "Trung bình" : "Thường"
=======
                        selectedRequest.priority === "high" ? "Cao" :
                        selectedRequest.priority === "medium" ? "Trung bình" : "Thấp"
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
                      }
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lý do chuyển viện
                  </label>
                  <textarea
                    value={selectedRequest.reason}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
          {/* ✅ Chỉ số sinh tồn - READ ONLY */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Chỉ số sinh tồn
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Chỉ xem
              </span>
            </h4>

            <div className="bg-[#F9FAFB] rounded-xl p-6 border border-red-100">
              <VitalSignsDisplay
                pulse={record?.pulse || selectedRequest?.pulse || 80}
                bloodPressure={record?.bloodPressure || selectedRequest?.bloodPressure || "120/80"}
                respiratoryRate={record?.respiratoryRate || selectedRequest?.respiratoryRate || 20}
                temperature={record?.temperature || selectedRequest?.temperature || 36.5}
              />
            </div>
          </div>

          {/* ✅ Thông tin lâm sàng - READ ONLY */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
              Thông tin lâm sàng
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Chỉ xem
              </span>
            </h4>

            <div className="bg-[#F9FAFB] to-emerald-50 rounded-xl p-6 border border-green-100">
              <ClinicalInformationDisplay
                clinicalProgress={record?.clinicalProgress || selectedRequest?.clinicalProgress}
                treatmentPerformed={record?.treatmentPerformed || selectedRequest?.treatmentPerformed}
                companionId={record?.companionId || selectedRequest?.companionId}
                companionName={record?.companionName || selectedRequest?.companionName}
                notes={record?.notes || selectedRequest?.notes}
              />
            </div>
          </div>
          {/* ✅ Phương tiện vận chuyển - READ ONLY */}
          {/* ✅ SỬA: Phương tiện vận chuyển - Input text đơn giản */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-indigo-600" />
              Phương tiện vận chuyển
            </h4>

            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phương tiện vận chuyển
              </label>
              <div className="relative">
                <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.Phuongtien}
                  onChange={(e) => setFormData({ ...formData, Phuongtien: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="VD: Xe cứu thương, Xe buýt y tế, Trực thăng..."
                />
              </div>

              {/* ✅ Gợi ý nhanh */}
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-xs text-gray-500">Gợi ý:</span>
                {["Xe cứu thương", "Xe buýt y tế"].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setFormData({ ...formData, Phuongtien: suggestion })}
                    className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>


          {/* ✅ Tài liệu kèm theo - READ ONLY */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-amber-600" />
              Tài liệu kèm theo
              {/* <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Từ cơ sở dữ liệu
              </span> */}
            </h4>

            <div className="bg-[#F9FAFB] rounded-xl p-6 border border-amber-100">
              <AccompanyingDocuments
                documents={record?.accompaningDocuments || selectedRequest?.accompaningDocuments || record?.TaiLieuKemTheo}
                readOnly={true}
              />
            </div>
          </div>

          {/* Thông tin chuyển viện */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Thông tin chuyển viện
            </h4>
<<<<<<< HEAD

=======
            
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ngày chuyển viện *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    required
                    value={formData.NgayChuyen}
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
                    value={formData.ThoiGianDuKien}
                    onChange={(e) => setFormData({ ...formData, ThoiGianDuKien: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại cơ sở y tế
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tình trạng ý thức *
                </label>
                <div className="relative">
                  <Monitor className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.YThuc}
                    onChange={(e) => setFormData({ ...formData, YThuc: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                  >
                    {consciousnessOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
<<<<<<< HEAD
            {/* ✅ THÊM: Người đi cùng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Người đi cùng
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={formData.companionId}
                  onChange={(e) => setFormData({ ...formData, companionId: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors appearance-none"
                >
                  <option value="">Chọn người đi cùng</option>
                  {staff?.map((person: any) => (
                    <option key={person.idNguoiDung || person._id} value={person.idNguoiDung || person._id}>
                      {person.HoTen} - {person.ChucVu}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
=======

>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú thêm
              </label>
              <div className="relative">
                <Clipboard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  value={formData.GhiChu}
                  onChange={(e) => setFormData({ ...formData, GhiChu: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                  rows={4}
                  placeholder="Ghi chú thêm về quá trình chuyển viện, tình trạng bệnh nhân..."
                />
              </div>
            </div>
          </div>

          {/* Thông tin người tạo */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-purple-600" />
              Thông tin người tạo
            </h4>
<<<<<<< HEAD

=======
            
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
            <div className="bg-purple-50 rounded-xl p-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Người tạo hồ sơ
                  </label>
                  <input
                    type="text"
                    value={user?.HoTen || ""}
                    readOnly
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chức vụ
                  </label>
                  <input
                    type="text"
                    value={user?.ChucVu || ""}
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
              disabled={isSubmitting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {record ? "Đang cập nhật..." : "Đang tạo..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {record ? "Cập nhật" : "Tạo hồ sơ"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {errorPopup.show && (
        <ErrorPopup
          errorPopup={errorPopup}
          setErrorPopup={setErrorPopup}
          onClose={onCancel} // ✅ THÊM DÒNG NÀY
        />
      )}
    </div>
  );
<<<<<<< HEAD


=======
>>>>>>> 4d2876b80d1de1a66e7fed79b4cad806e1dc9d53
}

