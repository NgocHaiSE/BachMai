import { useState } from "react";
import { 
  Users, 
  Calendar, 
  Stethoscope, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  User,
  Building2,
  FileText,
  ArrowRightLeft,
  Loader2,
  RefreshCw
} from "lucide-react";
import { 
  useDashboardStats, 
  useDashboardActivity,
  usePatients,
  useAppointments,
  useTransferRequests,
  useStaff
} from "../hooks/api";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  // Get dashboard data
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: activity, loading: activityLoading } = useDashboardActivity();
  
  // Get real data for better dashboard
  const { data: patients, loading: patientsLoading } = usePatients('');
  const { data: appointments, loading: appointmentsLoading } = useAppointments({
    TuNgay: new Date().toISOString().split('T')[0],
    DenNgay: new Date().toISOString().split('T')[0]
  });
  const { data: transferRequests } = useTransferRequests({
    TuNgay: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    DenNgay: new Date().toISOString().split('T')[0]
  });
  const { data: staff } = useStaff('');

  // Calculate real statistics
  const realStats = {
    todayAppointments: appointments?.length || 0,
    totalPatients: patients?.length || 0,
    activeStaff: staff?.filter((s: any) => s.TrangThai === 'Đang hoạt động')?.length || 0,
    pendingAppointments: appointments?.filter((a: any) => a.TrangThai === 'Đang chờ')?.length || 0,
    completedToday: appointments?.filter((a: any) => a.TrangThai === 'Đã hoàn thành')?.length || 0,
    pendingTransfers: transferRequests?.filter((t: any) => t.TrangThai === 'Đang chờ')?.length || 0,
  };

  const periodOptions = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'quarter', label: 'Quý này' }
  ];

  const handleRefresh = () => {
    refetchStats();
  };

  if (statsError) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải dữ liệu dashboard</h3>
          <p className="text-gray-600 mb-4">{statsError}</p>
          <button
            onClick={handleRefresh}
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Tổng quan hoạt động hệ thống bệnh viện</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            disabled={statsLoading}
          >
            {statsLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Lịch khám hôm nay"
          value={realStats.todayAppointments}
          change={+12}
          icon={Calendar}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          loading={appointmentsLoading}
        />
        <StatsCard
          title="Tổng bệnh nhân"
          value={realStats.totalPatients}
          change={+8}
          icon={Users}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          loading={patientsLoading}
        />
        <StatsCard
          title="Nhân viên hoạt động"
          value={realStats.activeStaff}
          change={+2}
          icon={Stethoscope}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          loading={statsLoading}
        />
        <StatsCard
          title="Chờ xử lý"
          value={realStats.pendingAppointments}
          change={-5}
          icon={Clock}
          iconColor="text-orange-600"
          iconBg="bg-orange-100"
          loading={appointmentsLoading}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Hoàn thành hôm nay"
          value={realStats.completedToday}
          change={+15}
          icon={CheckCircle}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
          loading={appointmentsLoading}
          className="lg:col-span-1"
        />
        <StatsCard
          title="Yêu cầu chuyển viện"
          value={realStats.pendingTransfers}
          change={+3}
          icon={ArrowRightLeft}
          iconColor="text-indigo-600"
          iconBg="bg-indigo-100"
          loading={statsLoading}
          className="lg:col-span-1"
        />
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Hiệu suất tổng thể</p>
              <p className="text-3xl font-bold mt-2">94.2%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span className="text-sm">+2.4% so với tuần trước</span>
              </div>
            </div>
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Thao Tác Nhanh</h3>
          <div className="space-y-4">
            <QuickActionButton
              icon={User}
              title="Đăng ký khám bệnh"
              description="Tạo phiếu đăng ký khám cho bệnh nhân mới"
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <QuickActionButton
              icon={Calendar}
              title="Đặt lịch khám"
              description="Sắp xếp lịch hẹn với bác sĩ"
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <QuickActionButton
              icon={ArrowRightLeft}
              title="Yêu cầu chuyển viện"
              description="Tạo yêu cầu chuyển viện cho bệnh nhân"
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
            <QuickActionButton
              icon={FileText}
              title="Quản lý hồ sơ"
              description="Xem và cập nhật hồ sơ bệnh án"
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Hoạt Động Gần Đây</h3>
            <span className="text-sm text-gray-500">Cập nhật 5 phút trước</span>
          </div>
          <div className="space-y-4">
            {activityLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : (
              <>
                <ActivityItem
                  icon={User}
                  title="Bệnh nhân mới đăng ký"
                  description="Nguyễn Văn A đã đăng ký khám tại khoa Nội"
                  time="5 phút trước"
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
                <ActivityItem
                  icon={Calendar}
                  title="Lịch khám được xác nhận"
                  description="Lịch khám của bệnh nhân Trần Thị B đã được xác nhận"
                  time="10 phút trước"
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                />
                <ActivityItem
                  icon={CheckCircle}
                  title="Khám bệnh hoàn thành"
                  description="BS. Lê Văn C đã hoàn thành khám cho 3 bệnh nhân"
                  time="15 phút trước"
                  color="text-emerald-600"
                  bgColor="bg-emerald-100"
                />
                <ActivityItem
                  icon={ArrowRightLeft}
                  title="Yêu cầu chuyển viện"
                  description="Yêu cầu chuyển viện bệnh nhân Phạm Văn D đã được phê duyệt"
                  time="30 phút trước"
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                />
                <ActivityItem
                  icon={AlertTriangle}
                  title="Cảnh báo hệ thống"
                  description="Số lượng bệnh nhân chờ khám đang tăng cao"
                  time="1 giờ trước"
                  color="text-orange-600"
                  bgColor="bg-orange-100"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Lịch Khám Hôm Nay</h3>
            <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Xem tất cả</span>
          </div>
          <div className="space-y-4">
            {appointmentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : appointments && appointments.length > 0 ? (
              appointments.slice(0, 5).map((appointment: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.BenhNhan?.HoTen || 'N/A'}</p>
                      <p className="text-sm text-gray-500">{appointment.TenKhoa || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {appointment.NgayLap ? new Date(appointment.NgayLap).toLocaleTimeString('vi-VN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      }) : 'N/A'}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.TrangThai === 'Đã hoàn thành' ? 'bg-green-100 text-green-800' :
                      appointment.TrangThai === 'Đang chờ' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {appointment.TrangThai || 'Đang chờ'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Không có lịch khám nào hôm nay</p>
              </div>
            )}
          </div>
        </div>

        {/* Department Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Tình Trạng Các Khoa</h3>
            <span className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer">Xem chi tiết</span>
          </div>
          <div className="space-y-4">
            <DepartmentStatusItem
              name="Nội tổng hợp"
              patients={12}
              capacity={20}
              status="normal"
            />
            <DepartmentStatusItem
              name="Ngoại tổng hợp"
              patients={8}
              capacity={15}
              status="normal"
            />
            <DepartmentStatusItem
              name="Tim mạch"
              patients={18}
              capacity={20}
              status="busy"
            />
            <DepartmentStatusItem
              name="Cấp cứu"
              patients={25}
              capacity={30}
              status="critical"
            />
            <DepartmentStatusItem
              name="Nhi khoa"
              patients={6}
              capacity={12}
              status="normal"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, change, icon: Icon, iconColor, iconBg, loading, className = "" }: any) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          {loading ? (
            <div className="flex items-center mt-2">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : (
            <>
              <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                {change > 0 ? (
                  <ArrowUpRight className="w-4 h-4 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(change)}%
                </span>
                <span className="text-gray-500 text-sm ml-1">vs tháng trước</span>
              </div>
            </>
          )}
        </div>
        <div className={`w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon: Icon, title, description, color, bgColor }: any) {
  return (
    <button className="w-full flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors text-left">
      <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mr-4`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </button>
  );
}

function ActivityItem({ icon: Icon, title, description, time, color, bgColor }: any) {
  return (
    <div className="flex items-start space-x-3">
      <div className={`w-8 h-8 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{time}</p>
      </div>
    </div>
  );
}

function DepartmentStatusItem({ name, patients, capacity, status }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal': return 'Bình thường';
      case 'busy': return 'Bận';
      case 'critical': return 'Quá tải';
      default: return 'Không xác định';
    }
  };

  const percentage = (patients / capacity) * 100;

  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
          <Building2 className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-sm text-gray-500">{patients}/{capacity} bệnh nhân</p>
        </div>
      </div>
      <div className="text-right">
        <div className="flex items-center mb-1">
          <div className={`w-2 h-2 ${getStatusColor(status)} rounded-full mr-2`}></div>
          <span className="text-sm font-medium text-gray-900">{getStatusText(status)}</span>
        </div>
        <div className="w-16 h-2 bg-gray-200 rounded-full">
          <div 
            className={`h-2 ${getStatusColor(status)} rounded-full`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}