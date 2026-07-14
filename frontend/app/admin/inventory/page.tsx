'use client';

import { useState } from 'react';
import {
  Search,
  AlertTriangle,
  TrendingDown,
  Package,
  Plus,
  ChevronDown,
  Sparkles,
  Check,
  X,
  Loader2,
  Minus,
  RefreshCw,
  ClipboardCheck,
  Calendar,
  Hash,
  Trash2,
} from 'lucide-react';
import { useInventory, InventoryItem } from '@/hooks/useInventory';
import { PermissionGuard } from '@/components/permission-guard';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function InventoryPage() {
  const { items, loading, usingLive, adjustStock, addItem, deleteItem, performCycleCount, refetch } = useInventory();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal State for Add Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Kopi');
  const [formStock, setFormStock] = useState('500');
  const [formUnit, setFormUnit] = useState('gram');
  const [formThreshold, setFormThreshold] = useState('100');
  const [formCost, setFormCost] = useState('15000');
  const [formSku, setFormSku] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Modal State for Cycle Count Stock Opname (INV-005 & INV-006)
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleTargetItem, setCycleTargetItem] = useState<InventoryItem | null>(null);
  const [physicalCountInput, setPhysicalCountInput] = useState('');
  const [cycleNotesInput, setCycleNotesInput] = useState('');
  const [batchNumberInput, setBatchNumberInput] = useState('');
  const [expirationDateInput, setExpirationDateInput] = useState('');
  const [cycleLoading, setCycleLoading] = useState(false);

  const categories = ['all', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const criticalItems = items.filter((i) => i.stock <= i.threshold);
  const warningItems = items.filter((i) => i.stock > i.threshold && i.stock <= i.threshold * 1.5);

  const stockLevel = (item: InventoryItem) => {
    const pct = (item.stock / (item.threshold || 1)) * 100;
    if (pct <= 100) return { color: 'bg-red-500', pct: Math.min(pct, 100), label: 'Kritis' };
    if (pct <= 150) return { color: 'bg-amber-400', pct: Math.min(pct / 1.5, 100), label: 'Hampir Habis' };
    return { color: 'bg-green-500', pct: Math.min(pct / 3, 100), label: 'Aman' };
  };

  const showNotification = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 3500);
  };

  const handleQuickAdjust = async (id: string | number, delta: number) => {
    await adjustStock(id, delta);
    showNotification(`Stok berhasil ${delta > 0 ? 'ditambahkan' : 'dikurangi'} (${delta > 0 ? '+' : ''}${delta})!`);
  };

  const handleOpenCycleCount = (item: InventoryItem) => {
    setCycleTargetItem(item);
    setPhysicalCountInput(item.stock.toString());
    setCycleNotesInput('Stock Opname Cycle Count (INV-005)');
    setBatchNumberInput('');
    setExpirationDateInput('');
    setIsCycleModalOpen(true);
  };

  const handleSaveCycleCount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cycleTargetItem) return;

    setCycleLoading(true);
    try {
      const physicalQty = parseFloat(physicalCountInput) || 0;
      const variance = physicalQty - cycleTargetItem.stock;

      if (variance !== 0) {
        const type = variance > 0 ? 'ADJUSTMENT_UP' : 'ADJUSTMENT_DOWN';
        await performCycleCount({
          inventory_item_id: cycleTargetItem.id,
          type,
          quantity: Math.abs(variance),
          notes: `${cycleNotesInput || 'Stock opname cycle count'} (Varians: ${variance >= 0 ? '+' : ''}${variance} ${cycleTargetItem.unit})`,
          batch_number: variance > 0 && batchNumberInput ? batchNumberInput : undefined,
          expiration_date: variance > 0 && expirationDateInput ? expirationDateInput : undefined,
        });
      }

      showNotification(`Stock opname untuk ${cycleTargetItem.name} tercatat (Fisik: ${physicalQty} ${cycleTargetItem.unit})`);
      setIsCycleModalOpen(false);
    } catch (err) {
      console.error('Cycle count error:', err);
      showNotification('Gagal mencatat Stock Opname');
    } finally {
      setCycleLoading(false);
    }
  };

  const handleDeleteItem = async (id: string | number, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus bahan baku "${name}"?`)) return;
    try {
      await deleteItem(id);
      showNotification(`Bahan baku "${name}" berhasil dihapus.`);
    } catch (err) {
      console.error('Delete error:', err);
      showNotification('Gagal menghapus bahan baku.');
    }
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setFormLoading(true);
    try {
      await addItem({
        name: formName,
        category: formCategory,
        stock: Number(formStock) || 0,
        unit: formUnit,
        threshold: Number(formThreshold) || 10,
        cost: Number(formCost) || 10000,
        sku: formSku || undefined,
      });

      setIsModalOpen(false);
      setFormName('');
      setFormSku('');
      showNotification('Bahan baku baru berhasil ditambahkan ke inventaris!');
    } catch (err) {
      console.error('Add item error:', err);
      showNotification('Gagal menambahkan bahan baku');
    } finally {
      setFormLoading(false);
    }
  };

  const currentVariance =
    cycleTargetItem && physicalCountInput !== ''
      ? (parseFloat(physicalCountInput) || 0) - cycleTargetItem.stock
      : 0;

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Inventori & Stok</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Terhubung API Laravel V1
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Offline / Resep Standar
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Terintegrasi dengan Cycle Count Stock Opname (<span className="font-semibold text-gray-700">INV-005</span>) dan Batch FEFO Kedaluwarsa (<span className="font-semibold text-gray-700">INV-006</span>).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            title="Refresh Data dari Server"
            className="flex items-center justify-center rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-colors bg-white shadow-sm"
          >
            <RefreshCw size={16} />
          </button>

          <PermissionGuard permission="inventory.create">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
            >
              <Plus size={16} /> Tambah Item
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Alert Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500 text-white">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600 font-serif">{criticalItems.length}</p>
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wider">Stok Kritis (Bawah Minimum)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white">
            <TrendingDown size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600 font-serif">{warningItems.length}</p>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Hampir Habis (Perhatian)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50 p-5 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500 text-white">
            <Package size={20} />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600 font-serif">{items.length}</p>
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Total Item Bahan Baku</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama bahan baku atau SKU..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#BA935D] focus:outline-none font-semibold"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Semua Kategori' : c}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Inventory Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat data inventaris dari server...</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">Nama Bahan / SKU</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Stok Saat Ini</th>
                  <th className="px-6 py-4 w-36">Level Stok</th>
                  <th className="px-6 py-4">Min. Stok</th>
                  <th className="px-6 py-4">Harga/Satuan</th>
                  <th className="px-6 py-4">Update</th>
                  <th className="px-6 py-4 text-center">Sesuaikan / Stock Opname</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((item) => {
                  const level = stockLevel(item);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {level.label === 'Kritis' && <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 animate-pulse" />}
                          {level.label === 'Hampir Habis' && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />}
                          <div>
                            <p className="text-sm font-semibold text-gray-800 leading-tight">{item.name}</p>
                            {item.sku && <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">{item.category}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-sm font-bold ${
                            level.label === 'Kritis'
                              ? 'text-red-600'
                              : level.label === 'Hampir Habis'
                              ? 'text-amber-600'
                              : 'text-gray-900 font-mono'
                          }`}
                        >
                          {item.stock.toLocaleString('id-ID')} {item.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full ${level.color}`} style={{ width: `${level.pct}%` }} />
                          </div>
                          <span
                            className={`text-[10px] font-bold shrink-0 ${
                              level.label === 'Kritis'
                                ? 'text-red-500'
                                : level.label === 'Hampir Habis'
                                ? 'text-amber-500'
                                : 'text-green-600'
                            }`}
                          >
                            {level.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.threshold} {item.unit}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 font-serif">{fmt(item.cost)}</td>
                      <td className="px-6 py-4 text-xs text-gray-400">{item.lastUpdate}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <PermissionGuard permission="inventory.adjust">
                            <button
                              onClick={() => handleQuickAdjust(item.id, -5)}
                              title="Kurangi -5 (Cepat)"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Minus size={13} />
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(item.id, 10)}
                              title="Tambah +10 (Cepat)"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                            >
                              <Plus size={13} />
                            </button>
                          </PermissionGuard>

                          {/* Cycle Count Stock Opname button (INV-005) */}
                          <PermissionGuard permission="inventory.adjust">
                            <button
                              onClick={() => handleOpenCycleCount(item)}
                              title="Stock Opname / Cycle Count (INV-005 & INV-006)"
                              className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-[#BA935D]/40 bg-[#FAF6F0] text-xs font-bold text-[#BA935D] hover:bg-[#BA935D] hover:text-white transition-colors"
                            >
                              <ClipboardCheck size={13} />
                              <span>Opname</span>
                            </button>
                          </PermissionGuard>

                          <PermissionGuard permission="inventory.delete">
                            <button
                              onClick={() => handleDeleteItem(item.id, item.name)}
                              title="Hapus Bahan Baku"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-100 text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={13} />
                            </button>
                          </PermissionGuard>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Cycle Count Stock Opname (INV-005 & INV-006 Batch FEFO) */}
      {isCycleModalOpen && cycleTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-[#BA935D]" />
                <h3 className="font-serif text-lg font-bold text-gray-800">Stock Opname Cycle Count</h3>
              </div>
              <button
                onClick={() => setIsCycleModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-[#FAF6F0] p-3.5 mb-4 text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800 text-sm">{cycleTargetItem.name}</span>
                <span className="font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-600">
                  {cycleTargetItem.sku || 'NO-SKU'}
                </span>
              </div>
              <p className="text-gray-500">
                Stok Tercatat di Sistem:{' '}
                <span className="font-bold text-gray-900 font-mono">
                  {cycleTargetItem.stock} {cycleTargetItem.unit}
                </span>
              </p>
            </div>

            <form onSubmit={handleSaveCycleCount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Hitungan Fisik Aktual ({cycleTargetItem.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={physicalCountInput}
                  onChange={(e) => setPhysicalCountInput(e.target.value)}
                  placeholder="Masukkan jumlah hitungan fisik..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-bold text-gray-900 font-mono"
                />
                {physicalCountInput !== '' && (
                  <div
                    className={`mt-1.5 flex items-center justify-between text-xs font-bold px-3 py-1.5 rounded-lg ${
                      currentVariance === 0
                        ? 'bg-gray-100 text-gray-600'
                        : currentVariance > 0
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    <span>Varians Hitungan Fisik vs Sistem:</span>
                    <span className="font-mono">
                      {currentVariance >= 0 ? '+' : ''}
                      {currentVariance.toFixed(2)} {cycleTargetItem.unit}
                    </span>
                  </div>
                )}
              </div>

              {/* Batch FEFO input for positive adjustments (INV-006) */}
              {currentVariance > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                    <Hash size={14} />
                    <span>Informasi Batch FEFO Penambahan Stok (INV-006)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1">Nomor Batch (Opsional)</label>
                      <input
                        type="text"
                        value={batchNumberInput}
                        onChange={(e) => setBatchNumberInput(e.target.value)}
                        placeholder="BATCH-2026-A"
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-mono bg-white focus:border-[#BA935D] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar size={11} /> Exp. Date
                      </label>
                      <input
                        type="date"
                        value={expirationDateInput}
                        onChange={(e) => setExpirationDateInput(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs bg-white focus:border-[#BA935D] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Catatan Audit Opname</label>
                <textarea
                  rows={2}
                  value={cycleNotesInput}
                  onChange={(e) => setCycleNotesInput(e.target.value)}
                  placeholder="Alasan selisih/varians atau nama auditor..."
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={cycleLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-[#12100E] px-5 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors disabled:opacity-50 shadow-sm"
                >
                  {cycleLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Stock Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tambah Item Bahan Baku */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">Tambah Bahan Baku Baru</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Bahan Baku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sirup Hazelnut Monin"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">SKU Internal</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="SYR-005"
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-semibold"
                  >
                    {['Kopi', 'Dairy', 'Sirup', 'Baking', 'Bahan Dasar', 'Kemasan', 'Minuman'].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-semibold"
                  >
                    {['gram', 'kg', 'liter', 'ml', 'botol', 'pack', 'pcs'].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Min. Kritis</label>
                  <input
                    type="number"
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Harga/Satuan</label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
