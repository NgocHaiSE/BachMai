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
  ChevronRight
} from "lucide-react";
import ExaminationRegistration from "./components/ExaminationRegistration";

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
    id: "schedule",
    name: "Lịch làm việc",
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
  }
];

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
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const loggedInUser = useQuery(api.auth.loggedInUser);

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
    }
  };

  const handleSubMenuClick = (menuId: string) => {
    setActiveTab(menuId);
  };

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
              {menuItems.map((item) => {
                const IconComponent = item.icon;
                const isExpanded = expandedMenus.includes(item.id);
                const hasChildren = item.children && item.children.length > 0;
                const isActive = activeTab === item.id || (hasChildren && item.children?.some(child => child.id === activeTab));

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleMenuClick(item.id, !!hasChildren)}
                      className={`w-full flex items-center justify-between px-4 py-3.5 text-left rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <IconComponent 
                          className={`mr-3 h-5 w-5 transition-colors ${
                            isActive ? "text-blue-600" : `${item.color} group-hover:${item.color}`
                          }`} 
                        />
                        <span className="font-medium">{item.name}</span>
                      </div>
                      <div className="flex items-center">
                        {isActive && !hasChildren && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                        )}
                        {hasChildren && (
                          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                            isExpanded ? 'rotate-90' : ''
                          } ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                        )}
                      </div>
                    </button>

                    {/* Submenu */}
                    {hasChildren && (
                      <div className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                      `}>
                        <div className="mt-2 ml-6 space-y-1 border-l-2 border-gray-100 pl-4">
                          {item.children?.map((subItem) => (
                            <button
                              key={subItem.id}
                              onClick={() => handleSubMenuClick(subItem.id)}
                              className={`
                                w-full text-left px-4 py-2.5 text-sm rounded-lg transition-all duration-200
                                ${activeTab === subItem.id 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm font-medium' 
                                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
            {activeTab == "register-exam" &&  <ExaminationRegistration />}
            
            {/* Placeholder for other pages */}
            {![
              "dashboard", "patients", "appointments", "staff", 
              "records", "prescriptions", "transfers", "register-exam",
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
}