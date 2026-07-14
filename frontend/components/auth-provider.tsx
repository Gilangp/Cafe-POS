'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useBranchStore } from '@/store/branch-store';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { fetchProfile, user, isAuthenticated } = useAuthStore();
  const { activeBranchId, setActiveBranchId } = useBranchStore();

  useEffect(() => {
    // Check if token exists or local admin session exists
    if (typeof window !== 'undefined') {
      const token = window.localStorage.getItem('velvra_access_token');
      const adminSessionRaw = window.localStorage.getItem('velvra_admin_session');
      const storedBranchId = window.localStorage.getItem('velvra_active_branch_id');

      if (storedBranchId && !activeBranchId) {
        setActiveBranchId(Number(storedBranchId));
      }

      if (token && !isAuthenticated) {
        fetchProfile().catch(() => {
          // Token invalid or offline, handled in interceptor
        });
      } else if (adminSessionRaw && !user) {
        try {
          const session = JSON.parse(adminSessionRaw);
          if (session && session.role) {
            useAuthStore.getState().setUser({
              id: 1,
              name: session.name || 'Admin Lead',
              email: session.email || 'admin@velvracoffee.com',
              role: session.role === 'Super Admin' ? 'super_admin' : session.role === 'Store Manager' ? 'store_manager' : 'barista',
              permissions: ['all'],
            });
          }
        } catch (e) {
          // ignore parsing error
        }
      }
    }
  }, [fetchProfile, isAuthenticated, user, activeBranchId, setActiveBranchId]);

  return <>{children}</>;
}
