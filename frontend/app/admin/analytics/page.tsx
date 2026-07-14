'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign } from 'lucide-react';

const weeklyData = [
  { day: 'Sen', sales: 1850000, orders: 38 },
  { day: 'Sel', sales: 2200000, orders: 45 },
  { day: 'Rab', sales: 1950000, orders: 41 },
  { day: 'Kam', sales: 2650000, orders: 54 },
  { day: 'Jum', sales: 3100000, orders: 63 },
  { day: 'Sab', sales: 3850000, orders: 78 },
  { day: 'Min', sales: 2847000, orders: 57 },
];

const topProducts = [
  { name: 'Caramel Latte', qty: 124, revenue: 4712000, pct: 92 },
  { name: 'Iced Macchiato', qty: 98, revenue: 4116000, pct: 76 },
  { name: 'Butter Croissant', qty: 87, revenue: 2784000, pct: 68 },
  { name: 'Golden Cappuccino', qty: 76, revenue: 2660000, pct: 59 },
  { name: 'Chocolate Brownie', qty: 65, revenue: 2925000, pct: 51 },
];

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtShort = (n: number) => n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : `Rp ${(n / 1000).toFixed(0)}rb`;
const maxSales = Math.max(...weeklyData.map(d => d.sales));

export default function AnalyticsPage() {
  const [period, setPeriod] = useState('minggu');
  const totalSales = weeklyData.reduce((s, d) => s + d.sales, 0);
  const totalOrders = weeklyData.reduce((s, d) => s + d.orders, 0);
  const avgOrder = Math.round(totalSales / totalOrders);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Analitik & Laporan</h1>
          <p className="text-sm text-gray-500 mt-1">Sudirman Flagship</p>
        </div>
        <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1">
          {[['hari','Hari Ini'],['minggu','Minggu Ini'],['bulan','Bulan Ini'],['tahun','Tahun Ini']].map(([v, l]) => (
            <button key={v} onClick={() => setPeriod(v)}
              className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-all ${period === v ? 'bg-[#12100E] text-[#BA935D]' : 'text-gray-500 hover:text-gray-700'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Penjualan', value: fmt(totalSales), change: '+18.3%', up: true, icon: DollarSign, color: 'bg-[#BA935D]' },
          { label: 'Total Order', value: String(totalOrders), change: '+12 order', up: true, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Rata-rata Order', value: fmt(avgOrder), change: '+5.2%', up: true, icon: TrendingUp, color: 'bg-violet-500' },
          { label: 'Pelanggan Unik', value: '312', change: '-3 pelanggan', up: false, icon: Users, color: 'bg-rose-500' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-800 font-serif">{kpi.value}</p>
                <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.change}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${kpi.color} text-white`}>
                <kpi.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-6">Grafik Penjualan Mingguan</h2>
          <div className="flex items-end gap-3 h-48">
            {weeklyData.map(d => {
              const h = Math.round((d.sales / maxSales) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#BA935D] opacity-0 group-hover:opacity-100 transition-opacity">{fmtShort(d.sales)}</span>
                  <div className="w-full flex items-end justify-center rounded-t-xl" style={{ height: '100%' }}>
                    <div className="w-full rounded-t-xl bg-[#BA935D] transition-all hover:opacity-80" style={{ height: `${h}%`, minHeight: '4px' }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{d.day}</span>
                  <span className="text-[10px] text-gray-400">{d.orders}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-5">Produk Terlaris</h2>
          <div className="space-y-5">
            {topProducts.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#BA935D]/15 text-[10px] font-bold text-[#BA935D]">{i + 1}</span>
                    <span className="font-semibold text-gray-700 text-xs">{p.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{p.qty}x</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-[#BA935D]" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-right text-gray-400">{fmt(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-gray-800 mb-5">Breakdown Per Channel</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'POS (In-store)', orders: 214, revenue: 8420000, pct: 58, color: 'bg-violet-500' },
            { label: 'Online Order', orders: 98, revenue: 4200000, pct: 29, color: 'bg-sky-500' },
            { label: 'QR Ordering', orders: 46, revenue: 1850000, pct: 13, color: 'bg-teal-500' },
          ].map(ch => (
            <div key={ch.label} className="rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700">{ch.label}</span>
                <span className={`${ch.color} text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full`}>{ch.pct}%</span>
              </div>
              <p className="text-xl font-bold text-gray-800 font-serif">{fmt(ch.revenue)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ch.orders} order</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100">
                <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
