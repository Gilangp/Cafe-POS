import { create } from 'zustand';

interface UserState {
  profile: Record<string, unknown> | null;
  setProfile: (profile: Record<string, unknown> | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  setProfile: (profile) => set({ profile }),
}));
