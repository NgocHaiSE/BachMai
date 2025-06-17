import { useState } from "react";
import { toast } from "sonner";

// Create Leave Modal
const CreateLeaveModal: React.FC<{
  staff: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ staff, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    leaveType: 'vacation',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    isFullDay: true,
    reason: '',
    replacementStaffId: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    notes: ''
  });

  const leaveTypes = [
    { value: 'sick', label: 'Nghỉ ốm' },
    { value: 'vacation', label: 'Nghỉ phép' },
    { value: 'personal', label: 'Nghỉ việc riêng' },
    { value: 'emergency', label: 'Nghỉ khẩn cấp' },
    { value: 'maternity', label: 'Nghỉ thai sản' },
    { value: 'bereavement', label: 'Nghỉ tang' },
    { value: 'annual', label: 'Nghỉ phép năm' },
    { value: 'unpaid', label: 'Nghỉ không lương' }
  ];

  const handleSubmit = () => {
    if (!formData.staffId || !formData.startDate || !formData.endDate || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error('Ngày bắt đầu không thể sau ngày kết thúc');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Tạo Đơn Xin Nghỉ</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData(prev => ({...prev, staffId: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhân viên</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại nghỉ *</label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData(prev => ({...prev, leaveType: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              {leaveTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  const startDate = e.target.value;
                  setFormData(prev => ({
                    ...prev, 
                    startDate,
                    endDate: prev.endDate || startDate
                  }));
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({...prev, endDate: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min={formData.startDate}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isFullDay"
              checked={formData.isFullDay}
              onChange={(e) => setFormData(prev => ({...prev, isFullDay: e.target.checked}))}
              className="mr-2"
            />
            <label htmlFor="isFullDay" className="text-sm text-gray-700">
              Nghỉ cả ngày
            </label>
          </div>

          {!formData.isFullDay && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ giờ</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({...prev, startTime: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến giờ</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({...prev, endTime: e.target.value}))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do nghỉ *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Nhập lý do xin nghỉ..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên thay thế</label>
            <select
              value={formData.replacementStaffId}
              onChange={(e) => setFormData(prev => ({...prev, replacementStaffId: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhân viên thay thế (không bắt buộc)</option>
              {staff.filter(s => s._id !== formData.staffId).map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Liên hệ khẩn cấp</label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Họ tên"
                value={formData.emergencyContact.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  emergencyContact: {...prev.emergencyContact, name: e.target.value}
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="tel"
                placeholder="Số điện thoại"
                value={formData.emergencyContact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  emergencyContact: {...prev.emergencyContact, phone: e.target.value}
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Mối quan hệ"
                value={formData.emergencyContact.relationship}
                onChange={(e) => setFormData(prev => ({
                  ...prev, 
                  emergencyContact: {...prev.emergencyContact, relationship: e.target.value}
                }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({...prev, notes: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={2}
              placeholder="Ghi chú thêm..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Tạo Đơn
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
  