'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  FileText,
  Plus,
  Search,
  PackageCheck,
  Calendar,
  Hash,
  Store,
  Check,
  X,
  Loader2,
  ChevronRight,
  Truck,
  Receipt,
  Trash2,
} from 'lucide-react';
import { useProcurement, PurchaseOrderData } from '@/features/inventory/hooks/use-procurement';
import { useInventory } from '@/features/inventory/hooks/use-inventory';
import { useUnitConversions } from '@/features/inventory/hooks/use-unit-conversions';
import { PermissionGuard } from '@/shared/components/common/permission-guard';

const fmt = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

const statusBadge: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 border border-gray-200',
  ORDERED: 'bg-blue-100 text-blue-800 border border-blue-200',
  PARTIAL: 'bg-amber-100 text-amber-800 border border-amber-200',
  RECEIVED: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
  CANCELLED: 'bg-red-100 text-red-800 border border-red-200',
};

export default function PurchaseOrdersPage() {
  const { purchaseOrders, suppliers, loading, usingLive, createPurchaseOrder, receivePurchaseOrder, cancelPurchaseOrder } = useProcurement();
  const { items: inventoryItems, loading: invLoading } = useInventory();
  const { conversions } = useUnitConversions();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal Create PO State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string | number>('');
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedDate, setExpectedDate] = useState('');
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState<
    { inventory_item_id: string | number; quantity: string; unit: string; conversion_multiplier: string; unit_price: string }[]
  >([{ inventory_item_id: '', quantity: '10', unit: 'kg', conversion_multiplier: '1000', unit_price: '25000' }]);
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  // Modal Receive PO State (INV-006 & Procurement Receiving)
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedPo, setSelectedPo] = useState<PurchaseOrderData | null>(null);
  const [receiveFormItems, setReceiveFormItems] = useState<
    {
      purchase_order_item_id: string | number;
      item_name: string;
      ordered_qty: number;
      already_received: number;
      receiving_qty: string;
      batch_number: string;
      expiration_date: string;
      unit: string;
    }[]
  >([]);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showNotification = (msg: string) => {
    setActionStatus(msg);
    setTimeout(() => setActionStatus(null), 3500);
  };

  // Auto-open modal if navigated from inventory critical alert
  useEffect(() => {
    // Only process URL when both hooks have finished loading their initial data
    if (typeof window !== 'undefined' && !loading && !invLoading) {
      const params = new URLSearchParams(window.location.search);
      const criticalIdsStr = params.get('critical_items');
      
      if (criticalIdsStr && inventoryItems.length > 0) {
        const ids = criticalIdsStr.split(',');
        const criticalInventory = inventoryItems.filter(i => ids.includes(i.id.toString()));
        
        if (criticalInventory.length > 0) {
          setSupplierId(suppliers.length > 0 ? suppliers[0].id : '');
          setOrderDate(new Date().toISOString().split('T')[0]);
          setPoItems(criticalInventory.map(item => ({
            inventory_item_id: item.id,
            quantity: item.min_stock ? (item.min_stock * 2).toString() : '10',
            unit: item.unit || 'satuan',
            unit_price: (item.cost || 0).toString(),
          })));
          setPoNotes('Auto-generated PO untuk item dengan stok kritis');
          setIsCreateModalOpen(true);
          
          // Clear the URL so it doesn't reopen on refresh
          window.history.replaceState({}, '', '/dashboard/admin/procurement/purchase-orders');
        }
      }
    }
  }, [loading, invLoading, inventoryItems, suppliers]);

  const handleOpenCreate = () => {
    setSupplierId(suppliers[0]?.id || '');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setExpectedDate('');
    setPoNotes('');
    setPoItems([{ inventory_item_id: inventoryItems[0]?.id || '', quantity: '1', unit: inventoryItems[0]?.unit || 'kg', conversion_multiplier: '1', unit_price: (inventoryItems[0]?.cost || 25000).toString() }]);
    setIsCreateModalOpen(true);
  };

  const handleAddPoRow = () => {
    const defaultItem = inventoryItems[0];
    setPoItems((prev) => [
      ...prev,
      {
        inventory_item_id: defaultItem?.id || '',
        quantity: '1',
        unit: defaultItem?.unit || 'satuan',
        conversion_multiplier: '1',
        unit_price: (defaultItem?.cost || 15000).toString(),
      },
    ]);
  };

  const handleRemovePoRow = (idx: number) => {
    setPoItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handlePoItemChange = (idx: number, field: string, value: string) => {
    setPoItems((prev) =>
      prev.map((item, i) => {
        if (i === idx) {
          if (field === 'inventory_item_id') {
            const match = inventoryItems.find((inv) => String(inv.id) === String(value));
            return {
              ...item,
              inventory_item_id: value,
              unit: match?.unit || item.unit,
              conversion_multiplier: '1', // Reset conversion on item change
              unit_price: match?.cost ? match.cost.toString() : item.unit_price,
            };
          }
          if (field === 'unit') {
            const match = inventoryItems.find((inv) => String(inv.id) === String(item.inventory_item_id));
            const baseUnit = match?.unit?.toLowerCase() || '';
            const poUnit = value.toLowerCase();
            
            let autoConversion = item.conversion_multiplier;
            
            // Check dynamic conversions from DB
            const dynamicMatch = conversions.find(
              c => c.from_unit.toLowerCase() === poUnit && c.to_unit.toLowerCase() === baseUnit
            );
            
            if (dynamicMatch) {
              autoConversion = dynamicMatch.multiplier.toString();
            } else {
              // Fallback for some common defaults if not in DB yet
              if (poUnit === 'kg' && baseUnit === 'gram') autoConversion = '1000';
              else if (poUnit === 'liter' && baseUnit === 'ml') autoConversion = '1000';
              else if (poUnit === 'lusin' && baseUnit === 'pcs') autoConversion = '12';
              else if (poUnit === 'box' && baseUnit === 'pcs') autoConversion = '24';
            }
            
            return { ...item, [field]: value, conversion_multiplier: autoConversion };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    );
  };

  const handleSavePo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || poItems.length === 0) return;

    // Determine status from the button clicked
    const submitter = (e.nativeEvent as any).submitter as HTMLButtonElement | undefined;
    const saveStatus = submitter?.value === 'DRAFT' ? 'DRAFT' : 'ORDERED';

    setFormLoading(true);
    try {
      const itemsPayload = poItems.map((i) => ({
        inventory_item_id: i.inventory_item_id || inventoryItems[0]?.id || 1,
        quantity: parseFloat(i.quantity) || 1,
        unit: i.unit || 'satuan',
        conversion_multiplier: parseFloat(i.conversion_multiplier) || 1,
        unit_price_cents: Math.round((parseFloat(i.unit_price) || 0) * 100),
      }));

      await createPurchaseOrder({
        supplier_id: supplierId,
        order_date: orderDate,
        expected_delivery_date: expectedDate || undefined,
        status: saveStatus,
        notes: poNotes || 'Dibuat dari modul Pengadaan Admin',
        items: itemsPayload,
      });

      setIsCreateModalOpen(false);
      showNotification(`Purchase Order berhasil disimpan sebagai ${saveStatus}!`);
    } catch (err) {
      console.error('Create PO error:', err);
      showNotification('Gagal membuat Purchase Order');
    } finally {
      setFormLoading(false);
    }
  };

  const handleOpenReceive = (po: PurchaseOrderData) => {
    setSelectedPo(po);
    const rows = (po.items || []).map((i) => ({
      purchase_order_item_id: i.id,
      item_name: i.inventory_item?.name || `Item #${i.inventory_item_id}`,
      ordered_qty: i.quantity,
      already_received: i.received_quantity,
      receiving_qty: Math.max(0, i.quantity - i.received_quantity).toString(),
      batch_number: `BATCH-${po.po_number.split('-').pop() || 'A'}`,
      expiration_date: '',
      unit: i.unit,
    }));
    setReceiveFormItems(rows);
    setIsReceiveModalOpen(true);
  };

  const handleSaveReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;

    setReceiveLoading(true);
    try {
      const payloadItems = receiveFormItems
        .filter((i) => parseFloat(i.receiving_qty) > 0)
        .map((i) => ({
          purchase_order_item_id: i.purchase_order_item_id,
          received_quantity: parseFloat(i.receiving_qty),
          batch_number: i.batch_number || undefined,
          expiration_date: i.expiration_date || undefined,
        }));

      if (payloadItems.length === 0) {
        showNotification('Masukkan minimal 1 kuantitas penerimaan.');
        setReceiveLoading(false);
        return;
      }

      await receivePurchaseOrder(selectedPo.id, { items: payloadItems });
      setIsReceiveModalOpen(false);
      showNotification(`Barang untuk ${selectedPo.po_number} berhasil diterima. Stok & Batch FEFO diperbarui!`);
    } catch (err) {
      console.error('Receive error:', err);
      showNotification('Gagal memproses penerimaan barang PO');
    } finally {
      setReceiveLoading(false);
    }
  };

  const handleCancelPo = async (po: PurchaseOrderData) => {
    if (confirm(`Apakah Anda yakin ingin membatalkan PO ${po.po_number}?`)) {
      try {
        await cancelPurchaseOrder(po.id);
        showNotification(`PO ${po.po_number} berhasil dibatalkan.`);
      } catch (err) {
        console.error('Cancel error:', err);
        showNotification('Gagal membatalkan PO');
      }
    }
  };

  const filtered = purchaseOrders.filter((po) => {
    const matchSearch =
      po.po_number.toLowerCase().includes(search.toLowerCase()) ||
      (po.supplier?.name && po.supplier.name.toLowerCase().includes(search.toLowerCase())) ||
      (po.notes && po.notes.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 selection:bg-accent/30">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide flex items-center gap-3">
            Purchase Orders (PO)
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 font-sans">
            Buat PO ke supplier dan proses penerimaan barang dengan integrasi Batch FEFO dan perhitungan HPP rata-rata tertimbang.
          </p>
        </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-2.5 text-xs font-bold text-primary hover:bg-[#b88c4d] transition-colors shadow-md active:scale-95 shrink-0"
          >
            <Plus size={16} /> Buat PO Baru
          </button>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          <span>{actionStatus}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor PO atau nama supplier..."
            className="w-full rounded-2xl border border-gray-200 dark:border-white/15 bg-white dark:bg-black/35 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-accent focus:outline-none"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`shrink-0 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
                statusFilter === st
                  ? 'bg-primary text-accent shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white bg-white dark:bg-black/30 border border-gray-200 dark:border-white/15'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* PO List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10">
          <Loader2 size={36} className="animate-spin mb-3 text-accent" />
          <p className="text-xs font-bold">Memuat daftar Purchase Order...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((po) => {
            const isFinished = po.status === 'RECEIVED' || po.status === 'CANCELLED';
            const displayTotal = po.total_cents > 1000000 ? po.total_cents / 100 : po.total_cents; // format cents if needed

            return (
              <div
                key={po.id}
                className="group relative bg-white dark:bg-[#1A2620] rounded-3xl border border-gray-200 dark:border-white/10 p-5 shadow-sm hover:shadow-glow hover:border-accent/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-mono text-xs font-bold text-gray-900 dark:text-white bg-primary/10 dark:bg-accent/10 px-3 py-1 rounded-lg text-primary dark:text-accent border border-primary/20 dark:border-accent/20">
                      <Receipt size={14} /> {po.po_number}
                    </span>
                    <span className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${statusBadge[po.status] || 'bg-gray-100 text-gray-600'}`}>
                      {po.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1 font-bold text-gray-800">
                      <Store size={13} className="text-[#BA935D]" /> {po.supplier?.name || 'Supplier'}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">
                      <Calendar size={13} /> Tgl Order: <strong className="text-gray-700">{po.order_date}</strong>
                    </span>
                    {po.expected_delivery_date && (
                      <span className="flex items-center gap-1 text-gray-400">
                        <Truck size={13} /> Est. Tiba: <strong className="text-gray-700">{po.expected_delivery_date}</strong>
                      </span>
                    )}
                  </div>

                  {po.notes && <p className="text-xs text-gray-500 italic">&ldquo;{po.notes}&rdquo;</p>}

                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 gap-3">
                  <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total Nilai PO</p>
                    <p className="font-serif text-lg font-bold text-gray-900">{fmt(displayTotal)}</p>
                  </div>

                  {!isFinished && (
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleOpenReceive(po)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-primary hover:bg-[#b88c4d] transition-colors shadow-sm shrink-0"
                      >
                        <PackageCheck size={15} />
                        <span>Terima Barang (Batch FEFO)</span>
                      </button>
                      {(po.status === 'DRAFT' || po.status === 'ORDERED') && (
                        <button
                          onClick={() => handleCancelPo(po)}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-900/30"
                        >
                          <X size={15} />
                          <span>Batalkan PO</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Create Purchase Order */}
      {mounted && isCreateModalOpen && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" style={{ zIndex: 9999 }}>
          <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-200 dark:border-white/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-accent" />
                <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Buat Purchase Order Baru</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePo} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pilih Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold focus:border-[#BA935D] focus:outline-none"
                  >
                    {suppliers.length === 0 && (
                      <option value="" disabled>-- Belum ada data Supplier --</option>
                    )}
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category || 'Umum'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Tanggal Order <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-[#BA935D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Estimasi Tiba
                  </label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-[#BA935D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Daftar Item Pesanan <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPoRow}
                    className="flex items-center gap-1 text-xs font-bold text-[#BA935D] hover:underline"
                  >
                    <Plus size={13} /> Tambah Baris
                  </button>
                </div>

                <div className="rounded-xl border border-gray-200 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-black/20 text-gray-400 uppercase tracking-wider text-left">
                        <th className="p-2.5">Bahan Baku</th>
                        <th className="p-2.5 w-24">Jumlah</th>
                        <th className="p-2.5 w-24">Satuan PO</th>
                        <th className="p-2.5 w-24">Konversi</th>
                        <th className="p-2.5 w-32">Harga/Sat (IDR)</th>
                        <th className="p-2.5 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {poItems.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <select
                              value={item.inventory_item_id}
                              onChange={(e) => handlePoItemChange(idx, 'inventory_item_id', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[#BA935D] focus:outline-none"
                            >
                              {inventoryItems.map((inv) => (
                                <option key={inv.id} value={inv.id}>
                                  {inv.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              required
                              value={item.quantity}
                              onChange={(e) => handlePoItemChange(idx, 'quantity', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono focus:border-[#BA935D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              required
                              value={item.unit}
                              onChange={(e) => handlePoItemChange(idx, 'unit', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono focus:border-[#BA935D] focus:outline-none"
                              placeholder="kg, dus..."
                            />
                          </td>
                          <td className="p-2 relative group">
                            <input
                              type="number"
                              required
                              value={item.conversion_multiplier}
                              onChange={(e) => handlePoItemChange(idx, 'conversion_multiplier', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono focus:border-[#BA935D] focus:outline-none"
                            />
                            {/* Tooltip to explain conversion */}
                            <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-[10px] rounded shadow-xl z-50">
                              Berapa banyak stok dasar per 1 satuan PO ini? (Cth: 1 kg = 1000 gram, isi 1000)
                            </div>
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              required
                              value={item.unit_price}
                              onChange={(e) => handlePoItemChange(idx, 'unit_price', e.target.value)}
                              className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono focus:border-[#BA935D] focus:outline-none"
                            />
                          </td>
                          <td className="p-2 text-center">
                            {poItems.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemovePoRow(idx)}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Catatan PO</label>
                <input
                  type="text"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="Instruksi pengiriman khusus..."
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    name="status"
                    value="DRAFT"
                    disabled={formLoading}
                    className="flex items-center gap-1.5 rounded-xl border border-primary/20 dark:border-white/20 bg-transparent px-4 py-2 text-xs font-bold text-primary dark:text-cream-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Simpan Draft
                  </button>
                  <button
                    type="submit"
                    name="status"
                    value="ORDERED"
                    disabled={formLoading}
                    className="flex items-center gap-1.5 rounded-xl bg-primary px-6 py-2 text-xs font-bold text-accent hover:bg-[#163026] transition-colors disabled:opacity-50"
                  >
                    {formLoading && <Loader2 size={13} className="animate-spin" />}
                    Simpan & Terbitkan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Receive Purchase Order with Batch FEFO */}
      {mounted && isReceiveModalOpen && selectedPo && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn" style={{ zIndex: 9999 }}>
          <div className="w-full max-w-3xl rounded-3xl bg-white dark:bg-[#1A2620] p-6 shadow-2xl border border-gray-200 dark:border-white/15 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <PackageCheck size={22} className="text-emerald-500" />
                <div>
                  <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">Penerimaan Barang PO (Receiving)</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">
                    {selectedPo.po_number} • {selectedPo.supplier?.name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-emerald-50/60 border border-emerald-200 p-3.5 mb-4 text-xs space-y-1 text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold">
                <Hash size={14} className="text-emerald-700" />
                <span>Pencatatan Kedaluwarsa Barang (FEFO)</span>
              </div>
              <p className="text-emerald-800">
                Penerimaan barang otomatis membuat rekam jejak batch dan memperbarui HPP rata-rata tertimbang (*Weighted-Average Unit Cost*).
              </p>
            </div>

            <form onSubmit={handleSaveReceive} className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-black/20 text-left uppercase tracking-wider text-gray-400">
                      <th className="p-3">Nama Bahan Baku</th>
                      <th className="p-3 w-28">Order vs Terima</th>
                      <th className="p-3 w-28">Qty Diterima</th>
                      <th className="p-3 w-36">Nomor Batch</th>
                      <th className="p-3 w-36">Exp. Date (FEFO)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {receiveFormItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="p-3 font-bold text-gray-800">{item.item_name}</td>
                        <td className="p-3 font-mono text-gray-600">
                          {item.already_received}/{item.ordered_qty} {item.unit}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            step="0.01"
                            max={item.ordered_qty - item.already_received}
                            value={item.receiving_qty}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReceiveFormItems((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, receiving_qty: val } : r))
                              );
                            }}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono font-bold focus:border-[#BA935D] focus:outline-none"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.batch_number}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReceiveFormItems((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, batch_number: val } : r))
                              );
                            }}
                            placeholder="BATCH-001"
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 font-mono focus:border-[#BA935D] focus:outline-none"
                          />
                        </td>
                        <td className="p-3">
                          <input
                            type="date"
                            value={item.expiration_date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setReceiveFormItems((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, expiration_date: val } : r))
                              );
                            }}
                            className="w-full rounded-lg border border-gray-200 px-2 py-1.5 focus:border-[#BA935D] focus:outline-none"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={receiveLoading}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-6 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition-colors disabled:opacity-50 shadow-sm"
                >
                  {receiveLoading && <Loader2 size={13} className="animate-spin" />}
                  Konfirmasi Penerimaan Barang
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
