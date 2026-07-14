import { create } from 'zustand';

export type CartState = {
  items: string[];
  addItem: (itemName: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (itemName) => set((state) => ({ items: [...state.items, itemName] })),
  clear: () => set({ items: [] }),
}));