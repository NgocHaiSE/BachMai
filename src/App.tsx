import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import PatientManagement from "./components/PatientManagement";
import AppointmentManagement from "./components/AppointmentManagement";
import StaffManagement from "./components/StaffManagement";
import MedicalRecords from "./components/MedicalRecords";
import TransferManagement from "./components/TransferManagement";
import PrescriptionManagement from "./components/PrescriptionManagement";
import { 
  BarChart3, 
  Users, 
  Calendar, 
  UserCheck, 
  FileText, 
  Pill, 
  Truck,
  Activity,
  Loader2
} from "lucide-react";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Authenticated>
        <HospitalApp />
      </Authenticated>
      <Unauthenticated>
        <LoginPage />
      </Unauthenticated>
      <Toaster />
    </div>
  );
}

function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Hệ Thống Quản Lý Bệnh Viện</h1>
            <p className="text-gray-600 text-lg">Đăng nhập để tiếp tục</p>
          </div>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}

function HospitalApp() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const navigation = [
    { id: "dashboard", name: "Tổng Quan", icon: BarChart3, color: "text-blue-600" },
    { id: "patients", name: "Bệnh Nhân", icon: Users, color: "text-green-600" },
    { id: "appointments", name: "Lịch Khám", icon: Calendar, color: "text-purple-600" },
    { id: "staff", name: "Nhân Viên", icon: UserCheck, color: "text-orange-600" },
    { id: "records", name: "Hồ Sơ Bệnh Án", icon: FileText, color: "text-indigo-600" },
    { id: "prescriptions", name: "Đơn Thuốc", icon: Pill, color: "text-pink-600" },
    { id: "transfers", name: "Chuyển Viện", icon: Truck, color: "text-red-600" },
  ];

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 shadow-md">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MediCare</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Hệ Thống Quản Lý Bệnh Viện</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm text-gray-600">Xin chào,</p>
                <p className="text-sm font-medium text-gray-900">{loggedInUser?.email}</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-72 bg-white shadow-sm min-h-screen border-r border-gray-200 sticky top-16">
          <div className="p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const IconComponent = item.icon;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center px-4 py-3.5 text-left rounded-xl transition-all duration-200 group ${
                        activeTab === item.id
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <IconComponent 
                        className={`mr-3 h-5 w-5 transition-colors ${
                          activeTab === item.id ? "text-blue-600" : `${item.color} group-hover:${item.color}`
                        }`} 
                      />
                      <span className="font-medium">{item.name}</span>
                      {activeTab === item.id && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50 min-h-screen overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "patients" && <PatientManagement />}
            {activeTab === "appointments" && <AppointmentManagement />}
            {activeTab === "staff" && <StaffManagement />}
            {activeTab === "records" && <MedicalRecords />}
            {activeTab === "prescriptions" && <PrescriptionManagement />}
            {activeTab === "transfers" && <TransferManagement />}
          </div>
        </main>
      </div>
    </div>
  );
}