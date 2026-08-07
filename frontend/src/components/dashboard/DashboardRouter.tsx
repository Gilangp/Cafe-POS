"use client";

import { useAuthStore } from "@/store/auth.store";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Lazy load role-specific dashboards to improve performance
const OwnerDashboard = dynamic(() => import("./roles/OwnerDashboard"), {
  loading: () => <DashboardSkeleton />,
});
const AdminDashboard = dynamic(() => import("./roles/AdminDashboard"), {
  loading: () => <DashboardSkeleton />,
});
const CashierDashboard = dynamic(() => import("./roles/CashierDashboard"), {
  loading: () => <DashboardSkeleton />,
});
const KitchenDashboard = dynamic(() => import("./roles/KitchenDashboard"), {
  loading: () => <DashboardSkeleton />,
});

const DashboardSkeleton = () => (
  <div className="flex h-[80vh] items-center justify-center">
    <div className="flex flex-col items-center gap-4 text-brand-500">
      <Loader2 className="h-10 w-10 animate-spin" />
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Memuat Dashboard...
      </p>
    </div>
  </div>
);

export default function DashboardRouter() {
  const { user } = useAuthStore();

  if (!user) {
    return <DashboardSkeleton />;
  }

  // Render dashboard based on strict role definitions from 04_modules_specification.md
  switch (user.role) {
    case "Owner":
      return <OwnerDashboard />;
    case "Admin":
      return <AdminDashboard />;
    case "Kasir":
      return <CashierDashboard />;
    case "Dapur/Barista":
      return <KitchenDashboard />;
    default:
      return (
        <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
          <div className="rounded-full bg-red-100 p-4 text-red-500 dark:bg-red-900/20">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Role Tidak Dikenali
          </h2>
          <p className="max-w-md text-gray-500 dark:text-gray-400">
            Akun Anda ({user.role}) tidak memiliki dashboard yang terdaftar di
            sistem. Silakan hubungi Administrator.
          </p>
        </div>
      );
  }
}
