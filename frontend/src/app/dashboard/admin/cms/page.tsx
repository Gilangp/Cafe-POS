'use client';

import { useState } from 'react';
import {
  FileText,
  Image,
  Calendar,
  BookOpen,
  Briefcase,
  Plus,
  Edit2,
  Eye,
  Layout,
  ArrowUp,
  ArrowDown,
  ToggleLeft,
  ToggleRight,
  Smartphone,
  Monitor,
  CheckCircle2,
  Save,
  X,
  Layers,
  Settings2,
  Clock,
  Phone,
  MapPin,
  Globe,
  Share2,
} from 'lucide-react';

const cmsModules = [
  { key: 'pages', label: 'Halaman Statis', icon: FileText, count: 8, color: 'bg-blue-600' },
  { key: 'blog', label: 'Blog & Artikel Jurnal', icon: BookOpen, count: 12, color: 'bg-emerald-600' },
  { key: 'events', label: 'Event & Workshop', icon: Calendar, count: 3, color: 'bg-amber-600' },
  { key: 'careers', label: 'Karir & Lowongan Barista', icon: Briefcase, count: 2, color: 'bg-teal-600' },
  { key: 'gallery', label: 'Galeri Foto Roastery', icon: Image, count: 48, color: 'bg-rose-600' },
];

const recentContent = [
  { title: 'Keindahan Proses Roasting Kopi Gayo Sumatra', type: 'Blog', status: 'published', author: 'Nadia R.', date: '12 Jul 2026' },
  { title: 'Event Slow-Bar Manual Brew — Agustus 2026', type: 'Event', status: 'draft', author: 'Nadia R.', date: '11 Jul 2026' },
  { title: 'Tentang Kami — Cerita Flagship Roastery Senopati', type: 'Halaman', status: 'published', author: 'Admin', date: '10 Jul 2026' },
  { title: 'Lowongan Head Barista — Flagship Senopati', type: 'Karir', status: 'published', author: 'Fajar N.', date: '9 Jul 2026' },
  { title: 'Panduan Memilih Biji Kopi Arabica vs Robusta', type: 'Blog', status: 'review', author: 'Nadia R.', date: '8 Jul 2026' },
];

const statusStyle: Record<string, string> = {
  published: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
  draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300',
  review: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
};

const statusLabel: Record<string, string> = {
  published: 'Tayang',
  draft: 'Draft',
  review: 'Review',
};

interface CmsBlock {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  active: boolean;
  order: number;
  badge: string;
}

const INITIAL_BLOCKS: CmsBlock[] = [
  { id: 'BLK-101', type: 'Hero Banner Section (`WEB-001`)', title: 'Sensasi Kopi Specialty Artisan Sesungguhnya', subtitle: 'Nikmati keharuman biji kopi single origin pilihan nusantara dengan sentuhan roasting modern di NEMU Space.', active: true, order: 1, badge: 'Hero Section' },
  { id: 'BLK-102', type: 'Featured Products Carousel (`CMS-005`)', title: 'Racikan Pilihan Head Barista (*Best Seller*)', subtitle: 'Katalog eksklusif Velvet Espresso, Caramel Macchiato Gold, dan Butter Artisan Croissant segar setiap pagi.', active: true, order: 2, badge: 'Product Carousel' },
  { id: 'BLK-103', type: 'Promo Countdown Banner (`PRO-001`)', title: 'Diskon Spesial 20% untuk Kunjungan Pertama', subtitle: 'Gunakan kode voucher WELCOME20 saat memesan online atau di kasir sebelum akhir bulan ini.', active: true, order: 3, badge: 'Promo Highlight' },
  { id: 'BLK-104', type: 'Artisan Roastery Story (`WEB-002`)', title: 'Dari Perkebunan Dataran Tinggi ke Cangkir Anda', subtitle: 'Komitmen kami terhadap petani lokal Gayo & Kintamani untuk menghasilkan rasa dengan kejernihan maksimal.', active: true, order: 4, badge: 'Story Text' },
  { id: 'BLK-105', type: 'Customer Review & Rating Slider (`CMS-006`)', title: 'Apa Kata Pengunjung Setia NEMU Space', subtitle: 'Ulasan jujur dari ribuan member Loyalty CRM dan penikmat kopi di Jakarta Selatan.', active: false, order: 5, badge: 'Social Proof' },
];

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'builder' | 'settings'>('content');
  const [activeModule, setActiveModule] = useState('blog');

  // Block Builder State
  const [blocks, setBlocks] = useState<CmsBlock[]>(INITIAL_BLOCKS);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [editingBlock, setEditingBlock] = useState<CmsBlock | null>(null);
  const [saveAlert, setSaveAlert] = useState('');

  // 9.1 Store Info & Hours State
  const [storeInfo, setStoreInfo] = useState({
    name: 'NEMU Space Specialty Roastery',
    phone: '+62 21 555 0199',
    whatsapp: '+62 812 3456 7890',
    instagram: '@nemuspace.roastery',
    address: 'Jl. Senopati Raya No. 42, Kebayoran Baru, Jakarta Selatan 12190',
    weekdayHours: 'Senin - Jumat: 08:00 - 22:00 WIB',
    weekendHours: 'Sabtu - Minggu: 07:00 - 23:00 WIB',
  });

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newBlocks = [...blocks];
    const [moved] = newBlocks.splice(index, 1);
    newBlocks.splice(targetIndex, 0, moved);
    setBlocks(newBlocks.map((b, idx) => ({ ...b, order: idx + 1 })));
  };

  const toggleBlockActive = (id: string) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  };

  const handleSaveBlockEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlock) return;
    setBlocks((prev) => prev.map((b) => (b.id === editingBlock.id ? editingBlock : b)));
    setEditingBlock(null);
    setSaveAlert('✓ Perubahan blok CMS berhasil disimpan dan langsung diperbarui di Live Preview!');
    setTimeout(() => setSaveAlert(''), 3500);
  };

  const handlePublishLayout = () => {
    setSaveAlert('✓ Susunan Visual Block Builder (9.1) berhasil diterbitkan ke beranda publik NEMU Space!');
    setTimeout(() => setSaveAlert(''), 4000);
  };

  const handleSaveStoreInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveAlert('✓ Kontak roastery & jam operasional berhasil diperbarui untuk seluruh platform!');
    setTimeout(() => setSaveAlert(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              CMS & Landing Page Builder (9.1)
            </h1>
            <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm">
              Phase 9.1 Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Kelola artikel jurnal roastery, atur seksi aktif banner beranda, serta perbarui kontak & jam operasional toko.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'builder' && (
            <button
              onClick={handlePublishLayout}
              className="flex items-center gap-2 rounded-xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] transition-all shadow-md active:scale-95"
            >
              <Save size={15} /> Terbitkan Layout Beranda
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 dark:border-white/10 scrollbar-hide">
        {[
          { id: 'content', label: '1. Daftar Konten Statis & Blog', icon: FileText, count: recentContent.length },
          { id: 'builder', label: '2. Visual Block Builder (`WEB-001`)', icon: Layout, count: blocks.length },
          { id: 'settings', label: '3. Kontak & Jam Operasional Toko', icon: Settings2, count: 6 },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === t.id
                ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md'
                : 'bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 hover:border-[#C89B5C]'
            }`}
          >
            <t.icon size={16} />
            <span>{t.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === t.id ? 'bg-[#C89B5C] text-[#1E3D31]' : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Save Alert */}
      {saveAlert && (
        <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveAlert}</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-emerald-200/80 dark:bg-emerald-900 px-2.5 py-1 rounded">Tersimpan</span>
        </div>
      )}

      {/* TAB 1: CONTENT LISTING */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cmsModules.map((mod) => (
              <button
                key={mod.key}
                onClick={() => setActiveModule(mod.key)}
                className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${
                  activeModule === mod.key ? 'border-[#C89B5C] bg-[#FAF3E7] dark:bg-[#C89B5C]/15' : 'border-gray-100 dark:border-white/10 bg-white dark:bg-white/5'
                }`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${mod.color} text-white mb-3 shadow-sm`}>
                  <mod.icon size={18} />
                </div>
                <p className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">{mod.count}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300 font-semibold mt-0.5">{mod.label}</p>
              </button>
            ))}
          </div>

          <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/10">
              <h2 className="font-heading text-base font-bold text-gray-900 dark:text-white">Konten Terbaru ({activeModule.toUpperCase()})</h2>
              <button className="flex items-center gap-1.5 rounded-xl bg-[#1E3D31] px-4 py-2 text-xs font-bold text-[#C89B5C] hover:bg-[#163026]">
                <Plus size={14} /> Buat Artikel Baru
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-black/30 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                    <th className="px-6 py-3.5">Judul Artikel / Halaman</th>
                    <th className="px-6 py-3.5">Tipe</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Penulis</th>
                    <th className="px-6 py-3.5">Tanggal</th>
                    <th className="px-6 py-3.5">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                  {recentContent.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">{c.title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{c.type}</td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${statusStyle[c.status]}`}>
                          {statusLabel[c.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{c.author}</td>
                      <td className="px-6 py-4 text-gray-400">{c.date}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-white/15 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-all">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button className="flex items-center gap-1 rounded-xl border border-gray-200 dark:border-white/15 px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-500 transition-all">
                            <Eye size={12} /> Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VISUAL BLOCK BUILDER */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-[#1E3D31] text-white p-5 border-2 border-[#C89B5C] flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#C89B5C]/20 text-[#C89B5C]">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-white leading-tight">Visual Block Builder (`WEB-001` / `CMS-005`)</h3>
                  <p className="text-[11px] text-white/75">Geser urutan atas/bawah atau nonaktifkan blok untuk mengatur tata letak halaman utama.</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase">
                Drag & Drop
              </span>
            </div>

            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border-2 p-5 transition-all ${
                    block.active ? 'bg-white dark:bg-[#1A2620] border-gray-200 dark:border-white/10 shadow-sm hover:border-[#C89B5C]' : 'bg-gray-50 dark:bg-black/30 border-dashed border-gray-200 dark:border-white/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FAF3E7] dark:bg-black/40 text-[#C89B5C] font-bold text-xs border border-[#C89B5C]/30 mt-0.5">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C89B5C] bg-[#C89B5C]/15 px-2.5 py-0.5 rounded-full">
                          {block.badge}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 font-bold">{block.id}</span>
                      </div>
                      <h4 className="font-heading text-sm font-bold text-gray-900 dark:text-white mt-1 truncate">{block.type}</h4>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate mt-0.5">&ldquo;{block.title}&rdquo;</p>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{block.subtitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-black/40 p-1 rounded-xl">
                      <button
                        onClick={() => moveBlock(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg ${idx === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 shadow-sm'}`}
                        title="Geser ke Atas"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveBlock(idx, 'down')}
                        disabled={idx === blocks.length - 1}
                        className={`p-1.5 rounded-lg ${
                          idx === blocks.length - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-white/10 shadow-sm'
                        }`}
                        title="Geser ke Bawah"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingBlock({ ...block })}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-colors"
                    >
                      <Settings2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => toggleBlockActive(block.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        block.active
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                          : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-300'
                      }`}
                    >
                      {block.active ? <ToggleRight size={16} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={16} />}
                      <span>{block.active ? 'Aktif' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#C89B5C]" />
                  <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white">Live Preview Box</h3>
                </div>

                <div className="flex rounded-xl bg-gray-100 dark:bg-black/40 p-1">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewDevice === 'desktop' ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Monitor size={13} /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewDevice === 'mobile' ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone size={13} /> Mobile
                  </button>
                </div>
              </div>

              <div
                className={`mx-auto rounded-3xl border-4 border-[#1E3D31] bg-[#FAF3E7] dark:bg-black/60 p-4 shadow-inner overflow-y-auto max-h-[520px] transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[280px] text-[10px]' : 'w-full text-xs'
                }`}
              >
                <div className="border-b border-gray-300 dark:border-white/10 pb-2 mb-3 flex items-center justify-between text-gray-500 font-mono text-[10px]">
                  <span>nemuspace.com/home</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">● Live Sync</span>
                </div>

                <div className="space-y-3">
                  {blocks.filter((b) => b.active).length === 0 ? (
                    <div className="py-12 text-center text-gray-400 italic">
                      Semua blok disembunyikan. Aktifkan minimal 1 blok.
                    </div>
                  ) : (
                    blocks
                      .filter((b) => b.active)
                      .map((block, i) => (
                        <div
                          key={block.id}
                          className="rounded-2xl bg-white dark:bg-black/40 border border-gray-200/80 dark:border-white/10 p-3.5 shadow-sm space-y-1.5 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#C89B5C] bg-[#C89B5C]/15 px-2 py-0.5 rounded">
                              #{i + 1} · {block.badge}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">{block.id}</span>
                          </div>
                          <p className="font-heading font-bold text-gray-900 dark:text-white text-sm leading-tight">{block.title}</p>
                          <p className="text-gray-500 dark:text-gray-300 text-[11px] leading-relaxed line-clamp-2">{block.subtitle}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1 pt-2">
                <span>Perubahan urutan & status aktif langsung direfleksikan di atas.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: STORE SETTINGS (9.1) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveStoreInfo} className="max-w-3xl space-y-6 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 border border-gray-200 dark:border-white/10 shadow-sm space-y-6">
            <div className="border-b border-gray-100 dark:border-white/10 pb-4">
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Globe size={19} className="text-[#C89B5C]" />
                <span>Pengaturan Identitas & Jam Operasional Toko (9.1)</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Informasi ini akan ditampilkan pada footer beranda, halaman kontak, dan struk reservasi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Nama Resmi Roastery
                </label>
                <input
                  required
                  type="text"
                  value={storeInfo.name}
                  onChange={(e) => setStoreInfo({ ...storeInfo, name: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  No. Telepon Reservasi / Kasir
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={storeInfo.phone}
                    onChange={(e) => setStoreInfo({ ...storeInfo, phone: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-3 pl-10 pr-4 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  WhatsApp Booking Meja
                </label>
                <input
                  required
                  type="text"
                  value={storeInfo.whatsapp}
                  onChange={(e) => setStoreInfo({ ...storeInfo, whatsapp: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Akun Instagram Resmi
                </label>
                <div className="relative">
                  <Share2 size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    required
                    type="text"
                    value={storeInfo.instagram}
                    onChange={(e) => setStoreInfo({ ...storeInfo, instagram: e.target.value })}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-3 pl-10 pr-4 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Alamat Flagship Roastery
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <textarea
                  required
                  rows={2}
                  value={storeInfo.address}
                  onChange={(e) => setStoreInfo({ ...storeInfo, address: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-3 pl-10 pr-4 text-xs focus:border-[#C89B5C] focus:outline-none leading-relaxed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 dark:border-white/10 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#C89B5C]" />
                  <span>Jam Buka Hari Kerja (Senin - Jumat)</span>
                </label>
                <input
                  required
                  type="text"
                  value={storeInfo.weekdayHours}
                  onChange={(e) => setStoreInfo({ ...storeInfo, weekdayHours: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#C89B5C]" />
                  <span>Jam Buka Akhir Pekan (Sabtu - Minggu)</span>
                </label>
                <input
                  required
                  type="text"
                  value={storeInfo.weekendHours}
                  onChange={(e) => setStoreInfo({ ...storeInfo, weekendHours: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-6 py-3.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md transition-all active:scale-95"
              >
                <Save size={16} />
                <span>Simpan Pengaturan Toko & Jam Buka</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* MODAL: EDIT BLOCK PAYLOAD */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#1A2620] rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-white/15 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={20} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Edit Blok CMS ({editingBlock.id})</h3>
              </div>
              <button onClick={() => setEditingBlock(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlockEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Tipe Blok</label>
                <input
                  type="text"
                  disabled
                  value={editingBlock.type}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-gray-100 dark:bg-black/30 p-3 text-xs text-gray-600 dark:text-gray-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Judul Utama / Heading (`Title`)</label>
                <input
                  required
                  type="text"
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 p-3 text-sm font-bold text-gray-900 dark:text-white focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Deskripsi & Teks (`Subtitle`)</label>
                <textarea
                  required
                  rows={4}
                  value={editingBlock.subtitle}
                  onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/40 p-3 text-xs text-gray-800 dark:text-gray-200 focus:border-[#C89B5C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="rounded-xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#1E3D31] px-6 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
