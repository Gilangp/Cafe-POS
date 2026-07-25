'use client';

import React, { useEffect, useState } from 'react';
import { 
  getDashboardSummary, 
  getSalesChart, 
  getTopMenus,
  DashboardSummary,
  ChartData,
  TopMenu 
} from '@/shared/services/dashboard.service';
import { 
  TrendingUp, 
  CreditCard, 
  CalendarCheck, 
  DollarSign,
  Loader2,
  AlertCircle,
  Coffee
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';

export default function DashboardPage() {
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
      setChartData(chartRes);
      setTopMenus(menusRes);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal mengambil data dashboard. Pastikan Anda memiliki akses (Owner/Admin).');
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
        <p className="text-primary/60 dark:text-cream-400 font-medium">Memuat data dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl p-8 max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Akses Ditolak</h2>
          <p className="text-red-600/80 dark:text-red-300/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-primary dark:text-cream-100 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-primary/70 dark:text-cream-400 font-medium">
            Ringkasan performa bisnis NEMU Space.
          </p>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#1A2620] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center">
              <DollarSign size={24} className="stroke-[2.5]" />
            </div>
          </div>
          <p className="text-sm font-semibold text-primary/60 dark:text-cream-400/60 mb-1">Pendapatan Hari Ini</p>
          <h3 className="text-2xl font-bold font-heading text-primary dark:text-cream-100">
            {formatCurrency(summary?.today_revenue || 0)}
          </h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-[#1A2620] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-accent/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#FAF3E7] dark:bg-accent/20 text-accent rounded-xl flex items-center justify-center">
              <TrendingUp size={24} className="stroke-[2.5]" />
            </div>
          </div>
          <p className="text-sm font-semibold text-primary/60 dark:text-cream-400/60 mb-1">Pendapatan Bulan Ini</p>
          <h3 className="text-2xl font-bold font-heading text-primary dark:text-cream-100">
            {formatCurrency(summary?.this_month_revenue || 0)}
          </h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-[#1A2620] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow relative overflow-hidden group"
        >
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center">
              <CreditCard size={24} className="stroke-[2.5]" />
            </div>
          </div>
          <p className="text-sm font-semibold text-primary/60 dark:text-cream-400/60 mb-1">Total Transaksi</p>
          <h3 className="text-2xl font-bold font-heading text-primary dark:text-cream-100">
            {summary?.total_transactions_all_time || 0}
          </h3>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-[#1A2620] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow relative overflow-hidden group"
        >
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/10 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out" />
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl flex items-center justify-center">
              <CalendarCheck size={24} className="stroke-[2.5]" />
            </div>
          </div>
          <p className="text-sm font-semibold text-primary/60 dark:text-cream-400/60 mb-1">Reservasi Hari Ini</p>
          <h3 className="text-2xl font-bold font-heading text-primary dark:text-cream-100">
            {summary?.today_reservations_count || 0}
          </h3>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1A2620] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold font-heading text-primary dark:text-cream-100">
              Grafik Penjualan
            </h2>
            <div className="flex bg-gray-100 dark:bg-[#14201A] p-1 rounded-lg">
              {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    period === p 
                    ? 'bg-white dark:bg-[#2A3F33] text-primary dark:text-white shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-cream-200'
                  }`}
                >
                  {p === 'daily' ? 'Harian' : p === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C89B5C" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C89B5C" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" className="dark:stroke-white/5 stroke-black/5" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12 }} 
                    className="dark:fill-cream-400/50 fill-primary/50"
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
                    className="dark:fill-cream-400/50 fill-primary/50"
                    tickFormatter={(val) => `Rp ${val / 1000}k`}
                    width={80}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1E3D31', 
                      borderColor: '#1E3D31',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                    }}
                    itemStyle={{ color: '#C89B5C' }}
                    formatter={(value: number) => [formatCurrency(value), 'Pendapatan']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
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
            ) : (
               <div className="w-full h-full flex items-center justify-center text-sm text-gray-500">
                Belum ada data penjualan pada periode ini.
              </div>
            )}
          </div>
        </div>

        {/* Top Menus Section */}
        <div className="bg-white dark:bg-[#1A2620] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow flex flex-col">
          <h2 className="text-lg font-bold font-heading text-primary dark:text-cream-100 mb-6">
            Menu Terlaris
          </h2>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto max-h-[350px] custom-scrollbar pr-2">
            {loading ? (
              <div className="flex flex-1 items-center justify-center">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
              </div>
            ) : topMenus.length > 0 ? (
              topMenus.map((menu, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-black/20 flex items-center justify-center shrink-0 border border-black/5 dark:border-white/5">
                    {index === 0 ? (
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-bold">1</div>
                    ) : index === 1 ? (
                      <div className="w-6 h-6 rounded-full bg-gray-300/20 flex items-center justify-center text-gray-400 dark:text-gray-300 text-xs font-bold">2</div>
                    ) : index === 2 ? (
                      <div className="w-6 h-6 rounded-full bg-amber-600/20 flex items-center justify-center text-amber-700 dark:text-amber-500 text-xs font-bold">3</div>
                    ) : (
                      <Coffee size={16} className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-primary dark:text-cream-100 truncate">
                      {menu.menu_name}
                    </p>
                    <p className="text-xs text-primary/60 dark:text-cream-400/60 font-medium">
                      {menu.total_quantity} Terjual
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
              <div className="flex flex-1 items-center justify-center text-sm text-gray-500">
                Belum ada data menu terlaris.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
