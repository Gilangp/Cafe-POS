'use client';

import { useState } from 'react';
import { Search, Star, Phone, Mail, ShoppingBag } from 'lucide-react';

const customers = [
  { id: 1, name: 'Rina Mahardika', email: 'rina@email.com', phone: '081234567890', tier: 'Gold', points: 4850, orders: 47, totalSpend: 3420000, lastVisit: '2 jam lalu', avatar: 'RM' },
  { id: 2, name: 'David Chen', email: 'david@email.com', phone: '081234567891', tier: 'Silver', points: 2100, orders: 23, totalSpend: 1680000, lastVisit: 'Kemarin', avatar: 'DC' },
  { id: 3, name: 'Anisa Putri', email: 'anisa@email.com', phone: '081234567892', tier: 'Gold', points: 6200, orders: 68, totalSpend: 5240000, lastVisit: '1 hari lalu', avatar: 'AP' },
  { id: 4, name: 'Budi Santoso', email: 'budi@email.com', phone: '081234567893', tier: 'Bronze', points: 420, orders: 8, totalSpend: 340000, lastVisit: '5 hari lalu', avatar: 'BS' },
  { id: 5, name: 'Sari Wulandari', email: 'sari@email.com', phone: '081234567894', tier: 'Silver', points: 1850, orders: 19, totalSpend: 1240000, lastVisit: '3 hari lalu', avatar: 'SW' },
];

const tierStyle: Record<string, { badge: string; bg: string }> = {
  Gold: { badge: 'bg-amber-100 text-amber-700', bg: 'border-amber-200' },
  Silver: { badge: 'bg-gray-100 text-gray-600', bg: 'border-gray-200' },
  Bronze: { badge: 'bg-orange-100 text-orange-700', bg: 'border-orange-200' },
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const avatarColors = ['bg-[#BA935D]', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500'];

export default function CrmPage() {
  const [search, setSearch] = useState('');
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.email.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Pelanggan (CRM)</h1>
          <p className="text-sm text-gray-500 mt-1">{customers.length} pelanggan terdaftar</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Member Gold', value: customers.filter(c => c.tier === 'Gold').length, color: 'bg-amber-400' },
          { label: 'Member Silver', value: customers.filter(c => c.tier === 'Silver').length, color: 'bg-gray-400' },
          { label: 'Member Bronze', value: customers.filter(c => c.tier === 'Bronze').length, color: 'bg-orange-400' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white font-bold text-lg font-serif`}>{s.value}</div>
            <span className="text-sm font-semibold text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau email pelanggan..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none" />
      </div>

      {/* Customer Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c, i) => (
          <div key={c.id} className={`rounded-2xl bg-white border-2 ${tierStyle[c.tier].bg} p-5 shadow-sm hover:shadow-md transition-all`}>
            <div className="flex items-start gap-4 mb-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${avatarColors[i % avatarColors.length]} text-white font-bold text-sm`}>
                {c.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-800 text-sm">{c.name}</h3>
                  <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${tierStyle[c.tier].badge}`}>
                    <Star size={8} className="inline mr-0.5" />{c.tier}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Terakhir kunjungan: {c.lastVisit}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="rounded-xl bg-[#FAF6F0] p-3 text-center">
                <p className="text-lg font-bold text-[#BA935D] font-serif">{c.orders}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Order</p>
              </div>
              <div className="rounded-xl bg-[#FAF6F0] p-3 text-center">
                <p className="text-sm font-bold text-gray-700 font-serif">{c.points.toLocaleString('id-ID')}</p>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">Poin</p>
              </div>
            </div>

            <p className="text-xs text-gray-500 mb-3">Total belanja: <strong className="text-gray-800">{fmt(c.totalSpend)}</strong></p>

            <div className="space-y-1.5 text-xs text-gray-400">
              <div className="flex items-center gap-2"><Phone size={11} />{c.phone}</div>
              <div className="flex items-center gap-2"><Mail size={11} />{c.email}</div>
            </div>

            <button className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
              <ShoppingBag size={12} /> Lihat Histori Order
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
