'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/shared/lib/supabase';

export interface CustomerMember {
  id: string | number;
  name: string;
  email: string;
  phone: string;
  tier: 'Gold' | 'Silver' | 'Bronze';
  points: number;
  orders: number;
  totalSpend: number;
  lastVisit: string;
  avatar: string;
  source: 'live' | 'mock';
}

export const INITIAL_CUSTOMERS: CustomerMember[] = [
  { id: 1, name: 'Rina Mahardika', email: 'rina@email.com', phone: '081234567890', tier: 'Gold', points: 4850, orders: 47, totalSpend: 3420000, lastVisit: '2 jam lalu', avatar: 'RM', source: 'mock' },
  { id: 2, name: 'David Chen', email: 'david@email.com', phone: '081234567891', tier: 'Silver', points: 2100, orders: 23, totalSpend: 1680000, lastVisit: 'Kemarin', avatar: 'DC', source: 'mock' },
  { id: 3, name: 'Anisa Putri', email: 'anisa@email.com', phone: '081234567892', tier: 'Gold', points: 6200, orders: 68, totalSpend: 5240000, lastVisit: '1 hari lalu', avatar: 'AP', source: 'mock' },
  { id: 4, name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567893', tier: 'Bronze', points: 420, orders: 8, totalSpend: 340000, lastVisit: '5 hari lalu', avatar: 'BS', source: 'mock' },
  { id: 5, name: 'Sari Wulandari', email: 'sari@email.com', phone: '081234567894', tier: 'Silver', points: 1850, orders: 19, totalSpend: 1240000, lastVisit: '3 hari lalu', avatar: 'SW', source: 'mock' },
];

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerMember[]>(INITIAL_CUSTOMERS);
  const [loading, setLoading] = useState(true);
  const [usingLive, setUsingLive] = useState(false);

  const calculateTier = (points: number): 'Gold' | 'Silver' | 'Bronze' => {
    if (points >= 3500) return 'Gold';
    if (points >= 1200) return 'Silver';
    return 'Bronze';
  };

  const fetchCustomers = async (isMounted = true) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('id', { ascending: true });

      if (isMounted && !error && data && data.length > 0) {
        const mapped: CustomerMember[] = data.map((c: any) => {
          const pts = Number(c.points || c.loyalty_points || 500);
          const name = c.name || c.full_name || 'Pelanggan Setia';
          return {
            id: c.id,
            name,
            email: c.email || 'customer@velvracoffee.com',
            phone: c.phone || '08123456789',
            tier: calculateTier(pts),
            points: pts,
            orders: Number(c.orders_count || c.total_orders || 12),
            totalSpend: Number(c.total_spend || pts * 1000),
            lastVisit: c.last_visit ? 'Hari ini' : '2 hari lalu',
            avatar: name
              .split(' ')
              .map((w: string) => w[0])
              .join('')
              .slice(0, 2)
              .toUpperCase(),
            source: 'live',
          };
        });
        setCustomers(mapped);
        setUsingLive(true);
      } else if (isMounted) {
        setUsingLive(false);
      }
    } catch (err) {
      console.warn('Fallback to mock customers:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchCustomers(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const addCustomer = async (payload: { name: string; email: string; phone: string }) => {
    const avatar = payload.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    if (usingLive) {
      try {
        const { data, error } = await supabase
          .from('customers')
          .insert([
            {
              name: payload.name,
              email: payload.email,
              phone: payload.phone,
              points: 100, // Welcome bonus point
              total_spend: 0,
              orders_count: 0,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          fetchCustomers();
          return data;
        }
      } catch (err) {
        console.warn('Cloud customer insert error:', err);
      }
    }

    const newItem: CustomerMember = {
      id: Date.now(),
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      tier: 'Bronze',
      points: 100,
      orders: 0,
      totalSpend: 0,
      lastVisit: 'Baru saja',
      avatar,
      source: 'mock',
    };
    setCustomers((prev) => [newItem, ...prev]);
    return newItem;
  };

  const addPointsFromTransaction = async (customerId: string | number, amountSpent: number) => {
    // 1 point per Rp 1.000 spent
    const earnedPoints = Math.round(amountSpent / 1000);

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId || c.name.toLowerCase() === String(customerId).toLowerCase()) {
          const nextPoints = c.points + earnedPoints;
          return {
            ...c,
            points: nextPoints,
            orders: c.orders + 1,
            totalSpend: c.totalSpend + amountSpent,
            tier: calculateTier(nextPoints),
            lastVisit: 'Baru saja',
          };
        }
        return c;
      })
    );

    const target = customers.find((c) => c.id === customerId);
    if (target && target.source === 'live' && typeof customerId === 'string') {
      try {
        const nextPoints = target.points + earnedPoints;
        await supabase
          .from('customers')
          .update({
            points: nextPoints,
            orders_count: target.orders + 1,
            total_spend: target.totalSpend + amountSpent,
          })
          .eq('id', customerId);
      } catch (err) {
        console.warn('Cloud loyalty update error:', err);
      }
    }
  };

  return { customers, loading, usingLive, addCustomer, addPointsFromTransaction, refetch: () => fetchCustomers(true) };
}
