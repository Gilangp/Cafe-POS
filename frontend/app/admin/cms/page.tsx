'use client';

import { useState } from 'react';
import { FileText, Image, Calendar, BookOpen, Briefcase, Plus, Edit2, Eye } from 'lucide-react';

const cmsModules = [
  { key: 'pages', label: 'Halaman Statis', icon: FileText, count: 8, color: 'bg-blue-500' },
  { key: 'blog', label: 'Blog & Artikel', icon: BookOpen, count: 12, color: 'bg-violet-500' },
  { key: 'events', label: 'Event', icon: Calendar, count: 3, color: 'bg-amber-500' },
  { key: 'careers', label: 'Karir & Lowongan', icon: Briefcase, count: 2, color: 'bg-teal-500' },
  { key: 'gallery', label: 'Galeri Foto', icon: Image, count: 48, color: 'bg-rose-500' },
];

const recentContent = [
  { title: 'Keindahan Proses Roasting Kopi Sumatra', type: 'Blog', status: 'published', author: 'Nadia R.', date: '12 Jul 2026' },
  { title: 'Event Brewing Class — Agustus 2026', type: 'Event', status: 'draft', author: 'Nadia R.', date: '11 Jul 2026' },
  { title: 'Tentang Kami — Update Cerita Brand', type: 'Halaman', status: 'published', author: 'Admin', date: '10 Jul 2026' },
  { title: 'Lowongan Barista — Sudirman', type: 'Karir', status: 'published', author: 'Fajar N.', date: '9 Jul 2026' },
  { title: 'Panduan Memilih Biji Kopi Terbaik', type: 'Blog', status: 'review', author: 'Nadia R.', date: '8 Jul 2026' },
];

const statusStyle: Record<string, string> = {
  published: 'bg-green-100 text-green-700',
  draft: 'bg-gray-100 text-gray-500',
  review: 'bg-amber-100 text-amber-700',
};

const statusLabel: Record<string, string> = {
  published: 'Tayang', draft: 'Draft', review: 'Review',
};

export default function CmsPage() {
  const [activeModule, setActiveModule] = useState('blog');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">CMS Konten</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola konten website Velvra</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
          <Plus size={16} /> Buat Konten Baru
        </button>
      </div>

      {/* Module Cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cmsModules.map(mod => (
          <button key={mod.key} onClick={() => setActiveModule(mod.key)}
            className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${activeModule === mod.key ? 'border-[#BA935D] bg-[#BA935D]/5' : 'border-gray-100 bg-white'}`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${mod.color} text-white mb-3`}>
              <mod.icon size={18} />
            </div>
            <p className="text-2xl font-bold text-gray-800 font-serif">{mod.count}</p>
            <p className="text-xs text-gray-500 font-semibold mt-0.5">{mod.label}</p>
          </button>
        ))}
      </div>

      {/* Recent Content Table */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-800">Konten Terbaru</h2>
          <span className="text-xs text-gray-400">{recentContent.length} item</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
              <th className="px-6 py-3">Judul</th>
              <th className="px-6 py-3">Tipe</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Penulis</th>
              <th className="px-6 py-3">Tanggal</th>
              <th className="px-6 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentContent.map((c, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-gray-800 max-w-xs truncate">{c.title}</td>
                <td className="px-6 py-4 text-xs text-gray-500">{c.type}</td>
                <td className="px-6 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[c.status]}`}>{statusLabel[c.status]}</span>
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">{c.author}</td>
                <td className="px-6 py-4 text-xs text-gray-400">{c.date}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:border-[#BA935D] hover:text-[#BA935D] transition-all">
                      <Edit2 size={11} /> Edit
                    </button>
                    <button className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-[11px] font-semibold text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all">
                      <Eye size={11} /> Preview
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
