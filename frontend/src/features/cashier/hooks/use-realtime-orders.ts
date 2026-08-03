'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/shared/api/axios';

export interface KdsOrderItem {
  id: string | number;
  name: string;
  qty: number;
  note?: string;
  done?: boolean;
}

export interface LiveOrder {
  id: string | number;
  order_number: string;
  customer_name: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  table_number?: string;
  items_count?: number;
  items?: KdsOrderItem[];
  created_at?: string;
  created_timestamp?: number;
  source: 'live' | 'mock';
}

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<LiveOrder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isFetching = useRef(false);
  const mutationLock = useRef(0);
  
  // Track known IDs to detect new incoming tickets
  const knownTicketIds = useRef<Set<string | number>>(new Set());
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTickets = useCallback(async (isInitial = false) => {
    if (isFetching.current) return;
    if (Date.now() < mutationLock.current) return; // Prevent overwriting optimistic UI
    isFetching.current = true;
    
    // Abort previous polling request if it's still somehow hanging
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const response = await api.get('/kds/tickets', {
        signal: abortControllerRef.current.signal
      });
      if (response.data?.success) {
        const rawTickets = response.data.data;
        
        const mapped: LiveOrder[] = rawTickets.map((t: any) => {
          // Map Laravel status to React UI status
          let uiStatus: LiveOrder['status'] = 'pending';
          if (t.status === 'diterima') uiStatus = 'pending';
          if (t.status === 'diproses') uiStatus = 'preparing';
          if (t.status === 'siap') uiStatus = 'ready';
          if (t.status === 'disajikan') uiStatus = 'completed';
          if (t.status === 'dibatalkan') uiStatus = 'cancelled';

          const createdMs = new Date(t.received_at || t.created_at).getTime();
          const diffMin = Math.floor((Date.now() - createdMs) / (1000 * 60));

          const mappedItems: KdsOrderItem[] = (t.items || []).map((item: any) => ({
            id: item.id,
            name: item.menu_name_snapshot || 'Produk Menu',
            qty: item.quantity,
            note: item.note,
            done: item.item_status === 'selesai' || item.item_status === 'disajikan',
          }));

          return {
            id: t.id,
            order_number: t.ticket_number || `TKT-${t.id}`,
            customer_name: t.transaction?.customer_name || 'Pelanggan',
            order_type: t.transaction?.order_type || t.order_type || 'dine_in',
            status: uiStatus,
            total: t.transaction?.total || 0,
            table_number: t.transaction?.table_number || 'Pesanan Kasir',
            items_count: mappedItems.length,
            items: mappedItems,
            created_at: diffMin > 0 ? `${diffMin} menit lalu` : 'Baru saja',
            created_timestamp: createdMs,
            source: 'live',
          };
        });

        // Deteksi tiket baru masuk jika bukan load pertama
        if (!isInitial) {
          const newIds = mapped.map(m => m.id);
          const justArrived = mapped.find(m => !knownTicketIds.current.has(m.id));
          
          if (justArrived && justArrived.status === 'pending') {
            setNewAlert(justArrived);
            try {
              if (!audioRef.current) {
                audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              }
              audioRef.current.play().catch(() => {});
            } catch (e) {}
            setTimeout(() => setNewAlert(null), 6000);
          }
          
          // Update known IDs
          knownTicketIds.current = new Set(newIds);
        } else {
          // Isi known IDs saat initial load
          knownTicketIds.current = new Set(mapped.map(m => m.id));
        }

        // Update state ONLY if no mutation occurred while we were fetching
        if (Date.now() >= mutationLock.current) {
          setOrders(mapped);
        }
        setLiveConnected(true);
      }
    } catch (err: any) {
      if (err.name === 'CanceledError' || err.message === 'canceled') return; // Ignore aborts
      console.warn('Gagal memuat tiket KDS dari server:', err);
      setLiveConnected(false);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchTickets(true);

    // Polling setiap 10 detik sebagai pengganti WebSocket untuk mengurangi beban server artisan
    const interval = setInterval(() => {
      fetchTickets(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchTickets]);

  const updateOrderStatus = async (id: string | number, newStatus: LiveOrder['status']) => {
    mutationLock.current = Date.now() + 2500; // Lock for 2.5s
    // Optimistic UI Update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));

    // BUG FIX 2: Complete status mapping UI → Laravel (was missing 'confirmed' case)
    const statusMap: Record<string, string> = {
      pending: 'diterima',
      confirmed: 'diterima',   // treat confirmed same as pending (both = diterima in backend)
      preparing: 'diproses',
      ready: 'siap',
      completed: 'disajikan',
      cancelled: 'dibatalkan',
    };
    const laravelStatus = statusMap[newStatus] ?? 'diterima';

    try {
      await api.patch(`/kds/tickets/${id}/status`, { status: laravelStatus });
      // Removed immediate fetchTickets(false) and mutationLock clear to prevent race conditions
    } catch (err) {
      console.error('Gagal update status tiket:', err);
      // Removed immediate fetchTickets(false) to prevent jumping
    }
  };

  const toggleOrderItemDone = async (orderId: string | number, itemId: string | number) => {
    mutationLock.current = Date.now() + 2500; // Lock for 2.5s
    // Cari status saat ini
    let currentItemDone = false;
    let allFinished = true;
    
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !order.items) return order;
        
        let checkedCount = 0;
        const newItems = order.items.map((it) => {
          if (it.id === itemId) {
            currentItemDone = !it.done;
            if (currentItemDone) checkedCount++;
            return { ...it, done: currentItemDone };
          }
          if (it.done) checkedCount++;
          return it;
        });
        
        allFinished = checkedCount === newItems.length;
        
        return {
          ...order,
          items: newItems,
          // We intentionally do NOT auto-change the ticket status to 'ready' here.
          // The user must explicitly click the "Tandai Siap Saji" button.
          status: order.status
        };
      })
    );

    const laravelItemStatus = currentItemDone ? 'selesai' : 'diproses';
    try {
      await api.patch(`/kds/tickets/${orderId}/items/${itemId}/status`, { item_status: laravelItemStatus });
      // Removed mutationLock.current = 0 to prevent race conditions
    } catch (err) {
      console.error('Gagal update status item:', err);
      // Removed immediate fetchTickets(false) to prevent jumping
    }
  };

  const createLiveOrder = async (payload: Partial<LiveOrder>) => {
    // Pada arsitektur baru, pesanan tidak dibuat via KDS. 
    // Pesanan selalu dibuat dari POS (Kasir), KDS hanya menerima tiket.
    console.warn('createLiveOrder dipanggil dari KDS. Seharusnya hanya via POS.');
    return null;
  };

  return { orders, loading, liveConnected, newAlert, updateOrderStatus, toggleOrderItemDone, createLiveOrder };
}
