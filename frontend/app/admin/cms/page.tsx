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
  Sparkles,
  Save,
  X,
  Layers,
  Settings2,
} from 'lucide-react';

const cmsModules = [
  { key: 'pages', label: 'Halaman Statis', icon: FileText, count: 8, color: 'bg-blue-500' },
  { key: 'blog', label: 'Blog & Artikel', icon: BookOpen, count: 12, color: 'bg-violet-500' },
  { key: 'events', label: 'Event & Workshop', icon: Calendar, count: 3, color: 'bg-amber-500' },
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
  { id: 'BLK-101', type: 'Hero Banner Block (`WEB-001`)', title: 'Sensasi Kopi Artisan Sesungguhnya', subtitle: 'Nikmati keharuman biji kopi pilihan nusantara dengan sentuhan roasting modern di Velvra Coffee Shop.', active: true, order: 1, badge: 'Hero Section' },
  { id: 'BLK-102', type: 'Featured Products Carousel (`CMS-005`)', title: 'Racikan Pilihan Barista (*Best Seller*)', subtitle: 'Katalog eksklusif Velvet Espresso, Caramel Sea Salt Latte, dan Croissant Perancis yang dipanggang segar setiap pagi.', active: true, order: 2, badge: 'Product Carousel' },
  { id: 'BLK-103', type: 'Promo Countdown Banner (`PRO-001`)', title: 'Diskon Spesial 25% untuk Pembelian Pertama', subtitle: 'Gunakan kode voucher FIRST25 saat memesan online atau di kasir sebelum 31 Agustus 2026.', active: true, order: 3, badge: 'Promo Highlight' },
  { id: 'BLK-104', type: 'Artisan Roastery Story (`WEB-002`)', title: 'Dari Perkebunan Langsung ke Cangkir Anda', subtitle: 'Komitmen kami terhadap petani lokal dan teknik penyeduhan slow-bar untuk menghasilkan rasa dengan kejernihan maksimal.', active: true, order: 4, badge: 'Story Text' },
  { id: 'BLK-105', type: 'Customer Testimonial Slider (`CMS-006`)', title: 'Apa Kata Pengunjung Setia Velvra', subtitle: 'Ulasan jujur dari lebih dari 10.000 member Gold dan penikmat kopi di Jakarta Selatan.', active: false, order: 5, badge: 'Social Proof' },
];

export default function CmsPage() {
  const [activeTab, setActiveTab] = useState<'content' | 'builder'>('content');
  const [activeModule, setActiveModule] = useState('blog');

  // CMS-005 Block Builder state
  const [blocks, setBlocks] = useState<CmsBlock[]>(INITIAL_BLOCKS);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [editingBlock, setEditingBlock] = useState<CmsBlock | null>(null);
  const [saveAlert, setSaveAlert] = useState('');

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
    setSaveAlert('✓ Susunan Visual Block Builder (CMS-005) berhasil diterbitkan ke halaman utama publik!');
    setTimeout(() => setSaveAlert(''), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">CMS & Visual Page Builder</h1>
            <span className="rounded-full bg-[#BA935D]/15 px-3 py-1 text-xs font-bold text-[#BA935D] border border-[#BA935D]/30">
              Phase F4 & F5 Verified
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Kelola artikel jurnal publik & rancang tata letak halaman beranda berbasis blok (`WEB-001` / `CMS-005`)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'builder' && (
            <button
              onClick={handlePublishLayout}
              className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700 transition-all shadow-md active:scale-95"
            >
              <Save size={16} /> Terbitkan Layout (`CMS-005`)
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100 scrollbar-hide">
        {[
          { id: 'content', label: '1. Daftar Konten Statis & Blog', icon: FileText, count: recentContent.length },
          { id: 'builder', label: '2. Visual Block Builder (`CMS-005`)', icon: Layout, count: blocks.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === t.id
                ? 'bg-[#12100E] text-[#BA935D] shadow-lg'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
            }`}
          >
            <t.icon size={17} />
            <span>{t.label}</span>
            <span className={`rounded-full px-2 py-0.5 text-[10px] ${activeTab === t.id ? 'bg-[#BA935D] text-[#12100E]' : 'bg-gray-100 text-gray-600'}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Alert status */}
      {saveAlert && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-300 p-4 text-sm font-bold text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <span>{saveAlert}</span>
          </div>
          <span className="text-[10px] uppercase font-mono bg-emerald-200/80 px-2 py-0.5 rounded">Saved</span>
        </div>
      )}

      {/* TAB 1: CONTENT LISTING */}
      {activeTab === 'content' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Module Cards */}
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {cmsModules.map((mod) => (
              <button
                key={mod.key}
                onClick={() => setActiveModule(mod.key)}
                className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${
                  activeModule === mod.key ? 'border-[#BA935D] bg-[#BA935D]/5' : 'border-gray-100 bg-white'
                }`}
              >
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
              <h2 className="font-serif text-lg font-bold text-gray-800">Konten Terbaru ({activeModule.toUpperCase()})</h2>
              <button className="flex items-center gap-1.5 rounded-xl bg-[#12100E] px-4 py-2 text-xs font-bold text-[#BA935D]">
                <Plus size={14} /> Buat Artikel Baru
              </button>
            </div>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3">Judul Artikel / Halaman</th>
                  <th className="px-6 py-3">Tipe</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Penulis</th>
                  <th className="px-6 py-3">Tanggal</th>
                  <th className="px-6 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {recentContent.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-800 max-w-xs truncate">{c.title}</td>
                    <td className="px-6 py-4 text-gray-500">{c.type}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[c.status]}`}>
                        {statusLabel[c.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-medium">{c.author}</td>
                    <td className="px-6 py-4 text-gray-400">{c.date}</td>
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
      )}

      {/* TAB 2: CMS-005 VISUAL BLOCK BUILDER */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
          {/* Left Column: Blocks Manager (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-3xl bg-[#12100E] text-white p-5 border-2 border-[#BA935D] flex items-center justify-between shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#BA935D]/20 text-[#BA935D]">
                  <Layers size={24} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white leading-tight">Visual Block Layout (`CMS-005`)</h3>
                  <p className="text-[11px] text-white/70">Geser urutan atas/bawah atau nonaktifkan blok untuk mengatur tampilan beranda.</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 text-[10px] font-bold uppercase">
                Interactive
              </span>
            </div>

            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <div
                  key={block.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border-2 p-5 transition-all ${
                    block.active ? 'bg-white border-gray-200 shadow-sm hover:border-[#BA935D]' : 'bg-gray-50 border-dashed border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FAF6F0] text-[#BA935D] font-bold text-xs border border-[#BA935D]/30 mt-0.5">
                      #{idx + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#BA935D] bg-[#BA935D]/10 px-2.5 py-0.5 rounded-full border border-[#BA935D]/20">
                          {block.badge}
                        </span>
                        <span className="font-mono text-[10px] text-gray-400 font-bold">{block.id}</span>
                      </div>
                      <h4 className="font-serif text-base font-bold text-gray-800 mt-1 truncate">{block.type}</h4>
                      <p className="text-xs font-semibold text-gray-700 truncate mt-0.5">“{block.title}”</p>
                      <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">{block.subtitle}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100 shrink-0">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        onClick={() => moveBlock(idx, 'up')}
                        disabled={idx === 0}
                        className={`p-1.5 rounded-lg ${idx === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-white shadow-sm'}`}
                        title="Geser ke Atas"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => moveBlock(idx, 'down')}
                        disabled={idx === blocks.length - 1}
                        className={`p-1.5 rounded-lg ${
                          idx === blocks.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-white shadow-sm'
                        }`}
                        title="Geser ke Bawah"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => setEditingBlock({ ...block })}
                      className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-bold text-gray-700 hover:border-[#BA935D] hover:text-[#BA935D] transition-colors"
                    >
                      <Settings2 size={13} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => toggleBlockActive(block.id)}
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                        block.active
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                      title={block.active ? 'Aktif - Klik untuk sembunyikan' : 'Sembunyi - Klik untuk aktifkan'}
                    >
                      {block.active ? <ToggleRight size={16} className="text-emerald-600" /> : <ToggleLeft size={16} />}
                      <span>{block.active ? 'Aktif' : 'Hidden'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live Frame Previewer (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm space-y-4 sticky top-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <Eye size={18} className="text-[#BA935D]" />
                  <h3 className="font-serif text-lg font-bold text-gray-800">Live Preview Box</h3>
                </div>

                <div className="flex rounded-xl bg-gray-100 p-1">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewDevice === 'desktop' ? 'bg-[#12100E] text-[#BA935D] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Monitor size={13} /> Desktop
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                      previewDevice === 'mobile' ? 'bg-[#12100E] text-[#BA935D] shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Smartphone size={13} /> Mobile
                  </button>
                </div>
              </div>

              {/* Preview Frame Box */}
              <div
                className={`mx-auto rounded-2xl border-4 border-[#12100E] bg-[#FAF6F0] p-4 shadow-inner overflow-y-auto max-h-[520px] transition-all ${
                  previewDevice === 'mobile' ? 'max-w-[280px] text-[10px]' : 'w-full text-xs'
                }`}
              >
                <div className="border-b border-gray-300 pb-2 mb-3 flex items-center justify-between text-gray-500 font-mono text-[10px]">
                  <span>velvra.id/home</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">● Live Sync</span>
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
                          className="rounded-xl bg-white border border-gray-200/80 p-3.5 shadow-sm space-y-1.5 animate-in fade-in"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#BA935D] bg-[#BA935D]/10 px-2 py-0.5 rounded">
                              #{i + 1} · {block.badge}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">{block.id}</span>
                          </div>
                          <p className="font-serif font-bold text-gray-800 text-sm leading-tight">{block.title}</p>
                          <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{block.subtitle}</p>
                        </div>
                      ))
                  )}
                </div>
              </div>

              <div className="text-[11px] text-gray-400 text-center flex items-center justify-center gap-1 pt-2">
                <Sparkles size={13} className="text-[#BA935D]" />
                <span>Perubahan urutan & teks langsung direfleksikan di atas.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT BLOCK PAYLOAD */}
      {editingBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                <Settings2 size={20} className="text-[#BA935D]" />
                <h3 className="font-serif text-xl font-bold text-gray-800">Edit Blok CMS ({editingBlock.id})</h3>
              </div>
              <button onClick={() => setEditingBlock(null)} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-600">
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-100 p-3 text-xs text-gray-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Judul Utama / Heading (`Title`)</label>
                <input
                  required
                  type="text"
                  value={editingBlock.title}
                  onChange={(e) => setEditingBlock({ ...editingBlock, title: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm font-bold text-gray-800 focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Deskripsi & Teks (`Subtitle`)</label>
                <textarea
                  required
                  rows={4}
                  value={editingBlock.subtitle}
                  onChange={(e) => setEditingBlock({ ...editingBlock, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs text-gray-800 focus:border-[#BA935D] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBlock(null)}
                  className="rounded-xl border border-gray-200 px-5 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#12100E] px-6 py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] shadow-md"
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
