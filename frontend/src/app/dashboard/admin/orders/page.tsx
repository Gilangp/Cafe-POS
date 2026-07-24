'use client';

import { useState } from 'react';
import { Search, Eye, ChevronDown, Download, Sparkles, Loader2, Check, X } from 'lucide-react';
import { useRealtimeOrders, LiveOrder } from '@/features/cashier/hooks/use-realtime-orders';

const statusStyle: Record<string, string> = {
  pending: 'bg-blue-100 text-blue-700',
  new: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-indigo-100 text-indigo-700',
  preparing: 'bg-amber-100 text-amber-700',
  ready: 'bg-green-100 text-green-700',
  completed: 'bg-gray-100 text-gray-600 font-bold',
  cancelled: 'bg-red-100 text-red-500',
};

const statusLabel: Record<string, string> = {
  pending: 'Baru Masuk',
  new: 'Baru',
  confirmed: 'Dikonfirmasi',
  preparing: 'Diproses Dapur',
  ready: 'Siap Diambil',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const channelStyle: Record<string, string> = {
  pos: 'bg-violet-100 text-violet-700',
  dine_in: 'bg-teal-100 text-teal-700',
  takeaway: 'bg-amber-100 text-amber-700',
  online: 'bg-sky-100 text-sky-700',
  delivery: 'bg-rose-100 text-rose-700',
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

export default function OrdersPage() {
  const { orders, loading, liveConnected, updateOrderStatus } = useRealtimeOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<LiveOrder | null>(null);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (o.table_number && o.table_number.toLowerCase().includes(search.toLowerCase()));
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalOmset = filtered
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  const handleExportCSV = () => {
    if (filtered.length === 0) {
      alert('Tidak ada data order untuk diekspor!');
      return;
    }

    const headers = ['ID Order', 'Pelanggan', 'Tipe/Channel', 'Meja/Lokasi', 'Item Count', 'Total (IDR)', 'Status', 'Waktu'];
    const rows = filtered.map((o) => [
      `"${o.order_number}"`,
      `"${o.customer_name}"`,
      `"${o.order_type.toUpperCase()}"`,
      `"${o.table_number || '-'}"`,
      `"${o.items_count || 2}"`,
      `"${o.total}"`,
      `"${statusLabel[o.status] || o.status}"`,
      `"${o.created_at || 'Hari ini'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-orders-velvra-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportStatus('Laporan CSV berhasil diunduh!');
    setTimeout(() => setExportStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Semua Riwayat Order</h1>
            {liveConnected ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Live Supabase Connected
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Offline / Sampel KDS
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Menampilkan seluruh transaksi dari POS Kasir, QR Table Meja, dan Online Ordering
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[#FAF6F0] border border-[#E5D7C3] px-4 py-2 text-right">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Omset Terfilter</p>
            <p className="text-sm font-bold text-[#BA935D] font-serif">{fmt(totalOmset)}</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
          >
            <Download size={16} /> Export CSV / Excel
          </button>
        </div>
      </div>

      {/* Export Notification */}
      {exportStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          {exportStatus}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor order (#ORD-...), nama pelanggan, atau nomor meja..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none rounded-xl border border-gray-200 bg-white py-2.5 pl-4 pr-10 text-sm text-gray-700 focus:border-[#BA935D] focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Baru Masuk</option>
            <option value="preparing">Diproses Dapur</option>
            <option value="ready">Siap Diambil</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat riwayat order dari Supabase Cloud...</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-4">ID Order</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Tipe / Channel</th>
                  <th className="px-6 py-4">Meja / Lokasi</th>
                  <th className="px-6 py-4">Item</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-800">{order.order_number}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{order.customer_name}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${channelStyle[order.order_type] || 'bg-gray-100 text-gray-600'}`}>
                        {order.order_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">{order.table_number || 'Takeaway'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{order.items_count || 2} porsi</td>
                    <td className="px-6 py-4 text-sm font-bold text-[#BA935D] font-serif">{fmt(order.total)}</td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as any)}
                        className={`rounded-full px-3 py-1 text-xs font-bold border-none focus:outline-none cursor-pointer ${statusStyle[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        <option value="pending">Baru Masuk</option>
                        <option value="preparing">Diproses Dapur</option>
                        <option value="ready">Siap Diambil</option>
                        <option value="completed">Selesai</option>
                        <option value="cancelled">Dibatalkan</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">{order.created_at || 'Hari ini'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
                      >
                        <Eye size={13} /> Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Detail Order */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-gray-800">Detail Pesanan {selectedOrder.order_number}</h3>
                <p className="text-xs text-gray-400">Sumber: {selectedOrder.source.toUpperCase()}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Pelanggan:</span>
                <span className="font-bold text-gray-800">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Tipe Layanan:</span>
                <span className="font-bold text-gray-800 uppercase">{selectedOrder.order_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Meja / Lokasi:</span>
                <span className="font-bold text-gray-800">{selectedOrder.table_number || 'Takeaway'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Status Saat Ini:</span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusStyle[selectedOrder.status]}`}>
                  {statusLabel[selectedOrder.status] || selectedOrder.status}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-500">Waktu Pesan:</span>
                <span className="text-gray-700">{selectedOrder.created_at || 'Hari ini'}</span>
              </div>
              <div className="flex justify-between pt-2 text-base">
                <span className="font-bold text-gray-800">Total Pembayaran:</span>
                <span className="font-serif font-bold text-[#BA935D] text-lg">{fmt(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full rounded-xl bg-[#12100E] py-2.5 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
