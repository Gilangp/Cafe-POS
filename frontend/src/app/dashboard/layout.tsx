import { DashboardLayoutClient } from '@/shared/components/layout/dashboard-layout';

export const metadata = {
  title: 'Dashboard - NEMU Space',
  description: 'NEMU Space Management System',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
