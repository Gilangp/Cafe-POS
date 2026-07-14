import '@testing-library/dom';
import { vi } from 'vitest';

// Mock localStorage for zustand persistence tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Default Mocks for hooks across UI/UX tests
vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    products: [
      { id: 1, name: 'Velvet Espresso Single Origin', price: 30000, category: 'Espresso', isAvailable: true },
      { id: 2, name: 'Caramel Latte Artisan', price: 38000, category: 'Latte', isAvailable: true },
      { id: 3, name: 'Uji Matcha Latte', price: 40000, category: 'Matcha', isAvailable: false },
      { id: 4, name: 'Butter Croissant 27 Layers', price: 32000, category: 'Pastry', isAvailable: true },
    ],
    loading: false,
    usingLive: true,
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useInventory', () => ({
  useInventory: () => ({
    items: [
      { id: 1, name: 'Biji Kopi Gayo Washed', category: 'Kopi', stock: 1200, unit: 'gram', threshold: 500, cost: 150000, sku: 'RAW-001', batchNumber: 'BATCH-2026-07A', expiryDate: '2026-12-31' },
      { id: 2, name: 'Susu Oat Barista Edition', category: 'Dairy', stock: 150, unit: 'ml', threshold: 200, cost: 45000, sku: 'RAW-002', batchNumber: 'BATCH-2026-07B', expiryDate: '2026-08-15' },
    ],
    loading: false,
    usingLive: true,
    adjustStock: vi.fn(),
    addItem: vi.fn(),
    deleteItem: vi.fn(),
    performCycleCount: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useRealtimeOrders', () => ({
  useRealtimeOrders: () => ({
    orders: [
      { id: 101, order_number: 'ORD-001', table_number: 'MEJA-01', status: 'pending', order_type: 'dine_in', total: 68000, items: [{ name: 'Velvet Espresso Single Origin', quantity: 2, price: 30000 }] },
      { id: 102, order_number: 'ORD-002', table_number: 'TAKEAWAY', status: 'preparing', order_type: 'take_away', total: 32000, items: [{ name: 'Butter Croissant 27 Layers', quantity: 1, price: 32000 }] },
      { id: 103, order_number: 'ORD-003', table_number: 'MEJA-05', status: 'ready', order_type: 'dine_in', total: 45000, items: [{ name: 'Caramel Latte', quantity: 1, price: 45000 }] },
    ],
    loading: false,
    updateStatus: vi.fn(),
    updateOrderStatus: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/useCustomers', () => ({
  useCustomers: () => ({
    members: [
      { id: 1, name: 'Nadia Rahmawati', phone: '081122334455', email: 'nadia@example.com', loyalty_points: 450, tier: 'Gold Tier VIP', total_orders: 24 },
      { id: 2, name: 'Fajar Nugraha', phone: '081234567890', email: 'fajar@example.com', loyalty_points: 120, tier: 'Silver Tier Member', total_orders: 5 },
    ],
    loading: false,
    addMember: vi.fn(),
    adjustPoints: vi.fn(),
    refetch: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePermission', () => ({
  usePermission: () => ({
    isSuperAdmin: true,
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasRole: () => true,
    user: { id: 1, name: 'Super Admin', role: 'super_admin' },
  }),
}));

