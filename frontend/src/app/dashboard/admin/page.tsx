'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Users,
  Clock,
  AlertTriangle,
  DollarSign,
  BarChart3,
  PieChart,
  Percent,
  ShieldCheck,
  Database,
  ArrowUpRight,
  FileSpreadsheet,
} from 'lucide-react';
import Link from 'next/link';

const weeklyRevenueChart = [
  { day: 'Senin', revenue: 2450000, cogs: 930000, profit: 1520000, orders: 42 },
  { day: 'Selasa', revenue: 2890000, cogs: 1090000, profit: 1800000, orders: 51 },
  { day: 'Rabu', revenue: 2650000, cogs: 1010000, profit: 1640000, orders: 48 },
  { day: 'Kamis', revenue: 3420000, cogs: 1300000, profit: 2120000, orders: 63 },
  { day: 'Jumat', revenue: 4150000, cogs: 1570000, profit: 2580000, orders: 75 },
  { day: 'Sabtu', revenue: 5280000, cogs: 1980000, profit: 3300000, orders: 94 },
  { day: 'Minggu', revenue: 4620000, cogs: 1750000, profit: 2870000, orders: 82 },
];

const monthlyRevenueChart = [
  { period: 'M1 (1-7 Jul)', revenue: 19200000, cogs: 7300000, profit: 11900000, orders: 340 },
  { period: 'M2 (8-14 Jul)', revenue: 22400000, cogs: 8500000, profit: 13900000, orders: 395 },
  { period: 'M3 (15-21 Jul)', revenue: 25460000, cogs: 9630000, profit: 15830000, orders: 455 },
  { period: 'M4 (Est 22-31 Jul)', revenue: 28100000, cogs: 10650000, profit: 17450000, orders: 498 },
];

// 10.1 Statistik top menu terlaris & profitabilitas (Margin HPP vs Harga Jual)
const topMenuProfitability = [
  { name: 'Sea Salt Caramel Macchiato Artisan', category: 'Specialty Coffee', price: 38000, cogs: 14500, marginRp: 23500, marginPct: 61.8, sold: 312 },
  { name: 'Velvet Espresso Single Origin Gayo', category: 'Slow-Bar / Espresso', price: 35000, cogs: 11800, marginRp: 23200, marginPct: 66.3, sold: 284 },
  { name: 'French Butter Croissant Segar Pagi', category: 'Artisan Pastry', price: 32000, cogs: 13200, marginRp: 18800, marginPct: 58.7, sold: 245 },
  { name: 'V60 Pour Over Kintamani Natural', category: 'Manual Brew', price: 42000, cogs: 15000, marginRp: 27000, marginPct: 64.3, sold: 198 },
  { name: 'Valrhona Dark Chocolate 70%', category: 'Non-Coffee Signature', price: 45000, cogs: 18500, marginRp: 26500, marginPct: 58.9, sold: 176 },
];

const lowStockItems = [
  { name: 'Susu Oat Barista Blend (Oatly)', stock: 2, unit: 'liter', threshold: 5 },
  { name: 'Biji Kopi Gayo Arabica Specialty', stock: 850, unit: 'gram', threshold: 1200 },
  { name: 'Mentega Butter Premium (Anchor)', stock: 3, unit: 'pack', threshold: 6 },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtShort = (n: number) => (n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : `Rp ${(n / 1000).toFixed(0)}rb`);

export default function AdminDashboardPage() {
  const [timeView, setTimeView] = useState<'weekly' | 'monthly'>('weekly');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit'>('profit');

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Sore';

  const chartData = timeView === 'weekly' ? weeklyRevenueChart : monthlyRevenueChart;
  const maxMetricVal = Math.max(...chartData.map((d) => (chartMetric === 'revenue' ? d.revenue : d.profit)));

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalCogs = chartData.reduce((s, d) => s + d.cogs, 0);
  const totalNetProfit = chartData.reduce((s, d) => s + d.profit, 0);
  const overallMarginPct = ((totalNetProfit / (totalRevenue || 1)) * 100).toFixed(1);
  const totalOrdersCount = chartData.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="space-y-8 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              {greeting}, Owner & Eksekutif (10.1)
            </h1>
            <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm flex items-center gap-1.5">
 Portal Bisnis Owner
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-sans">
            {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp; NEMU Space Flagship Roastery & Cafe
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/pos"
            className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md transition-all active:scale-95 shrink-0"
          >
            <ShoppingCart size={15} />
            <span>Buka POS Kasir</span>
          </Link>
          <Link
            href="/admin/employees"
            className="flex items-center gap-2 rounded-2xl border border-gray-300 dark:border-white/20 bg-white dark:bg-black/30 px-4 py-2.5 text-xs font-bold text-gray-800 dark:text-gray-200 hover:border-[#C89B5C] transition-all shrink-0"
          >
            <Users size={15} className="text-[#C89B5C]" />
            <span>Manajemen User & Multi-Role (10.2)</span>
          </Link>
          <Link
            href="/admin/settings"
            className="flex items-center gap-2 rounded-2xl border border-[#C89B5C]/50 bg-[#FAF3E7] dark:bg-black/40 px-4 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#C89B5C] hover:text-white transition-all shrink-0"
          >
            <Database size={15} />
            <span>Audit & Backup (10.3/10.4)</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards (10.1 Owner Executive Metrics) */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-3xl bg-white dark:bg-[#1A2620] border-2 border-gray-200 dark:border-white/10 p-6 shadow-sm flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Omset ({timeView === 'weekly' ? '7 Hari' : 'Bulan Ini'})</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">{fmt(totalRevenue)}</p>
            <p className="mt-2 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <TrendingUp size={14} /> +18.4% dari periode lalu
            </p>
          </div>
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-[#1E3D31] text-[#C89B5C] shadow-sm p-3">
            <DollarSign size={24} />
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1A2620] border-2 border-emerald-500/30 p-6 shadow-sm flex items-start justify-between gap-3 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Estimasi Laba Bersih (Net Profit)</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{fmt(totalNetProfit)}</p>
            <p className="mt-2 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
              <Percent size={13} /> Margin Rata-Rata {overallMarginPct}%
            </p>
          </div>
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-sm p-3">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1A2620] border-2 border-gray-200 dark:border-white/10 p-6 shadow-sm flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Biaya Pokok (HPP)</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-gray-200 font-mono">{fmt(totalCogs)}</p>
            <p className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
              {(100 - Number(overallMarginPct)).toFixed(1)}% dari total omset
            </p>
          </div>
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3">
            <Package size={24} />
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1A2620] border-2 border-gray-200 dark:border-white/10 p-6 shadow-sm flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Volume Transaksi</p>
            <p className="mt-2 text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white font-mono">{totalOrdersCount} Order</p>
            <p className="mt-2 text-xs font-extrabold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <ShoppingCart size={13} /> AOV: {fmt(Math.round(totalRevenue / totalOrdersCount))}
            </p>
          </div>
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm p-3">
            <BarChart3 size={24} />
          </div>
        </div>
      </div>

      {/* 10.1 GRAFIK TREN PENJUALAN MINGGUAN / BULANAN (RECHARTS VISUALIZATION) */}
      <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-white/10 pb-5">
          <div>
            <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="text-[#C89B5C]" size={22} />
              <span>Grafik Tren Penjualan & Profitabilitas ({timeView === 'weekly' ? 'Mingguan 7 Hari' : 'Bulanan 4 Pekan'})</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Analisis performa pendapatan kotor (Revenue) dibanding laba bersih (Net Profit) berdasarkan realisasi HPP resep
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex gap-1 rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/30 p-1">
              <button
                onClick={() => setChartMetric('profit')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  chartMetric === 'profit' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <span>Laba Bersih (Profit)</span>
              </button>
              <button
                onClick={() => setChartMetric('revenue')}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  chartMetric === 'revenue' ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                }`}
              >
                <span>Omset Kotor (Revenue)</span>
              </button>
            </div>

            <div className="flex gap-1 rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-50 dark:bg-black/30 p-1">
              <button
                onClick={() => setTimeView('weekly')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  timeView === 'weekly' ? 'bg-[#C89B5C] text-[#1E3D31] shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Mingguan
              </button>
              <button
                onClick={() => setTimeView('monthly')}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  timeView === 'monthly' ? 'bg-[#C89B5C] text-[#1E3D31] shadow-sm' : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                Bulanan
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Bar Chart */}
        <div className="flex items-end gap-3 sm:gap-6 h-64 pt-6">
          {chartData.map((d: any) => {
            const val = chartMetric === 'revenue' ? d.revenue : d.profit;
            const h = Math.round((val / maxMetricVal) * 100);
            const label = d.day || d.period;

            return (
              <div key={label} className="flex-1 flex flex-col items-center gap-2.5 group">
                <div className="text-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[11px] font-mono font-extrabold text-gray-900 dark:text-white block">
                    {fmtShort(val)}
                  </span>
                  <span className="text-[10px] text-gray-400 block font-semibold">{d.orders} Order</span>
                </div>
                <div className="w-full flex items-end justify-center rounded-t-2xl bg-gray-50 dark:bg-black/30 p-1.5" style={{ height: '100%' }}>
                  <div
                    className={`w-full rounded-t-xl transition-all group-hover:brightness-125 shadow-sm ${
                      chartMetric === 'profit' ? 'bg-gradient-to-t from-emerald-700 to-emerald-500' : 'bg-gradient-to-t from-[#1E3D31] to-[#C89B5C]'
                    }`}
                    style={{ height: `${h}%`, minHeight: '14px' }}
                  />
                </div>
                <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300 truncate max-w-[80px]">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 10.1 STATISTIK TOP MENU TERLARIS & PROFITABILITAS (MARGIN HPP VS HARGA JUAL) */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
            <div>
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Percent className="text-[#C89B5C]" size={20} />
                <span>Statistik Profitabilitas Menu (*Margin HPP vs Harga Jual 10.1*)</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Kalkulasi real-time selisih harga jual dengan HPP resep (BOM) per porsi untuk penentuan strategi menu
              </p>
            </div>
            <Link href="/admin/menu" className="text-xs font-extrabold text-[#C89B5C] hover:underline shrink-0">
              Kelola BOM →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-black/30 text-[11px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                  <th className="p-3.5 pl-4">Menu & Kategori</th>
                  <th className="p-3.5 font-mono">Harga Jual</th>
                  <th className="p-3.5 font-mono text-red-500">HPP / Modal</th>
                  <th className="p-3.5 font-mono text-emerald-600">Margin / Porsi</th>
                  <th className="p-3.5 text-center">% Profit</th>
                  <th className="p-3.5 text-right pr-4">Terjual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                {topMenuProfitability.map((item, idx) => (
                  <tr key={item.name} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-gray-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#1E3D31] text-[10px] font-extrabold text-[#C89B5C]">
                          #{idx + 1}
                        </span>
                        <div>
                          <p className="leading-tight">{item.name}</p>
                          <p className="text-[10px] text-gray-400 font-semibold">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-gray-800 dark:text-gray-200">{fmt(item.price)}</td>
                    <td className="p-3.5 font-mono font-semibold text-red-600 dark:text-red-400">{fmt(item.cogs)}</td>
                    <td className="p-3.5 font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{fmt(item.marginRp)}</td>
                    <td className="p-3.5 text-center">
                      <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 text-[10px] font-extrabold font-mono">
                        {item.marginPct}%
                      </span>
                    </td>
                    <td className="p-3.5 text-right pr-4 font-mono font-extrabold text-gray-900 dark:text-white">{item.sold} Porsi</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock & Quick Access */}
        <div className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-heading text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-500" />
                <span>Peringatan Stok Kritis</span>
              </h2>
              <Link href="/admin/inventory" className="text-xs font-bold text-[#C89B5C] hover:underline">
                Kelola →
              </Link>
            </div>
            <div className="p-6 space-y-4">
              {lowStockItems.map((item) => {
                const pct = Math.round((item.stock / item.threshold) * 100);
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-bold text-gray-800 dark:text-gray-200">{item.name}</span>
                      <span className="font-mono text-red-500 font-extrabold">{item.stock} {item.unit}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-black/50 overflow-hidden">
                      <div className="h-full rounded-full bg-red-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400 font-semibold">Min. {item.threshold} {item.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 10.2 / 10.3 / 10.4 Quick Links */}
          <div className="rounded-3xl bg-[#1E3D31] text-white p-6 shadow-md border border-[#C89B5C]/30 space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#C89B5C] font-extrabold mb-3">Modul Kontrol Owner (Fase 10)</h3>
            {[
              { label: '10.2 Manajemen User & Multi-Role', href: '/admin/employees', desc: 'RBAC berganda, tambah/nonaktifkan akun' },
              { label: '10.3 Audit Log & Keamanan Sistem', href: '/admin/employees?tab=audit', desc: 'Lacak riwayat perubahan Before/After JSON' },
              { label: '10.4 Menu Backup & Restore Database', href: '/admin/settings', desc: 'Snapshot ekspor/impor dengan pengaman ganda' },
              { label: '10.1 Laporan & Ekspor PDF / Excel', href: '/admin/reports', desc: 'Unduh laporan eksekutif lengkap' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-xs font-bold text-white hover:bg-[#C89B5C] hover:text-[#1E3D31] transition-all group"
              >
                <div>
                  <p className="font-extrabold">{link.label}</p>
                  <p className="text-[10px] text-white/70 group-hover:text-current font-normal mt-0.5">{link.desc}</p>
                </div>
                <ArrowUpRight size={16} className="shrink-0 text-[#C89B5C] group-hover:text-current" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
