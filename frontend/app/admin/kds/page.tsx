'use client';

import { useState } from 'react';
import {
  Clock,
  CheckCircle,
  ChefHat,
  AlertTriangle,
  Volume2,
  Flame,
  Zap,
  Play,
  Check,
  PackageCheck,
  UtensilsCrossed,
  Timer,
  RefreshCw,
} from 'lucide-react';
import { useRealtimeOrders, LiveOrder } from '@/hooks/useRealtimeOrders';

const channelLabel: Record<string, string> = {
  dine_in: 'Dine In (Makan di Tempat)',
  takeaway: 'Takeaway (Bawa Pulang)',
  delivery: 'Delivery (Pengantaran)',
  online: 'Online Order',
};

// Helper function to calculate ticket aging level (KDS-002)
function getAgingStatus(timeStr?: string) {
  if (!timeStr) return { level: 'normal', text: 'Baru', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
  
  // If timeStr is "Baru saja" or "x menit lalu" or HH:MM
  let minutes = 0;
  if (timeStr.includes('menit')) {
    const num = parseInt(timeStr);
    if (!isNaN(num)) minutes = num;
  } else if (timeStr.includes(':')) {
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const now = new Date();
      const orderTime = new Date();
      orderTime.setHours(h, m, 0, 0);
      minutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    } catch (e) {}
  }

  if (minutes >= 20) {
    return { level: 'critical', text: `${minutes}m (Kritis!)`, badge: 'bg-red-500 text-white animate-pulse border-red-600 font-bold' };
  } else if (minutes >= 10) {
    return { level: 'warning', text: `${minutes}m (Perhatian)`, badge: 'bg-amber-500 text-white border-amber-600 font-bold' };
  }
  return { level: 'normal', text: minutes > 0 ? `${minutes}m` : 'Baru Saja', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
}

export default function KdsPage() {
  const { orders, loading, liveConnected, newAlert, updateOrderStatus } = useRealtimeOrders();
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Filter out completed and cancelled orders for KDS live tracking (KDS-001)
  const activeTickets = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));

  const counts = {
    new: activeTickets.filter((t) => ['pending', 'confirmed'].includes(t.status)).length,
    preparing: activeTickets.filter((t) => t.status === 'preparing').length,
    ready: activeTickets.filter((t) => t.status === 'ready').length,
  };

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 bg-[#0E0C0A] min-h-full relative text-white">
      {/* Realtime Alert Pop (Zero Emoji Compliance) */}
      {newAlert && (
        <div className="fixed top-6 right-6 z-50 animate-bounce rounded-2xl bg-[#BA935D] p-4 text-white shadow-2xl border-2 border-white/20 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 animate-pulse">
            <Flame size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm flex items-center gap-1.5">
              <span>Tiket Pesanan Baru Masuk!</span>
            </p>
            <p className="text-xs text-white/90 font-mono mt-0.5">
              {newAlert.order_number} — {newAlert.customer_name} ({newAlert.table_number || channelLabel[newAlert.order_type]})
            </p>
          </div>
        </div>
      )}

      {/* KDS Header */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#BA935D]/20 border border-[#BA935D]/40">
            <ChefHat size={24} className="text-[#BA935D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-2xl font-bold text-white tracking-wide">Kitchen Display System (KDS)</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  liveConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-gray-500/20 text-gray-400 border border-white/10'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${liveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'}`} />
                <span>{liveConnected ? 'Terhubung API Supabase / Laravel Live' : 'Mode Simulasi Offline'}</span>
              </span>
            </div>
            <p className="text-xs text-white/50 mt-0.5">
              Pantau waktu pemrosesan tiket (*Aging Ticket* <strong className="text-amber-400">KDS-002</strong>) & alur status dapur secara *real-time* (<strong className="text-emerald-400">KDS-003</strong>).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-xs font-bold bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span className="flex items-center gap-1.5 text-blue-400">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              <span>{counts.new} Baru Masuk</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{counts.preparing} Sedang Dimasak</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{counts.ready} Siap Diantar</span>
            </span>
          </div>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all ${
              audioEnabled ? 'border-[#BA935D] bg-[#BA935D]/20 text-[#BA935D]' : 'border-white/10 text-white/30 hover:bg-white/5'
            }`}
            title="Aktifkan/Nonaktifkan Suara Notifikasi Tiket"
          >
            <Volume2 size={18} />
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
        <div className="rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-white bg-blue-600/90 shadow-lg border border-blue-400/30 flex items-center justify-center gap-2">
          <Clock size={15} />
          <span>Antrean Tiket Baru ({counts.new})</span>
        </div>
        <div className="rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-white bg-amber-600/90 shadow-lg border border-amber-400/30 flex items-center justify-center gap-2">
          <Timer size={15} />
          <span>Proses Racik & Masak ({counts.preparing})</span>
        </div>
        <div className="rounded-xl py-3 text-xs font-bold uppercase tracking-widest text-white bg-emerald-600/90 shadow-lg border border-emerald-400/30 flex items-center justify-center gap-2">
          <CheckCircle size={15} />
          <span>Siap Saji / Pickup ({counts.ready})</span>
        </div>
      </div>

      {/* Ticket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Column 1: New / Pending / Confirmed */}
        <div className="space-y-4">
          {activeTickets
            .filter((t) => ['pending', 'confirmed'].includes(t.status))
            .map((ticket) => {
              const aging = getAgingStatus(ticket.created_at);
              return (
                <div key={ticket.id} className="rounded-2xl border-2 border-blue-500/60 bg-[#161412] overflow-hidden shadow-2xl transition-all hover:border-blue-400">
                  <div className="bg-blue-600/90 px-4 py-3 flex items-center justify-between border-b border-blue-400/30">
                    <div>
                      <p className="font-mono font-bold text-white text-sm flex items-center gap-2">
                        <span>{ticket.order_number}</span>
                        {ticket.source === 'live' && (
                          <span className="flex items-center gap-0.5 rounded bg-blue-900/60 px-1.5 py-0.5 text-[9px] font-bold text-blue-200">
                            <Zap size={9} /> Live
                          </span>
                        )}
                      </p>
                      <p className="text-blue-100 text-xs font-semibold mt-0.5">
                        {ticket.table_number || 'Takeaway / Walk-in'} • {channelLabel[ticket.order_type] || ticket.order_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${aging.badge}`}>
                        <Timer size={10} />
                        <span>{aging.text}</span>
                      </span>
                      <span className="text-[10px] text-blue-200 font-mono">{ticket.created_at || 'Baru'}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/60 pb-2 border-b border-white/10">
                      <span>Pelanggan: <strong className="text-white">{ticket.customer_name}</strong></span>
                      <span>Total: <strong className="text-[#BA935D] font-mono">{ticket.items_count || 1} Item</strong></span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5 border border-white/5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white font-mono">
                          {ticket.items_count || 1}x
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white leading-snug">Paket Pesanan Artisan / Minuman</p>
                          <p className="text-xs text-white/50 italic mt-0.5">Catatan: Racikan standar sesuai pesanan {ticket.order_type}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-950/40 border-t border-blue-500/20 p-3.5">
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'preparing')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-95 transition-all shadow-md"
                    >
                      <Play size={14} />
                      <span>Mulai Masak / Siapkan Pesanan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          {activeTickets.filter((t) => ['pending', 'confirmed'].includes(t.status)).length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-10 text-center text-white/30 text-xs font-mono space-y-2 bg-white/[0.02]">
              <UtensilsCrossed size={28} className="mx-auto text-white/20" />
              <p>[ KOSONG: TIDAK ADA TIKET BARU ]</p>
            </div>
          )}
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-4">
          {activeTickets
            .filter((t) => t.status === 'preparing')
            .map((ticket) => {
              const aging = getAgingStatus(ticket.created_at);
              return (
                <div key={ticket.id} className="rounded-2xl border-2 border-amber-500/60 bg-[#161412] overflow-hidden shadow-2xl transition-all hover:border-amber-400">
                  <div className="bg-amber-600/90 px-4 py-3 flex items-center justify-between border-b border-amber-400/30">
                    <div>
                      <p className="font-mono font-bold text-white text-sm flex items-center gap-2">
                        <span>{ticket.order_number}</span>
                        {ticket.source === 'live' && (
                          <span className="flex items-center gap-0.5 rounded bg-amber-900/60 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                            <Zap size={9} /> Live
                          </span>
                        )}
                      </p>
                      <p className="text-amber-100 text-xs font-semibold mt-0.5">
                        {ticket.table_number || 'Takeaway / Walk-in'} • {channelLabel[ticket.order_type] || ticket.order_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border flex items-center gap-1 ${aging.badge}`}>
                        <Timer size={10} />
                        <span>{aging.text}</span>
                      </span>
                      <span className="text-[10px] text-amber-200 font-mono">{ticket.created_at || 'Proses'}</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/60 pb-2 border-b border-white/10">
                      <span>Pelanggan: <strong className="text-white">{ticket.customer_name}</strong></span>
                      <span>Status: <strong className="text-amber-400">Racik Dapur</strong></span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5 border border-white/5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-600 text-xs font-bold text-white font-mono">
                          {ticket.items_count || 1}x
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white leading-snug">Paket Pesanan Artisan / Minuman</p>
                          <p className="text-xs text-amber-300/80 italic mt-0.5">Sedang diseduh / diracik oleh Barista...</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-950/40 border-t border-amber-500/20 p-3.5">
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'ready')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all shadow-md"
                    >
                      <Check size={16} />
                      <span>Tandai Siap Saji (Ready)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          {activeTickets.filter((t) => t.status === 'preparing').length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-10 text-center text-white/30 text-xs font-mono space-y-2 bg-white/[0.02]">
              <ChefHat size={28} className="mx-auto text-white/20" />
              <p>[ KOSONG: TIDAK ADA PESANAN DIMASAK ]</p>
            </div>
          )}
        </div>

        {/* Column 3: Ready */}
        <div className="space-y-4">
          {activeTickets
            .filter((t) => t.status === 'ready')
            .map((ticket) => {
              const aging = getAgingStatus(ticket.created_at);
              return (
                <div key={ticket.id} className="rounded-2xl border-2 border-emerald-500/60 bg-[#161412] overflow-hidden shadow-2xl transition-all hover:border-emerald-400">
                  <div className="bg-emerald-600/90 px-4 py-3 flex items-center justify-between border-b border-emerald-400/30">
                    <div>
                      <p className="font-mono font-bold text-white text-sm flex items-center gap-2">
                        <span>{ticket.order_number}</span>
                        {ticket.source === 'live' && (
                          <span className="flex items-center gap-0.5 rounded bg-emerald-900/60 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                            <Zap size={9} /> Live
                          </span>
                        )}
                      </p>
                      <p className="text-emerald-100 text-xs font-semibold mt-0.5">
                        {ticket.table_number || 'Takeaway / Walk-in'} • {channelLabel[ticket.order_type] || ticket.order_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white text-emerald-800 flex items-center gap-1 shadow">
                        <PackageCheck size={11} />
                        <span>SIAP SAJI</span>
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white/60 pb-2 border-b border-white/10">
                      <span>Pelanggan: <strong className="text-white">{ticket.customer_name}</strong></span>
                      <span>Status: <strong className="text-emerald-400 font-bold">Menunggu Pengambilan</strong></span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2.5 rounded-xl bg-white/5 p-2.5 border border-white/5">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white font-mono">
                          ✓
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white leading-snug">Paket Pesanan Artisan / Minuman</p>
                          <p className="text-xs text-emerald-300/80 italic mt-0.5">Selesai dikemas / disajikan. Panggil nomor antrean / antar ke meja.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-950/40 border-t border-emerald-500/20 p-3.5">
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'completed')}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all shadow-md"
                    >
                      <CheckCircle size={15} />
                      <span>Selesai Diambil / Diantar (Completed)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          {activeTickets.filter((t) => t.status === 'ready').length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-10 text-center text-white/30 text-xs font-mono space-y-2 bg-white/[0.02]">
              <PackageCheck size={28} className="mx-auto text-white/20" />
              <p>[ KOSONG: TIDAK ADA TIKET SIAP SAJI ]</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
