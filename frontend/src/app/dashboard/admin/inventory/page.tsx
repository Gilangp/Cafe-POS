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
  ArrowUpRight,
  ArrowDownLeft,
  History,
  FileSpreadsheet,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { useInventory, InventoryItem } from '@/features/inventory/hooks/use-inventory';
import { PermissionGuard } from '@/shared/components/common/permission-guard';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

interface StockMovementLog {
  id: string;
  timestamp: string;
  itemName: string;
  type: 'STOCK_IN' | 'STOCK_OUT_WASTE' | 'BOM_AUTO_DEDUCT' | 'OPNAME';
  quantityChange: number;
  unit: string;
  reference: string;
  user: string;
}

const initialLogs: StockMovementLog[] = [
  { id: 'LOG-901', timestamp: '17 Jul 2026 14:32:10', itemName: 'Biji Kopi Specialty Gayo Arabica', type: 'BOM_AUTO_DEDUCT', quantityChange: -36, unit: 'gram', reference: 'POS Order #INV-8821 (2x Sea Salt Caramel)', user: 'System (POS Auto-BOM 9.4)' },
  { id: 'LOG-902', timestamp: '17 Jul 2026 14:15:00', itemName: 'Susu Oat Barista Blend (Oatly)', type: 'STOCK_IN', quantityChange: 6000, unit: 'ml', reference: 'Penerimaan PO #PO-2026-089 dari Supplier Global Dairy', user: 'Fajar (Head Barista)' },
  { id: 'LOG-903', timestamp: '17 Jul 2026 13:50:22', itemName: 'Sirup Hazelnut Artisan / Vanilla', type: 'BOM_AUTO_DEDUCT', quantityChange: -15, unit: 'ml', reference: 'POS Order #INV-8819 (1x Hazelnut Latte)', user: 'System (POS Auto-BOM 9.4)' },
  { id: 'LOG-904', timestamp: '17 Jul 2026 11:20:00', itemName: 'Paper Cup Hot / Cold 180ml + Lid', type: 'STOCK_OUT_WASTE', quantityChange: -5, unit: 'pcs', reference: 'Rusak saat persiapan shift pagi (Waste Adjustment)', user: 'Nadia (Barista)' },
  { id: 'LOG-905', timestamp: '16 Jul 2026 21:00:00', itemName: 'Biji Kopi Specialty Gayo Arabica', type: 'OPNAME', quantityChange: +120, unit: 'gram', reference: 'Audit Stock Opname Closing Shift Malam (INV-005)', user: 'Fajar (Head Barista)' },
];

export default function InventoryPage() {
  const { items, loading, usingLive, adjustStock, addItem, deleteItem, performCycleCount, refetch } = useInventory();
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [logs, setLogs] = useState<StockMovementLog[]>(initialLogs);

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

  // Modal State for Cycle Count Stock Opname
  const [isCycleModalOpen, setIsCycleModalOpen] = useState(false);
  const [cycleTargetItem, setCycleTargetItem] = useState<InventoryItem | null>(null);
  const [physicalCountInput, setPhysicalCountInput] = useState('');
  const [cycleNotesInput, setCycleNotesInput] = useState('');
  const [batchNumberInput, setBatchNumberInput] = useState('');
  const [expirationDateInput, setExpirationDateInput] = useState('');
  const [cycleLoading, setCycleLoading] = useState(false);

  // 9.4 Stock In / Out / Waste Logger Modal
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [movementTargetItem, setMovementTargetItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<'STOCK_IN' | 'STOCK_OUT_WASTE'>('STOCK_IN');
  const [movementQty, setMovementQty] = useState('');
  const [movementRef, setMovementRef] = useState('');
  const [movementLoading, setMovementLoading] = useState(false);

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
    if (pct <= 100) return { color: 'bg-red-500', pct: Math.min(pct, 100), label: 'Kritis (Low Stock)' };
    if (pct <= 150) return { color: 'bg-amber-400', pct: Math.min(pct / 1.5, 100), label: 'Hampir Habis' };
    return { color: 'bg-emerald-500', pct: Math.min(pct / 3, 100), label: 'Aman' };
  };

  const showNotification = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 4000);
  };

  const handleOpenMovementModal = (item: InventoryItem, type: 'STOCK_IN' | 'STOCK_OUT_WASTE') => {
    setMovementTargetItem(item);
    setMovementType(type);
    setMovementQty('');
    setMovementRef(type === 'STOCK_IN' ? 'Penerimaan faktur PO Pembelian baru' : 'Waste / pemakaian dapur internal');
    setIsMovementModalOpen(true);
  };

  const handleSaveStockMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movementTargetItem || !movementQty) return;

    setMovementLoading(true);
    try {
      const numQty = Math.abs(parseFloat(movementQty)) || 0;
      const delta = movementType === 'STOCK_IN' ? numQty : -numQty;
      await adjustStock(movementTargetItem.id, delta);

      // Add to movement logs
      const newLog: StockMovementLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('id-ID'),
        itemName: movementTargetItem.name,
        type: movementType,
        quantityChange: delta,
        unit: movementTargetItem.unit,
        reference: movementRef,
        user: 'Admin Roastery (Manual 9.4)',
      };
      setLogs((prev) => [newLog, ...prev]);

      showNotification(`✓ ${movementType === 'STOCK_IN' ? 'Barang Masuk (Stock In)' : 'Barang Keluar / Waste'} sebesar ${delta > 0 ? '+' : ''}${delta} ${movementTargetItem.unit} berhasil dicatat!`);
      setIsMovementModalOpen(false);
    } catch (err) {
      console.error('Movement error:', err);
      showNotification('Gagal mencatat mutasi stok bahan baku');
    } finally {
      setMovementLoading(false);
    }
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

        // Add to audit logs
        setLogs((prev) => [
          {
            id: `LOG-${Date.now()}`,
            timestamp: new Date().toLocaleString('id-ID'),
            itemName: cycleTargetItem.name,
            type: 'OPNAME',
            quantityChange: variance,
            unit: cycleTargetItem.unit,
            reference: `${cycleNotesInput || 'Stock Opname Audit'}`,
            user: 'Admin Roastery (Opname 9.4)',
          },
          ...prev,
        ]);
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
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-[#C89B5C]/30">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
              Manajemen Persediaan & Stok Bahan Baku (9.4)
            </h1>
            {usingLive ? (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 px-3.5 py-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <Sparkles size={13} /> Terhubung API Live
              </span>
            ) : (
              <span className="rounded-full bg-[#1E3D31] text-[#C89B5C] px-3.5 py-1 text-xs font-bold shadow-sm">
                Mode Offline / BOM Deduct
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Catat barang masuk (Stock In) & keluar (Waste/Stock Out), pantau peringatan stok kritis di bawah minimum, serta audit pemotongan stok otomatis dari resep BOM POS (<strong className="text-emerald-600 dark:text-emerald-400">9.4</strong>).
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex gap-1 rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/30 p-1">
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'stock' ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Package size={14} />
              <span>1. Daftar Stok & Peringatan Kritis</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'history' ? 'bg-[#1E3D31] text-[#C89B5C] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <History size={14} />
              <span>2. Log Mutasi & Audit BOM ({logs.length})</span>
            </button>
          </div>

          <PermissionGuard permission="inventory.create">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-5 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] transition-colors shadow-md active:scale-95 shrink-0"
            >
              <Plus size={16} /> Tambah Item Bahan
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-5 py-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Low Stock Alert Banner (9.4 Peringatan Stok Kritis di Bawah Minimum) */}
      {criticalItems.length > 0 && (
        <div className="rounded-3xl bg-red-500/10 border-2 border-red-500/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-md">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-extrabold text-red-700 dark:text-red-400">
                Peringatan Stok Kritis di Bawah Minimum (Low Stock Alert 9.4)
              </h3>
              <p className="text-xs text-red-600/90 dark:text-red-300/90 mt-0.5">
                Sebanyak <strong className="font-mono text-red-700 dark:text-red-300">{criticalItems.length} bahan baku</strong> berada di bawah batas minimum pengaman. Segera lakukan Stock In / PO dari supplier agar dapur tidak 86&apos;d.
              </p>
            </div>
          </div>
          <button
            onClick={() => showNotification('Membuka modul Purchase Order (PO) otomatis untuk seluruh item kritis...')}
            className="rounded-2xl bg-red-600 hover:bg-red-500 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95 shrink-0"
          >
            + Buat PO Pembelian Cepat
          </button>
        </div>
      )}

      {/* Alert Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400">
            <AlertTriangle size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 font-heading">{criticalItems.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Stok Kritis (Bawah Min.)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400">
            <TrendingDown size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-heading">{warningItems.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Hampir Habis (Perhatian)</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-5 shadow-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1E3D31] text-[#C89B5C]">
            <Package size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">{items.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Total Item Bahan Baku</p>
          </div>
        </div>
      </div>

      {/* TAB 1: INVENTORY ITEMS LIST */}
      {activeTab === 'stock' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[260px] max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama bahan baku atau SKU..."
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[#C89B5C] focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-4 pr-10 text-xs text-gray-700 dark:text-gray-200 font-bold focus:border-[#C89B5C] focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'Semua Kategori (' + items.length + ')' : c}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10">
              <Loader2 size={36} className="animate-spin mb-3 text-[#C89B5C]" />
              <p className="text-xs font-bold">Memuat data persediaan & level stok...</p>
            </div>
          ) : (
            <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-black/30 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                      <th className="px-6 py-4">Nama Bahan / SKU</th>
                      <th className="px-6 py-4">Kategori</th>
                      <th className="px-6 py-4">Stok Aktual (9.4)</th>
                      <th className="px-6 py-4 w-44">Indikator Batas Minimum</th>
                      <th className="px-6 py-4">Min. Stok</th>
                      <th className="px-6 py-4">Harga/Satuan</th>
                      <th className="px-6 py-4 text-center">Aksi Mutasi / Stock Opname</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                    {filtered.map((item) => {
                      const level = stockLevel(item);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2.5">
                              {level.label.includes('Kritis') && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 animate-pulse shadow-sm" />}
                              {level.label === 'Hampir Habis' && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />}
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm leading-tight">{item.name}</p>
                                {item.sku && <p className="text-[10px] font-mono text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs font-bold text-[#C89B5C] uppercase tracking-wider">{item.category}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`text-sm font-extrabold font-mono ${
                                level.label.includes('Kritis')
                                  ? 'text-red-600 dark:text-red-400'
                                  : level.label === 'Hampir Habis'
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-gray-900 dark:text-white'
                              }`}
                            >
                              {item.stock.toLocaleString('id-ID')} {item.unit}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-black/50 overflow-hidden">
                                <div className={`h-full rounded-full transition-all ${level.color}`} style={{ width: `${level.pct}%` }} />
                              </div>
                              <span
                                className={`text-[10px] font-extrabold shrink-0 ${
                                  level.label.includes('Kritis')
                                    ? 'text-red-600 dark:text-red-400'
                                    : level.label === 'Hampir Habis'
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }`}
                              >
                                {level.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400 font-semibold">
                            {item.threshold} {item.unit}
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-gray-900 dark:text-white">{fmt(item.cost)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* 9.4 Stock In Button */}
                              <PermissionGuard permission="inventory.adjust">
                                <button
                                  onClick={() => handleOpenMovementModal(item, 'STOCK_IN')}
                                  title="Pencatatan Barang Masuk (Stock In 9.4)"
                                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/25 transition-colors shadow-sm"
                                >
                                  <ArrowDownLeft size={13} className="text-emerald-600 dark:text-emerald-400" />
                                  <span>+ Stock In</span>
                                </button>
                              </PermissionGuard>

                              {/* 9.4 Stock Out / Waste Button */}
                              <PermissionGuard permission="inventory.adjust">
                                <button
                                  onClick={() => handleOpenMovementModal(item, 'STOCK_OUT_WASTE')}
                                  title="Pencatatan Barang Keluar / Waste (Stock Out 9.4)"
                                  className="flex items-center gap-1 h-8 px-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-500/25 transition-colors shadow-sm"
                                >
                                  <ArrowUpRight size={13} className="text-amber-600 dark:text-amber-400" />
                                  <span>- Out/Waste</span>
                                </button>
                              </PermissionGuard>

                              {/* Cycle Count Stock Opname */}
                              <PermissionGuard permission="inventory.adjust">
                                <button
                                  onClick={() => handleOpenCycleCount(item)}
                                  title="Stock Opname / Cycle Count Audit"
                                  className="flex items-center gap-1 h-8 px-3 rounded-xl border border-gray-200 dark:border-white/15 bg-white dark:bg-white/5 text-[11px] font-bold text-gray-700 dark:text-gray-300 hover:border-[#C89B5C] hover:text-[#C89B5C] transition-colors"
                                >
                                  <ClipboardCheck size={13} />
                                  <span>Opname</span>
                                </button>
                              </PermissionGuard>

                              <PermissionGuard permission="inventory.delete">
                                <button
                                  onClick={() => handleDeleteItem(item.id, item.name)}
                                  title="Hapus Bahan Baku"
                                  className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 dark:border-red-900/40 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                                >
                                  <Trash2 size={14} />
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
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENT & BOM AUTO-DEDUCTION LOGS (9.4) */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History size={20} className="text-[#C89B5C]" />
                  <span>Log Mutasi Stok & Pemotongan Resep BOM Otomatis (9.4)</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Setiap transaksi POS kasir secara langsung mengurangi stok bahan baku sesuai komposisi BOM menu yang terjual.
                </p>
              </div>
              <span className="rounded-xl bg-[#FAF3E7] dark:bg-black/40 border border-[#C89B5C]/30 px-3.5 py-1.5 text-xs font-mono font-bold text-[#C89B5C]">
                Real-Time Ledger Audit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-black/30 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-white/10">
                    <th className="px-6 py-3.5">Waktu Log</th>
                    <th className="px-6 py-3.5">Nama Bahan Baku</th>
                    <th className="px-6 py-3.5">Tipe Mutasi</th>
                    <th className="px-6 py-3.5">Perubahan Qty</th>
                    <th className="px-6 py-3.5">Referensi / Keterangan Transaksi</th>
                    <th className="px-6 py-3.5">Petugas / Sistem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/60 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-gray-400 text-[11px] whitespace-nowrap">{log.timestamp}</td>
                      <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">{log.itemName}</td>
                      <td className="px-6 py-4">
                        {log.type === 'BOM_AUTO_DEDUCT' && (
                          <span className="rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-300 px-3 py-1 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <Sparkles size={11} /> BOM Auto-Deduct POS
                          </span>
                        )}
                        {log.type === 'STOCK_IN' && (
                          <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 px-3 py-1 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <ArrowDownLeft size={11} /> Stock In (Barang Masuk)
                          </span>
                        )}
                        {log.type === 'STOCK_OUT_WASTE' && (
                          <span className="rounded-full bg-red-500/15 border border-red-500/30 text-red-700 dark:text-red-400 px-3 py-1 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <ArrowUpRight size={11} /> Stock Out / Waste
                          </span>
                        )}
                        {log.type === 'OPNAME' && (
                          <span className="rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 px-3 py-1 text-[10px] font-extrabold flex items-center gap-1 w-fit">
                            <ClipboardCheck size={11} /> Stock Opname Audit
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-extrabold text-sm">
                        <span className={log.quantityChange > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                          {log.quantityChange > 0 ? '+' : ''}{log.quantityChange} {log.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-sm font-sans">{log.reference}</td>
                      <td className="px-6 py-4 font-semibold text-gray-500 dark:text-gray-400">{log.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 9.4 MODAL: STOCK IN / OUT / WASTE LOGGER */}
      {isMovementModalOpen && movementTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {movementType === 'STOCK_IN' ? <ArrowDownLeft size={20} className="text-emerald-500" /> : <ArrowUpRight size={20} className="text-amber-500" />}
                <span>{movementType === 'STOCK_IN' ? 'Pencatatan Barang Masuk (Stock In 9.4)' : 'Pencatatan Barang Keluar / Waste (9.4)'}</span>
              </h3>
              <button onClick={() => setIsMovementModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-[#FAF3E7] dark:bg-black/40 p-4 text-xs space-y-1 border border-[#C89B5C]/30">
              <p className="font-extrabold text-gray-900 dark:text-white text-sm">{movementTargetItem.name}</p>
              <p className="text-gray-600 dark:text-gray-300">Stok Sistem Saat Ini: <strong className="text-gray-900 dark:text-white font-mono">{movementTargetItem.stock} {movementTargetItem.unit}</strong></p>
              <p className="text-[#C89B5C] font-semibold">Tipe Mutasi: {movementType === 'STOCK_IN' ? 'Penambahan (+) dari Supplier / PO' : 'Pengurangan (-) karena Waste / Rusak / Dapur'}</p>
            </div>

            <form onSubmit={handleSaveStockMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Jumlah / Qty Mutasi ({movementTargetItem.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={movementQty}
                  onChange={(e) => setMovementQty(e.target.value)}
                  placeholder="Misal: 1000"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm font-mono font-extrabold text-gray-900 dark:text-white focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                  Referensi / Keterangan Transaksi <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={movementRef}
                  onChange={(e) => setMovementRef(e.target.value)}
                  placeholder="No. Faktur PO / alasan barang rusak..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsMovementModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={movementLoading}
                  className={`rounded-2xl px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition-all active:scale-95 ${
                    movementType === 'STOCK_IN' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  {movementLoading && <Loader2 size={13} className="animate-spin inline mr-1" />}
                  {movementType === 'STOCK_IN' ? '✓ Simpan Stock In (+)' : '✓ Simpan Stock Out (-)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cycle Count Stock Opname */}
      {isCycleModalOpen && cycleTargetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-[#C89B5C]" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Stock Opname Cycle Count</h3>
              </div>
              <button onClick={() => setIsCycleModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-[#FAF3E7] dark:bg-black/40 p-4 mb-4 text-xs space-y-1 border border-[#C89B5C]/30">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white text-sm">{cycleTargetItem.name}</span>
                <span className="font-mono bg-white dark:bg-black px-2 py-0.5 rounded border border-gray-200 dark:border-white/15 text-gray-600 dark:text-gray-300">
                  {cycleTargetItem.sku || 'NO-SKU'}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-300">
                Stok Tercatat di Sistem:{' '}
                <span className="font-bold text-gray-900 dark:text-white font-mono">
                  {cycleTargetItem.stock} {cycleTargetItem.unit}
                </span>
              </p>
            </div>

            <form onSubmit={handleSaveCycleCount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Hitungan Fisik Aktual ({cycleTargetItem.unit}) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={physicalCountInput}
                  onChange={(e) => setPhysicalCountInput(e.target.value)}
                  placeholder="Masukkan jumlah hitungan fisik..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm focus:border-[#C89B5C] focus:outline-none font-bold text-gray-900 dark:text-white font-mono"
                />
                {physicalCountInput !== '' && (
                  <div
                    className={`mt-2 flex items-center justify-between text-xs font-bold px-3.5 py-2 rounded-xl ${
                      currentVariance === 0
                        ? 'bg-gray-100 text-gray-600'
                        : currentVariance > 0
                        ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30'
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

              {currentVariance > 0 && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 space-y-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <Hash size={14} />
                    <span>Informasi Batch FEFO Penambahan Stok</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">Nomor Batch (Opsional)</label>
                      <input
                        type="text"
                        value={batchNumberInput}
                        onChange={(e) => setBatchNumberInput(e.target.value)}
                        placeholder="BATCH-2026-A"
                        className="w-full rounded-xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs font-mono bg-white dark:bg-black/40 focus:border-[#C89B5C] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <Calendar size={11} /> Exp. Date
                      </label>
                      <input
                        type="date"
                        value={expirationDateInput}
                        onChange={(e) => setExpirationDateInput(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs bg-white dark:bg-black/40 focus:border-[#C89B5C] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Catatan Audit Opname</label>
                <textarea
                  rows={2}
                  value={cycleNotesInput}
                  onChange={(e) => setCycleNotesInput(e.target.value)}
                  placeholder="Alasan selisih/varians atau nama auditor..."
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCycleModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={cycleLoading}
                  className="flex items-center gap-1.5 rounded-2xl bg-[#1E3D31] px-6 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md disabled:opacity-50"
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
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4">
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Tambah Bahan Baku Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                  Nama Bahan Baku <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sirup Hazelnut Monin"
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">SKU Internal</label>
                  <input
                    type="text"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    placeholder="SYR-005"
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono uppercase focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
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
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-[#C89B5C] focus:outline-none"
                  >
                    {['gram', 'kg', 'liter', 'ml', 'botol', 'pack', 'pcs'].map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Stok Awal</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Min. Kritis</label>
                  <input
                    type="number"
                    required
                    value={formThreshold}
                    onChange={(e) => setFormThreshold(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Harga/Satuan</label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-[#C89B5C] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-2xl border border-gray-200 dark:border-white/15 px-5 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-300"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-2xl bg-[#1E3D31] px-6 py-2.5 text-xs font-bold text-[#C89B5C] hover:bg-[#163026] shadow-md disabled:opacity-50"
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
