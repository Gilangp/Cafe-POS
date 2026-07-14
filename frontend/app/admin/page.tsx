import { ShoppingCart, TrendingUp, Package, Users, Clock, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/admin/stat-card';
import Link from 'next/link';

const recentOrders = [
  { id: '#ORD-1042', customer: 'Rina Mahardika', items: 'Velvet Latte, Croissant', total: 'Rp 68.000', status: 'preparing', time: '3 mnt lalu' },
  { id: '#ORD-1041', customer: 'Budi Santoso', items: 'Iced Macchiato x2', total: 'Rp 84.000', status: 'ready', time: '8 mnt lalu' },
  { id: '#ORD-1040', customer: 'Walk-in', items: 'Espresso, Brownie', total: 'Rp 75.500', status: 'completed', time: '15 mnt lalu' },
  { id: '#ORD-1039', customer: 'Anisa Putri', items: 'V60 Pour Over', total: 'Rp 42.000', status: 'completed', time: '22 mnt lalu' },
  { id: '#ORD-1038', customer: 'David Chen', items: 'Cappuccino, Almond Pastry', total: 'Rp 59.000', status: 'completed', time: '31 mnt lalu' },
];

const lowStockItems = [
  { name: 'Susu Oat (Oatly)', stock: 2, unit: 'liter', threshold: 5 },
  { name: 'Biji Kopi Sumatra Dark', stock: 800, unit: 'gram', threshold: 1000 },
  { name: 'Mentega Premium (Anchor)', stock: 3, unit: 'pack', threshold: 6 },
];

const statusStyle: Record<string, string> = {
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  new: 'bg-blue-100 text-blue-700',
};

const statusLabel: Record<string, string> = {
  preparing: 'Menyiapkan',
  ready: 'Siap',
  completed: 'Selesai',
  new: 'Baru',
};

export default function AdminDashboardPage() {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Selamat Pagi' : now.getHours() < 17 ? 'Selamat Siang' : 'Selamat Sore';

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">{greeting}, Admin 👋</h1>
          <p className="mt-1 text-sm text-gray-500">
            {now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            &nbsp;·&nbsp; Sudirman Flagship
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/pos" className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
            <ShoppingCart size={16} />
            Buka POS
          </Link>
          <Link href="/admin/kds" className="flex items-center gap-2 rounded-xl border border-[#BA935D] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#BA935D]/10 transition-colors">
            <Clock size={16} />
            Lihat KDS
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Penjualan Hari Ini" value="Rp 2.847.000" change="12.5% lebih tinggi" positive={true} icon={TrendingUp} color="bg-[#BA935D]" />
        <StatCard title="Total Order" value="47" change="8 order lebih banyak" positive={true} icon={ShoppingCart} color="bg-blue-500" />
        <StatCard title="Pelanggan Aktif" value="134" change="5% dari kemarin" positive={true} icon={Users} color="bg-violet-500" />
        <StatCard title="Item Stok Kritis" value="3" change="1 item tambahan" positive={false} icon={Package} color="bg-red-500" />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders Table (2/3 width) */}
        <div className="lg:col-span-2 rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-serif text-lg font-bold text-gray-800">Order Terbaru</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[#BA935D] hover:underline">
              Lihat semua →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-3">ID Order</th>
                  <th className="px-6 py-3">Pelanggan</th>
                  <th className="px-6 py-3 hidden md:table-cell">Item</th>
                  <th className="px-6 py-3">Total</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 hidden sm:table-cell">Waktu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs font-bold text-gray-700">{order.id}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-700">{order.customer}</td>
                    <td className="px-6 py-3.5 hidden md:table-cell text-xs text-gray-500 max-w-[180px] truncate">{order.items}</td>
                    <td className="px-6 py-3.5 text-sm font-bold text-gray-800">{order.total}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 hidden sm:table-cell text-xs text-gray-400">{order.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Low Stock Alert */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-serif text-base font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle size={16} className="text-red-500" />
                Stok Kritis
              </h2>
              <Link href="/admin/inventory" className="text-xs font-semibold text-[#BA935D] hover:underline">
                Kelola →
              </Link>
            </div>
            <div className="p-5 space-y-4">
              {lowStockItems.map((item) => {
                const pct = Math.round((item.stock / item.threshold) * 100);
                return (
                  <div key={item.name}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-700 text-xs">{item.name}</span>
                      <span className="text-xs text-red-500 font-bold">{item.stock} {item.unit}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-red-400 transition-all"
                        style={{ width: `${Math.min(pct, 100)}%` }}
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-gray-400">Min. {item.threshold} {item.unit}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl bg-[#12100E] border border-white/10 p-5 space-y-2.5">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-4">Akses Cepat</h3>
            {[
              { label: 'Tambah Produk Baru', href: '/admin/menu' },
              { label: 'Buat Purchase Order', href: '/admin/suppliers' },
              { label: 'Laporan Penjualan', href: '/admin/reports' },
              { label: 'Manajemen Karyawan', href: '/admin/employees' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-sm text-white/80 hover:bg-white/10 hover:text-[#BA935D] transition-all group"
              >
                <span>{link.label}</span>
                <span className="text-white/30 group-hover:text-[#BA935D]">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
