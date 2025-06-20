import React, { useState, useEffect } from 'react';
import {
  useWeeklySchedule,
  useSchedules,
  useScheduleStats,
  useStaff,
  useDepartments,
  useCreateShift,
  useUpdateShift,
  useConfirmShift,
  useDeleteShift,
  useCreateShiftChangeRequest,
  useShiftChangeRequests,
  useLeaveRequests,
  useApproveShiftChangeRequest,
  useCreateLeaveRequest,
  useApproveLeaveRequest,
  useNhanVien
} from '../hooks/api';
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
  const [editingSchedule, setEditingSchedule] = useState<any | null>(null);
  const [showCreateTransferModal, setShowCreateTransferModal] = useState(false);
  const [showCreateLeaveModal, setShowCreateLeaveModal] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

// Queries
  const { data: workSchedules, refetch: refetchSchedules } = useWeeklySchedule({
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
  const {data : nhanvien} = useNhanVien()

  // Mutations
  const { mutate: createSchedule } = useCreateShift();
  const { mutate: updateSchedule } = useUpdateShift();
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

  const handleSaveSchedule = async (formData: any) => {
    try {
      if (editingSchedule) {
        await updateSchedule({ id: editingSchedule._id, ...formData });
        toast.success('Cập nhật ca làm việc thành công');
      } else {
        await createSchedule(formData);
        toast.success('Tạo lịch làm việc thành công');
      }
      setShowCreateScheduleModal(false);
      setEditingSchedule(null);
      refetchSchedules();
      setShowCreateScheduleModal(false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) {
      try {
        await deleteSchedule(id);
        toast.success('Xóa ca làm việc thành công');
        refetchSchedules();
      } catch (error: any) {
        toast.error(error.message);
      }
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
          nhanvien= {nhanvien || []}
          staff={staff || []}
          departments={departments || []}
          schedule={editingSchedule}
          onSubmit={handleSaveSchedule}
          onClose={() => {
            setShowCreateScheduleModal(false);
            setEditingSchedule(null);
          }}
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
  onEditSchedule: (schedule: any) => void;
  onDeleteSchedule: (id: string) => void;
  selectedWeek: { start: string; end: string };
  setSelectedWeek: (week: { start: string; end: string }) => void;
  departments: any[];
  filterDepartment: string;
  setFilterDepartment: (id: string) => void;
}> = ({
  schedules,
  onCreateSchedule,
  onEditSchedule,
  onDeleteSchedule,
  selectedWeek,
  setSelectedWeek,
  departments,
  filterDepartment,
  setFilterDepartment
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'calendar' | 'month'>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const getMonthRange = (month: string) => {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  };

  const monthRange = getMonthRange(selectedMonth);
  const { data: monthlySchedules } = useSchedules({
    TuNgay: monthRange.start,
    DenNgay: monthRange.end,
    idKhoa: filterDepartment || undefined,
  });

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

  const getMonthSchedulesForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return (monthlySchedules || []).filter(s => {
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
                    <div className={`inline-block px-2 py-1 rounded text-xs ${getStatusColor(schedule.status)}`}>{schedule.status}</div>
                    {schedule.notes && (
                  <div className="text-xs text-gray-500">{schedule.notes}</div>
                )}
                <div className="flex justify-end space-x-2 pt-1">
                  <button onClick={() => onEditSchedule(schedule)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Chỉnh sửa">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteSchedule(schedule._id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Xóa">
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

  if (viewMode === 'month') {
    const [year, month] = selectedMonth.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const daysInMonth = new Date(year, month, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const days: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month - 1, d));
    }

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const dt = new Date(year, month - 2, 1);
                setSelectedMonth(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
              }}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              ←
            </button>
            <h3 className="text-lg font-semibold">
              {`Tháng ${month}/${year}`}
            </h3>
            <button
              onClick={() => {
                const dt = new Date(year, month, 1);
                setSelectedMonth(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`);
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
              className={`px-3 py-1 text-sm rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'}`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'calendar' ? 'bg-blue-100 text-[#280559]' : 'text-gray-600'}`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm rounded ${viewMode === 'month' ? 'bg-blue-100 text-[#280559]' : 'text-gray-600'}`}
            >
              Tháng
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

        <div className="grid grid-cols-7 gap-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
            <div key={d} className="text-center font-medium text-gray-600">{d}</div>
          ))}
          {days.map((day, idx) => (
            <div key={idx} className="min-h-[120px] border border-gray-200 rounded p-1 text-sm">
              {day && (
                <div className="font-medium mb-1">{day.getDate()}</div>
              )}
              {day && getMonthSchedulesForDate(day).map((schedule) => (
                <div key={schedule._id} className="mb-1 p-1 rounded bg-blue-50 border border-blue-200">
                  <div className="text-xs font-medium">{schedule.staffFullName}</div>
                  <div className="text-xs text-gray-600">{schedule.startTime}-{schedule.endTime}</div>
                </div>
              ))}
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
          className="btn-primary px-4 py-2 rounded-lg flex items-center space-x-2"
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
  nhanvien: any[];
  staff: any[];
  departments: any[];
  schedule?: any;
  onSubmit: (data: any) => void;
  onClose: () => void;
}> = ({ nhanvien, staff, departments, schedule, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    idNhanVien: '',
    NgayLamViec: '',
    LoaiCa: 'morning',
    GioBD: '06:00',
    GioKT: '14:00',
    LoaiCongViec: 'regular',
    GhiChu: '',
    idKhoa: '',
    idLichTongThe: 'LTT0001',
  });

   useEffect(() => {
    if (schedule) {
      setFormData({
        idNhanVien: schedule.idNhanVien || '',
        NgayLamViec: schedule.date || '',
        LoaiCa: schedule.shiftType || 'morning',
        GioBD: schedule.startTime || '06:00',
        GioKT: schedule.endTime || '14:00',
        LoaiCongViec: schedule.workType || 'regular',
        GhiChu: schedule.notes || '',
        idKhoa: schedule.department || schedule.idKhoa || '',
        idLichTongThe: schedule.idLichTongThe || 'LTT0001',
      });
    }
  }, [schedule]);

  const handleSubmit = () => {
    if (!formData.idNhanVien || !formData.NgayLamViec || !formData.idKhoa) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">{schedule ? 'Chỉnh Sửa Ca Làm' : 'Tạo Ca Làm Việc Mới'}</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nhân viên *</label>
            <select
              value={formData.idNhanVien}
              onChange={(e) => setFormData(prev => ({ ...prev, idNhanVien: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn nhân viên</option>
              {nhanvien.map(s => (
                <option key={s._id} value={s.idNhanVien}>
                  {s.HoTen}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày làm việc *</label>
            <input
              type="date"
              value={formData.NgayLamViec}
              onChange={(e) => setFormData(prev => ({ ...prev, NgayLamViec: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ca làm việc</label>
            <select
              value={formData.LoaiCa}
              onChange={(e) => {
                const shiftType = e.target.value;
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

                setFormData(prev => ({ ...prev, LoaiCa: shiftType, GioBD: startTime, GioKT: endTime }));
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
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
                onChange={(e) => setFormData(prev => ({ ...prev, GioBD: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
              <input
                type="time"
                value={formData.GioKT}
                onChange={(e) => setFormData(prev => ({ ...prev, GioKT: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Khoa phòng *</label>
            <select
              value={formData.idKhoa}
              onChange={(e) => setFormData(prev => ({ ...prev, idKhoa: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">Chọn khoa phòng</option>
              {departments.map((dept: any) => (
                <option key={dept.idKhoa || dept._id} value={dept.idKhoa || dept._id}>
                  {dept.TenKhoa || dept.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Loại công việc</label>
            <select
              value={formData.LoaiCongViec}
              onChange={(e) => setFormData(prev => ({ ...prev, LoaiCongViec: e.target.value }))}
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
              value={formData.GhiChu}
              onChange={(e) => setFormData(prev => ({ ...prev, GhiChu: e.target.value }))}
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
              {schedule ? 'Cập Nhật' : 'Tạo Ca Làm'}
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