import { create } from 'zustand';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggleCollapse: () => void;
  setCollapse: (val: boolean) => void;
  toggleMobile: () => void;
  setMobile: (val: boolean) => void;
  closeAll: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  isMobileOpen: false,
  toggleCollapse: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  setCollapse: (val) => set({ isCollapsed: val }),
  toggleMobile: () => set((s) => ({ isMobileOpen: !s.isMobileOpen })),
  setMobile: (val) => set({ isMobileOpen: val }),
  closeAll: () => set({ isCollapsed: false, isMobileOpen: false }),
}));
