import React from "react";
import { useState } from "react";
import { toast } from "sonner";

const CreateTransferModal: React.FC<{
  staff: any[];
  workSchedules: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ staff, workSchedules, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    fromStaffId: '',
    toStaffId: '',
    originalScheduleId: '',
    transferDate: '',
    reason: '',
    compensationRequired: false,
    notes: ''
  });

  const [selectedFromStaff, setSelectedFromStaff] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState<any[]>([]);

  // Lọc lịch làm việc khi chọn nhân viên
  React.useEffect(() => {
    if (selectedFromStaff) {
      const staffSchedules = workSchedules.filter(s => 
        s.staffId === selectedFromStaff && 
        (s.status === 'scheduled' || s.status === 'confirmed') &&
        new Date(s.date) >= new Date()
      );
      setAvailableSchedules(staffSchedules);
    } else {
      setAvailableSchedules([]);
    }
  }, [selectedFromStaff, workSchedules]);

  const handleSubmit = () => {
    if (!formData.fromStaffId || !formData.toStaffId || !formData.originalScheduleId || !formData.reason) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    if (formData.fromStaffId === formData.toStaffId) {
      toast.error('Không thể chuyển ca cho chính mình');
      return;
    }

    const selectedSchedule = availableSchedules.find(s => s._id === formData.originalScheduleId);
    if (selectedSchedule) {
      onSubmit({
        ...formData,
        transferDate: selectedSchedule.date,
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Tạo Yêu Cầu Chuyển Ca</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên chuyển ca *</label>
            <select
              value={formData.fromStaffId}
              onChange={(e) => {
                const staffId = e.target.value;
                setFormData(prev => ({...prev, fromStaffId: staffId, originalScheduleId: ''}));
                setSelectedFromStaff(staffId);
              }}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc cần chuyển *</label>
            <select
              value={formData.originalScheduleId}
              onChange={(e) => setFormData(prev => ({...prev, originalScheduleId: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              disabled={!selectedFromStaff}
            >
              <option value="">Chọn ca làm việc</option>
              {availableSchedules.map(schedule => (
                <option key={schedule._id} value={schedule._id}>
                  {schedule.date} - {schedule.startTime}-{schedule.endTime} ({schedule.shiftType})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên nhận ca *</label>
            <select
              value={formData.toStaffId}
              onChange={(e) => setFormData(prev => ({...prev, toStaffId: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhân viên</option>
              {staff.filter(s => s._id !== formData.fromStaffId).map(s => (
                <option key={s._id} value={s._id}>
                  {s.firstName} {s.lastName} - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do chuyển ca *</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({...prev, reason: e.target.value}))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Nhập lý do cần chuyển ca..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="compensationRequired"
              checked={formData.compensationRequired}
              onChange={(e) => setFormData(prev => ({...prev, compensationRequired: e.target.checked}))}
              className="mr-2"
            />
            <label htmlFor="compensationRequired" className="text-sm text-gray-700">
              Yêu cầu ca bù
            </label>
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
              className="flex-1 btn-primary text-white py-2 px-4 rounded-lg  transition-colors"
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