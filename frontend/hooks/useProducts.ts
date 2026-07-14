'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useBranchStore } from '@/store/branch-store';

export interface CatalogCategory {
  id: number | string;
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number | null;
  is_active?: boolean;
}

export interface CatalogRecipe {
  id: number | string;
  name: string;
  yield_quantity: number;
  yield_unit: string;
  status: string;
}

export interface CatalogProduct {
  id: string | number;
  name: string;
  category_id?: number | string;
  category: string;
  price: number;
  effective_price?: number;
  cost?: number;
  image: string;
  description: string;
  sku?: string;
  tags?: string[];
  is_available?: boolean;
  is_active?: boolean;
  recipe_id?: number | string | null;
  branch_stock_quantity?: number | null;
  source?: 'live' | 'mock';
}

export const MOCK_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 1,
    name: 'Velvra Signature Gold Espresso',
    category_id: 1,
    category: 'Espresso',
    price: 48000,
    effective_price: 48000,
    cost: 14000,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Espresso double-shot berkelas dunia dengan sentuhan aroma vanilla bourbon dan hazelnut bakar premium.',
    tags: ['Best Seller', 'Signature', 'Arabica 100%'],
    is_available: true,
    is_active: true,
    source: 'mock',
  },
  {
    id: 2,
    name: 'Royal Velvet Cappuccino',
    category_id: 2,
    category: 'Latte',
    price: 52000,
    effective_price: 52000,
    cost: 16000,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    description: 'Espresso creamy dengan mikro-busa susu oat lembut dan taburan cocoa impor Swiss.',
    tags: ['Creamy', 'Barista Pick'],
    is_available: true,
    is_active: true,
    source: 'mock',
  },
  {
    id: 3,
    name: 'Almond Butter Croissant',
    category_id: 3,
    category: 'Pastry',
    price: 45000,
    effective_price: 45000,
    cost: 18000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Pastry renyah berlapis mentega Prancis AOP dengan isian krim almond manis yang lumer di mulut.',
    tags: ['Fresh Baked', 'Sweet'],
    is_available: true,
    is_active: true,
    source: 'mock',
  },
  {
    id: 4,
    name: 'Iced Artisan Caramel Macchiato',
    category_id: 2,
    category: 'Latte',
    price: 55000,
    effective_price: 55000,
    cost: 17000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    description: 'Perpaduan sempurna espresso dingin, susu segar, dan sirup karamel madu artisan buatan dapur kami.',
    tags: ['Cold Refreshing', 'Favorite'],
    is_available: true,
    is_active: true,
    source: 'mock',
  },
  {
    id: 5,
    name: 'Matcha Imperial Ceremonial Grade',
    category_id: 4,
    category: 'Matcha',
    price: 58000,
    effective_price: 58000,
    cost: 20000,
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=600&q=80',
    description: 'Uji Ceremonial Grade Matcha impor dari Kyoto, dikocok secara tradisional dengan susu almond hangat.',
    tags: ['Healthy', 'Antioxidant', 'Zen'],
    is_available: true,
    is_active: true,
    source: 'mock',
  },
  {
    id: 6,
    name: 'Truffle Mushroom Artisan Panini',
    category_id: 5,
    category: 'Makanan',
    price: 78000,
    effective_price: 78000,
    cost: 25000,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: 'Roti ciabatta panggang dengan jamur portobello, minyak truffle hitam Italia, dan keju provolone lumer.',
    tags: ['Savory', 'Chef Special'],
    is_available: true,
    is_active: true,
    source: 'mock',
  },
];

export const MOCK_CATEGORIES: CatalogCategory[] = [
  { id: 1, name: 'Espresso', is_active: true },
  { id: 2, name: 'Latte', is_active: true },
  { id: 3, name: 'Pastry', is_active: true },
  { id: 4, name: 'Matcha', is_active: true },
  { id: 5, name: 'Makanan', is_active: true },
];

export function useProducts(options?: { includeInactive?: boolean }) {
  const activeBranchId = useBranchStore((s) => s.activeBranchId);
  const [products, setProducts] = useState<CatalogProduct[]>(MOCK_CATALOG_PRODUCTS);
  const [categories, setCategories] = useState<CatalogCategory[]>(MOCK_CATEGORIES);
  const [recipes, setRecipes] = useState<CatalogRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingLive, setUsingLive] = useState(false);

  const fetchCatalog = useCallback(async (isMounted = true) => {
    setLoading(true);
    try {
      // 1. Fetch Categories
      const catRes = await api.get<any>('/categories');
      const catList = Array.isArray(catRes.data?.data)
        ? catRes.data.data
        : Array.isArray(catRes.data)
        ? catRes.data
        : [];
      if (isMounted && catList.length > 0) {
        setCategories(catList);
      }

      // 2. Fetch Recipes for MNU-005
      try {
        const recRes = await api.get<any>('/recipes');
        const recList = Array.isArray(recRes.data?.data)
          ? recRes.data.data
          : Array.isArray(recRes.data)
          ? recRes.data
          : [];
        if (isMounted) setRecipes(recList);
      } catch (recErr) {
        // Recipe endpoint might not be populated or accessible
      }

      // 3. Fetch Products
      const prodRes = await api.get<any>('/products', {
        params: {
          is_active: options?.includeInactive ? undefined : true,
          per_page: 100,
        },
      });

      const rawProducts = Array.isArray(prodRes.data?.data)
        ? prodRes.data.data
        : Array.isArray(prodRes.data)
        ? prodRes.data
        : [];

      if (isMounted && rawProducts.length > 0) {
        const mapped: CatalogProduct[] = rawProducts.map((p: any) => ({
          id: p.id,
          name: p.name,
          category_id: p.category_id || (p.category ? p.category.id : 1),
          category: p.category?.name || 'Artisan Choice',
          price: Number(p.base_price) || 45000,
          effective_price: p.effective_price !== undefined ? Number(p.effective_price) : Number(p.base_price) || 45000,
          cost: Number(p.cost_cents) ? Math.round(Number(p.cost_cents)) : Math.round((Number(p.base_price) || 45000) * 0.3),
          image: p.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
          description: p.description || 'Sajian istimewa dari dapur Velvra.',
          sku: p.sku || '',
          tags: Array.isArray(p.tags) ? p.tags : ['Special'],
          is_available: p.is_available !== false,
          is_active: p.is_active !== false,
          recipe_id: p.recipe_id || null,
          branch_stock_quantity: p.branch_stock_quantity !== undefined ? p.branch_stock_quantity : null,
          source: 'live',
        }));
        setProducts(mapped);
        setUsingLive(true);
      } else if (isMounted) {
        // Keep mock if cloud products list is empty
      }
    } catch (err) {
      console.warn('Fallback to mock catalog:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [options?.includeInactive, activeBranchId]);

  useEffect(() => {
    let isMounted = true;
    fetchCatalog(isMounted);
    return () => {
      isMounted = false;
    };
  }, [fetchCatalog]);

  // MNU-003 & MNU-004: Override Branch Price and Availability Status (86'd status)
  const overrideBranchProduct = async (productId: string | number, data: { price?: number; is_available?: boolean; stock_quantity?: number }) => {
    if (usingLive && typeof productId !== 'string') {
      await api.patch(`/products/${productId}/branch-override`, {
        branch_id: activeBranchId || 1,
        price: data.price,
        is_available: data.is_available,
        stock_quantity: data.stock_quantity,
      });
      await fetchCatalog(true);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                effective_price: data.price !== undefined ? data.price : p.effective_price,
                is_available: data.is_available !== undefined ? data.is_available : p.is_available,
                branch_stock_quantity: data.stock_quantity !== undefined ? data.stock_quantity : p.branch_stock_quantity,
              }
            : p
        )
      );
    }
  };

  const createProduct = async (payload: any) => {
    if (usingLive) {
      await api.post('/products', payload);
      await fetchCatalog(true);
    } else {
      const newProd: CatalogProduct = {
        id: Date.now(),
        name: payload.name,
        category_id: payload.category_id || 1,
        category: categories.find((c) => String(c.id) === String(payload.category_id))?.name || 'Espresso',
        price: Number(payload.base_price) || 35000,
        effective_price: Number(payload.base_price) || 35000,
        cost: Math.round((Number(payload.base_price) || 35000) * 0.3),
        image: payload.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        description: payload.description || '',
        sku: payload.sku || '',
        is_available: true,
        is_active: true,
        recipe_id: payload.recipe_id || null,
        source: 'mock',
      };
      setProducts((prev) => [newProd, ...prev]);
    }
  };

  const updateProduct = async (productId: string | number, payload: any) => {
    if (usingLive && typeof productId !== 'string') {
      await api.put(`/products/${productId}`, payload);
      await fetchCatalog(true);
    } else {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? {
                ...p,
                name: payload.name || p.name,
                category_id: payload.category_id || p.category_id,
                category: categories.find((c) => String(c.id) === String(payload.category_id))?.name || p.category,
                price: payload.base_price !== undefined ? Number(payload.base_price) : p.price,
                effective_price: payload.base_price !== undefined ? Number(payload.base_price) : p.effective_price,
                description: payload.description !== undefined ? payload.description : p.description,
                sku: payload.sku !== undefined ? payload.sku : p.sku,
                recipe_id: payload.recipe_id !== undefined ? payload.recipe_id : p.recipe_id,
              }
            : p
        )
      );
    }
  };

  const deleteProduct = async (productId: string | number) => {
    if (usingLive && typeof productId !== 'string') {
      await api.delete(`/products/${productId}`);
      await fetchCatalog(true);
    } else {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  return {
    products,
    categories,
    recipes,
    loading,
    usingLive,
    refetch: () => fetchCatalog(true),
    overrideBranchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
