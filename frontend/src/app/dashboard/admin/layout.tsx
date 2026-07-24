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
    if (pathname === '/admin/login') {
      setAuthChecked(true);
      return;
    }

    const session = localStorage.getItem('velvra_admin_session');
    if (!session) {
      // Auto redirect to login if session does not exist
      router.replace('/admin/login');
    } else {
      setAuthChecked(true);
    }
  }, [pathname, router]);

  // If on login page, render full screen without sidebar/header
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#12100E] text-white">{children}</div>;
  }

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
