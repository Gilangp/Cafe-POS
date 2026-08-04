import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cart.store';
import { useBranchStore } from '@/store/branch.store';
import { useAuthStore } from '@/store/auth.store';
import { useReservationStore } from '@/store/reservation.store';
import { useThemeStore } from '@/store/theme.store';
import { useSidebarStore } from '@/store/sidebar.store';
import { OfflineQueue } from '@/shared/lib/offline-queue';

const espresso = {
  menu_id: '1',
  name: 'Velvet Espresso',
  price: 30000,
  quantity: 1,
  note: '',
  image: null,
};

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('starts empty', () => {
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().getSubtotal()).toBe(0);
    expect(useCartStore.getState().getTotal()).toBe(0);
  });

  it('adds item with cart_id', () => {
    useCartStore.getState().addItem(espresso);
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].cart_id).toBeTruthy();
    expect(items[0].name).toBe('Velvet Espresso');
  });

  it('merges same menu_id + note + variants by quantity', () => {
    useCartStore.getState().addItem(espresso);
    useCartStore.getState().addItem({ ...espresso, quantity: 2 });
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('keeps separate lines for different notes', () => {
    useCartStore.getState().addItem(espresso);
    useCartStore.getState().addItem({ ...espresso, note: 'less ice' });
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it('updates quantity and removes when <= 0', () => {
    useCartStore.getState().addItem(espresso);
    const id = useCartStore.getState().items[0].cart_id;
    useCartStore.getState().updateQuantity(id, 5);
    expect(useCartStore.getState().items[0].quantity).toBe(5);
    useCartStore.getState().updateQuantity(id, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('applies discount and payment method', () => {
    useCartStore.getState().addItem({ ...espresso, quantity: 2 });
    useCartStore.getState().setDiscount(10000);
    useCartStore.getState().setPaymentMethod('qris');
    expect(useCartStore.getState().getSubtotal()).toBe(60000);
    expect(useCartStore.getState().getTotal()).toBe(50000);
    expect(useCartStore.getState().paymentMethod).toBe('qris');
  });

  it('clears cart fully', () => {
    useCartStore.getState().addItem(espresso);
    useCartStore.getState().setDiscount(5000);
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().discount).toBe(0);
    expect(useCartStore.getState().paymentMethod).toBe('tunai');
  });
});

describe('Branch Store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useBranchStore.setState({ activeBranchId: null, branches: [] });
  });

  it('sets active branch and localStorage key', () => {
    useBranchStore.getState().setActiveBranchId(101);
    expect(useBranchStore.getState().activeBranchId).toBe(101);
    expect(window.localStorage.getItem('velvra_active_branch_id')).toBe('101');
  });

  it('clears active branch key when null', () => {
    useBranchStore.getState().setActiveBranchId(101);
    useBranchStore.getState().setActiveBranchId(null);
    expect(useBranchStore.getState().activeBranchId).toBeNull();
    expect(window.localStorage.getItem('velvra_active_branch_id')).toBeNull();
  });

  it('sets branch directory', () => {
    useBranchStore.getState().setBranches([
      { id: 101, name: 'Sudirman', code: 'SUD-01', is_active: true },
      { id: 102, name: 'Kemang', code: 'KEM-02', is_active: true },
    ]);
    expect(useBranchStore.getState().branches).toHaveLength(2);
    expect(useBranchStore.getState().branches[0].code).toBe('SUD-01');
  });
});

describe('Auth Store', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('sets user and marks authenticated', () => {
    useAuthStore.getState().setUser({
      id: 1,
      name: 'Nadia',
      email: 'nadia@velvra.id',
      role: 'branch_manager',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.role).toBe('branch_manager');
  });

  it('clears auth on null user', () => {
    useAuthStore.getState().setUser({
      id: 1,
      name: 'Admin',
      email: 'admin@velvra.id',
      role: 'super_admin',
    });
    useAuthStore.getState().setUser(null);
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });

  it('stores token', () => {
    useAuthStore.getState().setToken('JWT_MOCK');
    expect(useAuthStore.getState().token).toBe('JWT_MOCK');
    useAuthStore.getState().setToken(null);
    expect(useAuthStore.getState().token).toBeNull();
  });
});

describe('Offline Queue', () => {
  beforeEach(() => {
    OfflineQueue.clear();
  });

  it('enqueues with auto idempotency_key', () => {
    const queued = OfflineQueue.enqueue({
      branch_id: 101,
      order_type: 'dine_in',
      payment_method: 'qris',
      items: [{ product_id: 1, quantity: 2, price: 35000 }],
      total: 70000,
      customer_name: 'Fajar',
    });
    expect(queued.idempotency_key).toMatch(/^IDEM-/);
    expect(queued.created_at).toBeTruthy();
    expect(OfflineQueue.count()).toBe(1);
  });

  it('removes synced by key', () => {
    const o1 = OfflineQueue.enqueue({
      branch_id: 101,
      order_type: 'dine_in',
      payment_method: 'cash',
      items: [],
      total: 50000,
      customer_name: 'One',
    });
    const o2 = OfflineQueue.enqueue({
      branch_id: 101,
      order_type: 'take_away',
      payment_method: 'card',
      items: [],
      total: 80000,
      customer_name: 'Two',
    });
    expect(OfflineQueue.count()).toBe(2);
    OfflineQueue.removeSynced([o1.idempotency_key]);
    expect(OfflineQueue.count()).toBe(1);
    expect(OfflineQueue.getQueue()[0].idempotency_key).toBe(o2.idempotency_key);
  });
});

describe('Reservation Store', () => {
  beforeEach(() => {
    useReservationStore.getState().reset();
  });

  it('sets date time guests and resets', () => {
    useReservationStore.getState().setDate('2026-08-10');
    useReservationStore.getState().setTime('19:00');
    useReservationStore.getState().setGuestCount(4);
    expect(useReservationStore.getState()).toMatchObject({
      selectedDate: '2026-08-10',
      selectedTime: '19:00',
      guestCount: 4,
    });
    useReservationStore.getState().reset();
    expect(useReservationStore.getState().guestCount).toBe(2);
    expect(useReservationStore.getState().selectedDate).toBeNull();
  });
});

describe('Theme Store', () => {
  it('toggles light/dark', () => {
    useThemeStore.setState({ theme: 'light' });
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('dark');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().theme).toBe('light');
  });
});

describe('Sidebar Store', () => {
  beforeEach(() => {
    useSidebarStore.getState().closeAll();
  });

  it('toggles collapse and mobile', () => {
    useSidebarStore.getState().toggleCollapse();
    expect(useSidebarStore.getState().isCollapsed).toBe(true);
    useSidebarStore.getState().toggleMobile();
    expect(useSidebarStore.getState().isMobileOpen).toBe(true);
    useSidebarStore.getState().closeAll();
    expect(useSidebarStore.getState().isCollapsed).toBe(false);
    expect(useSidebarStore.getState().isMobileOpen).toBe(false);
  });
});
