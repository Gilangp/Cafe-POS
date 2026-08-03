'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  Search,
  AlertTriangle,
  TrendingDown,
  Package,
  Plus,
  ChevronDown,
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

const initialLogs: StockMovementLog[] = [];

export default function InventoryPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { items, loading, usingLive, adjustStock, addItem, deleteItem, performCycleCount, refetch } = useInventory();
  const [activeTab, setActiveTab] = useState<'stock' | 'history'>('stock');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [logs, setLogs] = useState<StockMovementLog[]>(initialLogs);
  const [logsLoading, setLogsLoading] = useState(false);

  // BUG FIX 3: Fetch inventory categories from API
  const [inventoryCategories, setInventoryCategories] = useState<{ id: string; name: string }[]>([]);
  const [formCategoryId, setFormCategoryId] = useState('');

  // Fetch real logs from API
  useEffect(() => {
    if (usingLive) {
      setLogsLoading(true);
      import('@/shared/api/axios').then(({ default: api }) => {
        api.get('/admin/inventories/logs')
          .then(res => {
            if (res.data?.data) {
              const fetchedLogs = res.data.data.map((log: any) => {
                // BUG FIX 5: Normalize backend log types to frontend display types
                const rawType = (log.type || '').toLowerCase();
                let normalizedType: StockMovementLog['type'] = 'STOCK_IN';
                if (rawType === 'keluar' || rawType === 'stock_out') normalizedType = 'STOCK_OUT_WASTE';
                else if (rawType === 'masuk' || rawType === 'stock_in') normalizedType = 'STOCK_IN';
                else if (rawType === 'adjustment' || rawType === 'penyesuaian') normalizedType = 'OPNAME';
                // If reference is a Transaction UUID (from POS auto-deduct), it's BOM_AUTO_DEDUCT
                else if (log.reference_type && log.reference_type.includes('Transaction')) normalizedType = 'BOM_AUTO_DEDUCT';

                return {
                  id: log.id || `LOG-${Date.now()}-${Math.random()}`,
                  timestamp: new Date(log.created_at).toLocaleString('id-ID'),
                  itemName: log.inventory?.name || 'Item Terhapus',
                  type: normalizedType,
                  quantityChange: rawType === 'keluar' || rawType === 'stock_out' ? -Number(log.quantity) : Number(log.quantity),
                  unit: typeof log.inventory?.unit === 'object' && log.inventory?.unit ? log.inventory.unit.name : (log.inventory?.unit || 'satuan'),
                  reference: log.reference_id || log.reference_number || log.notes || '-',
                  user: log.user?.name || 'Sistem',
                };
              });
              setLogs(fetchedLogs);
            }
          })
          .catch(err => console.error('Failed to fetch real inventory logs:', err))
          .finally(() => setLogsLoading(false));
      });
    }
  }, [usingLive, activeTab]);

  // BUG FIX 3: Fetch inventory categories from API on mount
  useEffect(() => {
    import('@/shared/api/axios').then(({ default: api }) => {
      api.get('/admin/inventory-categories')
        .then(res => {
          if (res.data?.data && Array.isArray(res.data.data)) {
            setInventoryCategories(res.data.data);
            if (res.data.data.length > 0) {
              setFormCategoryId(res.data.data[0].id);
            }
          }
        })
        .catch(() => {
          // Fallback: inventory-categories not available, use item categories
        });
    });
  }, [usingLive]);

  // Modal State for Add Item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('Kopi'); // kept for fallback display
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

  // Stock In / Out / Waste Logger Modal
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
        user: 'Admin Roastery (Manual)',
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
    setCycleNotesInput('Stock Opname Cycle Count');
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
            user: 'Admin Roastery (Opname)',
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
      // BUG FIX 3: Use category_id (UUID) from API if available, otherwise fall back to category string
      if (usingLive && formCategoryId) {
        // Live mode: send proper category_id UUID to backend
        await import('@/shared/api/axios').then(async ({ default: api }) => {
          await api.post('/admin/inventories', {
            category_id: formCategoryId,
            name: formName,
            stock_quantity: Number(formStock) || 0,
            unit: formUnit,
            minimum_stock: Number(formThreshold) || 10,
            sku: formSku || undefined,
          });
          refetch();
        });
      } else {
        // Fallback mock mode
        await addItem({
          name: formName,
          category: formCategory,
          stock: Number(formStock) || 0,
          unit: formUnit,
          threshold: Number(formThreshold) || 10,
          cost: Number(formCost) || 10000,
          sku: formSku || undefined,
        });
      }

      setIsModalOpen(false);
      setFormName('');
      setFormSku('');
      setFormStock('500');
      setFormUnit('gram');
      setFormThreshold('100');
      setFormCost('15000');
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
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-accent/30">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide">
            Manajemen Inventaris
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Catat barang masuk (Stock In) & keluar (Waste/Stock Out), pantau peringatan stok kritis, dan audit otomatis (BOM).
          </p>
        </div>

        <PermissionGuard permission="inventory.create">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-primary hover:bg-[#b88c4d] transition-colors shadow-md active:scale-95 shrink-0"
          >
            <Plus size={16} /> Tambah Item Bahan
          </button>
        </PermissionGuard>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 dark:border-emerald-800 px-5 py-3.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn shadow-sm">
          <Check size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Low Stock Alert Banner (Peringatan Stok Kritis di Bawah Minimum) */}
      {criticalItems.length > 0 && (
        <div className="rounded-3xl bg-red-500/10 border-2 border-red-500/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-md">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-heading text-sm font-extrabold text-red-700 dark:text-red-400">
                Peringatan Stok Kritis di Bawah Minimum
              </h3>
              <p className="text-xs text-red-600/90 dark:text-red-300/90 mt-0.5">
                Sebanyak <strong className="font-mono text-red-700 dark:text-red-300">{criticalItems.length} bahan baku</strong> berada di bawah batas minimum pengaman. Segera lakukan Stock In / PO dari supplier agar dapur tidak 86&apos;d.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const criticalIds = criticalItems.map((i) => i.id).join(',');
              router.push(`/dashboard/admin/procurement/purchase-orders?critical_items=${criticalIds}`);
            }}
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
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-accent">
            <Package size={22} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white font-heading">{items.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-0.5">Total Item Bahan Baku</p>
          </div>
        </div>
      </div>

      {/* TABS Navigation */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'stock' ? 'bg-primary text-accent shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15'
          }`}
        >
          <Package size={16} />
          <span>Daftar Stok & Peringatan</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'history' ? 'bg-primary text-accent shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15'
          }`}
        >
          <History size={16} />
          <span>Log Mutasi & Audit ({logs.length})</span>
        </button>
      </div>

      {/* TAB 1: INVENTORY ITEMS LIST */}
      {activeTab === 'stock' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Filters */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[260px] max-w-sm">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama bahan baku atau SKU..."
                className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-accent focus:outline-none"
              />
            </div>
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-4 pr-10 text-xs text-gray-700 dark:text-gray-200 font-bold focus:border-accent focus:outline-none"
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
              <Loader2 size={36} className="animate-spin mb-3 text-accent" />
              <p className="text-xs font-bold">Memuat data persediaan & level stok...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((item) => {
                const level = stockLevel(item);
                return (
                  <div key={item.id} className="group relative bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10 p-5 shadow-sm hover:shadow-glow hover:border-accent/40 transition-all flex flex-col h-full animate-fadeIn">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-primary/10 dark:bg-accent/10 text-primary dark:text-accent text-[10px] font-extrabold uppercase tracking-wider mb-2">
                          {item.category}
                        </span>
                        <h3 className="font-heading text-base font-bold text-gray-900 dark:text-white leading-tight line-clamp-2">{item.name}</h3>
                        {item.sku && <p className="text-xs font-mono text-gray-400 mt-1">SKU: {item.sku}</p>}
                      </div>
                      {level.label.includes('Kritis') && (
                        <div className="h-3 w-3 shrink-0 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-gray-100 dark:border-white/5 space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Stok Saat Ini</p>
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-extrabold font-mono ${level.label.includes('Kritis') ? 'text-red-500' : level.label === 'Hampir Habis' ? 'text-amber-500' : 'text-gray-900 dark:text-white'}`}>
                              {item.stock.toLocaleString('id-ID')}
                            </span>
                            <span className="text-xs font-bold text-gray-500">{item.unit}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Min. Stok</p>
                          <p className="text-sm font-mono font-bold text-gray-400">{item.threshold} {item.unit}</p>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className={level.label.includes('Kritis') ? 'text-red-500' : level.label === 'Hampir Habis' ? 'text-amber-500' : 'text-emerald-500'}>{level.label}</span>
                          <span className="text-gray-400 font-mono">{Math.round(level.pct)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-black/50 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${level.color}`} style={{ width: `${level.pct}%` }} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                        <PermissionGuard permission="inventory.adjust">
                          <button
                            onClick={() => handleOpenMovementModal(item, 'STOCK_IN')}
                            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 transition-colors"
                          >
                            <ArrowDownLeft size={16} />
                            <span className="text-[10px] font-bold">Stock In</span>
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="inventory.adjust">
                          <button
                            onClick={() => handleOpenMovementModal(item, 'STOCK_OUT_WASTE')}
                            className="flex flex-col items-center justify-center gap-1 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 transition-colors"
                          >
                            <ArrowUpRight size={16} />
                            <span className="text-[10px] font-bold">Waste/Out</span>
                          </button>
                        </PermissionGuard>
                      </div>

                      <div className="flex items-center gap-2">
                        <PermissionGuard permission="inventory.adjust">
                          <button
                            onClick={() => handleOpenCycleCount(item)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-primary hover:text-accent transition-colors text-xs font-bold border border-transparent hover:border-accent/30"
                          >
                            <ClipboardCheck size={14} /> Opname Fisik
                          </button>
                        </PermissionGuard>
                        <PermissionGuard permission="inventory.delete">
                          <button
                            onClick={() => handleDeleteItem(item.id, item.name)}
                            className="w-11 h-11 flex shrink-0 items-center justify-center rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </PermissionGuard>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STOCK MOVEMENT & BOM AUTO-DEDUCTION LOGS */}
      {activeTab === 'history' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="rounded-3xl bg-white dark:bg-[#1A2620] border border-gray-200 dark:border-white/10 p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-white/10 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History size={20} className="text-accent" />
                  <span>Log Mutasi Stok & Pemotongan Resep BOM Otomatis</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Setiap transaksi POS kasir secara langsung mengurangi stok bahan baku sesuai komposisi BOM menu yang terjual.
                </p>
              </div>
              <span className="rounded-xl bg-cream-100 dark:bg-black/40 border border-accent/30 px-3.5 py-1.5 text-xs font-mono font-bold text-accent">
                Real-Time Ledger Audit
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-primary/5 dark:bg-accent/10 text-left text-[11px] uppercase tracking-wider font-bold text-primary dark:text-accent border-b border-gray-100 dark:border-white/10">
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
 BOM Auto-Deduct POS
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
      {mounted && isMovementModalOpen && movementTargetItem && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
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

            <div className="rounded-2xl bg-cream-100 dark:bg-black/40 p-4 text-xs space-y-1 border border-accent/30">
              <p className="font-extrabold text-gray-900 dark:text-white text-sm">{movementTargetItem.name}</p>
              <p className="text-gray-600 dark:text-gray-300">Stok Sistem Saat Ini: <strong className="text-gray-900 dark:text-white font-mono">{movementTargetItem.stock} {movementTargetItem.unit}</strong></p>
              <p className="text-accent font-semibold">Tipe Mutasi: {movementType === 'STOCK_IN' ? 'Penambahan (+) dari Supplier / PO' : 'Pengurangan (-) karena Waste / Rusak / Dapur'}</p>
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
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm font-mono font-extrabold text-gray-900 dark:text-white focus:border-accent focus:outline-none"
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
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-accent focus:outline-none"
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
        </div>, document.body
      )}

      {/* Modal Cycle Count Stock Opname */}
      {mounted && isCycleModalOpen && cycleTargetItem && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#1A2620] p-6 sm:p-8 shadow-2xl border border-gray-200 dark:border-white/15 space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={20} className="text-accent" />
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Stock Opname Cycle Count</h3>
              </div>
              <button onClick={() => setIsCycleModalOpen(false)} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-2xl bg-cream-100 dark:bg-black/40 p-4 mb-4 text-xs space-y-1 border border-accent/30">
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
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-sm focus:border-accent focus:outline-none font-bold text-gray-900 dark:text-white font-mono"
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
                        className="w-full rounded-xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs font-mono bg-white dark:bg-black/40 focus:border-accent focus:outline-none"
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
                        className="w-full rounded-xl border border-gray-200 dark:border-white/15 px-3 py-2 text-xs bg-white dark:bg-black/40 focus:border-accent focus:outline-none"
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
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-2.5 text-xs focus:border-accent focus:outline-none"
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
                  className="flex items-center gap-1.5 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-accent hover:bg-primary-hover shadow-md disabled:opacity-50"
                >
                  {cycleLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Stock Opname
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}

      {/* Modal Tambah Item Bahan Baku */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
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
                  className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-4 py-3 text-xs font-bold focus:border-accent focus:outline-none"
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
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono uppercase focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  {/* BUG FIX 3: Use category_id from API when live, fallback to string when mock */}
                  {inventoryCategories.length > 0 ? (
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-accent focus:outline-none"
                    >
                      {inventoryCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-accent focus:outline-none"
                    >
                      {['Kopi', 'Dairy', 'Sirup', 'Baking', 'Bahan Dasar', 'Kemasan', 'Minuman'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
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
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-bold focus:border-accent focus:outline-none"
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
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-accent focus:outline-none"
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
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Harga/Satuan</label>
                  <input
                    type="number"
                    required
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 px-3.5 py-3 text-xs font-mono font-bold focus:border-accent focus:outline-none"
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
                  className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-accent hover:bg-primary-hover shadow-md disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Bahan Baku
                </button>
              </div>
            </form>
          </div>
        </div>, document.body
      )}
    </div>
  );
}
