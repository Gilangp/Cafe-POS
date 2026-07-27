'use client';

import { useState, useEffect, useCallback } from 'react';
import api from '@/shared/api/axios';

export interface AdminCategory {
  id: string;
  name: string;
  display_order: number;
  menus_count?: number;
}

export interface AdminIngredient {
  inventory_id: string;
  quantity_used: number;
  // Pivot mapping from backend Menu::with('ingredients')
  pivot?: {
    inventory_id: string;
    quantity_used: string;
  };
  name?: string;
  unit?: string;
  unit_price?: string;
}

export interface AdminInventory {
  id: string;
  name: string;
  sku: string;
  unit: string;
  unit_price: string;
  stock_quantity: string;
}

export interface AdminMenu {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: string;
  image: string | null;
  status: 'tersedia' | 'tidak_tersedia';
  is_best_seller: boolean;
  category?: AdminCategory;
  ingredients?: AdminIngredient[];
  variant_groups?: {
    id: string; // The variant group ID
    name: string;
    type: 'single' | 'multiple';
    pivot?: {
      is_required: boolean;
    };
  }[];
}

export function useAdminMenu() {
  const [menus, setMenus] = useState<AdminMenu[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [inventories, setInventories] = useState<AdminInventory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/admin/categories');
      if (res.data?.success) {
        setCategories(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data kategori');
    }
  }, []);

  const fetchInventories = useCallback(async () => {
    try {
      const res = await api.get('/admin/inventories');
      if (res.data?.success) {
        setInventories(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch inventories:', err);
    }
  }, []);

  const fetchMenus = useCallback(async () => {
    try {
      const res = await api.get('/admin/menus');
      if (res.data?.success) {
        setMenus(res.data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch menus:', err);
      setError(err.response?.data?.message || 'Gagal mengambil data menu');
    }
  }, []);

  const init = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchCategories(), fetchMenus(), fetchInventories()]);
    setLoading(false);
  }, [fetchCategories, fetchMenus, fetchInventories]);

  useEffect(() => {
    init();
  }, [init]);

  // --- Category Mutations ---
  const createCategory = async (data: { name: string; display_order?: number }) => {
    const res = await api.post('/admin/categories', data);
    await fetchCategories();
    return res.data;
  };

  const updateCategory = async (id: string, data: { name: string; display_order?: number }) => {
    const res = await api.put(`/admin/categories/${id}`, data);
    await fetchCategories();
    return res.data;
  };

  const deleteCategory = async (id: string) => {
    const res = await api.delete(`/admin/categories/${id}`);
    await fetchCategories();
    return res.data;
  };

  // --- Menu Mutations ---
  const createMenu = async (data: Partial<AdminMenu>) => {
    const res = await api.post('/admin/menus', data);
    await fetchMenus();
    return res.data;
  };

  const updateMenu = async (id: string, data: Partial<AdminMenu>) => {
    const res = await api.put(`/admin/menus/${id}`, data);
    await fetchMenus();
    return res.data;
  };

  const deleteMenu = async (id: string) => {
    const res = await api.delete(`/admin/menus/${id}`);
    await fetchMenus();
    return res.data;
  };

  return {
    menus,
    categories,
    inventories,
    loading,
    error,
    refetch: init,
    createCategory,
    updateCategory,
    deleteCategory,
    createMenu,
    updateMenu,
    deleteMenu,
  };
}
