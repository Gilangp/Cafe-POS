'use client';

import React from 'react';
import { usePermission } from '@/shared/hooks/use-permission';
import { ShieldAlert } from 'lucide-react';

export interface PermissionGuardProps {
  /** Permission code or array of permission codes required */
  permission?: string | string[];
  /** Role code or array of role codes allowed */
  role?: string | string[];
  /** If true when multiple permissions are given, user must have ALL of them */
  requireAllPermissions?: boolean;
  /** Custom fallback element to render if access is denied */
  fallback?: React.ReactNode;
  /** If true, shows a warning banner when access is denied instead of null */
  showForbiddenBanner?: boolean;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  role,
  requireAllPermissions = false,
  fallback = null,
  showForbiddenBanner = false,
  children,
}: PermissionGuardProps) {
  const { hasPermission, hasAnyPermission, hasRole, isSuperAdmin } = usePermission();

  // Super admins and corporate admins bypass all checks
  if (isSuperAdmin) {
    return <>{children}</>;
  }

  let hasAccess = true;

  // Check role requirement if specified
  if (role) {
    hasAccess = hasRole(role);
  }

  // Check permission requirement if specified and role check passed
  if (hasAccess && permission) {
    if (Array.isArray(permission)) {
      if (requireAllPermissions) {
        hasAccess = permission.every((p) => hasPermission(p));
      } else {
        hasAccess = hasAnyPermission(permission);
      }
    } else {
      hasAccess = hasPermission(permission);
    }
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback !== null && fallback !== undefined) {
    return <>{fallback}</>;
  }

  if (showForbiddenBanner) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <ShieldAlert size={16} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Anda tidak memiliki otorisasi untuk mengakses tindakan atau opsi ini.</span>
      </div>
    );
  }

  return null;
}

export default PermissionGuard;
