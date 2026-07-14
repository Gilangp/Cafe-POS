'use client';

import { useAuthStore } from '@/store/auth-store';
import { useCallback } from 'react';
export { AuthProvider } from '@/components/auth-provider';

export function useAuth() {
  const { user, token, isAuthenticated, isLoading, login, logout, fetchProfile } = useAuthStore();

  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const currentToken = window.localStorage.getItem('velvra_access_token');
    const adminSession = window.localStorage.getItem('velvra_admin_session');
    return !!(currentToken || adminSession || isAuthenticated);
  }, [isAuthenticated]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    fetchProfile,
    checkSession,
    isSuperAdmin: user?.role === 'super_admin' || user?.role === 'Super Admin',
  };
}
