import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface BranchInfo {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
}

export interface BranchState {
  activeBranchId: number | null;
  branches: BranchInfo[];
  setActiveBranchId: (branchId: number | null) => void;
  setBranches: (branches: BranchInfo[]) => void;
}

export const useBranchStore = create<BranchState>()(
  persist(
    (set) => ({
      activeBranchId: null,
      branches: [],
      setActiveBranchId: (branchId) => {
        if (typeof window !== 'undefined' && branchId) {
          window.localStorage.setItem('velvra_active_branch_id', String(branchId));
        } else if (typeof window !== 'undefined') {
          window.localStorage.removeItem('velvra_active_branch_id');
        }
        set({ activeBranchId: branchId });
      },
      setBranches: (branches) => set({ branches }),
    }),
    {
      name: 'velvra-branch-storage',
    }
  )
);
