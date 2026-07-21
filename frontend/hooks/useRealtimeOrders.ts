'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

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

const INITIAL_MOCK_ORDERS: LiveOrder[] = [
  {
    id: 'mock-1',
    order_number: 'ORD-8821',
    customer_name: 'Dr. Nadia Putri',
    order_type: 'dine_in',
    status: 'preparing',
    total: 108000,
    table_number: 'Meja A2 (Window VIP)',
    items_count: 3,
    items: [
      { id: 101, name: 'Velvet Espresso Single Origin', qty: 1, note: 'Double shot, extra hot', done: true },
      { id: 102, name: 'Caramel Macchiato Gold', qty: 1, note: 'Less sugar 50%, oat milk', done: false },
      { id: 103, name: 'Butter Artisan Croissant', qty: 1, note: 'Hangatkan (Toasted)', done: true },
    ],
    source: 'mock',
    created_at: '6 menit lalu',
    created_timestamp: Date.now() - 6 * 60 * 1000,
  },
  {
    id: 'mock-2',
    order_number: 'ORD-8822',
    customer_name: 'Budi Santoso',
    order_type: 'takeaway',
    status: 'pending',
    total: 120000,
    items_count: 3,
    items: [
      { id: 201, name: 'Signature Cold Brew 24H', qty: 2, note: 'Tanpa es, pisah botol', done: false },
      { id: 202, name: 'Belgian Chocolate Brownie', qty: 1, note: 'Takeaway box exclusive', done: false },
    ],
    source: 'mock',
    created_at: '2 menit lalu',
    created_timestamp: Date.now() - 2 * 60 * 1000,
  },
  {
    id: 'mock-3',
    order_number: 'ORD-8820',
    customer_name: 'Hendra Saputra & Tim',
    order_type: 'dine_in',
    status: 'preparing',
    total: 165000,
    table_number: 'Meja C1 (Communal)',
    items_count: 4,
    items: [
      { id: 301, name: 'Uji Matcha Ceremonial Latte', qty: 2, note: 'Less ice, almond milk (+15k)', done: false },
      { id: 302, name: 'Sourdough Avocado Toast', qty: 1, note: 'Poached egg well done', done: false },
      { id: 303, name: 'Almond Kouign-Amann', qty: 1, done: false },
    ],
    source: 'mock',
    created_at: '11 menit lalu',
    created_timestamp: Date.now() - 11 * 60 * 1000,
  },
  {
    id: 'mock-4',
    order_number: 'ORD-8819',
    customer_name: 'Rina Mahardika',
    order_type: 'dine_in',
    status: 'ready',
    total: 95000,
    table_number: 'Meja B4 (Sofa Lounge)',
    items_count: 2,
    items: [
      { id: 401, name: 'Iced Hazelnut Latte', qty: 1, note: 'Normal sweet', done: true },
      { id: 402, name: 'Classic Tiramisu Slice', qty: 1, done: true },
    ],
    source: 'mock',
    created_at: '14 menit lalu',
    created_timestamp: Date.now() - 14 * 60 * 1000,
  },
];

export function useRealtimeOrders() {
  const [orders, setOrders] = useState<LiveOrder[]>(INITIAL_MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [liveConnected, setLiveConnected] = useState(false);
  const [newAlert, setNewAlert] = useState<LiveOrder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchInitialOrders() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(25);

        if (isMounted && !error && data && data.length > 0) {
          const mapped: LiveOrder[] = data.map((item: any) => {
            const createdMs = item.created_at ? new Date(item.created_at).getTime() : Date.now();
            const diffMin = Math.floor((Date.now() - createdMs) / (1000 * 60));
            return {
              id: item.id,
              order_number: item.order_number || `ORD-${item.id}`,
              customer_name: item.customer_name || 'Pelanggan Walk-in',
              order_type: item.order_type || 'dine_in',
              status: item.status || 'pending',
              total: Number(item.total) || 0,
              table_number: item.table_number || 'Meja Walk-in',
              items_count: item.items_count || (item.items ? item.items.length : 1),
              items: Array.isArray(item.items)
                ? item.items
                : [
                    { id: `${item.id}-1`, name: 'Specialty Espresso Artisan', qty: 1, note: 'Racikan standar KDS', done: false },
                  ],
              created_at: diffMin > 0 ? `${diffMin} menit lalu` : 'Baru saja',
              created_timestamp: createdMs,
              source: 'live',
            };
          });
          setOrders(mapped);
          setLiveConnected(true);
        } else {
          setLiveConnected(true);
        }
      } catch (err) {
        console.warn('Supabase orders fetch fallback to mock:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchInitialOrders();

    // 8.2 Real-time Sync & Sound Alert Subscription
    const channel = supabase
      .channel('public:orders_kds')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (!isMounted) return;

          if (payload.eventType === 'INSERT') {
            const createdMs = Date.now();
            const newOrder: LiveOrder = {
              id: payload.new.id,
              order_number: payload.new.order_number || `ORD-${payload.new.id}`,
              customer_name: payload.new.customer_name || 'Pelanggan Baru',
              order_type: payload.new.order_type || 'dine_in',
              status: payload.new.status || 'pending',
              total: Number(payload.new.total) || 0,
              table_number: payload.new.table_number || 'Meja KDS',
              items_count: payload.new.items_count || 1,
              items: Array.isArray(payload.new.items)
                ? payload.new.items
                : [
                    { id: `${payload.new.id}-1`, name: 'Paket Artisan Kopi / Pastry', qty: 1, note: 'Pesanan baru masuk dari POS', done: false },
                  ],
              created_at: 'Baru saja',
              created_timestamp: createdMs,
              source: 'live',
            };

            setOrders((prev) => [newOrder, ...prev]);
            setNewAlert(newOrder);

            // 8.2 Sound Alert Notification
            try {
              if (!audioRef.current) {
                audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              }
              audioRef.current.play().catch(() => {});
            } catch (e) {}

            setTimeout(() => {
              if (isMounted) setNewAlert(null);
            }, 6000);
          } else if (payload.eventType === 'UPDATE') {
            setOrders((prev) =>
              prev.map((o) => (o.id === payload.new.id ? { ...o, status: payload.new.status } : o))
            );
            // If updated to ready, broadcast sync to POS (8.4)
            if (payload.new.status === 'ready') {
              localStorage.setItem(
                'nemu_kds_latest_ready',
                JSON.stringify({
                  orderId: payload.new.id,
                  orderNumber: payload.new.order_number || `ORD-${payload.new.id}`,
                  tableNumber: payload.new.table_number || 'Takeaway',
                  timestamp: Date.now(),
                })
              );
            }
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

  const triggerLoyaltyReward = async (order: any) => {
    try {
      const custName = order?.customer_name;
      const amount = Number(order?.total || 45000);
      const earnedPts = Math.round(amount / 1000);

      if (custName && earnedPts > 0) {
        const { data: members } = await supabase
          .from('customers')
          .select('*')
          .ilike('name', `%${custName}%`)
          .limit(1);

        if (members && members.length > 0) {
          const m = members[0];
          const newPts = Number(m.points || 0) + earnedPts;
          await supabase
            .from('customers')
            .update({
              points: newPts,
              total_spend: Number(m.total_spend || 0) + amount,
              orders_count: Number(m.orders_count || 0) + 1,
            })
            .eq('id', m.id);
        }
      }
    } catch (err) {
      console.warn('Auto loyalty reward info:', err);
    }
  };

  // 8.4 POS Synchronization Trigger
  const updateOrderStatus = async (id: string | number, newStatus: LiveOrder['status']) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));

    const target = orders.find((o) => o.id === id);

    // If marked READY, broadcast to POS Kasir (8.4)
    if (newStatus === 'ready' && target) {
      localStorage.setItem(
        'nemu_kds_latest_ready',
        JSON.stringify({
          orderId: target.id,
          orderNumber: target.order_number,
          tableNumber: target.table_number || 'Walk-in / Takeaway',
          customerName: target.customer_name,
          timestamp: Date.now(),
        })
      );
      window.dispatchEvent(new Event('storage'));
    }

    if (newStatus === 'completed') {
      triggerStockDeduction(target || { items_count: 2 });
      triggerLoyaltyReward(target || { customer_name: 'Pelanggan Setia', total: 45000 });
    }

    if (target && target.source === 'live') {
      await supabase.from('orders').update({ status: newStatus }).eq('id', id);
    }
  };

  // Item Checklist Toggle inside KDS
  const toggleOrderItemDone = (orderId: string | number, itemId: string | number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId || !order.items) return order;
        return {
          ...order,
          items: order.items.map((it) => (it.id === itemId ? { ...it, done: !it.done } : it)),
        };
      })
    );
  };

  const createLiveOrder = async (payload: Partial<LiveOrder>) => {
    const orderNum = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const createdMs = Date.now();
    const newRecord = {
      order_number: orderNum,
      customer_name: payload.customer_name || 'Tamu POS Kasir',
      order_type: payload.order_type || 'dine_in',
      status: 'pending',
      total: payload.total || 45000,
      table_number: payload.table_number || 'Meja KDS-01',
      items_count: payload.items_count || (payload.items ? payload.items.length : 1),
      items: payload.items || [
        { id: `${Date.now()}-1`, name: 'Specialty Beverage / Pastry', qty: 1, note: 'Pemesanan POS Kasir', done: false },
      ],
      branch_id: 1,
    };

    const { data, error } = await supabase.from('orders').insert([newRecord]).select().single();
    if (error) {
      const fallback: LiveOrder = {
        id: `local-${createdMs}`,
        order_number: orderNum,
        customer_name: newRecord.customer_name,
        order_type: newRecord.order_type as any,
        status: 'pending',
        total: newRecord.total,
        table_number: newRecord.table_number,
        items_count: newRecord.items_count,
        items: newRecord.items as any,
        created_at: 'Baru saja',
        created_timestamp: createdMs,
        source: 'live',
      };
      setOrders((prev) => [fallback, ...prev]);
      setNewAlert(fallback);

      // Play sound for local simulation
      try {
        if (!audioRef.current) {
          audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        }
        audioRef.current.play().catch(() => {});
      } catch (e) {}

      setTimeout(() => setNewAlert(null), 6000);
      return fallback;
    }
    return data;
  };

  return { orders, loading, liveConnected, newAlert, updateOrderStatus, toggleOrderItemDone, createLiveOrder };
}
