import { create } from 'zustand';
import { CartItem } from '@/shared/services/pos.service';

interface CartState {
  items: CartItem[];
  discount: number;
  paymentMethod: 'tunai' | 'qris' | 'kartu';
  
  addItem: (item: Omit<CartItem, 'cart_id'>) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  updateNote: (cartId: string, note: string) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  setPaymentMethod: (method: 'tunai' | 'qris' | 'kartu') => void;
  setDiscount: (discount: number) => void;
  
  // Getters
  getSubtotal: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  paymentMethod: 'tunai',

  addItem: (item) => {
    set((state) => {
      // Check if item with same menu_id, same note, and same variants exists
      const existingItemIndex = state.items.findIndex(
        (i) => i.menu_id === item.menu_id && i.note === item.note && JSON.stringify(i.variants || []) === JSON.stringify(item.variants || [])
      );

      if (existingItemIndex > -1) {
        // Increase quantity
        const newItems = [...state.items];
        newItems[existingItemIndex].quantity += item.quantity;
        return { items: newItems };
      }

      // Add new item with unique cart_id
      const newItem = {
        ...item,
        cart_id: Math.random().toString(36).substring(2, 9),
      };
      return { items: [...state.items, newItem] };
    });
  },

  updateQuantity: (cartId, quantity) => {
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.cart_id !== cartId) };
      }
      return {
        items: state.items.map((i) =>
          i.cart_id === cartId ? { ...i, quantity } : i
        ),
      };
    });
  },

  updateNote: (cartId, note) => {
    set((state) => ({
      items: state.items.map((i) =>
        i.cart_id === cartId ? { ...i, note } : i
      ),
    }));
  },

  removeItem: (cartId) => {
    set((state) => ({
      items: state.items.filter((i) => i.cart_id !== cartId),
    }));
  },

  clearCart: () => {
    set({ items: [], discount: 0, paymentMethod: 'tunai' });
  },

  setPaymentMethod: (method) => {
    set({ paymentMethod: method });
  },

  setDiscount: (discount) => {
    set({ discount });
  },

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getTotal: () => {
    const { getSubtotal, discount } = get();
    return Math.max(0, getSubtotal() - discount);
  },
}));