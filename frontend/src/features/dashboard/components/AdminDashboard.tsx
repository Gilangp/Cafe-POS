'use client';

import React, { useEffect, useState } from 'react';
import { getAdminDashboardSummary, getTopMenus, getLowStockItems, TopMenu, LowStockItem } from '@/shared/services/dashboard.service';
import { TrendingUp, CalendarCheck, Loader2, AlertCircle, Coffee, Archive, FileText } from 'lucide-react';
import { motion } from 'framer-motion';


export function AdminDashboard() {
    const t = {
    dashboard: {
      admin: {
        loading: 'Memuat data...',
        title: 'Dashboard Admin',
        todaySales: 'Penjualan Hari Ini',
        lowStock: 'Stok Menipis',
        topMenus: 'Menu Terlaris',
        recentContent: 'Konten Terbaru',
      },
      owner: {
        todayReservations: 'Reservasi Hari Ini',
      }
    }
  };
  const [summary, setSummary] = useState<any>(null);
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, menusRes, lowStockRes] = await Promise.all([
        getAdminDashboardSummary(),
        getTopMenus(),
        getLowStockItems(),
      ]);
      setSummary(summaryData);
      setTopMenus(menusRes || []);
      setLowStockItems(lowStockRes || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch dashboard data for Admin.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  if (loading && !summary) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-foreground/60 font-medium">{t.dashboard.admin.loading}</p>
      </div>
    );
  }

  // ... (error state) ...

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground">{t.dashboard.admin.title}</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card p-6 rounded-2xl border border-border shadow-md">
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.admin.todaySales}</p>
          <h3 className="text-2xl font-bold font-heading text-foreground">{formatCurrency(summary?.today_sales || 0)}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card p-6 rounded-2xl border border-border shadow-md">
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.owner.todayReservations}</p>
          <h3 className="text-2xl font-bold font-heading text-foreground">{summary?.today_reservations || 0}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card p-6 rounded-2xl border border-border shadow-md">
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.admin.lowStock}</p>
          <h3 className="text-2xl font-bold font-heading text-destructive">{lowStockItems.length}</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4">{t.dashboard.admin.topMenus}</h2>
          {topMenus.map(menu => <div key={menu.menu_name}>{menu.menu_name} - {menu.total_quantity}</div>)}
        </div>
        <div className="bg-card p-6 rounded-2xl border border-border shadow-md">
          <h2 className="text-lg font-bold font-heading text-foreground mb-4">{t.dashboard.admin.recentContent}</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg"><FileText size={20} className="text-blue-500" /></div>
              <div>
                <p className="font-semibold">New Article: "5 Brewing Methods"</p>
                <p className="text-xs text-foreground/60">Published 2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
               <div className="p-3 bg-accent/10 rounded-lg"><Archive size={20} className="text-accent" /></div>
              <div>
                <p className="font-semibold">New Promo: "Weekend Discount"</p>
                <p className="text-xs text-foreground/60">Active until 30 Aug</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
