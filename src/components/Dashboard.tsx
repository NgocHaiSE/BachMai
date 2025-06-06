import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Dashboard() {
  const stats = useQuery(api.dashboard.getStats);
  const activity = useQuery(api.dashboard.getRecentActivity);

  if (stats === undefined || activity === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Appointments",
      value: stats.todayAppointments,
      icon: "📅",
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: "👥",
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Active Staff",
      value: stats.activeStaff,
      icon: "👨‍⚕️",
      color: "bg-purple-50 text-purple-700",
    },
    {
      title: "Pending Appointments",
      value: stats.pendingAppointments,
      icon: "⏳",
      color: "bg-orange-50 text-orange-700",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mr-4`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
          <div className="space-y-3">
            {activity.recentAppointments.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent appointments</p>
            ) : (
              activity.recentAppointments.map((appointment) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {appointment.patient?.firstName} {appointment.patient?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      with Dr. {appointment.staff?.firstName} {appointment.staff?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {appointment.appointmentDate} at {appointment.appointmentTime}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    appointment.status === "completed" ? "bg-green-100 text-green-800" :
                    appointment.status === "confirmed" ? "bg-blue-100 text-blue-800" :
                    appointment.status === "scheduled" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Patients</h3>
          <div className="space-y-3">
            {activity.recentPatients.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent patients</p>
            ) : (
              activity.recentPatients.map((patient) => (
                <div key={patient._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{patient.phone}</p>
                    <p className="text-xs text-gray-500">
                      Added {new Date(patient._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{patient.gender}</p>
                    <p className="text-xs text-gray-500">{patient.bloodType || "N/A"}</p>
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
