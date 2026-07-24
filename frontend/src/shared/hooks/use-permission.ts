'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCallback } from 'react';

export function usePermission() {
  const { user } = useAuthStore();

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (!user) return false;

      // Super admins and corporate admins bypass specific permission checks
      if (user.role === 'super_admin' || user.role === 'corporate_admin') {
        return true;
      }

      if (!user.permissions || !Array.isArray(user.permissions)) {
        return false;
      }

      return user.permissions.includes(permissionCode);
    },
    [user]
  );

  const hasAnyPermission = useCallback(
    (permissionCodes: string[]): boolean => {
      if (!user) return false;
      if (user.role === 'super_admin' || user.role === 'corporate_admin') return true;
      return permissionCodes.some((code) => hasPermission(code));
    },
    [user, hasPermission]
  );

  const hasRole = useCallback(
    (roleOrRoles: string | string[]): boolean => {
      if (!user || !user.role) return false;
      if (Array.isArray(roleOrRoles)) {
        return roleOrRoles.includes(user.role);
      }
      return user.role === roleOrRoles;
    },
    [user]
  );

  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasRole,
    isSuperAdmin: user?.role === 'super_admin',
  };
}
