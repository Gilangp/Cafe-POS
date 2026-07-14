import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginPayload } from '@/types/api';
import { login as apiLogin, logout as apiLogout, getCurrentUser, persistToken, clearToken } from '@/lib/auth';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => {
        if (token) {
          persistToken(token);
        } else {
          clearToken();
        }
        set({ token, isAuthenticated: !!token && !!get().user });
      },
      login: async (payload) => {
        set({ isLoading: true });
        try {
          const data = await apiLogin(payload);
          const token = data.token || data.access_token || '';
          if (token) {
            persistToken(token);
          }
          set({
            user: data.user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      logout: async () => {
        set({ isLoading: true });
        try {
          await apiLogout();
        } catch (e) {
          // Ignore network errors during logout
        } finally {
          clearToken();
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
      fetchProfile: async () => {
        const currentToken = typeof window !== 'undefined' ? window.localStorage.getItem('velvra_access_token') : null;
        if (!currentToken) {
          set({ user: null, token: null, isAuthenticated: false });
          return;
        }
        set({ isLoading: true });
        try {
          const user = await getCurrentUser();
          set({ user, token: currentToken, isAuthenticated: true, isLoading: false });
        } catch (error) {
          clearToken();
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'velvra-auth-storage',
    }
  )
);
