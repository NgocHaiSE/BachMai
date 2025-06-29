import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  ArrowRightLeft,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock4,
  CalendarDays,
  User,
  Building,
  Briefcase,
  Moon,
  Sun,
  Sunset,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface WorkScheduleManagementProps { }

type TabType = 'schedules' | 'transfers' | 'leaves';

// API Service Functions
const API_BASE = 'http://localhost:3000/api/lich-lam-viec';

const apiService = {
  // Lịch làm việc
  getWeeklySchedule: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/lich-tuan?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getScheduleStats: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/thong-ke?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getSchedules: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/ca?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getScheduleDetail: async (id: string) => {
    const response = await fetch(`${API_BASE}/ca/${id}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  createSchedule: async (scheduleData: any) => {
    console.log('Creating schedule with data:', scheduleData);
    const response = await fetch(`${API_BASE}/ca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });
    const data = await response.json();
    console.log('Create schedule response:', data);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  updateSchedule: async (id: string, scheduleData: any) => {
    console.log('Updating schedule:', id, 'with data:', scheduleData);
    const response = await fetch(`${API_BASE}/ca/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });
    const data = await response.json();
    console.log('Update schedule response:', data);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  deleteSchedule: async (id: string) => {
    const response = await fetch(`${API_BASE}/ca/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  confirmSchedule: async (id: string) => {
    const response = await fetch(`${API_BASE}/ca/${id}/xac-nhan`, { method: 'PATCH' });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Yêu cầu chuyển ca
  getShiftChangeRequests: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/chuyen-ca?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  createShiftChangeRequest: async (requestData: any) => {
    console.log('Creating shift change request with data:', requestData);
    const response = await fetch(`${API_BASE}/chuyen-ca`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    console.log('Create shift change response:', data);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  approveShiftChangeRequest: async (id: string, approvalData: any) => {
    const response = await fetch(`${API_BASE}/chuyen-ca/${id}/xu-ly`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Đơn nghỉ phép
  getLeaveRequests: async (params: any = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/nghi-phep?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  createLeaveRequest: async (requestData: any) => {
    console.log('Creating leave request with data:', requestData);
    const response = await fetch(`${API_BASE}/nghi-phep`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData)
    });
    const data = await response.json();
    console.log('Create leave response:', data);
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  approveLeaveRequest: async (id: string, approvalData: any) => {
    const response = await fetch(`${API_BASE}/nghi-phep/${id}/xu-ly`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(approvalData)
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  // Helper APIs
  getStaff: async (idKhoa?: string) => {
    const params = idKhoa ? { idKhoa } : {};
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/nhan-vien?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getDepartments: async () => {
    const response = await fetch(`${API_BASE}/khoa`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  },

  getConflicts: async (params: any) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/xung-dot?${queryString}`);
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    return data.data;
  }
};

// Toast notification function
const toast = {
  success: (message: string) => {
    console.log('SUCCESS:', message);
    // You can implement actual toast notification here
    alert('✅ ' + message);
  },
  error: (message: string) => {
    console.error('ERROR:', message);
    // You can implement actual toast notification here
    alert('❌ ' + message);
  }
};

// Delete Confirmation Modal Component
const DeleteConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  itemInfo?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}> = ({ 
  isOpen, 
  title, 
  message, 
  itemInfo, 
  onConfirm, 
  onCancel, 
  isLoading = false,
  confirmText = "Xóa",
  cancelText = "Hủy"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
            {title}
          </h3>
          
          <div className="text-gray-600 text-center mb-4">
            {message}
          </div>

          {itemInfo && (
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              {itemInfo}
            </div>
          )}

          <p className="text-red-600 font-medium text-center mb-6 text-sm">
            Hành động này không thể hoàn tác!
          </p>
          
          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
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
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CreateTransferModal Component
const CreateTransferModal: React.FC<{
  staff: any[];
  workSchedules: any[];
  formatTime: (timeString: string) => string;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ staff, workSchedules, formatTime, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    idCaLamViecGoc: '',
    idNhanVienMoi: '',
    NgayChuyen: '',
    LyDo: '',
    CanBuCa: false,
    GhiChu: ''
  });

  const [selectedShift, setSelectedShift] = useState<any>(null);
  const [errors, setErrors] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  console.log('CreateTransferModal - Staff:', staff);
  console.log('CreateTransferModal - WorkSchedules:', workSchedules);

  const handleShiftSelect = (shiftId: string) => {
    const shift = workSchedules.find(s => s.idCaLamViec === shiftId);
    console.log('Selected shift:', shift);
    setSelectedShift(shift);
    setFormData(prev => ({ 
      ...prev, 
      idCaLamViecGoc: shiftId,
      NgayChuyen: shift?.NgayLamViec || ''
    }));
    setErrors(prev => ({ ...prev, idCaLamViecGoc: '' }));
  };

  const handleStaffSelect = (staffId: string) => {
    setFormData(prev => ({ ...prev, idNhanVienMoi: staffId }));
    setErrors(prev => ({ ...prev, idNhanVienMoi: '' }));
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.idCaLamViecGoc) {
      newErrors.idCaLamViecGoc = 'Vui lòng chọn ca làm việc cần chuyển';
    }
    
    if (!formData.idNhanVienMoi) {
      newErrors.idNhanVienMoi = 'Vui lòng chọn nhân viên thay thế';
    }
    
    if (!formData.LyDo?.trim()) {
      newErrors.LyDo = 'Vui lòng nhập lý do chuyển ca';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Submitting transfer request:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting transfer request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter available staff (exclude current shift employee if selected)
  const availableStaff = selectedShift 
    ? staff.filter(member => {
        const memberId = member.idNhanVien || member._id;
        const currentEmployeeId = selectedShift.idNhanVien;
        return memberId !== currentEmployeeId;
      })
    : staff;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-[#280559]" />
            <span>Tạo Yêu Cầu Chuyển Ca</span>
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ca làm việc cần chuyển *
            </label>
            <select
              value={formData.idCaLamViecGoc}
              onChange={(e) => handleShiftSelect(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${errors.idCaLamViecGoc ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isLoading}
            >
              <option value="">Chọn ca làm việc</option>
              {workSchedules.map(shift => (
                <option key={shift.idCaLamViec} value={shift.idCaLamViec}>
                  {new Date(shift.NgayLamViec).toLocaleDateString('vi-VN')} - {shift.LoaiCa} ({formatTime(shift.GioBD)}-{formatTime(shift.GioKT)}) - {shift.HoTenNguoiDung}
                </option>
              ))}
            </select>
            {errors.idCaLamViecGoc && (
              <p className="text-red-600 text-sm mt-1">{errors.idCaLamViecGoc}</p>
            )}
          </div>

          {selectedShift && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin ca làm việc:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ngày:</span>
                  <span className="ml-2 font-medium">{new Date(selectedShift.NgayLamViec).toLocaleDateString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ca:</span>
                  <span className="ml-2 font-medium">{selectedShift.LoaiCa}</span>
                </div>
                <div>
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="ml-2 font-medium">{formatTime(selectedShift.GioBD)} - {formatTime(selectedShift.GioKT)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nhân viên hiện tại:</span>
                  <span className="ml-2 font-medium">{selectedShift.HoTenNguoiDung}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhân viên thay thế *
            </label>
            <select
              value={formData.idNhanVienMoi}
              onChange={(e) => handleStaffSelect(e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 ${errors.idNhanVienMoi ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isLoading}
            >
              <option value="">Chọn nhân viên thay thế</option>
              {availableStaff.map(member => {
                const memberId = member.idNhanVien || member._id;
                const memberName = member.HoTen || `${member.firstName || ''} ${member.lastName || ''}`.trim();
                const department = member.department || member.TenKhoa || 'Chưa xác định';
                
                return (
                  <option key={memberId} value={memberId}>
                    {memberName} - {department}
                  </option>
                );
              })}
            </select>
            {errors.idNhanVienMoi && (
              <p className="text-red-600 text-sm mt-1">{errors.idNhanVienMoi}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày chuyển</label>
            <input
              type="date"
              value={formData.NgayChuyen}
              onChange={(e) => setFormData(prev => ({ ...prev, NgayChuyen: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do chuyển ca *</label>
            <textarea
              value={formData.LyDo}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, LyDo: e.target.value }));
                setErrors(prev => ({ ...prev, LyDo: '' }));
              }}
              className={`w-full border rounded-lg px-3 py-2 ${errors.LyDo ? 'border-red-300' : 'border-gray-300'}`}
              rows={3}
              placeholder="Nhập lý do cần chuyển ca..."
              disabled={isLoading}
            />
            {errors.LyDo && (
              <p className="text-red-600 text-sm mt-1">{errors.LyDo}</p>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="canBuCa"
              checked={formData.CanBuCa}
              onChange={(e) => setFormData(prev => ({ ...prev, CanBuCa: e.target.checked }))}
              className="w-4 h-4 text-[#280559] border-gray-300 rounded focus:ring-[#280559]"
              disabled={isLoading}
            />
            <label htmlFor="canBuCa" className="text-sm font-medium text-gray-700">Cần bù ca</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.GhiChu}
              onChange={(e) => setFormData(prev => ({ ...prev, GhiChu: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={2}
              placeholder="Ghi chú thêm..."
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-[#280559] text-white py-2 px-4 rounded-lg hover:bg-[#1a0340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Yêu Cầu'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// CreateLeaveModal Component
const CreateLeaveModal: React.FC<{
  staff: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ staff, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    LoaiPhep: 'Phép năm',
    NgayBD: '',
    NgayKT: '',
    GioBD: '',
    GioKT: '',
    NghiCaNgay: true,
    TongNgayNghi: 1,
    LyDo: '',
    HoTenNguoiLienHe: '',
    SDTNguoiLienHe: '',
    MoiQuanHe: '',
    GhiChu: '',
    idNhanVienThayThe: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (formData.NgayBD && formData.NgayKT) {
      const startDate = new Date(formData.NgayBD);
      const endDate = new Date(formData.NgayKT);
      
      if (endDate >= startDate) {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setFormData(prev => ({ ...prev, TongNgayNghi: diffDays }));
      }
    }
  }, [formData.NgayBD, formData.NgayKT]);

  const handleSubmit = async () => {
    if (!formData.LoaiPhep || !formData.NgayBD || !formData.NgayKT || !formData.LyDo) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.NgayKT) < new Date(formData.NgayBD)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting leave request:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const leaveTypes = ['Phép năm', 'Phép ốm', 'Phép thai sản', 'Phép việc riêng', 'Phép không lương', 'Phép khác'];
  const relationshipTypes = ['Vợ/Chồng', 'Con', 'Cha/Mẹ', 'Anh/Chị/Em', 'Họ hàng', 'Bạn bè', 'Khác'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#280559]" />
            <span>Tạo Đơn Xin Nghỉ</span>
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Loại phép *</label>
            <select
              value={formData.LoaiPhep}
              onChange={(e) => setFormData(prev => ({ ...prev, LoaiPhep: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={isLoading}
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Từ ngày *</label>
              <input
                type="date"
                value={formData.NgayBD}
                onChange={(e) => setFormData(prev => ({ ...prev, NgayBD: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Đến ngày *</label>
              <input
                type="date"
                value={formData.NgayKT}
                onChange={(e) => setFormData(prev => ({ ...prev, NgayKT: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="nghiCaNgay"
              checked={formData.NghiCaNgay}
              onChange={(e) => setFormData(prev => ({ ...prev, NghiCaNgay: e.target.checked }))}
              className="w-4 h-4 text-[#280559] border-gray-300 rounded focus:ring-[#280559]"
              disabled={isLoading}
            />
            <label htmlFor="nghiCaNgay" className="text-sm font-medium text-gray-700">Nghỉ cả ngày</label>
          </div>

          {!formData.NghiCaNgay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Từ giờ</label>
                <input
                  type="time"
                  value={formData.GioBD}
                  onChange={(e) => setFormData(prev => ({ ...prev, GioBD: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Đến giờ</label>
                <input
                  type="time"
                  value={formData.GioKT}
                  onChange={(e) => setFormData(prev => ({ ...prev, GioKT: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tổng số ngày nghỉ</label>
            <input
              type="number"
              value={formData.TongNgayNghi}
              onChange={(e) => setFormData(prev => ({ ...prev, TongNgayNghi: parseInt(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="1"
              readOnly={formData.NgayBD && formData.NgayKT}
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Lý do nghỉ *</label>
            <textarea
              value={formData.LyDo}
              onChange={(e) => setFormData(prev => ({ ...prev, LyDo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Nhập lý do nghỉ phép..."
              disabled={isLoading}
            />
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Thông tin người liên hệ khi cần thiết</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Họ tên người liên hệ</label>
                <input
                  type="text"
                  value={formData.HoTenNguoiLienHe}
                  onChange={(e) => setFormData(prev => ({ ...prev, HoTenNguoiLienHe: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập họ tên..."
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.SDTNguoiLienHe}
                  onChange={(e) => setFormData(prev => ({ ...prev, SDTNguoiLienHe: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập số điện thoại..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mối quan hệ</label>
              <select
                value={formData.MoiQuanHe}
                onChange={(e) => setFormData(prev => ({ ...prev, MoiQuanHe: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                disabled={isLoading}
              >
                <option value="">Chọn mối quan hệ</option>
                {relationshipTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nhân viên thay thế (nếu có)</label>
            <select
              value={formData.idNhanVienThayThe}
              onChange={(e) => setFormData(prev => ({ ...prev, idNhanVienThayThe: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={isLoading}
            >
              <option value="">Chọn nhân viên thay thế</option>
              {staff.map(member => {
                const memberId = member.idNhanVien || member._id;
                const memberName = member.HoTen || `${member.firstName || ''} ${member.lastName || ''}`.trim();
                const department = member.department || member.TenKhoa || '';
                
                return (
                  <option key={memberId} value={memberId}>
                    {memberName} - {department}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
            <textarea
              value={formData.GhiChu}
              onChange={(e) => setFormData(prev => ({ ...prev, GhiChu: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={2}
              placeholder="Ghi chú thêm..."
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-[#280559] text-white py-2 px-4 rounded-lg hover:bg-[#1a0340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Đơn Nghỉ'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format time
const formatTime = (timeString: string) => {
  if (!timeString) return '00:00';
  
  try {
    // If it's already in HH:mm format
    if (timeString.includes(':') && !timeString.includes('T')) {
      return timeString.substring(0, 5);
    }
    
    // If it's in ISO format like "1970-01-01T14:00:00.000Z"
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) return '00:00';
      
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    }
    
    return '00:00';
  } catch (error) {
    console.error('Error formatting time:', error);
    return '00:00';
  }
};

const WorkScheduleManagement: React.FC<WorkScheduleManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schedules');
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);
  const [showCreateLeaveModal, setShowCreateLeaveModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Data states
  const [workSchedules, setWorkSchedules] = useState<any[]>([]);
  const [shiftTransfers, setShiftTransfers] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [scheduleStats, setScheduleStats] = useState<any>(null);
  
  // Loading states
  const [loading, setLoading] = useState(false);

  // Delete confirmation states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function getCurrentWeek() {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  }

  // Load data functions
  const loadWeeklySchedule = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSchedules({
        TuNgay: selectedWeek.start,
        DenNgay: selectedWeek.end,
        ...(filterDepartment && { idKhoa: filterDepartment })
      });
      console.log('Loaded schedules:', data);
      setWorkSchedules(data || []);
    } catch (error: any) {
      console.error('Error loading schedules:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadShiftTransfers = async () => {
    try {
      const data = await apiService.getShiftChangeRequests({
        ...(filterStatus && { TrangThai: filterStatus })
      });
      console.log('Loaded shift transfers:', data);
      setShiftTransfers(data || []);
    } catch (error: any) {
      console.error('Error loading shift transfers:', error);
      toast.error(error.message);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const data = await apiService.getLeaveRequests({
        ...(filterStatus && { TrangThai: filterStatus })
      });
      console.log('Loaded leave requests:', data);
      setLeaveRequests(data || []);
    } catch (error: any) {
      console.error('Error loading leave requests:', error);
      toast.error(error.message);
    }
  };

  const loadStaff = async () => {
    try {
      const data = await apiService.getStaff();
      console.log('Loaded staff:', data);
      setStaff(data || []);
    } catch (error: any) {
      console.error('Error loading staff:', error);
      toast.error(error.message);
    }
  };

  const loadDepartments = async () => {
    try {
      const data = await apiService.getDepartments();
      console.log('Loaded departments:', data);
      setDepartments(data || []);
    } catch (error: any) {
      console.error('Error loading departments:', error);
      toast.error(error.message);
    }
  };

  const loadScheduleStats = async () => {
    try {
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      
      const data = await apiService.getScheduleStats({
        NgayBatDau: startOfMonth.toISOString().split('T')[0],
        NgayKetThuc: endOfMonth.toISOString().split('T')[0]
      });
      setScheduleStats(data?.[0] || null);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast.error(error.message);
    }
  };

  // Effect hooks
  useEffect(() => {
    loadStaff();
    loadDepartments();
    loadScheduleStats();
  }, []);

  useEffect(() => {
    loadWeeklySchedule();
  }, [selectedWeek, filterDepartment]);

  useEffect(() => {
    if (activeTab === 'transfers') {
      loadShiftTransfers();
    } else if (activeTab === 'leaves') {
      loadLeaveRequests();
    }
  }, [activeTab, filterStatus]);

  const getShiftIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': case 'Ca sáng': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'afternoon': case 'Ca chiều': return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night': case 'Ca đêm': return <Moon className="w-4 h-4 text-blue-500" />;
      case 'full-day': case 'Ca hành chính': return <Clock className="w-4 h-4 text-green-500" />;
      case 'on-call': case 'Ca tối': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': case 'Chờ phê duyệt': case 'Chờ duyệt': return 'bg-yellow-100 text-yellow-800';
      case 'approved': case 'confirmed': case 'Đã phê duyệt': case 'Đã duyệt': return 'bg-green-100 text-green-800';
      case 'rejected': case 'cancelled': case 'Từ chối': case 'Đã từ chối': return 'bg-red-100 text-red-800';
      case 'completed': case 'Hoàn thành': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveSchedule = async (formData: any) => {
    try {
      console.log('handleSaveSchedule called with:', formData);
      if (editingSchedule) {
        console.log('Updating schedule:', editingSchedule.idCaLamViec);
        await apiService.updateSchedule(editingSchedule.idCaLamViec, formData);
        toast.success('Cập nhật ca làm việc thành công');
      } else {
        console.log('Creating new schedule');
        await apiService.createSchedule(formData);
        toast.success('Tạo lịch làm việc thành công');
      }
      setShowCreateScheduleModal(false);
      setEditingSchedule(null);
      loadWeeklySchedule();
    } catch (error: any) {
      console.error('Error in handleSaveSchedule:', error);
      toast.error(error.message);
    }
  };

  const handleDeleteSchedule = (schedule: any) => {
    setItemToDelete(schedule);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setDeleteLoading(true);
    try {
      await apiService.deleteSchedule(itemToDelete.idCaLamViec);
      toast.success('Xóa ca làm việc thành công');
      setShowDeleteModal(false);
      setItemToDelete(null);
      loadWeeklySchedule();
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra khi xóa');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setItemToDelete(null);
    setDeleteLoading(false);
  };

  const handleApproveTransfer = async (transferId: string, approved: boolean = true) => {
    try {
      await apiService.approveShiftChangeRequest(transferId, { 
        IsApproved: approved,
        GhiChuPheDuyet: approved ? 'Phê duyệt' : 'Từ chối'
      });
      toast.success(`${approved ? 'Phê duyệt' : 'Từ chối'} chuyển ca thành công`);
      loadShiftTransfers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleApproveLeave = async (leaveId: string, approved: boolean = true) => {
    try {
      await apiService.approveLeaveRequest(leaveId, { 
        IsApproved: approved,
        GhiChuPheDuyet: approved ? 'Phê duyệt' : 'Từ chối'
      });
      toast.success(`${approved ? 'Phê duyệt' : 'Từ chối'} đơn xin nghỉ thành công`);
      loadLeaveRequests();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getDeleteModalContent = () => {
    if (!itemToDelete) return { title: '', message: '', itemInfo: null };

    return {
      title: 'Xác nhận xóa ca làm việc',
      message: 'Bạn có chắc chắn muốn xóa ca làm việc này không?',
      itemInfo: (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Nhân viên:</span>
            <span className="font-medium">{itemToDelete.HoTenNguoiDung}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ngày:</span>
            <span className="font-medium">{new Date(itemToDelete.NgayLamViec).toLocaleDateString('vi-VN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ca làm việc:</span>
            <span className="font-medium">{itemToDelete.LoaiCa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian:</span>
            <span className="font-medium">{formatTime(itemToDelete.GioBD)} - {formatTime(itemToDelete.GioKT)}</span>
          </div>
          {itemToDelete.TenKhoa && (
            <div className="flex justify-between">
              <span className="text-gray-600">Khoa phòng:</span>
              <span className="font-medium">{itemToDelete.TenKhoa}</span>
            </div>
          )}
        </div>
      )
    };
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedules':
        return <SchedulesTab
          schedules={workSchedules}
          onCreateSchedule={() => {
            setEditingSchedule(null);
            setShowCreateScheduleModal(true);
          }}
          onEditSchedule={(s) => {
            setEditingSchedule(s);
            setShowCreateScheduleModal(true);
          }}
          onDeleteSchedule={handleDeleteSchedule}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          departments={departments}
          filterDepartment={filterDepartment}
          setFilterDepartment={setFilterDepartment}
          getShiftIcon={getShiftIcon}
          getStatusColor={getStatusColor}
          formatTime={formatTime}
          loading={loading}
        />;
      case 'transfers':
        return <TransfersTab
          transfers={shiftTransfers}
          onCreateTransfer={() => setShowCreateTransferModal(true)}
          onApprove={handleApproveTransfer}
          getStatusColor={getStatusColor}
        />;
      case 'leaves':
        return <LeavesTab
          leaves={leaveRequests}
          onCreateLeave={() => setShowCreateLeaveModal(true)}
          onApprove={handleApproveLeave}
          getStatusColor={getStatusColor}
        />;
      default:
        return null;
    }
  };

  const deleteModalContent = getDeleteModalContent();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Lịch Làm Việc</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yêu cầu chuyển ca</p>
              <p className="text-2xl font-bold">{shiftTransfers?.filter(t => t.TrangThai === 'Chờ duyệt').length || 0}</p>
            </div>
            <div className="p-3 rounded-xl">
              <ArrowRightLeft className="w-6 h-6 text-[#280559]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đơn xin nghỉ</p>
              <p className="text-2xl font-bold text-purple-600">{leaveRequests?.filter(l => l.TrangThai === 'Chờ duyệt').length || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ca làm việc tuần này</p>
              <p className="text-2xl font-bold text-blue-600">{workSchedules?.length || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'schedules'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Lịch Làm Việc
            </button>
            <button
              onClick={() => setActiveTab('transfers')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'transfers'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <ArrowRightLeft className="w-4 h-4 inline mr-2" />
              Chuyển Ca
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'leaves'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Đơn Xin Nghỉ
            </button>
          </nav>
        </div>

        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        title={deleteModalContent.title}
        message={deleteModalContent.message}
        itemInfo={deleteModalContent.itemInfo}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={deleteLoading}
      />

      {/* Other Modals */}
      {showCreateScheduleModal && (
        <CreateScheduleModal
          nhanvien={staff}
          staff={staff}
          departments={departments}
          schedule={editingSchedule}
          formatTime={formatTime}
          onSubmit={handleSaveSchedule}
          onClose={() => {
            setShowCreateScheduleModal(false);
            setEditingSchedule(null);
          }}
        />
      )}

      {showCreateTransferModal && (
        <CreateTransferModal
          staff={staff}
          workSchedules={workSchedules}
          formatTime={formatTime}
          onSubmit={async (data) => {
            try {
              console.log('Creating transfer with data:', data);
              await apiService.createShiftChangeRequest(data);
              toast.success('Tạo yêu cầu chuyển ca thành công');
              setShowCreateTransferModal(false);
              loadShiftTransfers();
            } catch (error: any) {
              console.error('Error creating transfer:', error);
              toast.error(error.message);
            }
          }}
          onClose={() => setShowCreateTransferModal(false)}
        />
      )}

      {showCreateLeaveModal && (
        <CreateLeaveModal
          staff={staff}
          onSubmit={async (data) => {
            try {
              console.log('Creating leave with data:', data);
              await apiService.createLeaveRequest(data);
              toast.success('Tạo đơn xin nghỉ thành công');
              setShowCreateLeaveModal(false);
              loadLeaveRequests();
            } catch (error: any) {
              console.error('Error creating leave:', error);
              toast.error(error.message);
            }
          }}
          onClose={() => setShowCreateLeaveModal(false)}
        />
      )}
    </div>
  );
};

// Schedules Tab Component
const SchedulesTab: React.FC<{
  schedules: any[];
  onCreateSchedule: () => void;
  onEditSchedule: (schedule: any) => void;
  onDeleteSchedule: (schedule: any) => void;
  selectedWeek: { start: string; end: string };
  setSelectedWeek: (week: { start: string; end: string }) => void;
  departments: any[];
  filterDepartment: string;
  setFilterDepartment: (id: string) => void;
  getShiftIcon: (shiftType: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  formatTime: (timeString: string) => string;
  loading: boolean;
}> = ({
  schedules,
  onCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
  selectedWeek,
  setSelectedWeek,
  departments,
  filterDepartment,
  setFilterDepartment,
  getShiftIcon,
  getStatusColor,
  formatTime,
  loading
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'month'>('calendar');

  const getWeekDays = () => {
    const days = [];
    const start = new Date(selectedWeek.start);
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return schedules.filter(s => {
      const schedDate = new Date(s.NgayLamViec).toISOString().split('T')[0];
      return schedDate === dateStr;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
      </div>
    );
  }

  if (viewMode === 'calendar') {
    const weekDays = getWeekDays();

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newStart = new Date(selectedWeek.start);
                newStart.setDate(newStart.getDate() - 7);
                const newEnd = new Date(newStart);
                newEnd.setDate(newStart.getDate() + 6);
                setSelectedWeek({
                  start: newStart.toISOString().split('T')[0],
                  end: newEnd.toISOString().split('T')[0]
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">
              {weekDays[0].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} - {weekDays[6].toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </h3>
            <button
              onClick={() => {
                const newStart = new Date(selectedWeek.start);
                newStart.setDate(newStart.getDate() + 7);
                const newEnd = new Date(newStart);
                newEnd.setDate(newStart.getDate() + 6);
                setSelectedWeek({
                  start: newStart.toISOString().split('T')[0],
                  end: newEnd.toISOString().split('T')[0]
                });
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              →
            </button>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="">Tất cả khoa</option>
              {departments.map((d: any) => (
                <option key={d.idKhoa || d._id} value={d.idKhoa || d._id}>{d.TenKhoa || d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
                }`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'calendar' ? 'bg-blue-100 text-[#280559]' : 'text-gray-600'
                }`}
            >
              Lịch
            </button>
            <button
              onClick={onCreateSchedule}
              className="bg-[#280559] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#1a0340]"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Ca Làm</span>
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day, index) => (
            <div key={day} className="min-h-[200px]">
              <div className="text-center font-medium text-gray-600 mb-2">
                {day} {weekDays[index].getDate()}
              </div>
              <div className="space-y-1">
                {getSchedulesForDate(weekDays[index]).map((schedule) => (
                  <div
                    key={schedule.idCaLamViec}
                    className="p-2 rounded bg-blue-50 border border-blue-200 text-xs"
                  >
                    <div className="flex items-center space-x-1 mb-1">
                      {getShiftIcon(schedule.LoaiCa)}
                      <span className="font-medium">{schedule.HoTenNguoiDung}</span>
                    </div>
                    <div className="text-gray-600">
                      {formatTime(schedule.GioBD)} - {formatTime(schedule.GioKT)}
                    </div>
                    <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(schedule.TrangThai)}`}>{schedule.TrangThai}</div>
                    {schedule.GhiChu && (
                      <div className="text-xs text-gray-500">{schedule.GhiChu}</div>
                    )}
                    <div className="flex justify-end space-x-2 pt-1">
                      <button onClick={() => onEditSchedule(schedule)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteSchedule(schedule)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Danh Sách Lịch Làm Việc</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
              }`}
          >
            Danh sách
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1 text-sm rounded ${viewMode === 'calendar' ? 'bg-blue-100 text-[#280559]' : 'text-gray-600'
              }`}
          >
            Lịch
          </button>
          <button
            onClick={onCreateSchedule}
            className="bg-[#280559] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#1a0340]"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Ca Làm</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule.idCaLamViec} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getShiftIcon(schedule.LoaiCa)}
                <div>
                  <div className="font-medium">{schedule.HoTenNguoiDung}</div>
                  <div className="text-sm text-gray-600">{schedule.TenKhoa}</div>
                  <div className="text-sm text-gray-600">{schedule.LoaiCa} - {schedule.LoaiCongViec}</div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-medium">{new Date(schedule.NgayLamViec).toLocaleDateString('vi-VN')}</div>
                  <div className="text-sm text-gray-600">{formatTime(schedule.GioBD)} - {formatTime(schedule.GioKT)}</div>
                  <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(schedule.TrangThai)}`}>
                    {schedule.TrangThai}
                  </div>
                  {schedule.GhiChu && (
                    <div className="text-xs text-gray-500 mt-1">{schedule.GhiChu}</div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onEditSchedule(schedule)} 
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded" 
                    title="Chỉnh sửa"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteSchedule(schedule)} 
                    className="p-2 text-red-600 hover:bg-red-50 rounded" 
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transfers Tab Component
const TransfersTab: React.FC<{
  transfers: any[];
  onCreateTransfer: () => void;
  onApprove: (transferId: string, approved: boolean) => void;
  getStatusColor: (status: string) => string;
}> = ({ transfers, onCreateTransfer, onApprove, getStatusColor }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Yêu Cầu Chuyển Ca</h3>
        <button
          onClick={onCreateTransfer}
          className="bg-[#280559] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#1a0340]"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Yêu Cầu Chuyển Ca</span>
        </button>
      </div>

      <div className="space-y-4">
        {transfers.map((transfer) => (
          <div key={transfer.idYeuCauChuyenCa} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <ArrowRightLeft className="w-5 h-5 text-[#280559]" />
                <div>
                  <div className="font-medium">{transfer.idYeuCauChuyenCa}</div>
                  <div className="text-sm text-gray-600">{new Date(transfer.NgayYeuCau).toLocaleDateString('vi-VN')}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(transfer.TrangThai)}`}>
                {transfer.TrangThai}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Từ:</div>
                <div className="font-medium">{transfer.TenNhanVienCu}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đến:</div>
                <div className="font-medium">{transfer.TenNhanVienMoi}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <strong>Lý do:</strong> {transfer.LyDo}
            </div>

            {transfer.TrangThai === 'Chờ duyệt' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onApprove(transfer.idYeuCauChuyenCa, true)}
                  className="bg-[#280559] text-white px-3 py-1 rounded text-sm hover:bg-[#1a0340] flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt</span>
                </button>
                <button 
                  onClick={() => onApprove(transfer.idYeuCauChuyenCa, false)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Từ chối</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Leaves Tab Component
const LeavesTab: React.FC<{
  leaves: any[];
  onCreateLeave: () => void;
  onApprove: (leaveId: string, approved: boolean) => void;
  getStatusColor: (status: string) => string;
}> = ({ leaves, onCreateLeave, onApprove, getStatusColor }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Đơn Xin Nghỉ</h3>
        <button
          onClick={onCreateLeave}
          className="bg-[#280559] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#1a0340]"
        >
          <FileText className="w-4 h-4" />
          <span>Tạo Đơn Xin Nghỉ</span>
        </button>
      </div>

      <div className="space-y-4">
        {leaves.map((leave) => (
          <div key={leave.idNghiPhep} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#280559]" />
                <div>
                  <div className="font-medium">{leave.idNghiPhep}</div>
                  <div className="text-sm text-gray-600">{leave.TenNhanVien}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(leave.TrangThai)}`}>
                {leave.TrangThai}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Loại nghỉ:</div>
                <div className="font-medium">{leave.LoaiPhep}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Từ ngày:</div>
                <div className="font-medium">{new Date(leave.NgayBD).toLocaleDateString('vi-VN')}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đến ngày:</div>
                <div className="font-medium">{new Date(leave.NgayKT).toLocaleDateString('vi-VN')}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <strong>Lý do:</strong> {leave.LyDo}
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <strong>Tổng số ngày:</strong> {leave.TongNgayNghi} ngày
            </div>

            {leave.TrangThai === 'Chờ duyệt' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onApprove(leave.idNghiPhep, true)}
                  className="bg-[#280559] text-white px-3 py-1 rounded text-sm hover:bg-[#1a0340] flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt</span>
                </button>
                <button 
                  onClick={() => onApprove(leave.idNghiPhep, false)}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Từ chối</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Create Schedule Modal
const CreateScheduleModal: React.FC<{
  nhanvien: any[];
  staff: any[];
  departments: any[];
  schedule?: any;
  formatTime: (timeString: string) => string;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ nhanvien, staff, departments, schedule, formatTime, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    idNhanVien: '',
    NgayLamViec: '',
    LoaiCa: 'Ca sáng',
    GioBD: '06:00',
    GioKT: '14:00',
    LoaiCongViec: 'Thường',
    GhiChu: '',
    idKhoa: '',
    idLichTongThe: 'LTT0001',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (schedule) {
      console.log('Editing schedule:', schedule);
      
      // Format date properly for input[type="date"]
      let formattedDate = '';
      if (schedule.NgayLamViec) {
        const date = new Date(schedule.NgayLamViec);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      }
      
      setFormData({
        idNhanVien: schedule.idNhanVien || '',
        NgayLamViec: formattedDate,
        LoaiCa: schedule.LoaiCa || 'Ca sáng',
        GioBD: formatTime(schedule.GioBD) || '06:00',
        GioKT: formatTime(schedule.GioKT) || '14:00',
        LoaiCongViec: schedule.LoaiCongViec || 'Thường',
        GhiChu: schedule.GhiChu || '',
        idKhoa: schedule.idKhoa || '',
        idLichTongThe: schedule.idLichTongThe || 'LTT0001',
      });
    }
  }, [schedule]);

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.idNhanVien) {
      newErrors.idNhanVien = 'Vui lòng chọn nhân viên';
    }
    
    if (!formData.NgayLamViec) {
      newErrors.NgayLamViec = 'Vui lòng chọn ngày làm việc';
    }
    
    if (!formData.idKhoa) {
      newErrors.idKhoa = 'Vui lòng chọn khoa phòng';
    }

    if (!formData.GioBD || !formData.GioKT) {
      newErrors.time = 'Vui lòng nhập đầy đủ thời gian';
    } else if (formData.GioBD >= formData.GioKT) {
      newErrors.time = 'Giờ kết thúc phải sau giờ bắt đầu';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      console.log('Submitting schedule with data:', formData);
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting schedule:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShiftChange = (shiftType: string) => {
    let startTime = '06:00', endTime = '14:00';

    switch (shiftType) {
      case 'Ca sáng':
        startTime = '06:00'; endTime = '14:00';
        break;
      case 'Ca chiều':
        startTime = '14:00'; endTime = '22:00';
        break;
      case 'Ca đêm':
        startTime = '22:00'; endTime = '06:00';
        break;
      case 'Ca hành chính':
        startTime = '08:00'; endTime = '17:00';
        break;
      case 'Ca tối':
        startTime = '18:00'; endTime = '22:00';
        break;
    }

    setFormData(prev => ({ 
      ...prev, 
      LoaiCa: shiftType, 
      GioBD: startTime, 
      GioKT: endTime 
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{schedule ? 'Chỉnh Sửa Ca Làm' : 'Tạo Ca Làm Việc Mới'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
            <select
              value={formData.idNhanVien}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, idNhanVien: e.target.value }));
                setErrors(prev => ({ ...prev, idNhanVien: '' }));
              }}
              className={`w-full border rounded-lg px-3 py-2 ${errors.idNhanVien ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isLoading}
            >
              <option value="">Chọn nhân viên</option>
              {staff.map(s => {
                const staffId = s.idNhanVien || s._id;
                const staffName = s.HoTen || `${s.firstName || ''} ${s.lastName || ''}`.trim();
                return (
                  <option key={staffId} value={staffId}>
                    {staffName}
                  </option>
                );
              })}
            </select>
            {errors.idNhanVien && (
              <p className="text-red-600 text-sm mt-1">{errors.idNhanVien}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày làm việc *</label>
            <input
              type="date"
              value={formData.NgayLamViec}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, NgayLamViec: e.target.value }));
                setErrors(prev => ({ ...prev, NgayLamViec: '' }));
              }}
              className={`w-full border rounded-lg px-3 py-2 ${errors.NgayLamViec ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isLoading}
            />
            {errors.NgayLamViec && (
              <p className="text-red-600 text-sm mt-1">{errors.NgayLamViec}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
            <select
              value={formData.LoaiCa}
              onChange={(e) => handleShiftChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={isLoading}
            >
              <option value="Ca sáng">Ca sáng (6:00-14:00)</option>
              <option value="Ca chiều">Ca chiều (14:00-22:00)</option>
              <option value="Ca đêm">Ca đêm (22:00-6:00)</option>
              <option value="Ca hành chính">Ca hành chính (8:00-17:00)</option>
              <option value="Ca tối">Ca tối (18:00-22:00)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
              <input
                type="time"
                value={formData.GioBD}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, GioBD: e.target.value }));
                  setErrors(prev => ({ ...prev, time: '' }));
                }}
                className={`w-full border rounded-lg px-3 py-2 ${errors.time ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
              <input
                type="time"
                value={formData.GioKT}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, GioKT: e.target.value }));
                  setErrors(prev => ({ ...prev, time: '' }));
                }}
                className={`w-full border rounded-lg px-3 py-2 ${errors.time ? 'border-red-300' : 'border-gray-300'}`}
                disabled={isLoading}
              />
            </div>
            {errors.time && (
              <div className="col-span-2">
                <p className="text-red-600 text-sm">{errors.time}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoa phòng *</label>
            <select
              value={formData.idKhoa}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, idKhoa: e.target.value }));
                setErrors(prev => ({ ...prev, idKhoa: '' }));
              }}
              className={`w-full border rounded-lg px-3 py-2 ${errors.idKhoa ? 'border-red-300' : 'border-gray-300'}`}
              disabled={isLoading}
            >
              <option value="">Chọn khoa phòng</option>
              {departments.map((dept: any) => (
                <option key={dept.idKhoa || dept._id} value={dept.idKhoa || dept._id}>
                  {dept.TenKhoa || dept.name}
                </option>
              ))}
            </select>
            {errors.idKhoa && (
              <p className="text-red-600 text-sm mt-1">{errors.idKhoa}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc</label>
            <select
              value={formData.LoaiCongViec}
              onChange={(e) => setFormData(prev => ({ ...prev, LoaiCongViec: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={isLoading}
            >
              <option value="Thường">Thường</option>
              <option value="Tăng ca">Tăng ca</option>
              <option value="Ngày lễ">Ngày lễ</option>
              <option value="Cấp cứu">Cấp cứu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.GhiChu}
              onChange={(e) => setFormData(prev => ({ ...prev, GhiChu: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Ghi chú thêm về ca làm việc..."
              disabled={isLoading}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 bg-[#280559] text-white py-2 px-4 rounded-lg hover:bg-[#1a0340] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang xử lý...' : (schedule ? 'Cập Nhật' : 'Tạo Ca Làm')}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkScheduleManagement;