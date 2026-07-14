'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useBranchStore } from '@/store/branch-store';

export interface SupplierItem {
  id: string | number;
  name: string;
  code?: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  category?: string;
  source?: 'live' | 'mock';
}

export interface PurchaseOrderItemData {
  id: string | number;
  inventory_item_id: string | number;
  inventory_item?: {
    id: string | number;
    name: string;
    unit: string;
  };
  quantity: number;
  received_quantity: number;
  unit: string;
  unit_price_cents: number;
  total_price_cents: number;
}

export interface PurchaseOrderData {
  id: string | number;
  po_number: string;
  supplier_id: string | number;
  supplier?: SupplierItem;
  branch_id: string | number;
  order_date: string;
  expected_delivery_date?: string | null;
  status: 'DRAFT' | 'ORDERED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
  total_cents: number;
  notes?: string | null;
  items?: PurchaseOrderItemData[];
  source?: 'live' | 'mock';
}

export const MOCK_SUPPLIERS: SupplierItem[] = [
  { id: 1, name: 'PT Agri Nusantara Kopi', code: 'SUP-001', contact_person: 'Pak Hendra', phone: '021-555-1234', email: 'hendra@agrinusantara.co.id', address: 'Jl. Raya Bogor No. 45, Jakarta', is_active: true, category: 'Kopi', source: 'mock' },
  { id: 2, name: 'Greenfields Indonesia Distribution', code: 'SUP-002', contact_person: 'Bu Sinta', phone: '021-555-5678', email: 'sinta@greenfields.id', address: 'Kawasan Industri Cikarang Barat', is_active: true, category: 'Dairy', source: 'mock' },
  { id: 3, name: 'Anchor Dairy Distributor Official', code: 'SUP-003', contact_person: 'Pak Budi', phone: '021-555-9012', email: 'budi@anchordairy.id', address: 'Jl. Daan Mogot Km 12, Tangerang', is_active: true, category: 'Dairy', source: 'mock' },
  { id: 4, name: 'Valrhona Chocolate Asia Pacific', code: 'SUP-004', contact_person: 'Ms. Lena', phone: '021-555-3456', email: 'lena@valrhona.asia', address: 'Sudirman Central Business District, Jakarta', is_active: true, category: 'Baking', source: 'mock' },
  { id: 5, name: 'Monin Syrup Artisan Importer', code: 'SUP-005', contact_person: 'Pak Reza', phone: '021-555-7890', email: 'reza@monin.com', address: 'Kelapa Gading Boulevard, Jakarta Utara', is_active: true, category: 'Sirup', source: 'mock' },
];

export const MOCK_POS: PurchaseOrderData[] = [
  {
    id: 101,
    po_number: 'PO-2026-0701',
    supplier_id: 1,
    supplier: MOCK_SUPPLIERS[0],
    branch_id: 1,
    order_date: '2026-07-10',
    expected_delivery_date: '2026-07-12',
    status: 'RECEIVED',
    total_cents: 485000000,
    notes: 'Pengiriman batch biji kopi Sumatra dan Ethiopia reguler.',
    items: [
      {
        id: 1,
        inventory_item_id: 3,
        inventory_item: { id: 3, name: 'Biji Kopi Sumatra Dark Roast', unit: 'gram' },
        quantity: 50000,
        received_quantity: 50000,
        unit: 'gram',
        unit_price_cents: 35000,
        total_price_cents: 1750000000,
      },
    ],
    source: 'mock',
  },
  {
    id: 102,
    po_number: 'PO-2026-0705',
    supplier_id: 2,
    supplier: MOCK_SUPPLIERS[1],
    branch_id: 1,
    order_date: '2026-07-14',
    expected_delivery_date: '2026-07-15',
    status: 'DRAFT',
    total_cents: 228000000,
    notes: 'Kebutuhan susu segar untuk akhir pekan.',
    items: [
      {
        id: 2,
        inventory_item_id: 1,
        inventory_item: { id: 1, name: 'Susu Full Cream (Greenfields)', unit: 'liter' },
        quantity: 100,
        received_quantity: 0,
        unit: 'liter',
        unit_price_cents: 1800000,
        total_price_cents: 180000000,
      },
    ],
    source: 'mock',
  },
];

export function useProcurement() {
  const activeBranchId = useBranchStore((s) => s.activeBranchId);
  const [suppliers, setSuppliers] = useState<SupplierItem[]>(MOCK_SUPPLIERS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrderData[]>(MOCK_POS);
  const [loading, setLoading] = useState(true);
  const [usingLive, setUsingLive] = useState(false);

  const fetchAll = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      // 1. Fetch Suppliers
      const supRes = await api.get<any>('/suppliers', { params: { per_page: 100 } });
      const rawSups = Array.isArray(supRes.data?.data) ? supRes.data.data : Array.isArray(supRes.data) ? supRes.data : [];
      
      let mappedSups = MOCK_SUPPLIERS;
      if (rawSups.length > 0) {
        mappedSups = rawSups.map((s: any) => ({
          id: s.id,
          name: s.name,
          code: s.code || `SUP-${String(s.id).padStart(3, '0')}`,
          contact_person: s.contact_person || 'Pic Supplier',
          email: s.email || '',
          phone: s.phone || '',
          address: s.address || '',
          is_active: s.is_active !== false,
          category: s.category || 'Bahan Baku',
          source: 'live',
        }));
        if (isMounted) {
          setSuppliers(mappedSups);
          setUsingLive(true);
        }
      }

      // 2. Fetch Purchase Orders
      const poRes = await api.get<any>('/purchase-orders', {
        params: { branch_id: activeBranchId || 1, per_page: 50 },
      });
      const rawPos = Array.isArray(poRes.data?.data) ? poRes.data.data : Array.isArray(poRes.data) ? poRes.data : [];
      if (rawPos.length > 0 && isMounted) {
        const mappedPos: PurchaseOrderData[] = rawPos.map((po: any) => ({
          id: po.id,
          po_number: po.po_number || `PO-${po.id}`,
          supplier_id: po.supplier_id,
          supplier: po.supplier
            ? {
                id: po.supplier.id,
                name: po.supplier.name,
                code: po.supplier.code,
                contact_person: po.supplier.contact_person,
                phone: po.supplier.phone,
                email: po.supplier.email,
                is_active: true,
              }
            : mappedSups.find((s) => String(s.id) === String(po.supplier_id)),
          branch_id: po.branch_id || 1,
          order_date: po.order_date || new Date().toISOString().split('T')[0],
          expected_delivery_date: po.expected_delivery_date || null,
          status: po.status || 'DRAFT',
          total_cents: Number(po.total_cents) || 0,
          notes: po.notes || '',
          items: Array.isArray(po.items)
            ? po.items.map((i: any) => ({
                id: i.id,
                inventory_item_id: i.inventory_item_id,
                inventory_item: i.inventoryItem || { id: i.inventory_item_id, name: 'Item', unit: i.unit },
                quantity: Number(i.quantity) || 0,
                received_quantity: Number(i.received_quantity) || 0,
                unit: i.unit || 'satuan',
                unit_price_cents: Number(i.unit_price_cents) || 0,
                total_price_cents: Number(i.total_price_cents) || 0,
              }))
            : [],
          source: 'live',
        }));
        setPurchaseOrders(mappedPos);
        setUsingLive(true);
      }
    } catch (err) {
      console.warn('Fallback to mock procurement:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [activeBranchId]);

  useEffect(() => {
    let isMounted = true;
    fetchAll(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchAll]);

  // Supplier CRUD
  const createSupplier = async (data: Omit<SupplierItem, 'id' | 'source'>) => {
    if (usingLive) {
      await api.post('/suppliers', data);
      await fetchAll(true);
    } else {
      const newSup: SupplierItem = {
        id: Date.now(),
        ...data,
        code: data.code || `SUP-${Date.now().toString().slice(-3)}`,
        source: 'mock',
      };
      setSuppliers((prev) => [newSup, ...prev]);
    }
  };

  const updateSupplier = async (id: string | number, data: Partial<SupplierItem>) => {
    if (usingLive && typeof id !== 'string') {
      await api.put(`/suppliers/${id}`, data);
      await fetchAll(true);
    } else {
      setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    }
  };

  const deleteSupplier = async (id: string | number) => {
    if (usingLive && typeof id !== 'string') {
      await api.delete(`/suppliers/${id}`);
      await fetchAll(true);
    } else {
      setSuppliers((prev) => prev.filter((s) => s.id !== id));
    }
  };

  // Purchase Order CRUD & Receiving
  const createPurchaseOrder = async (payload: {
    supplier_id: string | number;
    order_date: string;
    expected_delivery_date?: string;
    notes?: string;
    items: {
      inventory_item_id: string | number;
      quantity: number;
      unit: string;
      unit_price_cents: number;
    }[];
  }) => {
    if (usingLive) {
      const res = await api.post('/purchase-orders', {
        branch_id: activeBranchId || 1,
        ...payload,
      });
      await fetchAll(true);
      return res.data;
    } else {
      let total = 0;
      payload.items.forEach((i) => {
        total += i.quantity * i.unit_price_cents;
      });
      const newPo: PurchaseOrderData = {
        id: Date.now(),
        po_number: `PO-2026-${String(Date.now()).slice(-4)}`,
        supplier_id: payload.supplier_id,
        supplier: suppliers.find((s) => String(s.id) === String(payload.supplier_id)),
        branch_id: activeBranchId || 1,
        order_date: payload.order_date,
        expected_delivery_date: payload.expected_delivery_date || null,
        status: 'DRAFT',
        total_cents: total,
        notes: payload.notes || '',
        items: payload.items.map((i, idx) => ({
          id: idx + 1,
          inventory_item_id: i.inventory_item_id,
          quantity: i.quantity,
          received_quantity: 0,
          unit: i.unit,
          unit_price_cents: i.unit_price_cents,
          total_price_cents: i.quantity * i.unit_price_cents,
        })),
        source: 'mock',
      };
      setPurchaseOrders((prev) => [newPo, ...prev]);
      return newPo;
    }
  };

  const receivePurchaseOrder = async (
    poId: string | number,
    payload: {
      items: {
        purchase_order_item_id: string | number;
        received_quantity: number;
        batch_number?: string;
        expiration_date?: string;
      }[];
    }
  ) => {
    if (usingLive && typeof poId !== 'string') {
      const res = await api.post(`/purchase-orders/${poId}/receive`, payload);
      await fetchAll(true);
      return res.data;
    } else {
      setPurchaseOrders((prev) =>
        prev.map((po) => {
          if (po.id === poId) {
            const updatedItems = po.items?.map((item) => {
              const match = payload.items.find((x) => String(x.purchase_order_item_id) === String(item.id));
              if (match) {
                return { ...item, received_quantity: item.received_quantity + match.received_quantity };
              }
              return item;
            });
            const allReceived = updatedItems?.every((i) => i.received_quantity >= i.quantity) ?? true;
            return {
              ...po,
              status: allReceived ? 'RECEIVED' : 'PARTIAL',
              items: updatedItems,
            };
          }
          return po;
        })
      );
    }
  };

  return {
    suppliers,
    purchaseOrders,
    loading,
    usingLive,
    refetch: () => fetchAll(true),
    createSupplier,
    updateSupplier,
    deleteSupplier,
    createPurchaseOrder,
    receivePurchaseOrder,
  };
}
