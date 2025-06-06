"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="flex items-center px-4 py-2 rounded-xl bg-white text-gray-700 border border-gray-200 font-medium hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow group"
      onClick={() => void signOut()}
    >
      <LogOut className="w-4 h-4 mr-2 group-hover:text-red-500 transition-colors" />
      Đăng xuất
    </button>
  );
}