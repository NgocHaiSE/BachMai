import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import LogoutButton from './components/LogoutButton';
import { Toaster } from "sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import PatientManagement from "./components/PatientManagement";
import AppointmentManagement from "./components/AppointmentManagement";
import StaffManagement from "./components/StaffManagement";
import MedicalRecords from "./components/MedicalRecords";
import TransferManagement from "./components/TransferManagement";
import PrescriptionManagement from "./components/PrescriptionManagement";
import VaccinationManagement from "./components/VaccinationManagement";
import {
  BarChart3,
  Users,
  Calendar,
  UserCheck,
  FileText,
  Pill,
  Truck,
  Activity,
  Loader2,
  Home,
  CalendarDays,
  CalendarCheck,
  ClipboardList,
  Stethoscope,
  TestTube,
  ShoppingCart,
  CreditCard,
  Bed,
  Settings,
  Building2,
  HeartHandshake,
  DollarSign,
  TrendingUp,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
  Syringe,
} from "lucide-react";
import ExaminationRegistration from "./components/ExaminationRegistration";
import PatientMedicalRecords from "./components/PatientMedicalRecords";
import WorkScheduleManagement from "./components/WorkScheduleManagement";

interface MenuItem {
  id: string;
  name: string;
  icon: any;
  color: string;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  id: string;
  name: string;
}

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    name: "Trang chủ",
    icon: Home,
    color: "text-blue-600"
  },
  {
    id: "work-schedule",
    name: "Lịch làm việc",
    icon: CalendarDays,
    color: "text-green-600",
    children: [
      { id: "work", name: "Lịch làm việc" },
    ]
  },
  {
    id: "schedule",
    name: "Đăng ký & Lịch khám",
    icon: CalendarDays,
    color: "text-green-600",
    children: [
      { id: "appointments", name: "Đăng ký lịch khám" },
      { id: "register-exam", name: "Đăng ký khám bệnh" },
      { id: "today-schedule", name: "Lịch khám trong ngày" },
      { id: "follow-up", name: "Lịch hẹn tái khám" }
    ]
  },
  {
    id: "patients",
    name: "Bệnh nhân",
    icon: Users,
    color: "text-green-600",
    children: [
      { id: "patients", name: "Hồ sơ bệnh nhân" },
      { id: "records", name: "Hồ sơ bệnh án" },
      { id: "transfers", name: "Hồ sơ chuyển viện" }
    ]
  },
  {
    id: "examination",
    name: "Khám bệnh & Điều trị",
    icon: Stethoscope,
    color: "text-indigo-600",
    children: [
      { id: "waiting-list", name: "Danh sách chờ khám" },
      { id: "diagnosis", name: "Bệnh án & Kết luận" }
    ]
  },
  {
    id: "clinical",
    name: "Cận lâm sàng",
    icon: TestTube,
    color: "text-pink-600",
    children: [
      { id: "test-orders", name: "Danh sách chỉ định" },
      { id: "test-results", name: "Kết quả chỉ định" }
    ]
  },
  {
    id: "vaccination",
    name: "Tiêm chủng",
    icon: Syringe,
    color: "text-green-600"
  },
  {
    id: "pharmacy",
    name: "Dược phẩm & Đơn thuốc",
    icon: Pill,
    color: "text-pink-600",
    children: [
      { id: "medicines", name: "Dược phẩm" },
      { id: "prescriptions", name: "Đơn thuốc" }
    ]
  },
  {
    id: "billing",
    name: "Hoá đơn thanh toán",
    icon: CreditCard,
    color: "text-yellow-600"
  },
  {
    id: "medical-supplies",
    name: "Vật tư y tế",
    icon: ShoppingCart,
    color: "text-teal-600",
    children: [
      { id: "beds", name: "Giường bệnh" },
      { id: "equipment", name: "Thiết bị & Vật tư" }
    ]
  },
  {
    id: "departments",
    name: "Khoa phòng",
    icon: Building2,
    color: "text-cyan-600"
  },
  {
    id: "services",
    name: "Dịch vụ y tế",
    icon: HeartHandshake,
    color: "text-emerald-600"
  },
  {
    id: "finance",
    name: "Tài chính",
    icon: DollarSign,
    color: "text-green-600",
    children: [
      { id: "income-expense", name: "Thu - Chi" },
      { id: "debts", name: "Công nợ" },
      { id: "budget", name: "Dự toán ngân sách" }
    ]
  },
  {
    id: "statistics",
    name: "Thống kê",
    icon: TrendingUp,
    color: "text-violet-600"
  },
  {
    id: "account",
    name: "Tài khoản",
    icon: User,
    color: "text-gray-600"
  },
  {
    id: "settings",
    name: "Cài đặt",
    icon: Settings,
    color: "text-gray-600"
  },
  {
    id: "logout",
    name: "Đăng xuất",
    icon: LogOut,
    color: "text-gray-600"
  }
];

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const [selectedPatientForRecords, setSelectedPatientForRecords] = useState<any>(null);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - show login form
  if (!isAuthenticated) {
    return <LoginForm />;
  }

  // Rest of your HospitalApp component logic...
  const toggleMenu = (menuId: string) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuClick = (menuId: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleMenu(menuId);
    } else {
      setActiveTab(menuId);
      setSelectedPatientForRecords(null);
    }
  };

  const handleSubMenuClick = (menuId: string) => {
    setActiveTab(menuId);
    setSelectedPatientForRecords(null);
  };

  const handleViewPatientMedicalRecords = (patient: any) => {
    setSelectedPatientForRecords(patient);
    setActiveTab("patient-medical-records");
  };

  const handleBackToPatients = () => {
    setSelectedPatientForRecords(null);
    setActiveTab("patients");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar - same as your original code */}
        <nav className="w-72 bg-[#280559] min-h-screen sticky top-16 shadow-xl rounded-tr-[32px] rounded-br-[32px]">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-3 border border-white/20">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">BỆNH VIỆN<br />BẠCH MAI</h2>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="p-4">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isExpanded = expandedMenus.includes(item.id);
                const hasChildren = item.children && item.children.length > 0;
                const isActive = activeTab === item.id || (hasChildren && item.children?.some(child => child.id === activeTab));

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id, !!hasChildren)}
                      className={`w-full flex items-center justify-between px-4 py-4 text-left transition-all duration-200 group ${isActive
                          ? "bg-white/90 text-[#280559] rounded-xl shadow-lg font-medium"
                          : "text-white hover:bg-white/10 hover:text-white rounded-lg"
                        }`}
                    >
                      <div className="flex items-center">
                        <IconComponent
                          className={`mr-3 h-5 w-5 transition-colors ${isActive ? "text-[#280559]" : "text-white/80 group-hover:text-white"
                            }`}
                        />
                        <span className={`font-medium ${isActive ? 'text-[#280559]' : 'text-white group-hover:text-white'}`}>
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {isActive && !hasChildren && (
                          <div className="w-2 h-2 bg-[#280559] rounded-full mr-2"></div>
                        )}
                        {hasChildren && (
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''
                            } ${isActive ? 'text-[#280559]' : 'text-white/80 group-hover:text-white'}`} />
                        )}
                      </div>
                    </button>

                    {/* Submenu */}
                    {hasChildren && (
                      <div className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                      `}>
                        <div className="mt-2 ml-6 space-y-1 border-l-2 border-white/20 pl-4">
                          {item.children?.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubMenuClick(subItem.id)}
                              className={`
                                w-full text-left px-4 py-3 text-sm rounded-xl transition-all duration-200
                                ${activeTab === subItem.id
                                  ? 'bg-white/90 text-[#280559] shadow-md font-medium'
                                  : 'text-white/90 hover:bg-white/10 hover:text-white'
                                }
                              `}
                            >
                              {subItem.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* User Info */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-medium text-sm">
                  {user?.HoTen?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{user?.HoTen || 'Người dùng'}</div>
                <div className="text-white/60 text-xs">{user?.ChucVu || 'Nhân viên'}</div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50 min-h-screen overflow-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "patients" && (
              <PatientManagement onViewMedicalRecords={handleViewPatientMedicalRecords} />
            )}
            {activeTab === "patient-medical-records" && selectedPatientForRecords && (
              <PatientMedicalRecords
                patient={selectedPatientForRecords}
                onBack={handleBackToPatients}
              />
            )}
            {activeTab === "work" && <WorkScheduleManagement />}
            {activeTab === "appointments" && <AppointmentManagement />}
            {activeTab === "staff" && <StaffManagement />}
            {activeTab === "records" && <MedicalRecords />}
            {activeTab === "prescriptions" && <PrescriptionManagement />}
            {activeTab === "transfers" && <TransferManagement />}
            {activeTab === "register-exam" && <ExaminationRegistration />}
            {activeTab === "vaccination" && <VaccinationManagement />}

            {/* Placeholder for other pages */}
            {![
              "dashboard", "patients", "appointments", "staff",
              "records", "prescriptions", "transfers", "register-exam", "patient-medical-records", "vaccination", "work"
            ].includes(activeTab) && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Trang đang phát triển
                  </h3>
                  <p className="text-gray-600">
                    Chức năng "{menuItems.find(m => m.id === activeTab || m.children?.some(c => c.id === activeTab))?.name || activeTab}" sẽ được cập nhật trong phiên bản tiếp theo
                  </p>
                </div>
              )}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;