'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  ChefHat,
  AlertTriangle,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Play,
  Check,
  PackageCheck,
  UtensilsCrossed,
  Timer,
  RefreshCw,
  CheckSquare,
  Square,
  BellRing,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useRealtimeOrders, LiveOrder } from '@/features/cashier/hooks/use-realtime-orders';

const channelLabel: Record<string, string> = {
  dine_in: 'Dine In (Makan di Tempat)',
  takeaway: 'Takeaway (Bawa Pulang)',
  delivery: 'Delivery (Pengantaran)',
  online: 'Online Order',
};

// Helper to format ticking elapsed time & determine aging level (8.3 & KDS-002)
function getTicketTiming(timestamp?: number, fallbackText?: string) {
  if (!timestamp) {
    return {
      elapsedFormatted: fallbackText || 'Baru Saja',
      level: 'normal' as const,
      badgeText: '< 5m Normal',
      borderClass: 'border-blue-500/50 hover:border-blue-400',
      headerClass: 'bg-[#163026] text-white border-b border-[#C89B5C]/30',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
    };
  }

  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  const elapsedFormatted = `${minutes < 10 ? '0' : ''}${minutes}m ${remSec < 10 ? '0' : ''}${remSec}s`;

  if (minutes >= 10) {
    return {
      elapsedFormatted,
      level: 'critical' as const,
      badgeText: `🚨 KRITIS (>10m)`,
      borderClass: 'border-red-600 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.35)]',
      headerClass: 'bg-red-700 text-white font-extrabold border-b border-red-500',
      badgeClass: 'bg-white text-red-700 font-extrabold shadow animate-bounce',
    };
  } else if (minutes >= 5) {
    return {
      elapsedFormatted,
      level: 'warning' as const,
      badgeText: `⚠️ PERHATIAN (5-10m)`,
      borderClass: 'border-amber-500 hover:border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
      headerClass: 'bg-amber-700 text-white font-bold border-b border-amber-500',
      badgeClass: 'bg-black/40 text-amber-300 border border-amber-400 font-bold',
    };
  }

  return {
    elapsedFormatted,
    level: 'normal' as const,
    badgeText: '✓ Normal (<5m)',
    borderClass: 'border-[#C89B5C]/50 hover:border-[#C89B5C]',
    headerClass: 'bg-[#1E3D31] text-white border-b border-[#C89B5C]/30',
    badgeClass: 'bg-[#C89B5C]/20 text-[#C89B5C] border border-[#C89B5C]/30',
  };
}

export default function KdsPage() {
  const { orders, loading, liveConnected, newAlert, updateOrderStatus, toggleOrderItemDone } = useRealtimeOrders();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ticker, setTicker] = useState(0);

  // 1-second live ticker loop for elapsed time updating (8.1 & 8.3)
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const testKitchenPing = () => {
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(() => {});
    } catch (e) {
      console.warn('Audio play restricted by browser:', e);
    }
  };

  const activeTickets = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));

  const counts = {
    new: activeTickets.filter((t) => ['pending', 'confirmed'].includes(t.status)).length,
    preparing: activeTickets.filter((t) => t.status === 'preparing').length,
    ready: activeTickets.filter((t) => t.status === 'ready').length,
  };

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 bg-[#0E0C0A] min-h-full relative text-white selection:bg-[#C89B5C]/30">
      {/* 8.2 Realtime Alert Pop */}
      {newAlert && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300 rounded-3xl bg-[#1E3D31] p-5 text-white shadow-2xl border-2 border-[#C89B5C] flex items-center gap-4 max-w-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#C89B5C] text-[#1E3D31] animate-bounce shadow-lg">
            <BellRing size={26} className="stroke-[2.5]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-base font-extrabold text-[#C89B5C] flex items-center gap-1.5">
              <Sparkles size={16} /> Tiket Pesanan Baru Masuk!
            </p>
            <p className="text-xs font-bold text-white mt-1 truncate">
              {newAlert.order_number} — {newAlert.customer_name}
            </p>
            <p className="text-[11px] text-[#E4D9C4]/80 font-mono mt-0.5">
              Meja: <strong>{newAlert.table_number || channelLabel[newAlert.order_type]}</strong> · {newAlert.items_count || 1} Item
            </p>
          </div>
        </div>
      )}

      {/* KDS Header Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-white/15 pb-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E3D31] border-2 border-[#C89B5C] shadow-lg shadow-[#C89B5C]/15">
            <ChefHat size={30} className="text-[#C89B5C]" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
                NEMU <span className="text-[#C89B5C] font-light">Space</span> KDS
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                  liveConnected
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${liveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span>{liveConnected ? 'Real-Time Sync 8.2 Aktif' : 'Offline / Mock Sync Mode'}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#E4D9C4]/75 mt-1 font-sans">
              Kitchen Display System · Timer Keterlambatan Tiket (<strong className="text-amber-400">8.3</strong>) & Sinkronisasi Kasir POS (<strong className="text-[#C89B5C]">8.4</strong>)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Status Counter Badges */}
          <div className="flex gap-2.5 text-xs font-bold bg-[#161412] px-4 py-2.5 rounded-2xl border border-white/15 shadow-inner">
            <span className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
              <Clock size={14} />
              <span>{counts.new} Baru</span>
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
              <Timer size={14} />
              <span>{counts.preparing} Proses</span>
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle size={14} />
              <span>{counts.ready} Siap Saji</span>
            </span>
          </div>

          {/* Test Ping Sound Button */}
          <button
            onClick={testKitchenPing}
            className="flex items-center gap-1.5 rounded-xl border border-[#C89B5C]/50 bg-[#C89B5C]/15 hover:bg-[#C89B5C]/25 px-3.5 py-2.5 text-xs font-bold text-[#C89B5C] transition-all shadow-sm"
            title="Uji Suara Bell Antrean Dapur"
          >
            <BellRing size={15} />
            <span className="hidden sm:inline">Uji Suara Bell</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition-all ${
              audioEnabled
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                : 'border-white/20 bg-white/5 text-white/40 hover:text-white'
            }`}
            title={audioEnabled ? 'Suara Bell Dapur Aktif' : 'Suara Bell Dapur Senyap'}
          >
            {audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
        </div>
      </div>

      {/* 8.1 Kanban 3-Column Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
        <div className="rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r from-blue-700 to-blue-600 shadow-xl border border-blue-400/40 flex items-center justify-center gap-2">
          <Clock size={16} />
          <span>8.1 DITERIMA / TIKET BARU ({counts.new})</span>
        </div>
        <div className="rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest text-white bg-gradient-to-r from-amber-700 to-amber-600 shadow-xl border border-amber-400/40 flex items-center justify-center gap-2">
          <Timer size={16} />
          <span>8.1 PROSES RACIK & MASAK ({counts.preparing})</span>
        </div>
        <div className="rounded-2xl py-3.5 text-xs font-bold uppercase tracking-widest text-[#1E3D31] bg-gradient-to-r from-[#C89B5C] to-[#e4b574] shadow-xl border border-[#C89B5C] flex items-center justify-center gap-2 font-extrabold">
          <PackageCheck size={17} />
          <span>8.1 SIAP SAJI / PICKUP ({counts.ready})</span>
        </div>
      </div>

      {/* Ticket Columns Container */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start pb-12">
        {/* Column 1: New / Pending / Confirmed */}
        <div className="space-y-5">
          {activeTickets
            .filter((t) => ['pending', 'confirmed'].includes(t.status))
            .map((ticket) => {
              const timing = getTicketTiming(ticket.created_timestamp, ticket.created_at);
              const allItemsDone = ticket.items && ticket.items.length > 0 && ticket.items.every((it) => it.done);

              return (
                <div
                  key={ticket.id}
                  className={`rounded-3xl border-2 bg-[#161412] overflow-hidden shadow-2xl transition-all ${timing.borderClass}`}
                >
                  <div className={`px-4 py-3.5 flex items-center justify-between ${timing.headerClass}`}>
                    <div>
                      <p className="font-mono font-extrabold text-white text-base flex items-center gap-2">
                        <span>{ticket.order_number}</span>
                        {ticket.source === 'live' && (
                          <span className="flex items-center gap-0.5 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-[#C89B5C]">
                            <Zap size={11} /> POS Live
                          </span>
                        )}
                      </p>
                      <p className="text-white/90 text-xs font-bold mt-0.5">
                        {ticket.table_number || 'Takeaway'} • {channelLabel[ticket.order_type] || ticket.order_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${timing.badgeClass}`}>
                        <Clock size={13} className={timing.level === 'critical' ? 'animate-spin' : ''} />
                        <span>{timing.elapsedFormatted}</span>
                      </span>
                      <span className="text-[10px] opacity-80">{timing.badgeText}</span>
                    </div>
                  </div>

                  {/* Customer Info Bar */}
                  <div className="px-4 py-2 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span>Tamu: <strong className="text-white font-bold">{ticket.customer_name}</strong></span>
                    <span>Total: <strong className="text-[#C89B5C] font-mono">{ticket.items_count || 1} Item</strong></span>
                  </div>

                  {/* 8.1 Item List with Checklist Toggles */}
                  <div className="p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#C89B5C] flex items-center gap-1">
                      <span>Daftar Item & Kematangan (Klik Checklist):</span>
                    </p>
                    {ticket.items && ticket.items.length > 0 ? (
                      ticket.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleOrderItemDone(ticket.id, item.id)}
                          className={`w-full flex items-start gap-3 rounded-2xl p-3 border text-left transition-all ${
                            item.done
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 opacity-80'
                              : 'bg-white/5 border-white/10 text-white hover:border-[#C89B5C]'
                          }`}
                        >
                          <span className="mt-0.5 text-lg shrink-0">
                            {item.done ? (
                              <CheckSquare size={20} className="text-emerald-400" />
                            ) : (
                              <Square size={20} className="text-white/50" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-bold ${item.done ? 'line-through text-white/60' : 'text-white'}`}>
                                {item.name}
                              </span>
                              <span className="shrink-0 rounded-lg bg-[#C89B5C] text-[#1E3D31] px-2 py-0.5 text-xs font-extrabold font-mono">
                                {item.qty}x
                              </span>
                            </div>
                            {item.note && (
                              <p className={`text-xs mt-1 font-sans ${item.done ? 'text-emerald-400/70' : 'text-amber-400 font-medium'}`}>
                                * Catatan: {item.note}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl bg-white/5 p-3 text-xs text-white/70 italic">
                        Racikan standar minuman / pastry (Tanpa item notes tambahan)
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="bg-black/50 border-t border-white/10 p-4">
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'preparing')}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition-all shadow-lg ${
                        allItemsDone
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                          : 'bg-[#1E3D31] text-[#C89B5C] border border-[#C89B5C] hover:bg-[#163026]'
                      }`}
                    >
                      <Play size={16} />
                      <span>{allItemsDone ? '✨ Semua Checklist Selesai - Mulai Masak' : 'Mulai Masak / Diproses Dapur'}</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}

          {counts.new === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-white/15 p-12 text-center text-white/30 text-xs font-mono space-y-3 bg-white/[0.01]">
              <UtensilsCrossed size={34} className="mx-auto text-white/20" />
              <p>[ KOSONG: TIDAK ADA ANTREAN TIKET BARU ]</p>
            </div>
          )}
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-5">
          {activeTickets
            .filter((t) => t.status === 'preparing')
            .map((ticket) => {
              const timing = getTicketTiming(ticket.created_timestamp, ticket.created_at);
              const allItemsDone = ticket.items && ticket.items.length > 0 && ticket.items.every((it) => it.done);

              return (
                <div
                  key={ticket.id}
                  className={`rounded-3xl border-2 bg-[#161412] overflow-hidden shadow-2xl transition-all ${timing.borderClass}`}
                >
                  <div className={`px-4 py-3.5 flex items-center justify-between bg-amber-700 text-white font-bold border-b border-amber-500`}>
                    <div>
                      <p className="font-mono font-extrabold text-white text-base flex items-center gap-2">
                        <span>{ticket.order_number}</span>
                        {ticket.source === 'live' && (
                          <span className="flex items-center gap-0.5 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Zap size={11} /> POS Live
                          </span>
                        )}
                      </p>
                      <p className="text-amber-100 text-xs font-bold mt-0.5">
                        {ticket.table_number || 'Takeaway'} • {channelLabel[ticket.order_type] || ticket.order_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 ${timing.badgeClass}`}>
                        <Timer size={13} className="animate-spin" />
                        <span>{timing.elapsedFormatted}</span>
                      </span>
                      <span className="text-[10px] text-amber-200">{timing.badgeText}</span>
                    </div>
                  </div>

                  {/* Customer Info Bar */}
                  <div className="px-4 py-2 bg-black/40 border-b border-white/10 flex items-center justify-between text-xs text-white/70">
                    <span>Tamu: <strong className="text-white font-bold">{ticket.customer_name}</strong></span>
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <Flame size={13} /> Sedang Dimasak
                    </span>
                  </div>

                  {/* 8.1 Item List with Checklist Toggles */}
                  <div className="p-4 space-y-2.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <span>Proses Seduh / Plating Item (Klik Selesai):</span>
                    </p>
                    {ticket.items && ticket.items.length > 0 ? (
                      ticket.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => toggleOrderItemDone(ticket.id, item.id)}
                          className={`w-full flex items-start gap-3 rounded-2xl p-3 border text-left transition-all ${
                            item.done
                              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-300 shadow-inner'
                              : 'bg-white/5 border-amber-500/30 text-white hover:border-amber-400'
                          }`}
                        >
                          <span className="mt-0.5 text-lg shrink-0">
                            {item.done ? (
                              <CheckSquare size={20} className="text-emerald-400" />
                            ) : (
                              <Square size={20} className="text-amber-400" />
                            )}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className={`text-sm font-bold ${item.done ? 'line-through text-white/60' : 'text-white'}`}>
                                {item.name}
                              </span>
                              <span className="shrink-0 rounded-lg bg-amber-500 text-black px-2 py-0.5 text-xs font-extrabold font-mono">
                                {item.qty}x
                              </span>
                            </div>
                            {item.note && (
                              <p className={`text-xs mt-1 font-sans ${item.done ? 'text-emerald-400/70' : 'text-amber-300 font-semibold'}`}>
                                * Catatan: {item.note}
                              </p>
                            )}
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="rounded-xl bg-white/5 p-3 text-xs text-white/70 italic">
                        Racikan standar minuman / pastry sedang diselesaikan...
                      </div>
                    )}
                  </div>

                  {/* Action Button (8.4 Sync Trigger) */}
                  <div className="bg-black/50 border-t border-white/10 p-4">
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'ready')}
                      className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-bold transition-all shadow-lg ${
                        allItemsDone
                          ? 'bg-[#C89B5C] hover:bg-[#b88c4d] text-[#1E3D31] font-extrabold scale-[1.01]'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                      }`}
                    >
                      <Check size={18} className="stroke-[3]" />
                      <span>{allItemsDone ? '🌟 Tandai Siap Saji (Kirim Notif ke POS 8.4)' : 'Tandai Siap Saji (Ready)'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {counts.preparing === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-white/15 p-12 text-center text-white/30 text-xs font-mono space-y-3 bg-white/[0.01]">
              <ChefHat size={34} className="mx-auto text-white/20" />
              <p>[ KOSONG: TIDAK ADA PESANAN SEDANG DIMASAK ]</p>
            </div>
          )}
        </div>

        {/* Column 3: Ready */}
        <div className="space-y-5">
          {activeTickets
            .filter((t) => t.status === 'ready')
            .map((ticket) => {
              const timing = getTicketTiming(ticket.created_timestamp, ticket.created_at);

              return (
                <div
                  key={ticket.id}
                  className="rounded-3xl border-2 border-emerald-500 bg-[#161412] overflow-hidden shadow-2xl transition-all hover:border-emerald-400 shadow-emerald-500/10"
                >
                  <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-4 py-3.5 flex items-center justify-between border-b border-emerald-400/40">
                    <div>
                      <p className="font-mono font-extrabold text-white text-base flex items-center gap-2">
                        <span>{ticket.order_number}</span>
                        {ticket.source === 'live' && (
                          <span className="flex items-center gap-0.5 rounded bg-black/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                            <Zap size={11} /> POS Live
                          </span>
                        )}
                      </p>
                      <p className="text-emerald-100 text-xs font-bold mt-0.5">
                        {ticket.table_number || 'Takeaway'} • {channelLabel[ticket.order_type] || ticket.order_type}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white text-emerald-900 flex items-center gap-1.5 shadow">
                        <PackageCheck size={14} />
                        <span>SIAP PICKUP</span>
                      </span>
                    </div>
                  </div>

                  {/* Customer Info Bar */}
                  <div className="px-4 py-2.5 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center justify-between text-xs text-emerald-200">
                    <span>Tamu: <strong className="text-white font-bold">{ticket.customer_name}</strong></span>
                    <span className="font-mono font-bold">Waktu Total: {timing.elapsedFormatted}</span>
                  </div>

                  {/* 8.1 Item List */}
                  <div className="p-4 space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                      <span>✓ Item Siap Diantar / Dipanggil:</span>
                    </p>
                    {ticket.items && ticket.items.length > 0 ? (
                      ticket.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-xl bg-white/5 p-2.5 border border-white/10 text-xs font-semibold text-white"
                        >
                          <span>✓ {item.name} {item.note ? `(${item.note})` : ''}</span>
                          <span className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2 py-0.5 font-mono font-bold">
                            {item.qty}x
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-xl bg-white/5 p-3 text-xs text-white/80 font-semibold">
                        Paket pesanan siap disajikan kepada tamu/pelayan
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="bg-emerald-950/50 border-t border-emerald-500/30 p-4">
                    <button
                      onClick={() => updateOrderStatus(ticket.id, 'completed')}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 py-3.5 text-xs font-bold text-white transition-all shadow-lg active:scale-95"
                    >
                      <CheckCircle size={17} />
                      <span>Selesai Diantar / Diambil oleh Tamu (Completed)</span>
                    </button>
                  </div>
                </div>
              );
            })}

          {counts.ready === 0 && (
            <div className="rounded-3xl border-2 border-dashed border-white/15 p-12 text-center text-white/30 text-xs font-mono space-y-3 bg-white/[0.01]">
              <PackageCheck size={34} className="mx-auto text-white/20" />
              <p>[ KOSONG: BELUM ADA PESANAN SIAP SAJI ]</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
