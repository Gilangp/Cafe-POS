'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface CatalogProduct {
  id: string | number;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  tags?: string[];
  is_available?: boolean;
  source?: 'live' | 'mock';
}

export const MOCK_CATALOG_PRODUCTS: CatalogProduct[] = [
  {
    id: 'prod-1',
    name: 'Velvra Signature Gold Espresso',
    category: 'Coffee',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
    description: 'Espresso double-shot berkelas dunia dengan sentuhan aroma vanilla bourbon dan hazelnut bakar premium.',
    tags: ['Best Seller', 'Signature', 'Arabica 100%'],
    is_available: true,
    source: 'mock',
  },
  {
    id: 'prod-2',
    name: 'Royal Velvet Cappuccino',
    category: 'Coffee',
    price: 52000,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80',
    description: 'Espresso creamy dengan mikro-busa susu oat lembut dan taburan cocoa impor Swiss.',
    tags: ['Creamy', 'Barista Pick'],
    is_available: true,
    source: 'mock',
  },
  {
    id: 'prod-3',
    name: 'Almond Butter Croissant',
    category: 'Pastry',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
    description: 'Pastry renyah berlapis mentega Prancis AOP dengan isian krim almond manis yang lumer di mulut.',
    tags: ['Fresh Baked', 'Sweet'],
    is_available: true,
    source: 'mock',
  },
  {
    id: 'prod-4',
    name: 'Iced Artisan Caramel Macchiato',
    category: 'Iced Coffee',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=600&q=80',
    description: 'Perpaduan sempurna espresso dingin, susu segar, dan sirup karamel madu artisan buatan dapur kami.',
    tags: ['Cold Refreshing', 'Favorite'],
    is_available: true,
    source: 'mock',
  },
  {
    id: 'prod-5',
    name: 'Matcha Imperial Ceremonial Grade',
    category: 'Non-Coffee',
    price: 58000,
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&w=600&q=80',
    description: 'Uji Ceremonial Grade Matcha impor dari Kyoto, dikocok secara tradisional dengan susu almond hangat.',
    tags: ['Healthy', 'Antioxidant', 'Zen'],
    is_available: true,
    source: 'mock',
  },
  {
    id: 'prod-6',
    name: 'Truffle Mushroom Artisan Panini',
    category: 'Main Dish',
    price: 78000,
    image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80',
    description: 'Roti ciabatta panggang dengan jamur portobello, minyak truffle hitam Italia, dan keju provolone lumer.',
    tags: ['Savory', 'Chef Special'],
    is_available: true,
    source: 'mock',
  },
];

export function useProducts(options?: { includeInactive?: boolean }) {
  const [products, setProducts] = useState<CatalogProduct[]>(MOCK_CATALOG_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [usingLive, setUsingLive] = useState(false);

  const fetchSupabaseProducts = async (isMounted = true) => {
    setLoading(true);
    try {
      let query = supabase
        .from('products')
        .select('id, name, base_price, description, image, is_active, tags, categories(name)');

      if (!options?.includeInactive) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (isMounted && !error && data && data.length > 0) {
        const mapped: CatalogProduct[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          category: p.categories?.name || 'Artisan Choice',
          price: Number(p.base_price) || 45000,
          image: p.image || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
          description: p.description || 'Sajian istimewa dari dapur Velvra.',
          tags: Array.isArray(p.tags) ? p.tags : ['Special'],
          is_available: p.is_active !== false,
          source: 'live',
        }));
        setProducts(mapped);
        setUsingLive(true);
      } else if (isMounted && options?.includeInactive && !error && data && data.length === 0) {
        setProducts([]);
        setUsingLive(true);
      } else if (isMounted) {
        setUsingLive(true);
      }
    } catch (err) {
      console.warn('Fallback to mock catalog:', err);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    fetchSupabaseProducts(isMounted);
    return () => {
      isMounted = false;
    };
  }, [options?.includeInactive]);

  return { products, loading, usingLive, refetch: () => fetchSupabaseProducts(true) };
}
