'use client';

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && user) {
      const role = user.role.toLowerCase();
      switch (role) {
        case 'owner':
          router.replace('/dashboard/owner');
          break;
        case 'admin':
          router.replace('/dashboard/admin');
          break;
        case 'kasir':
          router.replace('/dashboard/kasir');
          break;
        case 'dapur':
        case 'barista':
        case 'dapur_barista':
          router.replace('/dashboard/barista');
          break;
        default:
          break;
      }
    }
  }, [isClient, user, router]);

  // While checking or if a valid role is detected (waiting to redirect), show loader
  if (!isClient || user?.role.match(/owner|admin|kasir|dapur|barista/i)) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        <p className="text-sm font-medium text-muted-foreground">Memverifikasi sesi...</p>
      </div>
    );
  }

  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <p>Unrecognized user role. Please contact support.</p>
    </div>
  );
}
