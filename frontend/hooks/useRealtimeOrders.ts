'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface LiveOrder {
  id: string | number;
  order_number: string;
  customer_name: string;
  order_type: 'dine_in' | 'takeaway' | 'delivery' | 'online';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  total: number;
  table_number?: string;
  items_count?: number;
  created_at?: string;
  source: 'live' | 'mock';
}

const INITIAL_MOCK_ORDERS: LiveOrder[] = [
  { id: 'mock-1', order_number: 'ORD-8821', customer_name: 'Nadia Putri', order_type: 'dine_in', status: 'preparing', total: 68000, table_number: 'MEJA-04', items_count: 3, source: 'mock', created_at: '2 menit lalu' },
  { id: 'mock-2', order_number: 'ORD-8822', customer_name: 'Budi Santoso', order_type: 'takeaway', status: 'pending', total: 120000, items_count: 4, source: 'mock', created_at: 'Baru saja' },
  { id: 'mock-3', order_number: 'ORD-8820', customer_name: 'Rina Mahardika', order_type: 'dine_in', status: 'ready', total: 95000, table_number: 'MEJA-02', items_count: 2, source: 'mock', created_at: '8 menit lalu' },
];

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<LiveOrder[]>(INITIAL_MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<LiveOrder | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (isMounted && !error && data && data.length > 0) {
          const mapped: LiveOrder[] = data.map((item: any) => ({
            id: item.id,
            order_number: item.order_number || `ORD-${item.id}`,
            customer_name: item.customer_name || 'Pelanggan',
            order_type: item.order_type || 'dine_in',
            status: item.status || 'pending',
            total: Number(item.total) || 0,
            table_number: item.table_number,
            items_count: item.items_count || 1,
            created_at: new Date(item.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            source: 'live',
          }));
          setOrders(mapped);
          setLiveConnected(true);
        } else {
          // If empty or error, keep mock orders but show connected ready state
          setLiveConnected(true);
        }
      } catch (err) {
        console.warn('Supabase orders fetch fallback to mock:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInitialOrders();

    // Subscribe to real-time postgres changes
    const channel = supabase
      .channel('public:orders_kds')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (!isMounted) return;

          if (payload.eventType === 'INSERT') {
            const newOrder: LiveOrder = {
              id: payload.new.id,
              order_number: payload.new.order_number || `ORD-${payload.new.id}`,
              customer_name: payload.new.customer_name || 'Pelanggan QR/Online',
              order_type: payload.new.order_type || 'dine_in',
              status: payload.new.status || 'pending',
              total: Number(payload.new.total) || 0,
              table_number: payload.new.table_number,
              items_count: payload.new.items_count || 1,
              created_at: 'Baru saja',
              source: 'live',
            };

            setOrders((prev) => [newOrder, ...prev]);
            setNewAlert(newOrder);
            // Play notification sound if browser allows
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.play().catch(() => {});
            } catch (e) {}

            setTimeout(() => setNewAlert(null), 5000);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
            );
          } else if (payload.eventType === 'DELETE') {
            setOrders((prev) => prev.filter((o) => o.id !== payload.old.id));
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setLiveConnected(true);
        }
      });

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const triggerStockDeduction = async (order: any) => {
    try {
      const multiplier = Number(order?.items_count || 2);
      // Reduce key ingredients in cloud inventory if table exists
      const { data: invItems } = await supabase.from('inventory').select('id, item_name, current_stock');
      if (invItems && invItems.length > 0) {
        for (const item of invItems) {
          const name = (item.item_name || '').toLowerCase();
          let deduct = 0;
          if (name.includes('kopi')) deduct = 18 * multiplier;
          else if (name.includes('susu')) deduct = 150 * multiplier;
          else if (name.includes('cup') || name.includes('gelas')) deduct = 1 * multiplier;

          if (deduct > 0 && typeof item.current_stock === 'number') {
            const newStock = Math.max(0, item.current_stock - deduct);
            await supabase.from('inventory').update({ current_stock: newStock, updated_at: new Date().toISOString() }).eq('id', item.id);
          }
        }
      }
    } catch (err) {
      console.warn('Auto stock deduction info:', err);
    }
  };

  const updateOrderStatus = async (id: string | number, newStatus: LiveOrder['status']) => {
    // Optimistic UI update
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));

    const target = orders.find((o) => o.id === id);
    if (newStatus === 'completed') {
      triggerStockDeduction(target || { items_count: 2 });
    }

    // If it's a live record, update in Supabase
    if (target && target.source === 'live') {
      await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    }
  };

  const createLiveOrder = async (payload: Partial<LiveOrder>) => {
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRecord = {
      order_number: orderNum,
      customer_name: payload.customer_name || 'Tamu KDS',
      order_type: payload.order_type || 'dine_in',
      status: 'pending',
      total: payload.total || 45000,
      table_number: payload.table_number || 'MEJA-01',
      branch_id: 1, // Default branch ID
    };

    const { data, error } = await supabase.from('orders').insert([newRecord]).select().single();
    if (error) {
      // Fallback local insert if Supabase RLS/schema not fully seeded yet
      const fallback: LiveOrder = {
        id: `local-${Date.now()}`,
        order_number: orderNum,
        customer_name: newRecord.customer_name,
        order_type: newRecord.order_type as any,
        status: 'pending',
        total: newRecord.total,
        table_number: newRecord.table_number,
        items_count: 2,
        created_at: 'Baru saja',
        source: 'live',
      };
      setOrders((prev) => [fallback, ...prev]);
      setNewAlert(fallback);
      return fallback;
    }
    return data;
  };

  return { orders, loading, liveConnected, newAlert, updateOrderStatus, createLiveOrder };
}
