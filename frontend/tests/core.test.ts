import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '@/store/cart-store';
import { useBranchStore } from '@/store/branch-store';
import { OfflineQueue } from '@/lib/offline-queue';
import { useAuthStore } from '@/store/auth-store';

describe('1. Cart Store Unit Tests (Phase F3 Ordering Logic)', () => {
  beforeEach(() => {
    useCartStore.getState().clear();
  });

  it('initializes with empty items list', () => {
    expect(useCartStore.getState().items).toEqual([]);
  });

  it('adds items accurately to cart', () => {
    useCartStore.getState().addItem('Espresso Gayo Single Origin');
    useCartStore.getState().addItem('Croissant Butter 27-Layer');
    expect(useCartStore.getState().items).toHaveLength(2);
    expect(useCartStore.getState().items).toContain('Espresso Gayo Single Origin');
  });

  it('clears cart successfully upon checkout completion or reset', () => {
    useCartStore.getState().addItem('Cold Brew Kintamani');
    useCartStore.getState().clear();
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('2. Branch Store Unit Tests (Phase F0/F1 Multi-Branch Context)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useBranchStore.setState({ activeBranchId: null, branches: [] });
  });

  it('sets and persists active branch id to window localStorage', () => {
    useBranchStore.getState().setActiveBranchId(101);
    expect(useBranchStore.getState().activeBranchId).toBe(101);
    expect(window.localStorage.getItem('velvra_active_branch_id')).toBe('101');
  });

  it('updates branch directory list correctly', () => {
    const mockBranches = [
      { id: 101, name: 'Sudirman Flagship Lounge', code: 'SUD-01', is_active: true },
      { id: 102, name: 'Kemang Artisan Roastery Bar', code: 'KEM-02', is_active: true },
    ];
    useBranchStore.getState().setBranches(mockBranches);
    expect(useBranchStore.getState().branches).toHaveLength(2);
    expect(useBranchStore.getState().branches[0].code).toBe('SUD-01');
  });
});

describe('3. Offline Queue & POS Synchronization Tests (Phase F0/F3 KDS)', () => {
  beforeEach(() => {
    OfflineQueue.clear();
  });

  it('enqueues order payload and generates guaranteed idempotency_key if missing', () => {
    const orderPayload = {
      branch_id: 101,
      order_type: 'dine_in' as const,
      payment_method: 'qris' as const,
      items: [{ product_id: 1, quantity: 2, price: 35000 }],
      total: 70000,
      customer_name: 'Fajar Nugraha',
    };

    const queued = OfflineQueue.enqueue(orderPayload);
    expect(queued.idempotency_key).toMatch(/^IDEM-/);
    expect(OfflineQueue.count()).toBe(1);
    expect(OfflineQueue.getQueue()[0].customer_name).toBe('Fajar Nugraha');
  });

  it('removes successfully synced offline orders by idempotency_key', () => {
    const o1 = OfflineQueue.enqueue({
      branch_id: 101,
      order_type: 'dine_in',
      payment_method: 'cash',
      items: [],
      total: 50000,
      customer_name: 'Order One',
    });
    const o2 = OfflineQueue.enqueue({
      branch_id: 101,
      order_type: 'take_away',
      payment_method: 'card',
      items: [],
      total: 80000,
      customer_name: 'Order Two',
    });

    expect(OfflineQueue.count()).toBe(2);
    OfflineQueue.removeSynced([o1.idempotency_key]);
    expect(OfflineQueue.count()).toBe(1);
    expect(OfflineQueue.getQueue()[0].idempotency_key).toBe(o2.idempotency_key);
  });
});

describe('4. Authentication Store Tests (Phase F2/F3 RBAC & Token Storage)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });

  it('sets user profile and updates authentication status flag', () => {
    useAuthStore.getState().setUser({
      id: 1,
      name: 'Nadia Roaster',
      email: 'nadia@velvra.id',
      role: 'branch_manager',
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user?.role).toBe('branch_manager');
  });

  it('persists and clears auth token accurately', () => {
    useAuthStore.getState().setUser({ id: 1, name: 'Admin', email: 'admin@velvra.id', role: 'super_admin' });
    useAuthStore.getState().setToken('JWT_MOCK_TOKEN_999');
    expect(useAuthStore.getState().token).toBe('JWT_MOCK_TOKEN_999');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().setToken(null);
    expect(useAuthStore.getState().token).toBe(null);
  });
});
