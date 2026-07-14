'use client';

import { useState } from 'react';
import { Search, Filter, Eye, ChevronDown } from 'lucide-react';

const orders = [
  { id: '#ORD-1042', customer: 'Rina Mahardika', items: 3, total: 98000, status: 'preparing', channel: 'pos', table: 'Meja 4', time: '09:32' },
  { id: '#ORD-1041', customer: 'Budi Santoso', items: 2, total: 84000, status: 'ready', channel: 'online', table: 'Online', time: '09:27' },
  { id: '#ORD-1040', customer: 'Walk-in', items: 2, total: 75500, status: 'completed', channel: 'pos', table: 'Walk-in', time: '09:20' },
  { id: '#ORD-1039', customer: 'Anisa Putri', items: 1, total: 42000, status: 'completed', channel: 'qr', table: 'Meja 2', time: '09:13' },
  { id: '#ORD-1038', customer: 'David Chen', items: 2, total: 59000, status: 'completed', channel: 'pos', table: 'Walk-in', time: '09:04' },
  { id: '#ORD-1037', customer: 'Walk-in', items: 4, total: 136000, status: 'completed', channel: 'pos', table: 'Meja 1', time: '08:55' },
  { id: '#ORD-1036', customer: 'Member - Sari W.', items: 2, total: 73000, status: 'cancelled', channel: 'online', table: 'Online', time: '08:41' },
];

const statusStyle: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-500',
  cancelled: 'bg-red-100 text-red-500',
};

const statusLabel: Record<string, string> = {
  new: 'Baru', preparing: 'Diproses', ready: 'Siap Ambil', completed: 'Selesai', cancelled: 'Dibatalkan',
};

const channelStyle: Record<string, string> = {
  pos: 'bg-violet-100 text-violet-700',
  online: 'bg-sky-100 text-sky-700',
  qr: 'bg-teal-100 text-teal-700',
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function OrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = orders.filter((o) => {
    const matchSearch = o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold text-gray-800">Semua Order</h1>
        <div className="text-sm text-gray-500">Hari ini · {orders.length} order</div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari order atau pelanggan..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#BA935D] focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="new">Baru</option>
            <option value="preparing">Diproses</option>
            <option value="ready">Siap Ambil</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">ID Order</th>
                <th className="px-6 py-4">Pelanggan</th>
                <th className="px-6 py-4">Channel</th>
                <th className="px-6 py-4">Meja / Lokasi</th>
                <th className="px-6 py-4">Item</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">{order.id}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{order.customer}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${channelStyle[order.channel]}`}>
                      {order.channel.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.table}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.items} item</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{fmt(order.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${statusStyle[order.status]}`}>
                      {statusLabel[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{order.time}</td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                      <Eye size={13} /> Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
