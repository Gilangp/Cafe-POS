'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Auth state sudah dipersist via Zustand persist middleware
    // Tidak perlu melakukan apapun di sini
  }, [isAuthenticated]);

  return <>{children}</>;
}
