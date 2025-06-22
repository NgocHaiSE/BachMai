import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTransferModalProps {
  staff: any[];
  workSchedules: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const CreateTransferModal: React.FC<CreateTransferModalProps> = ({
  staff,
  workSchedules,
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

  const [selectedShift, setSelectedShift] = useState<any>(null);

  const handleShiftSelect = (shiftId: string) => {
    const shift = workSchedules.find(s => s._id === shiftId);
    setSelectedShift(shift);
    setFormData(prev => ({ 
      ...prev, 
      idCaLamViecGoc: shiftId,
      NgayChuyen: shift?.date || ''
    }));
  };

  const handleSubmit = () => {
    if (!formData.idCaLamViecGoc || !formData.idNhanVienMoi || !formData.LyDo) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-[#280559]" />
            <span>Tạo Yêu Cầu Chuyển Ca</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Chọn ca làm việc gốc */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn ca làm việc cần chuyển *
            </label>
            <select
              value={formData.idCaLamViecGoc}
              onChange={(e) => handleShiftSelect(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn ca làm việc</option>
              {workSchedules.map(shift => (
                <option key={shift._id} value={shift._id}>
                  {new Date(shift.date).toLocaleDateString('vi-VN')} - {shift.shiftType} ({shift.startTime}-{shift.endTime}) - {shift.staffFullName}
                </option>
              ))}
            </select>
          </div>

          {/* Hiển thị thông tin ca được chọn */}
          {selectedShift && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin ca làm việc:</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ngày:</span>
                  <span className="ml-2 font-medium">{new Date(selectedShift.date).toLocaleDateString('vi-VN')}</span>
                </div>
                <div>
                  <span className="text-gray-600">Ca:</span>
                  <span className="ml-2 font-medium">{selectedShift.shiftType}</span>
                </div>
                <div>
                  <span className="text-gray-600">Thời gian:</span>
                  <span className="ml-2 font-medium">{selectedShift.startTime} - {selectedShift.endTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">Nhân viên hiện tại:</span>
                  <span className="ml-2 font-medium">{selectedShift.staffFullName}</span>
                </div>
              </div>
            </div>
          )}

          {/* Chọn nhân viên mới */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhân viên thay thế *
            </label>
            <select
              value={formData.idNhanVienMoi}
              onChange={(e) => setFormData(prev => ({ ...prev, idNhanVienMoi: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhân viên thay thế</option>
              {staff.map(member => (
                <option key={member._id || member.idNhanVien} value={member._id || member.idNhanVien}>
                  {member.firstName ? `${member.firstName} ${member.lastName}` : member.HoTen} - {member.department}
                </option>
              ))}
            </select>
          </div>

          {/* Ngày chuyển */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày chuyển
            </label>
            <input
              type="date"
              value={formData.NgayChuyen}
              onChange={(e) => setFormData(prev => ({ ...prev, NgayChuyen: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do chuyển ca *
            </label>
            <textarea
              value={formData.LyDo}
              onChange={(e) => setFormData(prev => ({ ...prev, LyDo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Nhập lý do cần chuyển ca..."
            />
          </div>

          {/* Cần bù ca */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="canBuCa"
              checked={formData.CanBuCa}
              onChange={(e) => setFormData(prev => ({ ...prev, CanBuCa: e.target.checked }))}
              className="w-4 h-4 text-[#280559] border-gray-300 rounded focus:ring-[#280559]"
            />
            <label htmlFor="canBuCa" className="text-sm font-medium text-gray-700">
              Cần bù ca
            </label>
          </div>

          {/* Ghi chú */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú
            </label>
            <textarea
              value={formData.GhiChu}
              onChange={(e) => setFormData(prev => ({ ...prev, GhiChu: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={2}
              placeholder="Ghi chú thêm..."
            />
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-[#280559] text-white py-2 px-4 rounded-lg hover:bg-[#1a0340] transition-colors"
            >
              Tạo Yêu Cầu
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
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