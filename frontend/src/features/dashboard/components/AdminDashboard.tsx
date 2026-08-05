'use client';

import React, { useEffect, useState } from 'react';
import { getAdminDashboardSummary, getAdminTopMenus, getLowStockItems, TopMenu, LowStockItem } from '@/shared/services/dashboard.service';
import { TrendingUp, CalendarCheck, Loader2, AlertCircle, PackageMinus, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function AdminDashboard() {
  const t = {
    dashboard: {
      admin: {
        loading: 'Memuat data...',
        title: 'System Overview',
        desc: 'Pusat kendali inventori, menu, dan operasional harian.',
        todaySales: 'Penjualan Hari Ini',
        lowStock: 'Stok Kritis',
        topMenus: 'Menu Paling Laris',
        recentContent: 'Stok Kritis',
      },
      owner: {
        todayReservations: 'Reservasi Aktif',
      }
    }
  };

  const [summary, setSummary] = useState<any>(null);
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      let summaryData: any = null;
      let menusRes: TopMenu[] = [];
      let lowStockRes: LowStockItem[] = [];
      try { summaryData = await getAdminDashboardSummary(); } catch (e) { console.warn('Failed to fetch summary', e); }
      try { menusRes = await getAdminTopMenus(); } catch (e: any) { console.warn('Failed to fetch top menus', e); }
      try { lowStockRes = await getLowStockItems(); } catch (e) { console.warn('Failed to fetch low stock', e); }
      if (!summaryData && menusRes.length === 0 && lowStockRes.length === 0)
        throw new Error("Anda tidak memiliki akses ke modul ini atau sesi Anda telah habis.");
      setSummary(summaryData || { today_sales: 0, today_reservations: 0 });
      setTopMenus(menusRes || []);
      setLowStockItems(lowStockRes || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Gagal memuat data Admin.');
    } finally { setLoading(false); }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  if (loading && !summary) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">{t.dashboard.admin.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="max-w-md rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h2 className="mb-2 text-lg font-semibold text-destructive">Akses Ditolak</h2>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { title: t.dashboard.admin.todaySales, value: formatCurrency(summary?.today_sales || 0), icon: TrendingUp, iconBg: 'bg-success/10', iconColor: 'text-success' },
    { title: t.dashboard.owner.todayReservations, value: summary?.today_reservations || 0, icon: CalendarCheck, iconBg: 'bg-blue-100 dark:bg-blue-500/10', iconColor: 'text-blue-600 dark:text-blue-400' },
    { title: t.dashboard.admin.lowStock, value: lowStockItems.length, icon: PackageMinus, iconBg: 'bg-destructive/10', iconColor: 'text-destructive' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1 mb-2">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold font-heading tracking-tight text-foreground">
          {t.dashboard.admin.title}
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground">
          {t.dashboard.admin.desc}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }} whileHover={{ y: -4 }}
              className="flex flex-col justify-between rounded-2xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon size={20} strokeWidth={2} className={card.iconColor} />
                </div>
              </div>
              <h3 className="text-3xl font-bold font-heading text-foreground">{card.value}</h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-[400px]">
          <div className="p-6 border-b border-border bg-muted/30 shrink-0">
            <h2 className="text-lg font-semibold font-heading text-foreground">{t.dashboard.admin.topMenus}</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {topMenus?.length > 0 ? (
              <div className="space-y-2">
                {topMenus.map((menu, index) => (
                  <div key={index} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400' :
                      index === 1 ? 'bg-muted text-muted-foreground' :
                      index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-muted/50 text-muted-foreground'
                    }`}>#{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{menu.menu_name}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="rounded-lg bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">{menu.total_quantity} Porsi</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">Data belum tersedia.</div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col rounded-2xl bg-card border border-border shadow-sm overflow-hidden h-[400px]">
          <div className="p-6 border-b border-border bg-muted/30 shrink-0">
            <h2 className="text-lg font-semibold font-heading text-foreground">{t.dashboard.admin.recentContent}</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            {lowStockItems?.length > 0 ? (
              <div className="space-y-3">
                {lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20">
                    <AlertTriangle size={18} className="text-destructive mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-destructive/80 mt-0.5">Sisa: {item.current_stock} {item.unit || 'unit'} (min: {item.minimum_stock})</p>
                    </div>
                    <span className="text-xs font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">KRITIS</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">Tidak ada stok kritis.</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
