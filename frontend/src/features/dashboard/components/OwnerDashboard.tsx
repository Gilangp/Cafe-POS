'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getDashboardSummary, getSalesChart, getTopMenus, DashboardSummary, ChartData, TopMenu } from '@/shared/services/dashboard.service';
import { TrendingUp, CreditCard, CalendarCheck, DollarSign, Loader2, AlertCircle, Database, Users, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const t = {
  dashboard: {
    owner: {
      loading: 'Memuat data...',
      errorTitle: 'Gagal Memuat',
      title: 'Business Overview',
      desc: 'Pantau kinerja dan pertumbuhan bisnis Anda secara real-time.',
      todayRevenue: 'Pendapatan Hari Ini',
      monthRevenue: 'Pendapatan Bulan Ini',
      totalTransactions: 'Total Transaksi',
      todayReservations: 'Reservasi Aktif',
      salesChart: 'Analisis Penjualan',
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      revenue: 'Pendapatan',
      noSales: 'Belum ada data penjualan pada periode ini.',
      topMenus: 'Menu Favorit Pelanggan',
      sold: 'terjual',
      noTopMenus: 'Belum ada menu terlaris.',
    }
  }
};

export function OwnerDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topMenus, setTopMenus] = useState<TopMenu[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryData, chartRes, menusRes] = await Promise.all([
        getDashboardSummary(),
        getSalesChart(period),
        getTopMenus()
      ]);
      setSummary(summaryData);
      setChartData(chartRes || []);
      setTopMenus(menusRes || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat data dasbor.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading && !summary) {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">{t.dashboard.owner.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="max-w-md bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h2 className="mb-2 text-lg font-semibold text-destructive">{t.dashboard.owner.errorTitle}</h2>
          <p className="text-sm text-destructive/80">{error}</p>
          <button onClick={fetchDashboardData} className="mt-6 rounded-lg bg-destructive/20 px-6 py-2 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/30">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: t.dashboard.owner.todayRevenue,
      value: formatCurrency(summary?.today_revenue || 0),
      icon: DollarSign,
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: t.dashboard.owner.monthRevenue,
      value: formatCurrency(summary?.this_month_revenue || 0),
      icon: TrendingUp,
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: t.dashboard.owner.totalTransactions,
      value: summary?.total_transactions_all_time || 0,
      icon: CreditCard,
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: t.dashboard.owner.todayReservations,
      value: summary?.today_reservations_count || 0,
      icon: CalendarCheck,
      iconBg: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    }
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-1 mb-2">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold tracking-tight text-foreground"
        >
          {t.dashboard.owner.title}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-sm text-muted-foreground"
        >
          {t.dashboard.owner.desc}
        </motion.p>
      </div>
      
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4 }}
              className="flex flex-col justify-between rounded-xl bg-card p-6 border border-border shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{card.title}</p>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.iconBg}`}>
                  <Icon size={20} strokeWidth={2} className={card.iconColor} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                {card.value}
              </h3>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="flex flex-col rounded-xl bg-card border border-border shadow-sm lg:col-span-2 overflow-hidden h-[450px]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 pb-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold text-foreground">
              {t.dashboard.owner.salesChart}
            </h2>
            <div className="mt-4 sm:mt-0 flex rounded-lg bg-muted p-1 border border-border">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    period === p 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {p === 'daily' ? t.dashboard.owner.daily : p === 'weekly' ? t.dashboard.owner.weekly : t.dashboard.owner.monthly}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 w-full p-6 pt-4">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex h-full w-full items-center justify-center"
                >
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </motion.div>
              ) : chartData?.length > 0 ? (
                <motion.div 
                  key="chart"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="h-full w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#C89B5C" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#C89B5C" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#E4D9C4" opacity={0.6} className="dark:stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#C89B5C', fontWeight: 500 }} 
                        dy={10}
                        tickFormatter={(val) => {
                          const d = new Date(val);
                          return `${d.getDate()}/${d.getMonth()+1}`;
                        }}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fill: '#C89B5C', fontWeight: 500 }} 
                        tickFormatter={(val) => `Rp${val / 1000}k`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#fff', 
                          borderColor: '#E4D9C4',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          fontSize: '12px',
                          fontWeight: 500
                        }}
                        itemStyle={{ color: '#1E3D31', fontWeight: 600 }}
                        formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                        labelFormatter={(label: any) => label ? new Date(label).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#C89B5C" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                 <div className="flex h-full w-full items-center justify-center text-sm font-medium text-muted-foreground">
                  {t.dashboard.owner.noSales}
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex flex-col rounded-xl bg-card border border-border shadow-sm overflow-hidden h-[450px]"
        >
          <div className="p-6 border-b border-border bg-muted/30 shrink-0">
            <h2 className="text-lg font-semibold text-foreground">
              {t.dashboard.owner.topMenus}
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : topMenus?.length > 0 ? (
              <div className="space-y-2">
                {topMenus.map((menu, index) => (
                  <div key={index} className="group flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                      index === 0 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
index === 1 ? 'bg-muted text-muted-foreground' :
index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
'bg-muted text-muted-foreground dark:bg-muted dark:text-muted-foreground'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {menu.menu_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {menu.total_quantity} {t.dashboard.owner.sold}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-lg">
                        {formatCurrency(menu.total_revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-medium text-muted-foreground">
                {t.dashboard.owner.noTopMenus}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <Link href="/dashboard/admin/employees" className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:border-accent/30 transition-colors group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Users size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Manajemen Karyawan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Kelola akun kasir & barista</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/backup" className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:border-accent/30 transition-colors group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <Database size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Backup & Restore</p>
            <p className="text-xs text-muted-foreground mt-0.5">Cadangkan & pulihkan data</p>
          </div>
        </Link>
        <Link href="/dashboard/admin/settings" className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border shadow-sm hover:border-accent/30 transition-colors group">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Settings size={20} className="text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Pengaturan Sistem</p>
            <p className="text-xs text-muted-foreground mt-0.5">Konfigurasi website & toko</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
