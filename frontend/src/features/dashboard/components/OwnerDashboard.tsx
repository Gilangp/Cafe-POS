'use client';

import React, { useEffect, useState } from 'react';
import { getDashboardSummary, getSalesChart, getTopMenus, DashboardSummary, ChartData, TopMenu } from '@/shared/services/dashboard.service';
import { TrendingUp, CreditCard, CalendarCheck, DollarSign, Loader2, AlertCircle, Coffee } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
const t = {
  dashboard: {
    owner: {
      loading: 'Memuat data...',
      errorTitle: 'Gagal Memuat',
      title: 'Dashboard Owner',
      desc: 'Ringkasan performa bisnis Anda.',
      todayRevenue: 'Pendapatan Hari Ini',
      monthRevenue: 'Pendapatan Bulan Ini',
      totalTransactions: 'Total Transaksi',
      todayReservations: 'Reservasi Hari Ini',
      salesChart: 'Grafik Penjualan',
      daily: 'Harian',
      weekly: 'Mingguan',
      monthly: 'Bulanan',
      revenue: 'Pendapatan',
      noSales: 'Tidak ada data penjualan.',
      topMenus: 'Menu Terlaris',
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
      setError(err?.response?.data?.message || 'Failed to fetch dashboard data. Make sure you have the correct permissions (Owner).');
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
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-foreground/60 font-medium">{t.dashboard.owner.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">{t.dashboard.owner.errorTitle}</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground tracking-tight">
            {t.dashboard.owner.title}
          </h1>
          <p className="text-foreground/70 font-medium">
            {t.dashboard.owner.desc}
          </p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-success/20 text-success rounded-xl flex items-center justify-center">
              <DollarSign size={24} />
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.owner.todayRevenue}</p>
          <h3 className="text-2xl font-bold font-heading text-foreground">
            {formatCurrency(summary?.today_revenue || 0)}
          </h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-accent/20 text-accent rounded-xl flex items-center justify-center">
              <TrendingUp size={24} />
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.owner.monthRevenue}</p>
          <h3 className="text-2xl font-bold font-heading text-foreground">
            {formatCurrency(summary?.this_month_revenue || 0)}
          </h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
              <CreditCard size={24} />
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.owner.totalTransactions}</p>
          <h3 className="text-2xl font-bold font-heading text-foreground">
            {summary?.total_transactions_all_time || 0}
          </h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-md"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center">
              <CalendarCheck size={24} />
            </div>
          </div>
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.owner.todayReservations}</p>
          <h3 className="text-2xl font-bold font-heading text-foreground">
            {summary?.today_reservations_count || 0}
          </h3>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-card p-6 rounded-2xl border border-border shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold font-heading text-foreground">
              {t.dashboard.owner.salesChart}
            </h2>
            <div className="flex bg-background p-1 rounded-lg">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    period === p 
                    ? 'bg-card text-foreground shadow-sm' 
                    : 'text-foreground/50 hover:text-foreground'
                  }`}
                >
                  {p === 'daily' ? t.dashboard.owner.daily : p === 'weekly' ? t.dashboard.owner.weekly : t.dashboard.owner.monthly}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }} 
                    className="fill-foreground/50"
                    dy={10}
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return `${d.getDate()}/${d.getMonth()+1}`;
                    }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }} 
                    className="fill-foreground/50"
                    tickFormatter={(val) => `Rp ${val / 1000}k`}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--color-primary)', 
                      borderColor: 'var(--color-border)',
                      borderRadius: '12px',
                      color: 'var(--color-background)',
                    }}
                    itemStyle={{ color: 'var(--color-accent)' }}
                    formatter={(value: any) => [formatCurrency(Number(value) || 0), t.dashboard.owner.revenue]}
                    labelFormatter={(label: any) => label ? new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="var(--color-accent)" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
               <div className="w-full h-full flex items-center justify-center text-sm text-foreground/50">
                {t.dashboard.owner.noSales}
              </div>
            )}
          </div>
        </div>

        {/* Top Menus Section */}
        <div className="bg-card p-6 rounded-2xl border border-border shadow-md flex flex-col">
          <h2 className="text-lg font-bold font-heading text-foreground mb-6">
            {t.dashboard.owner.topMenus}
          </h2>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[350px]">
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : topMenus?.length > 0 ? (
              topMenus.map((menu, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shrink-0 border border-border">
                    {index === 0 ? (
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">1</div>
                    ) : index === 1 ? (
                      <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-foreground/60 text-xs font-bold">2</div>
                    ) : index === 2 ? (
                      <div className="w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-700 text-xs font-bold">3</div>
                    ) : (
                      <Coffee size={16} className="text-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {menu.menu_name}
                    </p>
                    <p className="text-xs text-foreground/60 font-medium">
                      {menu.total_quantity} {t.dashboard.owner.sold}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">
                      {formatCurrency(menu.total_revenue)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-1 items-center justify-center text-sm text-foreground/50">
                {t.dashboard.owner.noTopMenus}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
