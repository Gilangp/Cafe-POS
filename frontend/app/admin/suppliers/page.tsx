'use client';

import { useState } from 'react';
import { Plus, Search, Phone, Mail, Package } from 'lucide-react';

const suppliers = [
  { id: 1, name: 'PT Agri Nusantara', category: 'Kopi', contact: 'Pak Hendra', phone: '0215551234', email: 'hendra@agri.co.id', lastOrder: '10 Jul 2026', orderCount: 24, totalValue: 48500000, status: 'active' },
  { id: 2, name: 'Greenfields Indonesia', category: 'Dairy', contact: 'Bu Sinta', phone: '0215555678', email: 'sinta@greenfields.id', lastOrder: '12 Jul 2026', orderCount: 36, totalValue: 22800000, status: 'active' },
  { id: 3, name: 'Anchor Dairy Distributor', category: 'Dairy', contact: 'Pak Budi', phone: '0215559012', email: 'budi@anchor.id', lastOrder: '8 Jul 2026', orderCount: 18, totalValue: 14200000, status: 'active' },
  { id: 4, name: 'Valrhona Chocolate Asia', category: 'Baking', contact: 'Ms. Lena', phone: '0215553456', email: 'lena@valrhona.asia', lastOrder: '5 Jul 2026', orderCount: 8, totalValue: 31000000, status: 'active' },
  { id: 5, name: 'Oatly SEA Distribution', category: 'Dairy', contact: 'Pak Reza', phone: '0215557890', email: 'reza@oatly.com', lastOrder: '1 Jul 2026', orderCount: 12, totalValue: 18600000, status: 'inactive' },
];

const categoryColor: Record<string, string> = {
  'Kopi': 'bg-amber-100 text-amber-700',
  'Dairy': 'bg-blue-100 text-blue-700',
  'Baking': 'bg-rose-100 text-rose-700',
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) || s.category.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Manajemen Supplier</h1>
          <p className="text-sm text-gray-500 mt-1">{suppliers.filter(s => s.status === 'active').length} supplier aktif</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
          <Plus size={16} /> Tambah Supplier
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari supplier atau kategori..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none" />
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Kategori</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Order Terakhir</th>
                <th className="px-6 py-4">Total Order</th>
                <th className="px-6 py-4">Total Nilai</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-800">{s.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${categoryColor[s.category] || 'bg-gray-100 text-gray-500'}`}>{s.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-semibold text-gray-700">{s.contact}</p>
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Phone size={9} />{s.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{s.lastOrder}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <Package size={13} className="text-gray-300" />
                      <span className="text-sm font-bold text-gray-700">{s.orderCount}x</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-800">{fmt(s.totalValue)}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                      {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                      Buat PO
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
