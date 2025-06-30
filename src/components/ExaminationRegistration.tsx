import { useState } from "react";
import { useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import { toast } from "sonner";
import {
  ClipboardList,
  Plus,
  Edit3,
  Trash2,
  X,
  Save,
  Loader2,
  User,
  Search,
  Filter,
  ChevronDown,
  Phone,
  Building2,
  Calendar,
  Clock,
  AlertTriangle,
  FileText,
  Hash,
  MapPin,
  CreditCard,
  ShieldCheck,
  Users,
  Eye,
  UserPlus,
  Stethoscope,
  Activity,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useUpdateAppointmentStatus,
  useDeleteAppointment,
  usePatients,
  useCreatePatient
} from "../hooks/api";

// Data structures
interface ExaminationRecord {
  MaPhieuDangKy: string;
  NgayLap: string;
  LyDoKham: string;
  ThoiGianBatDauTrieuChung?: string;
  PhongKhamSo?: string;
  TienSuBenhLyBanThan?: string;
  TienSuBenhLyGiaDinh?: string;
  ThuocDangSuDung?: string;
  KhamBHYT?: boolean;
  TrangThai?: string;
  idBenhNhan?: string;
  idKhoa?: string;
  BenhNhan?: {
    HoTen: string;
    NgaySinh: string;
    GioiTinh: string;
    SDT: string;
  };
}

interface Patient {
  idBenhNhan: string;
  HoTen: string;
  CCCD: string;
  NgaySinh: string;
  GioiTinh: string;
  NgheNghiep: string;
  DanToc: string;
  SDT: string;
  DiaChi: string;
  HoTenThanNhan: string;
  MoiQuanHe: string;
  SDTThanNhan: string;
  BHYT: string;
  ThoiHanBHYT: string;
  DoiTuongUuTien: string;
}

export default function ExaminationRegistration() {
  const [fromDate, setFromDate] = useState(""); // từ ngày
  const [toDate, setToDate] = useState("");    // đến ngày
  const [advanceSearch, setAdvanceSearch] = useState(""); // ô tìm kiếm nâng cao

  const [showForm, setShowForm] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  
  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<any>(null);
  
  const { user } = useAuth();

  // Get examination records
  const { data: records, loading, error, refetch } = useAppointments({
    TuNgay: fromDate || "2000-01-01", 
    DenNgay: toDate || new Date().toISOString().split('T')[0],
    // Keyword: advanceSearch
  });

  // Get patients for selection
  const { data: patients } = usePatients('');

  const { mutate: createRecord } = useCreateAppointment();
  const { mutate: updateRecord } = useUpdateAppointment();
  const { mutate: updateStatus } = useUpdateAppointmentStatus();
  const { mutate: deleteRecord, loading: deleteLoading } = useDeleteAppointment();
  const { mutate: createPatient } = useCreatePatient();


  const normalizedSearch = removeVietnameseTones(advanceSearch);

  const filteredRecords = records?.filter((record: any) => {
    // normalize các trường để so sánh
    const id = removeVietnameseTones(record.idDKKhambenh || "");
    const ten = removeVietnameseTones(record.TenBenhNhan || "");
    const bhyt = removeVietnameseTones(record.BenhNhan?.BHYT || "");
    const khoa = removeVietnameseTones(record.TenKhoa || "");
    return (
      !normalizedSearch ||
      id.includes(normalizedSearch) ||
      ten.includes(normalizedSearch) ||
      bhyt.includes(normalizedSearch) ||
      khoa.includes(normalizedSearch)
    );
  }) || [];

  function removeVietnameseTones(str = "") {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D")
      .toLowerCase();
  }

  const handleSubmit = async (formData: any) => {
    try {
      // Thêm idNguoiDung vào formData trước khi gửi
      const dataToSubmit = {
        ...formData,
        idNguoiDung: user?.idNguoiDung // Thêm dòng này
      };

      if (editingRecord) {
        await updateRecord({ id: editingRecord.MaPhieuDangKy , ...dataToSubmit });
        toast.success("Cập nhật phiếu đăng ký thành công");
      } else {
        await createRecord(dataToSubmit);
        toast.success("Đăng ký khám bệnh thành công");
      }
      setShowForm(false);
      setEditingRecord(null);
      setSelectedPatient(null);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Đăng ký khám bệnh thất bại");
    }
  };

  const handleDeleteClick = (record: any) => {
  if ((record.TrangThai || "").toLowerCase() === "đã khám xong") {
    toast.error("Không thể xóa phiếu đã khám xong!");
    return;
  }
  setRecordToDelete(record);
  setShowDeleteModal(true);
};


  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    
    try {
      await deleteRecord(recordToDelete.MaPhieuDangKy);
      toast.success("Xóa phiếu đăng ký thành công");
      refetch();
      setShowDeleteModal(false);
      setRecordToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Xóa phiếu đăng ký thất bại");
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setRecordToDelete(null);
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    // Find patient from record's patientId or create from record data
    let patient = patients?.find((p: any) => p.idBenhNhan === record.MaBenhNhan);
    
    // If patient not found in patients list, create from record data
    if (!patient && record.MaBenhNhan) {
      patient = {
        idBenhNhan: record.MaBenhNhan,
        HoTen: record.TenBenhNhan || record.BenhNhan?.HoTen || '',
        CCCD: record.BenhNhan?.CCCD || '',
        NgaySinh: record.BenhNhan?.NgaySinh || '',
        GioiTinh: record.BenhNhan?.GioiTinh || '',
        NgheNghiep: record.BenhNhan?.NgheNghiep || '',
        DanToc: record.BenhNhan?.DanToc || '',
        SDT: record.BenhNhan?.SDT || '',
        DiaChi: record.BenhNhan?.DiaChi || '',
        HoTenThanNhan: record.BenhNhan?.HoTenThanNhan || '',
        MoiQuanHe: record.BenhNhan?.MoiQuanHe || '',
        SDTThanNhan: record.BenhNhan?.SDTThanNhan || '',
        BHYT: record.BenhNhan?.BHYT || '',
        ThoiHanBHYT: record.BenhNhan?.ThoiHanBHYT || '',
        DoiTuongUuTien: record.BenhNhan?.DoiTuongUuTien || 'Bình thường'
      };
    }
    
    setSelectedPatient(patient || null);
    setShowForm(true);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientList(false);
  };

  const handleNewRecord = () => {
    setEditingRecord(null);
    setSelectedPatient(null);
    setShowForm(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "khẩn cấp": return "bg-red-100 text-red-800 border-red-200";
      case "ưu tiên": return "bg-orange-100 text-orange-800 border-orange-200";
      case "bình thường": return "bg-green-100 text-green-800 border-green-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "đã hoàn thành": return "bg-green-100 text-green-800";
      case "đang chờ": return "bg-yellow-100 text-yellow-800";
      case "đã hủy": return "bg-red-100 text-red-800";
      default: return "bg-blue-100 text-blue-800";
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
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Đăng Ký Khám Bệnh</h2>
          </div>
        </div>
        <button
          onClick={handleNewRecord}
          className="inline-flex items-center px-4 py-3 btn-primary text-white font-medium rounded-xl  transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
          Đăng Ký Khám Bệnh
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex gap-2 items-center">
            <span className="text-gray-600">Từ ngày</span>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
            <span className="text-gray-600 ml-2">Đến ngày</span>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="border border-gray-300 rounded-xl px-3 py-2"
            />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã BHYT, khoa phòng..."
              value={advanceSearch}
              onChange={e => setAdvanceSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {filteredRecords && (
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <ClipboardList className="w-4 h-4 mr-1" />
            Tìm thấy {filteredRecords.length} phiếu đăng ký
          </div>
        )}
      </div>

      {/* Records List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy phiếu đăng ký</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? "Không có phiếu đăng ký nào phù hợp với từ khóa tìm kiếm" : "Chưa có phiếu đăng ký khám bệnh nào"}
            </p>
            <button
              onClick={handleNewRecord}
              className="inline-flex items-center px-4 py-2 btn-primary text-white rounded-lg  transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Đăng ký khám bệnh đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mã phiếu
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bệnh Nhân
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày lập
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
                {filteredRecords.map((record: any) => (
                  <tr key={record.idDKKhambenh} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <Hash className="w-4 h-4 mr-1 text-gray-400" />
                            {record.MaPhieuDangKy}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.TenBenhNhan || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500 flex items-center mt-1">
                          {record.NgayLap ? new Date(record.NgayLap).toLocaleString('vi-VN') : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center">
                        {record.TenKhoa || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {record.LyDoKham || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.TrangThai || 'Đang chờ')}`}>
                        {record.TrangThai || 'Đang chờ'}
                      </span>
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

      {/* Registration Form Modal */}
      {showForm && (
        <RegistrationForm
          record={editingRecord}
          selectedPatient={selectedPatient}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
            setSelectedPatient(null);
          }}
          onSelectPatient={() => setShowPatientList(true)}
          onChangePatient={() => {
            setSelectedPatient(null);
            setShowPatientList(true);
          }}
        />
      )}

      {/* Patient List Modal */}
      {showPatientList && (
        <PatientListModal
          patients={patients || []}
          onSelectPatient={handleSelectPatient}
          onAddNewPatient={() => {
            setShowPatientList(false);
            setShowNewPatientForm(true);
          }}
          onCancel={() => setShowPatientList(false)}
        />
      )}

      {/* New Patient Form Modal */}
      {showNewPatientForm && (
        <NewPatientForm
          onSubmit={async (patient: Patient) => {
            try {
              const newPatient = await createPatient(patient);
              setSelectedPatient(newPatient);
              setShowNewPatientForm(false);
              toast.success("Thêm bệnh nhân mới thành công");
            } catch (error: any) {
              toast.error(error.message || "Thêm bệnh nhân thất bại");
            }
          }}
          onCancel={() => setShowNewPatientForm(false)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteConfirmationModal
          record={recordToDelete}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={deleteLoading}
        />
      )}
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ record, onConfirm, onCancel, isLoading }: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6 text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Bạn có chắc chắn muốn xóa dữ liệu này không?
          </h3>
          
          {/* Record Info */}
          {record && (
            <div className="text-sm text-gray-600 mb-6">
              <p className="mb-1">
                <strong>Mã phiếu:</strong> {record.MaPhieuDangKy}
              </p>
              <p className="mb-1">
                <strong>Bệnh nhân:</strong> {record.TenBenhNhan || 'N/A'}
              </p>
              <p>
                <strong>Ngày lập:</strong> {record.NgayLap ? new Date(record.NgayLap).toLocaleDateString('vi-VN') : 'N/A'}
              </p>
            </div>
          )}
          
          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                'Xóa'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function toSQLDateTime(datetimeLocal) {
  // input: '2025-06-12T10:57'
  if (!datetimeLocal) return ''; // Trả về chuỗi rỗng thay vì null
  return datetimeLocal.replace('T', ' ') + ':00';
}

// Giữ nguyên các component khác (RegistrationForm, PatientInfoDisplay, PatientListModal, NewPatientForm)
function RegistrationForm({ record, selectedPatient, onSubmit, onCancel, onSelectPatient, onChangePatient }: any) {
  const [formData, setFormData] = useState({
    LyDoKham: "",
    ThoiGianBatDauTrieuChung: "",
    PhongKhamSo: "",
    TienSuBenhLyBanThan: "",
    TienSuBenhLyGiaDinh: "",
    ThuocDangSuDung: "",
    KhamBHYT: false,
    idKhoa: ""
  });

  // Danh sách khoa với idKhoa và tên khoa
  const departments = [
    { idKhoa: "K0001", tenKhoa: "Khoa Nội tổng hợp" },
    { idKhoa: "K0002", tenKhoa: "Khoa Cấp cứu" },
    { idKhoa: "K0003", tenKhoa: "Khoa Xét nghiệm" },
    { idKhoa: "K0004", tenKhoa: "Khoa Chẩn đoán Hình ảnh" },
    { idKhoa: "K0005", tenKhoa: "Khoa Y học cổ truyền" },
  ];

  useEffect(() => {
    setFormData({
      LyDoKham: record?.LyDoKham || "",
      ThoiGianBatDauTrieuChung: record?.ThoiGianBatDauTrieuChung
        ? new Date(record.ThoiGianBatDauTrieuChung).toISOString().slice(0, 16)
        : "",
      PhongKhamSo: record?.PhongKhamSo || "",
      TienSuBenhLyBanThan: record?.TienSuBenhLyBanThan || "",
      TienSuBenhLyGiaDinh: record?.TienSuBenhLyGiaDinh || "",
      ThuocDangSuDung: record?.ThuocDangSuDung || "",
      KhamBHYT: record?.KhamBHYT || false,
      idKhoa: record?.idKhoa?.trim() || ""
    });
  }, [record]);
console.log(record)

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) {
      toast.error("Vui lòng chọn bệnh nhân");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        idBenhNhan: selectedPatient.idBenhNhan,
        ThoiGianBatDauTrieuChung: toSQLDateTime(formData.ThoiGianBatDauTrieuChung),
        TrangThai: "Đang chờ"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {record ? "Sửa Phiếu Đăng Ký" : "Đăng Ký Khám Bệnh Mới"}
                </h3>
                <p className="text-sm text-gray-600">
                  {record ? "Cập nhật thông tin phiếu đăng ký" : "Tạo phiếu đăng ký khám bệnh mới"}
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
          {/* A. Thông tin phiếu */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 " />
              A. Thông tin phiếu
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số phiếu
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={record?.MaPhieuDangKy || "Tự động tạo"}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian đăng ký
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={new Date().toLocaleString('vi-VN')}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian bắt đầu triệu chứng
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="datetime-local"
                    value={formData.ThoiGianBatDauTrieuChung}
                    onChange={(e) => setFormData({ ...formData, ThoiGianBatDauTrieuChung: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chỉ định khoa khám *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    required
                    value={formData.idKhoa}
                    onChange={(e) => setFormData({ ...formData, idKhoa: e.target.value })}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors appearance-none"
                  >
                    <option value="">Chọn khoa khám</option>
                    {departments.map((dept) => (
                      <option key={dept.idKhoa} value={dept.idKhoa}>
                        {dept.tenKhoa}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phòng khám số
                </label>
                <input
                  type="text"
                  value={formData.PhongKhamSo}
                  onChange={(e) => setFormData({ ...formData, PhongKhamSo: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="VD: 101, 205"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khám BHYT
                </label>
                <div className="flex items-center space-x-4 mt-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="KhamBHYT"
                      checked={formData.KhamBHYT === true}
                      onChange={() => setFormData({ ...formData, KhamBHYT: true })}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Có</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="KhamBHYT"
                      checked={formData.KhamBHYT === false}
                      onChange={() => setFormData({ ...formData, KhamBHYT: false })}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Không</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do khám *
              </label>
              <textarea
                required
                value={formData.LyDoKham}
                onChange={(e) => setFormData({ ...formData, LyDoKham: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                rows={3}
                placeholder="Mô tả triệu chứng, lý do khám bệnh..."
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền sử bệnh lý bản thân
                </label>
                <textarea
                  value={formData.TienSuBenhLyBanThan}
                  onChange={(e) => setFormData({ ...formData, TienSuBenhLyBanThan: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả tiền sử bệnh lý..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiền sử bệnh lý gia đình
                </label>
                <textarea
                  value={formData.TienSuBenhLyGiaDinh}
                  onChange={(e) => setFormData({ ...formData, TienSuBenhLyGiaDinh: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows={3}
                  placeholder="Mô tả tiền sử gia đình..."
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thuốc đang sử dụng
              </label>
              <textarea
                value={formData.ThuocDangSuDung}
                onChange={(e) => setFormData({ ...formData, ThuocDangSuDung: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                rows={3}
                placeholder="Liệt kê các loại thuốc đang sử dụng..."
              />
            </div>
          </div>

          {/* B. Thông tin bệnh nhân */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900 flex items-center">
                <User className="w-5 h-5 mr-2 " />
                B. Thông tin bệnh nhân
              </h4>
              {selectedPatient ? (
                <button
                  type="button"
                  onClick={onChangePatient}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thay đổi bệnh nhân
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onSelectPatient}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Chọn bệnh nhân
                </button>
              )}
            </div>

            {selectedPatient ? (
              <PatientInfoDisplay patient={selectedPatient} />
            ) : (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-xl">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Vui lòng chọn bệnh nhân để tiếp tục</p>
              </div>
            )}
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
              disabled={isSubmitting || !selectedPatient}
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
                  {record ? "Cập nhật" : "Đăng ký"} khám bệnh
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PatientInfoDisplay({ patient }: { patient: Patient }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Thông tin hành chính */}
        <div>
          <h5 className="text-md font-medium text-gray-900 mb-4">1. Thông tin hành chính</h5>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mã bệnh nhân</label>
                <div className="text-sm font-medium text-gray-900">{patient.idBenhNhan}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
                <div className="text-sm font-medium text-gray-900">{patient.HoTen}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số CCCD/CMND</label>
                <div className="text-sm font-medium text-gray-900">{patient.CCCD}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Ngày sinh</label>
                <div className="text-sm font-medium text-gray-900">{patient.NgaySinh ? new Date(patient.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Giới tính</label>
                <div className="text-sm font-medium text-gray-900">{patient.GioiTinh}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nghề nghiệp</label>
                <div className="text-sm font-medium text-gray-900">{patient.NgheNghiep}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Dân tộc</label>
                <div className="text-sm font-medium text-gray-900">{patient.DanToc}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Điện thoại</label>
                <div className="text-sm font-medium text-gray-900">{patient.SDT}</div>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
              <div className="text-sm font-medium text-gray-900">{patient.DiaChi}</div>
            </div>
          </div>
        </div>

        {/* 2. Người liên hệ khẩn cấp + 3. Thông tin bảo hiểm */}
        <div className="space-y-6">
          {/* 2. Người liên hệ khẩn cấp */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-4">2. Người liên hệ khẩn cấp</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Họ tên</label>
                <div className="text-sm font-medium text-gray-900">{patient.HoTenThanNhan}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Mối quan hệ</label>
                  <div className="text-sm font-medium text-gray-900">{patient.MoiQuanHe}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Số điện thoại</label>
                  <div className="text-sm font-medium text-gray-900">{patient.SDTThanNhan}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Thông tin bảo hiểm y tế và ưu tiên */}
          <div>
            <h5 className="text-md font-medium text-gray-900 mb-4">3. Thông tin bảo hiểm y tế và ưu tiên</h5>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Số thẻ BHYT/BHXH</label>
                <div className="text-sm font-medium text-gray-900">{patient.BHYT}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Thời hạn thẻ</label>
                  <div className="text-sm font-medium text-gray-900">{patient.ThoiHanBHYT ? new Date(patient.ThoiHanBHYT).toLocaleDateString('vi-VN') : 'N/A'}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Đối tượng ưu tiên</label>
                  <div className="text-sm font-medium text-gray-900">{patient.DoiTuongUuTien}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PatientListModal({ patients, onSelectPatient, onAddNewPatient, onCancel }: any) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPatients = patients.filter((patient: Patient) =>
    patient.HoTen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.idBenhNhan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.SDT?.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-5 h-5 " />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Danh sách bệnh nhân</h3>
                <p className="text-sm text-gray-600">Chọn bệnh nhân để đăng ký khám</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onAddNewPatient}
                className="inline-flex items-center px-4 py-2 text-white rounded-lg btn-primary transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm bệnh nhân mới
              </button>
              <button
                onClick={onCancel}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã bệnh nhân, họ tên, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="overflow-y-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã BN</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giới tính</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số BHYT/BHXH</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điện thoại</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ ưu tiên</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chọn</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient: Patient) => (
                  <tr key={patient.idBenhNhan} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{patient.idBenhNhan}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.HoTen}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.NgaySinh ? new Date(patient.NgaySinh).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.GioiTinh}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.BHYT}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{patient.SDT}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${patient.DoiTuongUuTien === "Ưu tiên" ? "bg-orange-100 text-orange-800" : "bg-green-100 text-green-800"
                        }`}>
                        {patient.DoiTuongUuTien}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onSelectPatient(patient)}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Chọn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewPatientForm({ onSubmit, onCancel }: any) {
  const [formData, setFormData] = useState({
    HoTen: "",
    CCCD: "",
    NgaySinh: "",
    GioiTinh: "Nam",
    NgheNghiep: "",
    DanToc: "Kinh",
    SDT: "",
    DiaChi: "",
    HoTenThanNhan: "",
    MoiQuanHe: "",
    SDTThanNhan: "",
    BHYT: "",
    ThoiHanBHYT: "",
    DoiTuongUuTien: "Bình thường"
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
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                <UserPlus className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Thêm Bệnh Nhân Mới</h3>
                <p className="text-sm text-gray-600">Nhập đầy đủ thông tin bệnh nhân</p>
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
          {/* Thông tin cơ bản */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Thông tin cơ bản
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên *</label>
                <input
                  type="text"
                  required
                  value={formData.HoTen}
                  onChange={(e) => setFormData({ ...formData, HoTen: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số CCCD/CMND *</label>
                <input
                  type="text"
                  required
                  value={formData.CCCD}
                  onChange={(e) => setFormData({ ...formData, CCCD: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh *</label>
                <input
                  type="date"
                  required
                  value={formData.NgaySinh}
                  onChange={(e) => setFormData({ ...formData, NgaySinh: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Giới tính *</label>
                <select
                  value={formData.GioiTinh}
                  onChange={(e) => setFormData({ ...formData, GioiTinh: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nghề nghiệp</label>
                <input
                  type="text"
                  value={formData.NgheNghiep}
                  onChange={(e) => setFormData({ ...formData, NgheNghiep: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dân tộc</label>
                <select
                  value={formData.DanToc}
                  onChange={(e) => setFormData({ ...formData, DanToc: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Kinh">Kinh</option>
                  <option value="Tày">Tày</option>
                  <option value="Thái">Thái</option>
                  <option value="Hoa">Hoa</option>
                  <option value="Khmer">Khmer</option>
                  <option value="Mường">Mường</option>
                  <option value="Nùng">Nùng</option>
                  <option value="Hmông">Hmông</option>
                  <option value="Dao">Dao</option>
                  <option value="Gia Rai">Gia Rai</option>
                  <option value="Ê Đê">Ê Đê</option>
                  <option value="Ba Na">Ba Na</option>
                  <option value="Sán Chay">Sán Chay</option>
                  <option value="Chăm">Chăm</option>
                  <option value="Sán Dìu">Sán Dìu</option>
                  <option value="Hrê">Hrê</option>
                  <option value="Ra Glai">Ra Glai</option>
                  <option value="Mnông">Mnông</option>
                  <option value="Thổ">Thổ</option>
                  <option value="Xtiêng">Xtiêng</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={formData.SDT}
                  onChange={(e) => setFormData({ ...formData, SDT: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ *</label>
                <textarea
                  required
                  value={formData.DiaChi}
                  onChange={(e) => setFormData({ ...formData, DiaChi: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Người liên hệ khẩn cấp */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-green-600" />
              Người liên hệ khẩn cấp
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên người thân</label>
                <input
                  type="text"
                  value={formData.HoTenThanNhan}
                  onChange={(e) => setFormData({ ...formData, HoTenThanNhan: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mối quan hệ</label>
                <select
                  value={formData.MoiQuanHe}
                  onChange={(e) => setFormData({ ...formData, MoiQuanHe: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="">Chọn mối quan hệ</option>
                  <option value="Cha">Cha</option>
                  <option value="Mẹ">Mẹ</option>
                  <option value="Vợ">Vợ</option>
                  <option value="Chồng">Chồng</option>
                  <option value="Con">Con</option>
                  <option value="Anh/Chị">Anh/Chị</option>
                  <option value="Em">Em</option>
                  <option value="Bạn">Bạn</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.SDTThanNhan}
                  onChange={(e) => setFormData({ ...formData, SDTThanNhan: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Thông tin bảo hiểm */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Thông tin bảo hiểm y tế và ưu tiên
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ BHYT/BHXH</label>
                <input
                  type="text"
                  value={formData.BHYT}
                  onChange={(e) => setFormData({ ...formData, BHYT: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="VD: GD1234567890123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời hạn thẻ</label>
                <input
                  type="date"
                  value={formData.ThoiHanBHYT}
                  onChange={(e) => setFormData({ ...formData, ThoiHanBHYT: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đối tượng ưu tiên</label>
                <select
                  value={formData.DoiTuongUuTien}
                  onChange={(e) => setFormData({ ...formData, DoiTuongUuTien: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                >
                  <option value="Bình thường">Bình thường</option>
                  <option value="Ưu tiên">Ưu tiên</option>
                  <option value="Khẩn cấp">Khẩn cấp</option>
                </select>
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
              className="px-6 py-3 btn-primary text-white rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Thêm bệnh nhân
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
