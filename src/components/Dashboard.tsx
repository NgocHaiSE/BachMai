import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar, Users, UserCheck, Clock, TrendingUp, Loader2 } from "lucide-react";

export default function Dashboard() {
  const stats = useQuery(api.dashboard.getStats);
  const activity = useQuery(api.dashboard.getRecentActivity);

  if (stats === undefined || activity === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Lịch Khám Hôm Nay",
      value: stats.todayAppointments,
      icon: Calendar,
      color: "bg-blue-50 text-blue-700",
      bgGradient: "from-blue-500 to-blue-600",
      change: "+12%",
      changeType: "increase"
    },
    {
      title: "Tổng Số Bệnh Nhân",
      value: stats.totalPatients,
      icon: Users,
      color: "bg-green-50 text-green-700",
      bgGradient: "from-green-500 to-green-600",
      change: "+8%",
      changeType: "increase"
    },
    {
      title: "Nhân Viên Đang Làm",
      value: stats.activeStaff,
      icon: UserCheck,
      color: "bg-purple-50 text-purple-700",
      bgGradient: "from-purple-500 to-purple-600",
      change: "100%",
      changeType: "stable"
    },
    {
      title: "Lịch Hẹn Chờ Xử Lý",
      value: stats.pendingAppointments,
      icon: Clock,
      color: "bg-orange-50 text-orange-700",
      bgGradient: "from-orange-500 to-orange-600",
      change: "-5%",
      changeType: "decrease"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Tổng Quan</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.bgGradient} flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`flex items-center text-sm ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      stat.changeType === 'decrease' ? 'rotate-180' : ''
                    }`} />
                    {stat.change}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">so với tháng trước</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Appointments */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Lịch Khám Gần Đây
            </h3>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {activity.recentAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chưa có lịch khám nào</p>
              </div>
            ) : (
              activity.recentAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                        với BS. {appointment.staff?.firstName} {appointment.staff?.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {appointment.appointmentDate} lúc {appointment.appointmentTime}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    appointment.status === "completed" ? "bg-green-100 text-green-800" :
                    appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                    appointment.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {appointment.status === "completed" ? "Hoàn thành" :
                     appointment.status === "confirmed" ? "Đã xác nhận" :
                     appointment.status === "scheduled" ? "Đã lên lịch" :
                     appointment.status === "cancelled" ? "Đã hủy" :
                     "Vắng mặt"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2 text-green-600" />
              Bệnh Nhân Mới
            </h3>
            <button className="text-green-600 hover:text-green-800 text-sm font-medium">
              Xem tất cả
            </button>
          </div>
          <div className="space-y-4">
            {activity.recentPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Chưa có bệnh nhân mới</p>
              </div>
            ) : (
              activity.recentPatients.map((patient) => (
                <div key={patient._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                      <UserCheck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {patient.firstName} {patient.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{patient.phone}</p>
                      <p className="text-xs text-gray-500">
                        Thêm ngày {new Date(patient._creationTime).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {patient.gender === "male" ? "Nam" : 
                       patient.gender === "female" ? "Nữ" : "Khác"}
                    </p>
                    <p className="text-xs text-gray-500">{patient.bloodType || "Chưa rõ"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}