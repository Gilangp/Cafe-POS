import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
  branch_id?: number;
  scoped_branch_ids?: number[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      },
    }),
    {
      name: 'auth-storage', // key di localStorage — harus cocok dengan yang dibaca di axios interceptor
    }
  )
);
