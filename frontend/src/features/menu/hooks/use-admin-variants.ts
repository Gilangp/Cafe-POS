'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/api/axios';

export interface AdminVariantOption {
  id?: string;
  name: string;
  additional_price: number | string;
  inventory_item_id?: string | null;
  inventory_action?: 'none' | 'multiply' | 'swap' | 'add';
  inventory_action_value?: number | string;
}

export interface AdminVariantGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  options: AdminVariantOption[];
}

export function useAdminVariants() {
  const [variants, setVariants] = useState<AdminVariantGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVariants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/variants');
      if (res.data?.success) {
        setVariants(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch variants:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  const createVariant = async (data: Omit<AdminVariantGroup, 'id'>) => {
    const res = await api.post('/admin/variants', data);
    await fetchVariants();
    return res.data;
  };

  const updateVariant = async (id: string, data: Omit<AdminVariantGroup, 'id'>) => {
    const res = await api.put(`/admin/variants/${id}`, data);
    await fetchVariants();
    return res.data;
  };

  const deleteVariant = async (id: string) => {
    const res = await api.delete(`/admin/variants/${id}`);
    await fetchVariants();
    return res.data;
  };

  return {
    variants,
    loading,
    refetch: fetchVariants,
    createVariant,
    updateVariant,
    deleteVariant
  };
}
