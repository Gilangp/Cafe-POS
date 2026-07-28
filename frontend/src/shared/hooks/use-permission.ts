'use client';

import { useAuthStore } from '@/store/auth.store';
import { useCallback } from 'react';

export function usePermission() {
  const { user } = useAuthStore();

  const hasPermission = useCallback(
    (permissionCode: string): boolean => {
      if (!user) return false;

      // Super admins, corporate admins, Admin, and Owner bypass specific permission checks
      if (['super_admin', 'corporate_admin', 'Admin', 'Owner'].includes(user.role)) {
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
      if (['super_admin', 'corporate_admin', 'Admin', 'Owner'].includes(user.role)) return true;
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
