import React, { useState, useEffect } from 'react';
import { ArrowRightLeft, X, User, Calendar, Clock, Building, AlertTriangle } from 'lucide-react';

// CreateTransferModal Component - Improved Version
const CreateTransferModal = ({ 
  staff = [], 
  workSchedules = [], 
  onSubmit, 
  onClose 
}) => {
  const [formData, setFormData] = useState({
    idCaLamViecGoc: '',
    idNhanVienMoi: '',
    NgayChuyen: '',
    LyDo: '',
    CanBuCa: false,
    GhiChu: ''
  });

  const [selectedShift, setSelectedShift] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Debug logs
  console.log('Staff data:', staff);
  console.log('Work schedules:', workSchedules);

  const formatTime = (timeString) => {
    if (!timeString) return '00:00';
    
    if (timeString.includes(':') && !timeString.includes('T')) {
      return timeString.substring(0, 5);
    }
    
    if (timeString.includes('T')) {
      const date = new Date(timeString);
      return date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    
    return timeString;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const validateForm = () => {
    const newErrors = {};
    
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

  const handleShiftSelect = (shiftId) => {
    setErrors(prev => ({ ...prev, idCaLamViecGoc: '' }));
    
    if (!shiftId) {
      setSelectedShift(null);
      setFormData(prev => ({ 
        ...prev, 
        idCaLamViecGoc: '',
        NgayChuyen: ''
      }));
      return;
    }

    const shift = workSchedules.find(s => s.idCaLamViec === shiftId);
    console.log('Selected shift:', shift);
    
    setSelectedShift(shift);
    setFormData(prev => ({ 
      ...prev, 
      idCaLamViecGoc: shiftId,
      NgayChuyen: shift?.NgayLamViec || ''
    }));
  };

  const handleStaffSelect = (staffId) => {
    setErrors(prev => ({ ...prev, idNhanVienMoi: '' }));
    setFormData(prev => ({ ...prev, idNhanVienMoi: staffId }));
  };

  const handleInputChange = (field, value) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
    setFormData(prev => ({ ...prev, [field]: value }));
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

  // Filter available schedules (only pending/approved ones)
  const availableSchedules = workSchedules.filter(schedule => 
    schedule.TrangThai !== 'Đã hủy' && schedule.TrangThai !== 'Hoàn thành'
  );

  // Get available staff (exclude current shift employee if selected)
  const availableStaff = selectedShift 
    ? staff.filter(member => {
        const memberId = member._id || member.idNhanVien || member.idNguoiDung;
        const currentEmployeeId = selectedShift.idNhanVien;
        return memberId !== currentEmployeeId;
      })
    : staff;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
              <ArrowRightLeft className="w-6 h-6 text-blue-600" />
              <span>Tạo Yêu Cầu Chuyển Ca</span>
            </h3>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Chọn ca làm việc cần chuyển */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Chọn ca làm việc cần chuyển *
            </label>
            <select
              value={formData.idCaLamViecGoc}
              onChange={(e) => handleShiftSelect(e.target.value)}
              className={`w-full border rounded-lg px-3 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.idCaLamViecGoc ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            >
              <option value="">-- Chọn ca làm việc --</option>
              {availableSchedules.map(shift => (
                <option key={shift.idCaLamViec} value={shift.idCaLamViec}>
                  {formatDate(shift.NgayLamViec)} - {shift.LoaiCa} 
                  ({formatTime(shift.GioBD)}-{formatTime(shift.GioKT)}) 
                  - {shift.HoTenNguoiDung || 'Chưa có người'}
                  {shift.TenKhoa ? ` - ${shift.TenKhoa}` : ''}
                </option>
              ))}
            </select>
            {errors.idCaLamViecGoc && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.idCaLamViecGoc}</span>
              </p>
            )}
          </div>

          {/* Thông tin ca được chọn */}
          {selectedShift && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Thông tin ca làm việc được chọn</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Ngày:</span>
                    <span className="font-medium">{formatDate(selectedShift.NgayLamViec)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Ca:</span>
                    <span className="font-medium">{selectedShift.LoaiCa}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Thời gian:</span>
                    <span className="font-medium">
                      {formatTime(selectedShift.GioBD)} - {formatTime(selectedShift.GioKT)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Nhân viên hiện tại:</span>
                    <span className="font-medium">{selectedShift.HoTenNguoiDung}</span>
                  </div>
                </div>
                {selectedShift.TenKhoa && (
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Khoa:</span>
                    <span className="font-medium">{selectedShift.TenKhoa}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chọn nhân viên thay thế */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Nhân viên thay thế *
            </label>
            <select
              value={formData.idNhanVienMoi}
              onChange={(e) => handleStaffSelect(e.target.value)}
              className={`w-full border rounded-lg px-3 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.idNhanVienMoi ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading || !selectedShift}
            >
              <option value="">-- Chọn nhân viên thay thế --</option>
              {availableStaff.map(member => {
                const memberId = member._id || member.idNhanVien || member.idNguoiDung;
                const memberName = member.HoTen || `${member.firstName || ''} ${member.lastName || ''}`.trim();
                const department = member.department || member.TenKhoa || 'Chưa xác định';
                
                return (
                  <option key={memberId} value={memberId}>
                    {memberName} - {department}
                    {member.ChucVu ? ` (${member.ChucVu})` : ''}
                  </option>
                );
              })}
            </select>
            {errors.idNhanVienMoi && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.idNhanVienMoi}</span>
              </p>
            )}
            {!selectedShift && (
              <p className="text-gray-500 text-sm">
                Vui lòng chọn ca làm việc trước để chọn nhân viên thay thế
              </p>
            )}
          </div>

          {/* Ngày chuyển */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ngày chuyển (tùy chọn)
            </label>
            <input
              type="date"
              value={formData.NgayChuyen}
              onChange={(e) => handleInputChange('NgayChuyen', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <p className="text-gray-500 text-sm">
              Để trống sẽ sử dụng ngày của ca làm việc được chọn
            </p>
          </div>

          {/* Lý do chuyển ca */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Lý do chuyển ca *
            </label>
            <textarea
              value={formData.LyDo}
              onChange={(e) => handleInputChange('LyDo', e.target.value)}
              className={`w-full border rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                errors.LyDo ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Nhập lý do cần chuyển ca..."
              disabled={isLoading}
            />
            {errors.LyDo && (
              <p className="text-red-600 text-sm flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.LyDo}</span>
              </p>
            )}
          </div>

          {/* Tùy chọn bù ca */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="canBuCa"
              checked={formData.CanBuCa}
              onChange={(e) => handleInputChange('CanBuCa', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              disabled={isLoading}
            />
            <div>
              <label htmlFor="canBuCa" className="text-sm font-medium text-gray-700 cursor-pointer">
                Cần bù ca
              </label>
              <p className="text-gray-500 text-sm mt-1">
                Tạo ca bù cho nhân viên ban đầu sau khi chuyển ca
              </p>
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Ghi chú thêm
            </label>
            <textarea
              value={formData.GhiChu}
              onChange={(e) => handleInputChange('GhiChu', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              rows={2}
              placeholder="Ghi chú thêm về yêu cầu chuyển ca..."
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading || !formData.idCaLamViecGoc || !formData.idNhanVienMoi || !formData.LyDo?.trim()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Yêu Cầu'}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50 transition-colors"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransferModal;