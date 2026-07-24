'use client';

import { AdminSidebar } from '@/features/dashboard/admin/sidebar';
import { AdminHeader } from '@/features/dashboard/admin/header';
import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check from localStorage matching Zustand persist key
    const authStorage = localStorage.getItem('auth-storage');
    let isAuthenticated = false;

    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        if (parsed?.state?.token) {
          isAuthenticated = true;
        }
      } catch (e) {
        console.error("Gagal parsing auth-storage", e);
      }
    }

    if (!isAuthenticated) {
      // Auto redirect to global login if token does not exist
      router.replace('/login');
    } else {
      setAuthChecked(true);
    }
  }, [router]);



  // Optional loading guard while checking session
  if (!authChecked) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F5F3F0]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#BA935D] border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider">Memeriksa Sesi Admin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F5F3F0] overflow-hidden">
      {/* Sidebar */}
      <AdminSidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <AdminHeader onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
