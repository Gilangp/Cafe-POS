'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { OwnerDashboard } from '@/features/dashboard/components/OwnerDashboard';
import { AdminDashboard } from '@/features/dashboard/components/AdminDashboard';
import { CashierDashboard } from '@/features/dashboard/components/CashierDashboard';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
      </div>
    );
  }

  const role = user?.role.toLowerCase();

  switch (role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'kasir':
      return <CashierDashboard />;
    default:
      return (
        <div className="flex h-[60vh] w-full items-center justify-center">
          <p>Unrecognized user role. Please contact support.</p>
        </div>
      );
  }
}
