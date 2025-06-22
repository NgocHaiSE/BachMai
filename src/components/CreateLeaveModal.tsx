import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface CreateLeaveModalProps {
  staff: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}

const CreateLeaveModal: React.FC<CreateLeaveModalProps> = ({
  staff,
  onSubmit,
  onClose
}) => {
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

  // Tính toán số ngày nghỉ khi thay đổi ngày bắt đầu hoặc kết thúc
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

  const handleSubmit = () => {
    if (!formData.LoaiPhep || !formData.NgayBD || !formData.NgayKT || !formData.LyDo) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.NgayKT) < new Date(formData.NgayBD)) {
      toast.error('Ngày kết thúc phải sau ngày bắt đầu');
      return;
    }

    onSubmit(formData);
  };

  const leaveTypes = [
    'Phép năm',
    'Phép ốm',
    'Phép thai sản',
    'Phép việc riêng',
    'Phép không lương',
    'Phép khác'
  ];

  const relationshipTypes = [
    'Vợ/Chồng',
    'Con',
    'Cha/Mẹ',
    'Anh/Chị/Em',
    'Họ hàng',
    'Bạn bè',
    'Khác'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#280559]" />
            <span>Tạo Đơn Xin Nghỉ</span>
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Loại phép */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại phép *
            </label>
            <select
              value={formData.LoaiPhep}
              onChange={(e) => setFormData(prev => ({ ...prev, LoaiPhep: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {leaveTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Thời gian nghỉ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Từ ngày *
              </label>
              <input
                type="date"
                value={formData.NgayBD}
                onChange={(e) => setFormData(prev => ({ ...prev, NgayBD: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đến ngày *
              </label>
              <input
                type="date"
                value={formData.NgayKT}
                onChange={(e) => setFormData(prev => ({ ...prev, NgayKT: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          {/* Nghỉ cả ngày */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="nghiCaNgay"
              checked={formData.NghiCaNgay}
              onChange={(e) => setFormData(prev => ({ ...prev, NghiCaNgay: e.target.checked }))}
              className="w-4 h-4 text-[#280559] border-gray-300 rounded focus:ring-[#280559]"
            />
            <label htmlFor="nghiCaNgay" className="text-sm font-medium text-gray-700">
              Nghỉ cả ngày
            </label>
          </div>

          {/* Thời gian cụ thể nếu không nghỉ cả ngày */}
          {!formData.NghiCaNgay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Từ giờ
                </label>
                <input
                  type="time"
                  value={formData.GioBD}
                  onChange={(e) => setFormData(prev => ({ ...prev, GioBD: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đến giờ
                </label>
                <input
                  type="time"
                  value={formData.GioKT}
                  onChange={(e) => setFormData(prev => ({ ...prev, GioKT: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          {/* Tổng số ngày */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng số ngày nghỉ
            </label>
            <input
              type="number"
              value={formData.TongNgayNghi}
              onChange={(e) => setFormData(prev => ({ ...prev, TongNgayNghi: parseInt(e.target.value) || 1 }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              min="1"
              readOnly={formData.NgayBD && formData.NgayKT}
            />
          </div>

          {/* Lý do */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do nghỉ *
            </label>
            <textarea
              value={formData.LyDo}
              onChange={(e) => setFormData(prev => ({ ...prev, LyDo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Nhập lý do nghỉ phép..."
            />
          </div>

          {/* Thông tin người liên hệ */}
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3">Thông tin người liên hệ khi cần thiết</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ tên người liên hệ
                </label>
                <input
                  type="text"
                  value={formData.HoTenNguoiLienHe}
                  onChange={(e) => setFormData(prev => ({ ...prev, HoTenNguoiLienHe: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập họ tên..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.SDTNguoiLienHe}
                  onChange={(e) => setFormData(prev => ({ ...prev, SDTNguoiLienHe: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Nhập số điện thoại..."
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mối quan hệ
              </label>
              <select
                value={formData.MoiQuanHe}
                onChange={(e) => setFormData(prev => ({ ...prev, MoiQuanHe: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Chọn mối quan hệ</option>
                {relationshipTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Nhân viên thay thế */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhân viên thay thế (nếu có)
            </label>
            <select
              value={formData.idNhanVienThayThe}
              onChange={(e) => setFormData(prev => ({ ...prev, idNhanVienThayThe: e.target.value }))}
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
              Tạo Đơn Nghỉ
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

export default CreateLeaveModal;