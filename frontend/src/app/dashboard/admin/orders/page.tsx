'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Eye, ChevronDown, Loader2, X, FileText, RefreshCw } from 'lucide-react';
import api from '@/shared/api/axios';

interface TransactionItem {
  id: string;
  invoice_number: string;
  customer_name: string;
  order_type: string;
  table_number: string | null;
  items_count: number;
  total: number;
  status: string;
  created_at: string;
  source: string;
  kitchen_status?: string;
}

const statusStyle: Record<string, string> = {
  pending: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
  preparing: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  ready: 'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
  completed: 'bg-muted text-gray-600 dark:bg-white/10 dark:text-cream-400 font-bold',
  cancelled: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400',
};

const statusLabel: Record<string, string> = {
  pending: 'Baru Masuk',
  preparing: 'Diproses Dapur',
  ready: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const channelStyle: Record<string, string> = {
  pos: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  dine_in: 'bg-teal-50 text-teal-600 dark:bg-teal-500/10 dark:text-teal-400',
  takeaway: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  online: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  delivery: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function OrdersPage() {
  const [orders, setOrders] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<TransactionItem | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTransactions = useCallback(async (isRefreshing = false) => {
    if (isRefreshing) setRefreshing(true);
    try {
      const res = await api.get('/pos/transactions');
      if (res.data?.success) {
        const mapped = res.data.data.map((t: any) => {
          let uiStatus = 'completed';
          let kitchenStatus = t.order_ticket?.status;
          
          if (t.status === 'dibatalkan') {
            uiStatus = 'cancelled';
          } else if (kitchenStatus) {
            if (kitchenStatus === 'diterima') uiStatus = 'pending';
            if (kitchenStatus === 'diproses') uiStatus = 'preparing';
            if (kitchenStatus === 'siap') uiStatus = 'ready';
            if (kitchenStatus === 'disajikan') uiStatus = 'completed';
            if (kitchenStatus === 'dibatalkan') uiStatus = 'cancelled';
          }

          return {
            id: t.id,
            invoice_number: t.invoice_number,
            customer_name: t.customer_name || 'Pelanggan',
            order_type: t.order_type || 'dine_in',
            table_number: t.table_number,
            total: Number(t.total) || 0,
            status: uiStatus,
            created_at: new Date(t.created_at).toLocaleString('id-ID'),
            source: 'POS Kasir',
          };
        });
        setOrders(mapped);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat pesanan:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    
    // Auto-refresh every 15s to keep list updated
    const interval = setInterval(() => fetchTransactions(), 15000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const filtered = orders.filter((o) => {
    const s = search.toLowerCase();
    const typeLabel = o.order_type.replace('_', ' ').toLowerCase();
    const statusText = (statusLabel[o.status] || o.status).toLowerCase();
    
    const matchSearch =
      o.invoice_number.toLowerCase().includes(s) ||
      o.customer_name.toLowerCase().includes(s) ||
      (o.table_number && o.table_number.toLowerCase().includes(s)) ||
      typeLabel.includes(s) ||
      statusText.includes(s);
      
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedOrders = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-primary dark:text-cream-100 tracking-tight flex items-center gap-3">
            Semua Riwayat Order
          </h1>
          <p className="text-primary/70 dark:text-cream-400 font-medium mt-2">
            Menampilkan seluruh riwayat transaksi pesanan dari POS Kasir.
          </p>
        </div>
        <div>
          <button
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-card border border-border px-4 py-2.5 text-sm font-bold text-primary dark:text-cream-100 hover:bg-muted dark:hover:bg-white/5 transition-colors shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> 
            {refreshing ? "Menyegarkan..." : "Segarkan"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/40 dark:text-cream-400/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari No. Invoice, Nama, Meja, Tipe, atau Status..."
            className="w-full rounded-xl border border-border bg-card py-3 pl-11 pr-4 text-sm text-primary dark:text-cream-100 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent shadow-sm"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-card py-3 pl-4 pr-10 text-sm text-primary dark:text-cream-100 focus:border-accent focus:outline-none shadow-sm cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Baru Masuk</option>
            <option value="preparing">Diproses Dapur</option>
            <option value="ready">Siap Diambil</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 dark:text-cream-400/40 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary/40 dark:text-cream-400/40 bg-card rounded-2xl border border-border shadow-sm">
          <Loader2 size={36} className="animate-spin mb-3 text-slate-400" />
          <p className="text-sm font-semibold">Memuat riwayat transaksi POS...</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-card border border-border shadow-card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted dark:bg-black/20 text-left text-[11px] uppercase tracking-wider text-muted-foreground/60 border-b border-border">
                  <th className="px-6 py-4 font-bold whitespace-nowrap">No. Invoice</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Pelanggan</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Tipe / Channel</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Meja / Lokasi</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Total</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap">Waktu</th>
                  <th className="px-6 py-4 font-bold whitespace-nowrap"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-muted/50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary dark:text-cream-100 whitespace-nowrap">{order.invoice_number}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary dark:text-cream-100 whitespace-nowrap">{order.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`rounded-md px-2 py-1 text-[10px] font-black uppercase tracking-wider ${channelStyle[order.order_type] || 'bg-muted text-gray-600 dark:bg-white/10 dark:text-cream-400'}`}>
                        {order.order_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-primary/80 dark:text-cream-100/80 whitespace-nowrap">{order.table_number || 'Takeaway'}</td>
                    <td className="px-6 py-4 text-sm font-bold text-accent font-heading whitespace-nowrap">{fmt(order.total)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-bold ${statusStyle[order.status] || 'bg-muted text-gray-600 dark:bg-white/10 dark:text-cream-400'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-primary/50 dark:text-cream-100/50 whitespace-nowrap">{order.created_at}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted dark:bg-white/5 text-muted-foreground/60 hover:bg-accent/10 hover:text-accent transition-all border border-border"
                        title="Detail"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {paginatedOrders.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-primary/40 dark:text-cream-400/40">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <FileText size={32} className="opacity-50" />
                        <p className="text-sm font-semibold">Tidak ada data order ditemukan</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-border bg-muted dark:bg-black/10">
              <span className="text-xs text-muted-foreground/60 font-medium text-center sm:text-left">
                Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} dari {filtered.length} pesanan
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-primary dark:text-cream-100 bg-card hover:bg-muted dark:hover:bg-white/5 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    // Tampilkan maksimal 5 tombol halaman (current +/- 2)
                    if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors shadow-sm border ${
                            currentPage === pageNum 
                              ? 'bg-primary text-accent border-primary' 
                              : 'bg-card text-primary dark:text-cream-100 border-border hover:bg-muted dark:hover:bg-white/5'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-primary/40 dark:text-cream-400/40 text-xs">...</span>;
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-bold text-primary dark:text-cream-100 bg-card hover:bg-muted dark:hover:bg-white/5 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail Order */}
      {selectedOrder && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-2xl border border-black/10 dark:border-white/10 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-primary dark:text-cream-100">Detail Pesanan {selectedOrder.invoice_number}</h3>
                <p className="text-xs text-primary/50 dark:text-cream-100/50 mt-0.5">Sumber: <span className="font-bold">{selectedOrder.source}</span></p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1.5 text-primary/40 dark:text-cream-100/40 hover:bg-muted dark:hover:bg-white/10 hover:text-primary dark:hover:text-cream-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground/60 font-medium">Pelanggan</span>
                <span className="font-bold text-primary dark:text-cream-100">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground/60 font-medium">Tipe Layanan</span>
                <span className="font-black text-primary dark:text-cream-100 uppercase tracking-wider text-[11px]">{selectedOrder.order_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground/60 font-medium">Meja / Lokasi</span>
                <span className="font-bold text-primary dark:text-cream-100">{selectedOrder.table_number || 'Takeaway'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground/60 font-medium">Status Saat Ini</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle[selectedOrder.status]}`}>
                  {statusLabel[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-border">
                <span className="text-muted-foreground/60 font-medium">Waktu Pesan</span>
                <span className="text-primary dark:text-cream-100 font-medium">{selectedOrder.created_at}</span>
              </div>
              <div className="flex justify-between pt-3 text-base">
                <span className="font-bold text-primary dark:text-cream-100">Total Pembayaran</span>
                <span className="font-heading font-bold text-accent text-xl">{fmt(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-accent hover:bg-[#163026] transition-colors shadow-md flex items-center justify-center gap-2"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

