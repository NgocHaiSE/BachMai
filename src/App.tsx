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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MediCare HMS</h1>
            <p className="text-gray-600">Hospital Management System</p>
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
    { id: "dashboard", name: "Dashboard", icon: "📊" },
    { id: "patients", name: "Patients", icon: "👥" },
    { id: "appointments", name: "Appointments", icon: "📅" },
    { id: "staff", name: "Staff", icon: "👨‍⚕️" },
    { id: "records", name: "Medical Records", icon: "📋" },
    { id: "prescriptions", name: "Prescriptions", icon: "💊" },
    { id: "transfers", name: "Transfer Management", icon: "🚑" },
  ];

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">MediCare HMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {loggedInUser?.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen border-r border-gray-200">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "dashboard" && <Dashboard />}
          {activeTab === "patients" && <PatientManagement />}
          {activeTab === "appointments" && <AppointmentManagement />}
          {activeTab === "staff" && <StaffManagement />}
          {activeTab === "records" && <MedicalRecords />}
          {activeTab === "prescriptions" && <PrescriptionManagement />}
          {activeTab === "transfers" && <TransferManagement />}
        </main>
      </div>
    </div>
  );
}
