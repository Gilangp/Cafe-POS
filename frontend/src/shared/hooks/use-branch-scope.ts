'use client';

import { useAuthStore } from '@/store/auth.store';
import { useBranchStore, type BranchInfo } from '@/store/branch.store';
import { useCallback, useMemo } from 'react';

export function useBranchScope() {
  const { user } = useAuthStore();
  const { activeBranchId, branches, setActiveBranchId, setBranches } = useBranchStore();

  const isGlobalRole = useMemo(() => {
    if (!user || !user.role) return false;
    return ['super_admin', 'corporate_admin', 'regional_analyst', 'marketing_manager', 'crm_officer', 'hr_manager'].includes(user.role);
  }, [user]);

  const canAccessBranch = useCallback(
    (branchId: number): boolean => {
      if (!user) return false;
      if (isGlobalRole) return true;
      if (user.branch_id === branchId) return true;
      if (user.scoped_branch_ids && Array.isArray(user.scoped_branch_ids)) {
        return user.scoped_branch_ids.includes(branchId);
      }
      return false;
    },
    [user, isGlobalRole]
  );

  const accessibleBranches = useMemo((): BranchInfo[] => {
    if (!branches || !Array.isArray(branches)) return [];
    if (isGlobalRole) return branches;
    return branches.filter((b) => canAccessBranch(b.id));
  }, [branches, isGlobalRole, canAccessBranch]);

  const currentBranch = useMemo((): BranchInfo | null => {
    if (!activeBranchId || !branches) return null;
    return branches.find((b) => b.id === activeBranchId) || null;
  }, [activeBranchId, branches]);

  return {
    activeBranchId,
    currentBranch,
    accessibleBranches,
    isGlobalRole,
    canAccessBranch,
    setActiveBranchId,
    setBranches,
  };
}
