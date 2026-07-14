'use client';

import { useState, useEffect, useCallback } from 'react';
import { OfflineQueue, OfflineOrderPayload } from '@/lib/offline-queue';
import { supabase } from '@/lib/supabase';

export function useOfflinePOS() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [queueCount, setQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ synced: number; duplicate: number } | null>(null);

  const refreshQueueCount = useCallback(() => {
    setQueueCount(OfflineQueue.count());
  }, []);

  const syncQueue = useCallback(async () => {
    const pendingOrders = OfflineQueue.getQueue();
    if (pendingOrders.length === 0 || !isOnline || isSyncing) return;

    setIsSyncing(true);
    try {
      // Send batch sync request to Laravel API endpoint
      const response = await fetch('/api/v1/orders/batch-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          orders: pendingOrders.map((o) => ({
            idempotency_key: o.idempotency_key,
            branch_id: o.branch_id || 1,
            order_type: o.order_type,
            payment_method: o.payment_method,
            table_number: o.table_number || null,
            notes: o.notes || null,
            items: o.items.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
              notes: i.notes || null,
            })),
          })),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const successfulKeys = (data.results || []).map((r: any) => r.idempotency_key);
        if (successfulKeys.length > 0) {
          OfflineQueue.removeSynced(successfulKeys);
        } else {
          // If all succeeded or duplicates recognized
          OfflineQueue.clear();
        }
        setLastSyncResult({
          synced: data.synced_count || 0,
          duplicate: data.duplicate_count || 0,
        });
        refreshQueueCount();
      } else {
        // Fallback or simulated sync if API proxy not running
        console.warn('Backend batch-sync returned non-200, attempting direct Supabase queue processing...');
        let syncedCount = 0;
        const syncedKeys: string[] = [];

        for (const o of pendingOrders) {
          const { error } = await supabase.from('orders').insert([{
            order_number: `ORD-OFF-${Math.floor(1000 + Math.random() * 9000)}`,
            customer_name: o.customer_name || 'Walk-in Offline',
            order_type: o.order_type,
            status: 'confirmed',
            total: o.total,
            table_number: o.table_number || 'MEJA-01',
            branch_id: o.branch_id || 1,
          }]);

          if (!error) {
            syncedKeys.push(o.idempotency_key);
            syncedCount++;
          }
        }

        if (syncedKeys.length > 0) {
          OfflineQueue.removeSynced(syncedKeys);
          refreshQueueCount();
          setLastSyncResult({ synced: syncedCount, duplicate: 0 });
        }
      }
    } catch (err) {
      console.warn('Offline sync error (will retry when network stabilizes):', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshQueueCount]);

  useEffect(() => {
    // Initial check
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      refreshQueueCount();

      const handleOnline = () => {
        setIsOnline(true);
        syncQueue();
      };
      const handleOffline = () => {
        setIsOnline(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Auto-sync periodic check every 15 seconds if online
      const interval = setInterval(() => {
        if (navigator.onLine && OfflineQueue.count() > 0) {
          syncQueue();
        }
      }, 15000);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        clearInterval(interval);
      };
    }
  }, [syncQueue, refreshQueueCount]);

  /**
   * Queue an order when offline or when network call fails
   */
  const queueOfflineOrder = (order: Omit<OfflineOrderPayload, 'idempotency_key' | 'created_at'>) => {
    const queued = OfflineQueue.enqueue(order);
    refreshQueueCount();
    return queued;
  };

  return {
    isOnline,
    queueCount,
    isSyncing,
    lastSyncResult,
    queueOfflineOrder,
    syncQueue,
    refreshQueueCount,
  };
}
