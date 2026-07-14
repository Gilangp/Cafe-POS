'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface InventoryItem {
  id: string | number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  threshold: number;
  cost: number;
  lastUpdate: string;
  source: 'live' | 'mock';
}

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Susu Full Cream (Greenfields)', category: 'Dairy', stock: 45, unit: 'liter', threshold: 20, cost: 18000, lastUpdate: 'Hari ini', source: 'mock' },
  { id: 2, name: 'Susu Oat (Oatly)', category: 'Dairy', stock: 2, unit: 'liter', threshold: 5, cost: 55000, lastUpdate: 'Hari ini', source: 'mock' },
  { id: 3, name: 'Biji Kopi Sumatra Dark Roast', category: 'Kopi', stock: 800, unit: 'gram', threshold: 1000, cost: 350, lastUpdate: 'Kemarin', source: 'mock' },
  { id: 4, name: 'Biji Kopi Ethiopia Single Origin', category: 'Kopi', stock: 2400, unit: 'gram', threshold: 500, cost: 420, lastUpdate: 'Kemarin', source: 'mock' },
  { id: 5, name: 'Mentega Anchor', category: 'Baking', stock: 3, unit: 'pack', threshold: 6, cost: 22000, lastUpdate: '2 hari lalu', source: 'mock' },
  { id: 6, name: 'Tepung Terigu Protein Tinggi', category: 'Baking', stock: 12, unit: 'kg', threshold: 5, cost: 14000, lastUpdate: '3 hari lalu', source: 'mock' },
  { id: 7, name: 'Gula Pasir Premium', category: 'Bahan Dasar', stock: 25, unit: 'kg', threshold: 10, cost: 16000, lastUpdate: '3 hari lalu', source: 'mock' },
  { id: 8, name: 'Sirup Vanilla Madagascar', category: 'Sirup', stock: 4, unit: 'botol', threshold: 3, cost: 95000, lastUpdate: 'Kemarin', source: 'mock' },
  { id: 9, name: 'Cokelat Dark 70% (Valrhona)', category: 'Baking', stock: 1500, unit: 'gram', threshold: 500, cost: 280, lastUpdate: '4 hari lalu', source: 'mock' },
  { id: 10, name: 'Bubuk Matcha Uji Ceremonial', category: 'Minuman', stock: 200, unit: 'gram', threshold: 150, cost: 1200, lastUpdate: 'Kemarin', source: 'mock' },
];

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [usingLive, setUsingLive] = useState(false);

  const fetchInventory = async (isMounted = true) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('id', { ascending: true });

      if (isMounted && !error && data && data.length > 0) {
        const mapped: InventoryItem[] = data.map((item: any) => ({
          id: item.id,
          name: item.item_name || item.name || 'Bahan Baku',
          category: item.category || 'Umum',
          stock: Number(item.current_stock ?? item.stock ?? 10),
          unit: item.unit || 'satuan',
          threshold: Number(item.minimum_stock ?? item.threshold ?? 5),
          cost: Number(item.cost_per_unit ?? item.cost ?? 15000),
          lastUpdate: item.updated_at ? 'Hari ini' : 'Baru saja',
          source: 'live',
        }));
        setItems(mapped);
        setUsingLive(true);
      } else if (isMounted) {
        // If table doesn't exist or is empty, fallback to rich mock data
        setUsingLive(false);
      }
    } catch (err) {
      console.warn('Fallback to mock inventory:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchInventory(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  const adjustStock = async (id: string | number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStock = Math.max(0, item.stock + delta);
          return { ...item, stock: newStock, lastUpdate: 'Baru saja' };
        }
        return item;
      })
    );

    const target = items.find((i) => i.id === id);
    if (target && target.source === 'live' && typeof id === 'string') {
      try {
        const newStock = Math.max(0, target.stock + delta);
        await supabase
          .from('inventory')
          .update({ current_stock: newStock, updated_at: new Date().toISOString() })
          .eq('id', id);
      } catch (err) {
        console.warn('Cloud inventory update error:', err);
      }
    }
  };

  const addItem = async (payload: Omit<InventoryItem, 'id' | 'lastUpdate' | 'source'>) => {
    if (usingLive) {
      try {
        const { data, error } = await supabase
          .from('inventory')
          .insert([
            {
              item_name: payload.name,
              category: payload.category,
              current_stock: payload.stock,
              unit: payload.unit,
              minimum_stock: payload.threshold,
              cost_per_unit: payload.cost,
            },
          ])
          .select()
          .single();

        if (!error && data) {
          fetchInventory();
          return data;
        }
      } catch (err) {
        console.warn('Cloud insert error:', err);
      }
    }

    // Local fallback
    const newItem: InventoryItem = {
      id: Date.now(),
      ...payload,
      lastUpdate: 'Baru saja',
      source: 'mock',
    };
    setItems((prev) => [newItem, ...prev]);
    return newItem;
  };

  return { items, loading, usingLive, adjustStock, addItem, refetch: () => fetchInventory(true) };
}
