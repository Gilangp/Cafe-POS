'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCallback } from 'react';
export { AuthProvider } from '@/shared/providers/auth-provider';

export function useAuth() {
  const { user, token, isAuthenticated, logout } = useAuthStore();

  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const currentToken = window.localStorage.getItem('auth-storage');
    return !!(currentToken || isAuthenticated);
  }, [isAuthenticated]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: false,
    login: undefined,
    logout,
    fetchProfile: undefined,
    checkSession,
    isSuperAdmin: user?.role === 'super_admin' || user?.role === 'Super Admin' || user?.role === 'Owner',
  };
}
