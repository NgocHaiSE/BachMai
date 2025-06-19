import React, { useState } from 'react';
import {
  useWeeklySchedule,
  useScheduleStats,
  useStaff,
  useDepartments,
  useCreateShift,
  useConfirmShift,
  useDeleteShift,
  useCreateShiftChangeRequest,
  useShiftChangeRequests,
  useLeaveRequests,
  useApproveShiftChangeRequest,
  useCreateLeaveRequest,
  useApproveLeaveRequest
} from '../hooks/api';
import {
  Calendar,
  Clock,
  Plus,
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
  Sunset
} from 'lucide-react';
import { toast } from 'sonner';
import CreateTransferModal from './CreateTransferModal';
import CreateLeaveModal from './CreateLeaveModal';

interface WorkScheduleManagementProps { }

type TabType = 'schedules' | 'transfers' | 'leaves';

const WorkScheduleManagement: React.FC<WorkScheduleManagementProps> = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schedules');
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);
  const [showCreateLeaveModal, setShowCreateLeaveModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

// Queries
  const { data: workSchedules } = useWeeklySchedule({
    TuNgay: selectedWeek.start,
    DenNgay: selectedWeek.end,
    // idKhoa: filterDepartment || null
  });

  const { data: shiftTransfers } = useShiftChangeRequests({
    TrangThai: filterStatus || undefined
  });

  const { data: leaveRequests } = useLeaveRequests({
    TrangThai: filterStatus || undefined
  });

  const { data: staff } = useStaff('');
  const { data: scheduleStats } = useScheduleStats(new Date().toISOString().slice(0, 7));
  const { data: departments } = useDepartments();

  // Mutations
  const { mutate: createSchedule } = useCreateShift();
  const { mutate: updateScheduleStatus } = useConfirmShift();
  const { mutate: deleteSchedule } = useDeleteShift();
  const { mutate: createTransfer } = useCreateShiftChangeRequest();
  const { mutate: approveTransfer } = useApproveShiftChangeRequest();
  const { mutate: createLeave } = useCreateLeaveRequest();
  const { mutate: approveLeave } = useApproveLeaveRequest();

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

  const getShiftIcon = (shiftType: string) => {
    switch (shiftType) {
      case 'morning': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'afternoon': return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night': return <Moon className="w-4 h-4 text-blue-500" />;
      case 'full-day': return <Clock className="w-4 h-4 text-green-500" />;
      case 'on-call': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateSchedule = async (formData: any) => {
    try {
      await createSchedule(formData);
      toast.success('Tạo lịch làm việc thành công');
      setShowCreateScheduleModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleApproveTransfer = async (transferId: string, staffId: string) => {
    try {
      await approveTransfer({ id: transferId, approvedBy: staffId });
      toast.success('Phê duyệt chuyển ca thành công');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'schedules':
        return <SchedulesTab
          schedules={workSchedules || []}
          onCreateSchedule={() => setShowCreateScheduleModal(true)}
          selectedWeek={selectedWeek}
          setSelectedWeek={setSelectedWeek}
          departments={departments || []}
          filterDepartment={filterDepartment}
          setFilterDepartment={setFilterDepartment}
        />;
      case 'transfers':
        return <TransfersTab
          transfers={shiftTransfers || []}
          onCreateTransfer={() => setShowCreateTransferModal(true)}
          onApprove={handleApproveTransfer}
        />;
      case 'leaves':
        return <LeavesTab
          leaves={leaveRequests || []}
          onCreateLeave={() => setShowCreateLeaveModal(true)}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản Lý Lịch Làm Việc</h1>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng ca làm việc</p>
              <p className="text-2xl font-bold text-gray-900">{scheduleStats?.totalSchedules || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ca đã xác nhận</p>
              <p className="text-2xl font-bold text-green-600">{scheduleStats?.confirmedSchedules || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Yêu cầu chuyển ca</p>
              <p className="text-2xl font-bold">{shiftTransfers?.filter(t => t.status === 'pending').length || 0}</p>
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
              <p className="text-2xl font-bold text-purple-600">{leaveRequests?.filter(l => l.status === 'pending').length || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <FileText className="w-6 h-6 text-purple-600" />
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

      {/* Modals */}
      {showCreateScheduleModal && (
        <CreateScheduleModal
          staff={staff || []}
          onSubmit={handleCreateSchedule}
          onClose={() => setShowCreateScheduleModal(false)}
        />
      )}

      {showCreateTransferModal && (
        <CreateTransferModal
          staff={staff || []}
          workSchedules={workSchedules || []}
          onSubmit={async (data) => {
            try {
              await createTransfer(data);
              toast.success('Tạo yêu cầu chuyển ca thành công');
              setShowCreateTransferModal(false);
            } catch (error: any) {
              toast.error(error.message);
            }
          }}
          onClose={() => setShowCreateTransferModal(false)}
        />
      )}

      {showCreateLeaveModal && (
        <CreateLeaveModal
          staff={staff || []}
          onSubmit={async (data) => {
            try {
              await createLeave(data);
              toast.success('Tạo đơn xin nghỉ thành công');
              setShowCreateLeaveModal(false);
            } catch (error: any) {
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
  selectedWeek: { start: string; end: string };
  setSelectedWeek: (week: { start: string; end: string }) => void;
departments: any[];
  filterDepartment: string;
  setFilterDepartment: (id: string) => void;
}> = ({
  schedules,
  onCreateSchedule,
  selectedWeek,
  setSelectedWeek,
  departments,
  filterDepartment,
  setFilterDepartment
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');

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
      const schedDate = new Date(s.date).toISOString().split('T')[0];
      return schedDate === dateStr;
    });
  };

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
              className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
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
                    key={schedule._id}
                    className="p-2 rounded bg-blue-50 border border-blue-200 text-xs"
                  >
                    <div className="flex items-center space-x-1 mb-1">
                      {schedule.shiftType && getShiftIcon(schedule.shiftType)}
                      <span className="font-medium">{schedule.staffFullName}</span>
                    </div>
                    <div className="text-gray-600">
                      {schedule.startTime} - {schedule.endTime}
                    </div>
                    <div className={`inline-block px-1 py-0.5 rounded text-xs ${getStatusColor(schedule.status)}`}>
                      {schedule.status}
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Danh Sách Lịch Làm Việc</h3>
        <button
          onClick={onCreateSchedule}
          className="btn-primary px-4 py-2  flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Ca Làm</span>
        </button>
      </div>

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {schedule.shiftType && getShiftIcon(schedule.shiftType)}
                <div>
                  <div className="font-medium">{schedule.staffFullName}</div>
                  <div className="text-sm text-gray-600">{schedule.department}</div>
                  <div className="text-sm text-gray-600">{schedule.shiftType} - {schedule.workType}</div>
                </div>
              </div>
              <div className="text-right">
                 <div className="font-medium">{new Date(schedule.date).toLocaleDateString('vi-VN')}</div>
                <div className="text-sm text-gray-600">{schedule.startTime} - {schedule.endTime}</div>
                <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(schedule.status)}`}>
                  {schedule.status}
                </div>
                {schedule.notes && (
                  <div className="text-xs text-gray-500 mt-1">{schedule.notes}</div>
                )}
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
  onApprove: (transferId: string, staffId: string) => void;
}> = ({ transfers, onCreateTransfer, onApprove }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Yêu Cầu Chuyển Ca</h3>
        <button
          onClick={onCreateTransfer}
          className="btn-primary px-4 py-2 rounded-lg  flex items-center space-x-2"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Yêu Cầu Chuyển Ca</span>
        </button>
      </div>

      <div className="space-y-4">
        {transfers.map((transfer) => (
          <div key={transfer._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <ArrowRightLeft className="w-5 h-5 text-[#280559]" />
                <div>
                  <div className="font-medium">{transfer.transferCode}</div>
                  <div className="text-sm text-gray-600">{transfer.transferDate}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(transfer.status)}`}>
                {transfer.status}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Từ:</div>
                <div className="font-medium">{transfer.fromStaffFullName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đến:</div>
                <div className="font-medium">{transfer.toStaffFullName}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <strong>Lý do:</strong> {transfer.reason}
            </div>

            {transfer.status === 'pending' && (
              <div className="flex space-x-2">
                <button
                  onClick={() => onApprove(transfer._id, 'current-user-staff-id')}
                  className="btn-primary px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Duyệt</span>
                </button>
                <button className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex items-center space-x-1">
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
}> = ({ leaves, onCreateLeave }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Đơn Xin Nghỉ</h3>
        <button
          onClick={onCreateLeave}
          className="btn-primary px-4 py-2 rounded-lg  flex items-center space-x-2"
        >
          <FileText className="w-4 h-4" />
          <span>Tạo Đơn Xin Nghỉ</span>
        </button>
      </div>

      <div className="space-y-4">
        {leaves.map((leave) => (
          <div key={leave._id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-[#280559]" />
                <div>
                  <div className="font-medium">{leave.requestCode}</div>
                  <div className="text-sm text-gray-600">{leave.staffFullName}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(leave.status)}`}>
                {leave.status}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3">
              <div>
                <div className="text-sm text-gray-600">Loại nghỉ:</div>
                <div className="font-medium">{leave.leaveType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Từ ngày:</div>
                <div className="font-medium">{leave.startDate}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đến ngày:</div>
                <div className="font-medium">{leave.endDate}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600 mb-3">
              <strong>Lý do:</strong> {leave.reason}
            </div>

            <div className="text-sm text-gray-600">
              <strong>Tổng số ngày:</strong> {leave.totalDays} ngày
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Create Schedule Modal
const CreateScheduleModal: React.FC<{
  staff: any[];
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ staff, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    staffId: '',
    date: '',
    shiftType: 'morning',
    startTime: '06:00',
    endTime: '14:00',
    department: '',
    workType: 'regular',
    notes: ''
  });

  const departments = ['Khoa Nội', 'Khoa Ngoại', 'Khoa Sản', 'Khoa Nhi', 'Cấp Cứu'];

  const handleSubmit = () => {
    if (!formData.staffId || !formData.date || !formData.department) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Tạo Ca Làm Việc Mới</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
            <select
              value={formData.staffId}
              onChange={(e) => setFormData(prev => ({ ...prev, staffId: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhân viên</option>
              {staff.map(s => (
                <option key={s._id} value={s._id}>
                  {s.fullName || `${s.firstName} ${s.lastName}`} - {s.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày làm việc *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
            <select
              value={formData.shiftType}
              onChange={(e) => {
                const shiftType = e.target.value;
                let startTime = '06:00', endTime = '14:00';

                switch (shiftType) {
                  case 'morning':
                    startTime = '06:00'; endTime = '14:00';
                    break;
                  case 'afternoon':
                    startTime = '14:00'; endTime = '22:00';
                    break;
                  case 'night':
                    startTime = '22:00'; endTime = '06:00';
                    break;
                  case 'full-day':
                    startTime = '08:00'; endTime = '17:00';
                    break;
                  case 'on-call':
                    startTime = '18:00'; endTime = '08:00';
                    break;
                }

                setFormData(prev => ({ ...prev, shiftType, startTime, endTime }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="morning">Ca sáng (6:00-14:00)</option>
              <option value="afternoon">Ca chiều (14:00-22:00)</option>
              <option value="night">Ca đêm (22:00-6:00)</option>
              <option value="full-day">Ca ngày (8:00-17:00)</option>
              <option value="on-call">Ca trực</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoa phòng *</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn khoa phòng</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc</label>
            <select
              value={formData.workType}
              onChange={(e) => setFormData(prev => ({ ...prev, workType: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="regular">Thường</option>
              <option value="overtime">Tăng ca</option>
              <option value="holiday">Ngày lễ</option>
              <option value="emergency">Cấp cứu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Ghi chú thêm về ca làm việc..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              onClick={handleSubmit}
              className="flex-1 btn-primary text-white py-2 px-4 rounded-lg  transition-colors"
            >
              Tạo Ca Làm
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

function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'approved': case 'confirmed': return 'bg-green-100 text-green-800';
    case 'rejected': case 'cancelled': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getShiftIcon(shiftType: string) {
  switch (shiftType) {
    case 'morning': return <Sun className="w-4 h-4 text-yellow-500" />;
    case 'afternoon': return <Sunset className="w-4 h-4 text-orange-500" />;
    case 'night': return <Moon className="w-4 h-4 text-blue-500" />;
    case 'full-day': return <Clock className="w-4 h-4 text-green-500" />;
    case 'on-call': return <AlertCircle className="w-4 h-4 text-red-500" />;
    default: return <Clock className="w-4 h-4" />;
  }
}
export default WorkScheduleManagement;