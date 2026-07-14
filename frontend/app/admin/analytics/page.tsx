'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Download, Sparkles, RefreshCw, Check } from 'lucide-react';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

const weeklyChartMock = [
  { day: 'Sen', sales: 1850000, orders: 38 },
  { day: 'Sel', sales: 2200000, orders: 45 },
  { day: 'Rab', sales: 1950000, orders: 41 },
  { day: 'Kam', sales: 2650000, orders: 54 },
  { day: 'Jum', sales: 3100000, orders: 63 },
  { day: 'Sab', sales: 3850000, orders: 78 },
  { day: 'Min', sales: 2847000, orders: 57 },
];

const topProductsMock = [
  { name: 'Caramel Latte', qty: 124, revenue: 4712000, pct: 92 },
  { name: 'Iced Macchiato', qty: 98, revenue: 4116000, pct: 76 },
  { name: 'Butter Croissant', qty: 87, revenue: 2784000, pct: 68 },
  { name: 'Golden Cappuccino', qty: 76, revenue: 2660000, pct: 59 },
  { name: 'Chocolate Brownie', qty: 65, revenue: 2925000, pct: 51 },
];

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const fmtShort = (n: number) => (n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : `Rp ${(n / 1000).toFixed(0)}rb`);
const maxSalesMock = Math.max(...weeklyChartMock.map((d) => d.sales));

export default function AnalyticsPage() {
  const { orders, loading, liveConnected } = useRealtimeOrders();
  const [period, setPeriod] = useState('minggu');
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const activeOrders = orders.filter((o) => o.status !== 'cancelled');
  
  // Calculate dynamic metrics from live transactions if connected, plus mock baselines
  const liveSales = activeOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const totalSales = liveConnected && liveSales > 0 ? liveSales : weeklyChartMock.reduce((s, d) => s + d.sales, 0);
  const totalOrdersCount = liveConnected && activeOrders.length > 0 ? activeOrders.length : weeklyChartMock.reduce((s, d) => s + d.orders, 0);
  const avgOrder = totalOrdersCount > 0 ? Math.round(totalSales / totalOrdersCount) : 45000;

  // Dynamic Channel Breakdown
  const posOrdersCount = activeOrders.filter((o) => ['pos', 'dine_in', 'takeaway'].includes(o.order_type)).length;
  const onlineOrdersCount = activeOrders.filter((o) => ['online', 'delivery'].includes(o.order_type)).length;
  const qrOrdersCount = activeOrders.filter((o) => ['qr', 'table'].includes(o.order_type)).length;

  const totalFilteredCount = posOrdersCount + onlineOrdersCount + qrOrdersCount || 1;
  const posPct = Math.round((posOrdersCount / totalFilteredCount) * 100) || 58;
  const onlinePct = Math.round((onlineOrdersCount / totalFilteredCount) * 100) || 29;
  const qrPct = Math.round((qrOrdersCount / totalFilteredCount) * 100) || 13;

  const handleExportFinancialReport = () => {
    const lines = [
      'LAPORAN ANALITIK & PENJUALAN VELVRA COFFEE SHOP',
      `Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
      `Status Koneksi: ${liveConnected ? 'Live Supabase Cloud' : 'Offline / Standar'}`,
      `Periode: ${period.toUpperCase()}`,
      '',
      '=== RINGKASAN EKSEKUTIF KPI ===',
      `Total Omset Penjualan,${totalSales}`,
      `Total Transaksi Order,${totalOrdersCount}`,
      `Rata-rata Nilai Order (AOV),${avgOrder}`,
      `Estimasi Pelanggan Unik,${Math.round(totalOrdersCount * 0.85)}`,
      '',
      '=== BREAKDOWN PER CHANNEL ===',
      `POS In-Store Bar,${posPct}%,Rp ${Math.round((totalSales * posPct) / 100)}`,
      `Online Ordering,${onlinePct}%,Rp ${Math.round((totalSales * onlinePct) / 100)}`,
      `QR Table Meja,${qrPct}%,Rp ${Math.round((totalSales * qrPct) / 100)}`,
      '',
      '=== PRODUK TERLARIS ===',
      ...topProductsMock.map((p, idx) => `${idx + 1}. ${p.name},${p.qty} terjual,${p.revenue}`),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + lines.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-analitik-velvra-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportStatus('Laporan analitik finansial (CSV) berhasil diunduh!');
    setTimeout(() => setExportStatus(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Analitik & Laporan</h1>
            {liveConnected ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Live Cloud Metrics
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Standar / Agregasi
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">Sudirman Flagship · Terhubung dengan arus transaksi kasir POS & Online</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {[['hari', 'Hari Ini'], ['minggu', 'Minggu Ini'], ['bulan', 'Bulan Ini'], ['tahun', 'Tahun Ini']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setPeriod(v)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all ${
                  period === v ? 'bg-[#12100E] text-[#BA935D] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
          <button
            onClick={handleExportFinancialReport}
            className="flex items-center gap-2 rounded-xl bg-[#12100E] px-4 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
          >
            <Download size={15} /> Export Laporan
          </button>
        </div>
      </div>

      {/* Export Notification */}
      {exportStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          {exportStatus}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total Omset Penjualan', value: fmt(totalSales), change: '+18.3%', up: true, icon: DollarSign, color: 'bg-[#BA935D]' },
          { label: 'Total Transaksi Order', value: `${totalOrdersCount} pesanan`, change: '+12 order baru', up: true, icon: ShoppingCart, color: 'bg-blue-500' },
          { label: 'Rata-rata Nilai Order (AOV)', value: fmt(avgOrder), change: '+5.2%', up: true, icon: TrendingUp, color: 'bg-violet-500' },
          { label: 'Pelanggan Unik', value: `${Math.round(totalOrdersCount * 0.85)} orang`, change: '+14% dari minggu lalu', up: true, icon: Users, color: 'bg-rose-500' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold text-gray-800 font-serif">{kpi.value}</p>
                <p className={`mt-1 text-xs font-medium flex items-center gap-1 ${kpi.up ? 'text-green-600' : 'text-red-500'}`}>
                  {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.change}
                </p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${kpi.color} text-white shadow-sm`}>
                <kpi.icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Top Products */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-6">Grafik Penjualan Mingguan</h2>
          <div className="flex items-end gap-3 h-48">
            {weeklyChartMock.map((d) => {
              const h = Math.round((d.sales / maxSalesMock) * 100);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#BA935D] opacity-0 group-hover:opacity-100 transition-opacity">
                    {fmtShort(d.sales)}
                  </span>
                  <div className="w-full flex items-end justify-center rounded-t-xl" style={{ height: '100%' }}>
                    <div className="w-full rounded-t-xl bg-[#BA935D] transition-all hover:opacity-80" style={{ height: `${h}%`, minHeight: '4px' }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{d.day}</span>
                  <span className="text-[10px] text-gray-400">{d.orders}x</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
          <h2 className="font-serif text-lg font-bold text-gray-800 mb-5">Produk Terlaris (*Best Seller*)</h2>
          <div className="space-y-5">
            {topProductsMock.map((p, i) => (
              <div key={p.name}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#BA935D]/15 text-[10px] font-bold text-[#BA935D]">
                      {i + 1}
                    </span>
                    <span className="font-semibold text-gray-800 text-xs">{p.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-600">{p.qty}x terjual</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div className="h-full rounded-full bg-[#BA935D]" style={{ width: `${p.pct}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-right text-gray-400 font-serif font-semibold">{fmt(p.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown per Channel */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <h2 className="font-serif text-lg font-bold text-gray-800 mb-5">Breakdown Pendapatan Per Channel</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: 'POS (In-Store Kasir)', orders: posOrdersCount || 214, revenue: Math.round((totalSales * posPct) / 100), pct: posPct, color: 'bg-violet-500' },
            { label: 'Online Ordering', orders: onlineOrdersCount || 98, revenue: Math.round((totalSales * onlinePct) / 100), pct: onlinePct, color: 'bg-sky-500' },
            { label: 'QR Table Ordering', orders: qrOrdersCount || 46, revenue: Math.round((totalSales * qrPct) / 100), pct: qrPct, color: 'bg-teal-500' },
          ].map((ch) => (
            <div key={ch.label} className="rounded-xl border border-gray-100 p-5 hover:border-gray-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700">{ch.label}</span>
                <span className={`${ch.color} text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full`}>{ch.pct}%</span>
              </div>
              <p className="text-xl font-bold text-gray-800 font-serif">{fmt(ch.revenue)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ch.orders} order terproses</p>
              <div className="mt-3 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className={`h-full rounded-full ${ch.color}`} style={{ width: `${ch.pct}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
