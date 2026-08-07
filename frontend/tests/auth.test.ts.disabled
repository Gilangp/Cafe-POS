import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/store/auth.store';
import { useAuth } from '@/features/authentication/hooks/use-auth';

describe('useAuth', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('exposes unauthenticated defaults', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isSuperAdmin).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('reads user from auth store', () => {
    act(() => {
      useAuthStore.getState().setUser({
        id: 1,
        name: 'Owner',
        email: 'owner@velvra.id',
        role: 'Owner',
      });
      useAuthStore.getState().setToken('tok-1');
    });

    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.token).toBe('tok-1');
    expect(result.current.isSuperAdmin).toBe(true);
    expect(result.current.user?.name).toBe('Owner');
  });

  it('checkSession true when authenticated', () => {
    act(() => {
      useAuthStore.getState().setUser({
        id: 2,
        name: 'Kasir',
        email: 'kasir@velvra.id',
        role: 'cashier',
      });
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.checkSession()).toBe(true);
  });

  it('checkSession true when auth-storage exists', () => {
    window.localStorage.setItem('auth-storage', JSON.stringify({ state: { token: 'x' } }));
    const { result } = renderHook(() => useAuth());
    expect(result.current.checkSession()).toBe(true);
  });

  it('logout clears store', () => {
    const hrefSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { href: '', set href(v: string) { hrefSpy(v); } },
      configurable: true,
    });

    act(() => {
      useAuthStore.getState().setUser({
        id: 1,
        name: 'Admin',
        email: 'admin@velvra.id',
        role: 'super_admin',
      });
      useAuthStore.getState().setToken('tok');
    });

    const { result } = renderHook(() => useAuth());
    act(() => {
      result.current.logout();
    });

    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(hrefSpy).toHaveBeenCalledWith('/login');
  });
});
