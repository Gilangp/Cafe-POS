'use client';

import { useState } from 'react';
import {
  Plus,
  Tag,
  Calendar,
  Percent,
  ToggleLeft,
  ToggleRight,
  Gift,
  Smartphone,
  Edit2,
  Trash2,
  X,
  Check,
  DollarSign,
  Clock,
  Layers,
} from 'lucide-react';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

interface PromoItem {
  id: number;
  name: string;
  code: string;
  type: 'percent' | 'nominal' | 'bogo';
  value: number;
  minOrder: number;
  channel: string;
  startDate: string;
  endDate: string;
  usageCount: number;
  maxUsage: number;
  active: boolean;
  description: string;
}

const initialPromotions: PromoItem[] = [
  { id: 1, name: 'Happy Hour Specialty Brew', code: 'HAPPY17', type: 'percent', value: 20, minOrder: 40000, channel: 'Semua Channel', startDate: '2026-07-01', endDate: '2026-07-31', usageCount: 148, maxUsage: 500, active: true, description: 'Diskon 20% untuk semua menu kopi single origin jam 17:00 - 19:00 WIB' },
  { id: 2, name: 'Buy 2 Get 1 Croissant', code: 'PASTRY2', type: 'bogo', value: 0, minOrder: 65000, channel: 'POS Kasir', startDate: '2026-07-10', endDate: '2026-07-30', usageCount: 42, maxUsage: 150, active: true, description: 'Beli 2 Butter Croissant gratis 1 pastry pilihan hari ini' },
  { id: 3, name: 'Potongan Harga Langsung IDR 25K', code: 'HEMAT25', type: 'nominal', value: 25000, minOrder: 150000, channel: 'Online Order', startDate: '2026-07-12', endDate: '2026-08-15', usageCount: 89, maxUsage: 200, active: false, description: 'Potongan langsung Rp 25.000 untuk transaksi di atas Rp 150.000 via QR' },
  { id: 4, name: 'First Visit Experience Promo', code: 'WELCOME20', type: 'percent', value: 20, minOrder: 35000, channel: 'Semua Channel', startDate: '2026-01-01', endDate: '2026-12-31', usageCount: 213, maxUsage: 1000, active: true, description: 'Diskon 20% khusus pelanggan baru yang bergabung di membership CRM' },
];

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromoItem[]>(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [saveAlert, setSaveAlert] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formType, setFormType] = useState<'percent' | 'nominal' | 'bogo'>('percent');
  const [formValue, setFormValue] = useState('20');
  const [formMinOrder, setFormMinOrder] = useState('40000');
  const [formChannel, setFormChannel] = useState('Semua Channel');
  const [formStartDate, setFormStartDate] = useState('2026-07-17');
  const [formEndDate, setFormEndDate] = useState('2026-08-31');
  const [formMaxUsage, setFormMaxUsage] = useState('500');
  const [formDesc, setFormDesc] = useState('');

  const toggleActive = (id: number) => {
    setPromos((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = !p.active;
          setSaveAlert(`Status voucher ${p.code} diperbarui menjadi ${updated ? 'Aktif' : 'Nonaktif'}`);
          setTimeout(() => setSaveAlert(null), 3500);
          return { ...p, active: updated };
        }
        return p;
      })
    );
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditId(null);
    setFormName('');
    setFormCode('PROMO' + Math.floor(10 + Math.random() * 90));
    setFormType('percent');
    setFormValue('20');
    setFormMinOrder('40000');
    setFormChannel('Semua Channel');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('2026-08-31');
    setFormMaxUsage('500');
    setFormDesc('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: PromoItem) => {
    setModalMode('edit');
    setEditId(item.id);
    setFormName(item.name);
    setFormCode(item.code);
    setFormType(item.type);
    setFormValue(item.value.toString());
    setFormMinOrder(item.minOrder.toString());
    setFormChannel(item.channel);
    setFormStartDate(item.startDate);
    setFormEndDate(item.endDate);
    setFormMaxUsage(item.maxUsage.toString());
    setFormDesc(item.description);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, code: string) => {
    if (!window.confirm(`Yakin ingin menghapus voucher promosi [${code}]?`)) return;
    setPromos((prev) => prev.filter((p) => p.id !== id));
    setSaveAlert(`Voucher promosi ${code} berhasil dihapus.`);
    setTimeout(() => setSaveAlert(null), 3500);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) return;

    if (modalMode === 'add') {
      const newRecord: PromoItem = {
        id: Date.now(),
        name: formName,
        code: formCode.toUpperCase().replace(/\s+/g, ''),
        type: formType,
        value: Number(formValue) || 0,
        minOrder: Number(formMinOrder) || 0,
        channel: formChannel,
        startDate: formStartDate,
        endDate: formEndDate,
        usageCount: 0,
        maxUsage: Number(formMaxUsage) || 100,
        active: true,
        description: formDesc || 'Promo spesial diskon NEMU Space',
      };
      setPromos((prev) => [newRecord, ...prev]);
      setSaveAlert(`✓ Voucher promosi baru [${newRecord.code}] berhasil dibuat & aktif!`);
    } else if (modalMode === 'edit' && editId !== null) {
      setPromos((prev) =>
        prev.map((p) =>
          p.id === editId
            ? {
                ...p,
                name: formName,
                code: formCode.toUpperCase().replace(/\s+/g, ''),
                type: formType,
                value: Number(formValue) || 0,
                minOrder: Number(formMinOrder) || 0,
                channel: formChannel,
                startDate: formStartDate,
                endDate: formEndDate,
                maxUsage: Number(formMaxUsage) || 100,
                description: formDesc,
              }
            : p
        )
      );
      setSaveAlert(`✓ Voucher promosi [${formCode}] berhasil diperbarui!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSaveAlert(null), 4000);
  };

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              Promosi & Kode Voucher (9.2)
            </h1>
            <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm">
              Phase 9.2 Ready
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Kelola kode voucher diskon (% atau nominal Rp), masa berlaku tanggal & waktu, serta batas kuota penukaran untuk kasir dan online.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-2xl bg-[#1E3D31] px-6 py-3 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md transition-all active:scale-95 shrink-0"
        >
          <Plus size={16} /> Buat Promo Baru (9.2)
        </button>
      </div>

      {/* Save Alert */}
      {saveAlert && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-5 py-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{saveAlert}</span>
        </div>
      )}

      {/* Promo Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {promos.map((promo) => {
          const usagePct = Math.min(100, Math.round((promo.usageCount / promo.maxUsage) * 100));
          return (
            <div
              key={promo.id}
              className={`rounded-3xl bg-white dark:bg-[#1A2620] border-2 p-6 shadow-sm transition-all flex flex-col justify-between hover:shadow-xl ${
                promo.active
                  ? 'border-gray-200 dark:border-white/10 hover:border-[#C89B5C]'
                  : 'border-dashed border-gray-200 dark:border-white/10 opacity-70 bg-gray-50 dark:bg-black/20'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <span className="flex items-center gap-1 rounded-full bg-[#1E3D31] border border-[#C89B5C]/40 px-3 py-1 text-xs font-mono font-extrabold text-[#C89B5C] shadow-sm">
                        <Tag size={12} /> {promo.code}
                      </span>
                      {promo.type === 'percent' && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                          <Percent size={12} /> {promo.value}% Diskon
                        </span>
                      )}
                      {promo.type === 'nominal' && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400">
                          <DollarSign size={13} /> Hemat {fmt(promo.value)}
                        </span>
                      )}
                      {promo.type === 'bogo' && (
                        <span className="flex items-center gap-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-400">
                          <Gift size={13} /> Buy 2 Get 1
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-base font-extrabold text-gray-900 dark:text-white mt-2 leading-snug">{promo.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mt-1 leading-relaxed">{promo.description}</p>
                  </div>

                  <button
                    onClick={() => toggleActive(promo.id)}
                    className="shrink-0 text-gray-400 hover:text-[#C89B5C] transition-colors p-1"
                    title={promo.active ? 'Klik untuk nonaktifkan voucher' : 'Klik untuk aktifkan voucher'}
                  >
                    {promo.active ? <ToggleRight size={32} className="text-emerald-600 dark:text-emerald-400" /> : <ToggleLeft size={32} />}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400 py-3 border-y border-gray-100 dark:border-white/10 font-mono">
                  <span className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
                    <Calendar size={13} className="text-[#C89B5C]" /> {promo.startDate} s/d {promo.endDate}
                  </span>
                  <span className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-black/40 px-2.5 py-1 font-sans font-semibold">
                    <Smartphone size={12} /> {promo.channel}
                  </span>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1.5 font-bold">
                    <span className="text-gray-500 dark:text-gray-400">Penggunaan Kuota:</span>
                    <span className="text-gray-900 dark:text-white font-mono">{promo.usageCount} / {promo.maxUsage} Klaim</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-black/50 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${usagePct > 85 ? 'bg-red-500' : 'bg-[#C89B5C]'}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Bar */}
              <div className="flex items-center justify-between gap-2 pt-4 mt-4 border-t border-gray-100 dark:border-white/10">
                <span className="text-[11px] font-mono text-gray-400">Min. Order: <strong className="text-gray-800 dark:text-white">{fmt(promo.minOrder)}</strong></span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(promo)}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-white/15 px-3 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-all"
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(promo.id, promo.code)}
                    className="flex items-center justify-center rounded-xl border border-red-200 dark:border-red-900/40 p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: CRUD ADD/EDIT PROMO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Tag size={20} className="text-[#C89B5C]" />
                <span>{modalMode === 'add' ? 'Buat Voucher Promosi Baru (9.2)' : 'Edit Voucher Promosi'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Nama Promosi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Contoh: Happy Hour Specialty"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Kode Voucher <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="HAPPY20"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-extrabold uppercase text-[#C89B5C] focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Tipe Diskon
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  >
                    <option value="percent">Diskon Persen (%)</option>
                    <option value="nominal">Potongan Nominal (Rp)</option>
                    <option value="bogo">Buy 2 Get 1 Free</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Nilai Diskon (% atau Rp)
                  </label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder="20"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Min. Order (IDR)
                  </label>
                  <input
                    type="number"
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(e.target.value)}
                    placeholder="40000"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Berlaku Channel
                  </label>
                  <select
                    value={formChannel}
                    onChange={(e) => setFormChannel(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  >
                    <option value="Semua Channel">Semua Channel</option>
                    <option value="POS Kasir">POS Kasir</option>
                    <option value="Online Order">Online Order / QR</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Batas Maksimal Penggunaan (Kuota Voucher)
                </label>
                <input
                  type="number"
                  value={formMaxUsage}
                  onChange={(e) => setFormMaxUsage(e.target.value)}
                  placeholder="500"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-mono focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Deskripsi & Syarat Ketentuan
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Diskon berlaku untuk minuman kopi dan pastry..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-[#C89B5C] focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-3 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#1E3D31] px-7 py-3 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md"
                >
                  {modalMode === 'add' ? 'Simpan Voucher Promosi' : 'Perbarui Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
