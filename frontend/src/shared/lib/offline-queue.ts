'use client';

export interface OfflineOrderPayload {
  idempotency_key: string;
  branch_id: number;
  order_type: 'dine_in' | 'take_away' | 'takeaway' | 'delivery' | 'online';
  payment_method: 'cash' | 'card' | 'qris' | 'transfer';
  table_number?: string;
  notes?: string;
  items: {
    product_id: number;
    quantity: number;
    notes?: string;
    name?: string;
    price?: number;
  }[];
  total: number;
  customer_name: string;
  created_at: string;
}

const STORAGE_KEY = 'velvra_pos_offline_queue_v1';

export const OfflineQueue = {
  /**
   * Retrieve all pending offline orders from storage
   */
  getQueue(): OfflineOrderPayload[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (err) {
      console.warn('Failed to read offline queue from localStorage:', err);
      return [];
    }
  },

  /**
   * Add a new order to the offline queue with a guaranteed idempotency_key
   */
  enqueue(order: Omit<OfflineOrderPayload, 'idempotency_key' | 'created_at'> & { idempotency_key?: string }): OfflineOrderPayload {
    const queue = this.getQueue();
    const newOrder: OfflineOrderPayload = {
      ...order,
      idempotency_key: order.idempotency_key || `IDEM-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      created_at: new Date().toISOString(),
    };

    queue.push(newOrder);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
      } catch (err) {
        console.warn('Failed to save offline order to localStorage:', err);
      }
    }
    return newOrder;
  },

  /**
   * Remove orders that have successfully synced based on their idempotency_key
   */
  removeSynced(idempotencyKeys: string[]): void {
    if (typeof window === 'undefined') return;
    try {
      const queue = this.getQueue();
      const filtered = queue.filter((item) => !idempotencyKeys.includes(item.idempotency_key));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (err) {
      console.warn('Failed to remove synced items from localStorage:', err);
    }
  },

  /**
   * Clear the entire offline queue
   */
  clear(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  },

  /**
   * Get total count of pending offline orders
   */
  count(): number {
    return this.getQueue().length;
  }
};
