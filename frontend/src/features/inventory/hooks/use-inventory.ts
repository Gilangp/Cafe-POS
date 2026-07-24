'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/api/axios';
import { useBranchStore } from '@/store/branch.store';

export interface InventoryItem {
  id: string | number;
  name: string;
  category: string;
  stock: number;
  unit: string;
  threshold: number;
  cost: number;
  lastUpdate: string;
  sku?: string;
  reorder_quantity?: number;
  source: 'live' | 'mock';
}

export interface CycleCountPayload {
  inventory_item_id: string | number;
  type: 'ADJUSTMENT_UP' | 'ADJUSTMENT_DOWN' | 'DAMAGED' | 'WASTE' | 'RETURNED';
  quantity: number;
  notes?: string;
  batch_number?: string;
  expiration_date?: string;
}

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 1, name: 'Susu Full Cream (Greenfields)', category: 'Dairy', stock: 45, unit: 'liter', threshold: 20, cost: 18000, lastUpdate: 'Hari ini', sku: 'DRY-001', source: 'mock' },
  { id: 2, name: 'Susu Oat (Oatly)', category: 'Dairy', stock: 2, unit: 'liter', threshold: 5, cost: 55000, lastUpdate: 'Hari ini', sku: 'DRY-002', source: 'mock' },
  { id: 3, name: 'Biji Kopi Sumatra Dark Roast', category: 'Kopi', stock: 800, unit: 'gram', threshold: 1000, cost: 350, lastUpdate: 'Kemarin', sku: 'COF-001', source: 'mock' },
  { id: 4, name: 'Biji Kopi Ethiopia Single Origin', category: 'Kopi', stock: 2400, unit: 'gram', threshold: 500, cost: 420, lastUpdate: 'Kemarin', sku: 'COF-002', source: 'mock' },
  { id: 5, name: 'Mentega Anchor', category: 'Baking', stock: 3, unit: 'pack', threshold: 6, cost: 22000, lastUpdate: '2 hari lalu', sku: 'BAK-001', source: 'mock' },
  { id: 6, name: 'Tepung Terigu Protein Tinggi', category: 'Baking', stock: 12, unit: 'kg', threshold: 5, cost: 14000, lastUpdate: '3 hari lalu', sku: 'BAK-002', source: 'mock' },
  { id: 7, name: 'Gula Pasir Premium', category: 'Bahan Dasar', stock: 25, unit: 'kg', threshold: 10, cost: 16000, lastUpdate: '3 hari lalu', sku: 'RAW-001', source: 'mock' },
  { id: 8, name: 'Sirup Vanilla Madagascar', category: 'Sirup', stock: 4, unit: 'botol', threshold: 3, cost: 95000, lastUpdate: 'Kemarin', sku: 'SYR-001', source: 'mock' },
  { id: 9, name: 'Cokelat Dark 70% (Valrhona)', category: 'Baking', stock: 1500, unit: 'gram', threshold: 500, cost: 280, lastUpdate: '4 hari lalu', sku: 'BAK-003', source: 'mock' },
  { id: 10, name: 'Bubuk Matcha Uji Ceremonial', category: 'Minuman', stock: 200, unit: 'gram', threshold: 150, cost: 1200, lastUpdate: 'Kemarin', sku: 'BEV-001', source: 'mock' },
];

export function useInventory(options?: { lowStockOnly?: boolean }) {
  const activeBranchId = useBranchStore((s) => s.activeBranchId);
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [loading, setLoading] = useState(true);
  const [usingLive, setUsingLive] = useState(false);

  const fetchInventory = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      const params: any = { per_page: 100 };
      if (options?.lowStockOnly) {
        params.low_stock = true;
      }
      if (activeBranchId) {
        params.branch_id = activeBranchId;
      }

      const res = await api.get<any>('/inventory', { params });
      const rawData = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      if (isMounted && rawData.length > 0) {
        const mapped: InventoryItem[] = rawData.map((item: any) => ({
          id: item.id,
          name: item.name || item.item_name || 'Bahan Baku',
          category: item.category || 'Umum',
          stock: Number(item.quantity ?? item.current_stock ?? item.stock ?? 0),
          unit: item.unit || 'satuan',
          threshold: Number(item.reorder_point ?? item.minimum_stock ?? item.threshold ?? 5),
          cost: Number(item.unit_cost ?? item.cost_per_unit ?? item.cost ?? 15000),
          sku: item.sku || '',
          reorder_quantity: Number(item.reorder_quantity || 10),
          lastUpdate: item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : 'Hari ini',
          source: 'live',
        }));
        setItems(mapped);
        setUsingLive(true);
      } else if (isMounted && options?.lowStockOnly && rawData.length === 0) {
        setItems([]);
        setUsingLive(true);
      } else if (isMounted) {
        // Keep initial mock if server returns empty list when checking all inventory
      }
    } catch (err) {
      console.warn('Fallback to mock inventory:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [options?.lowStockOnly, activeBranchId]);

  useEffect(() => {
    let isMounted = true;
    fetchInventory(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchInventory]);

  // INV-005 & INV-006: Cycle count and FEFO batch adjustments
  const performCycleCount = async (payload: CycleCountPayload) => {
    if (usingLive && typeof payload.inventory_item_id !== 'string') {
      const res = await api.post<any>('/inventory/adjust', payload);
      await fetchInventory(true);
      return res.data;
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (String(item.id) === String(payload.inventory_item_id)) {
            const isDown = ['ADJUSTMENT_DOWN', 'DAMAGED', 'WASTE'].includes(payload.type);
            const delta = isDown ? -payload.quantity : payload.quantity;
            const newStock = Math.max(0, item.stock + delta);
            return { ...item, stock: newStock, lastUpdate: 'Baru saja' };
          }
          return item;
        })
      );
      return null;
    }
  };

  const adjustStock = async (id: string | number, delta: number) => {
    if (usingLive && typeof id !== 'string') {
      const type = delta >= 0 ? 'ADJUSTMENT_UP' : 'ADJUSTMENT_DOWN';
      await api.post('/inventory/adjust', {
        inventory_item_id: id,
        type,
        quantity: Math.abs(delta),
        notes: `Quick adjustment (${delta >= 0 ? '+' : ''}${delta})`,
      });
      await fetchInventory(true);
    } else {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const newStock = Math.max(0, item.stock + delta);
            return { ...item, stock: newStock, lastUpdate: 'Baru saja' };
          }
          return item;
        })
      );
    }
  };

  const addItem = async (payload: Omit<InventoryItem, 'id' | 'lastUpdate' | 'source'>) => {
    if (usingLive) {
      const res = await api.post<any>('/inventory', {
        branch_id: activeBranchId || 1,
        name: payload.name,
        category: payload.category,
        quantity: payload.stock,
        unit: payload.unit,
        reorder_point: payload.threshold,
        unit_cost: payload.cost,
        sku: payload.sku || undefined,
      });
      await fetchInventory(true);
      return res.data;
    } else {
      const newItem: InventoryItem = {
        id: Date.now(),
        ...payload,
        lastUpdate: 'Baru saja',
        source: 'mock',
      };
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    }
  };

  const deleteItem = async (id: string | number) => {
    if (usingLive && typeof id !== 'string') {
      await api.delete(`/inventory/${id}`);
      await fetchInventory(true);
    } else {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return {
    items,
    loading,
    usingLive,
    performCycleCount,
    adjustStock,
    addItem,
    deleteItem,
    refetch: () => fetchInventory(true),
  };
}
