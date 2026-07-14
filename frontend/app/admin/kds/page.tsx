'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChefHat, AlertCircle, Volume2 } from 'lucide-react';

interface KdsTicket {
  id: string;
  orderId: string;
  table: string;
  channel: 'pos' | 'online' | 'qr';
  items: { name: string; qty: number; notes?: string }[];
  status: 'new' | 'preparing' | 'ready';
  createdAt: Date;
}

const MOCK_TICKETS: KdsTicket[] = [
  {
    id: 'T001', orderId: '#ORD-1042', table: 'Meja 4', channel: 'pos',
    items: [
      { name: 'Velvet Latte', qty: 1, notes: 'Less sweet, oat milk' },
      { name: 'Butter Croissant', qty: 2 },
    ],
    status: 'new', createdAt: new Date(Date.now() - 2 * 60 * 1000),
  },
  {
    id: 'T002', orderId: '#ORD-1041', table: 'Online', channel: 'online',
    items: [
      { name: 'Iced Macchiato', qty: 2 },
      { name: 'Chocolate Brownie', qty: 1, notes: 'Extra warm' },
    ],
    status: 'preparing', createdAt: new Date(Date.now() - 7 * 60 * 1000),
  },
  {
    id: 'T003', orderId: '#ORD-1040', table: 'Meja 2', channel: 'qr',
    items: [
      { name: 'Golden Cappuccino', qty: 1 },
      { name: 'Espresso Shot', qty: 2 },
    ],
    status: 'ready', createdAt: new Date(Date.now() - 13 * 60 * 1000),
  },
  {
    id: 'T004', orderId: '#ORD-1043', table: 'Meja 7', channel: 'pos',
    items: [
      { name: 'Signature Cold Brew', qty: 3 },
      { name: 'Almond Pastry', qty: 1 },
      { name: 'Club Sandwich', qty: 1 },
    ],
    status: 'new', createdAt: new Date(Date.now() - 1 * 60 * 1000),
  },
  {
    id: 'T005', orderId: '#ORD-1039', table: 'Online', channel: 'online',
    items: [
      { name: 'Uji Matcha Latte', qty: 2, notes: 'Hot, no sugar' },
      { name: 'Tiramisu Slice', qty: 1 },
    ],
    status: 'preparing', createdAt: new Date(Date.now() - 10 * 60 * 1000),
  },
];

import { useRealtimeOrders, LiveOrder } from '@/hooks/useRealtimeOrders';

const statusConfig = {
  pending: { label: 'Baru', color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', header: 'bg-blue-500' },
  confirmed: { label: 'Baru', color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', header: 'bg-blue-500' },
  preparing: { label: 'Menyiapkan', color: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', header: 'bg-amber-500' },
  ready: { label: 'Siap', color: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', header: 'bg-green-500' },
};

const channelLabel: Record<string, string> = { dine_in: 'Dine In', takeaway: 'Takeaway', delivery: 'Delivery', online: 'Online' };

export default function KdsPage() {
  const { orders, loading, liveConnected, newAlert, updateOrderStatus } = useRealtimeOrders();
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Filter out completed and cancelled orders for KDS
  const activeTickets = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));

  const counts = {
    new: activeTickets.filter((t) => ['pending', 'confirmed'].includes(t.status)).length,
    preparing: activeTickets.filter((t) => t.status === 'preparing').length,
    ready: activeTickets.filter((t) => t.status === 'ready').length,
  };

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 bg-[#0E0C0A] min-h-full relative">
      {/* Realtime Alert Pop */}
      {newAlert && (
        <div className="fixed top-6 right-6 z-50 animate-bounce rounded-2xl bg-[#BA935D] p-4 text-white shadow-2xl border-2 border-white/20 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
          <div>
            <p className="font-bold text-sm">🔥 Tiket Pesanan Baru Masuk!</p>
            <p className="text-xs text-white/90">{newAlert.order_number} — {newAlert.customer_name} ({newAlert.table_number || channelLabel[newAlert.order_type]})</p>
          </div>
        </div>
      )}

      {/* KDS Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BA935D]/20 border border-[#BA935D]/40">
            <ChefHat size={20} className="text-[#BA935D]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl font-bold text-white">Kitchen Display System</h1>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${liveConnected ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-500/20 text-gray-400'}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${liveConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                {liveConnected ? 'Live Supabase Connected' : 'Simulasi Offline'}
              </span>
            </div>
            <p className="text-xs text-white/40">Sudirman Flagship · Dapur Utama Real-Time Monitor</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-sm font-bold">
            <span className="flex items-center gap-1.5 text-blue-400"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" />{counts.new} Baru</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" />{counts.preparing} Proses</span>
            <span className="flex items-center gap-1.5 text-green-400"><span className="h-2.5 w-2.5 rounded-full bg-green-500" />{counts.ready} Siap</span>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-all ${audioEnabled ? 'border-[#BA935D] bg-[#BA935D]/20 text-[#BA935D]' : 'border-white/10 text-white/30'}`}
            title="Toggle Notifikasi Suara"
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-center">
        <div className="rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-blue-600 shadow-md">
          Baru Masuk ({counts.new})
        </div>
        <div className="rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-amber-600 shadow-md">
          Sedang Diproses ({counts.preparing})
        </div>
        <div className="rounded-xl py-2.5 text-xs font-bold uppercase tracking-widest text-white bg-green-600 shadow-md">
          Siap Saji ({counts.ready})
        </div>
      </div>

      {/* Ticket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {/* Column 1: New / Pending / Confirmed */}
        <div className="space-y-4">
          {activeTickets
            .filter((t) => ['pending', 'confirmed'].includes(t.status))
            .map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border-2 border-blue-400 overflow-hidden shadow-xl transition-all">
                <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{ticket.order_number}</p>
                    <p className="text-white/80 text-xs">{ticket.table_number || 'Takeaway'} · {channelLabel[ticket.order_type] || ticket.order_type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-mono text-xs">
                    <Clock size={12} />
                    <span>{ticket.created_at || 'Baru'}</span>
                  </div>
                </div>
                <div className="bg-blue-50 px-4 py-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">1x</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Paket Pesanan Artisan</p>
                      <p className="text-xs text-gray-500 italic">Total Item: {ticket.items_count || 1} pcs</p>
                    </div>
                  </div>
                  {ticket.source === 'live' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">⚡ Live Supabase</span>
                  )}
                </div>
                <div className="bg-blue-50 border-t border-blue-200 px-4 py-3">
                  <button
                    onClick={() => updateOrderStatus(ticket.id, 'preparing')}
                    className="w-full rounded-xl py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow"
                  >
                    ▶ Mulai Siapkan
                  </button>
                </div>
              </div>
            ))}
          {activeTickets.filter((t) => ['pending', 'confirmed'].includes(t.status)).length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center text-gray-500 text-xs font-mono">
              [ 0 TIKET BARU ]
            </div>
          )}
        </div>

        {/* Column 2: Preparing */}
        <div className="space-y-4">
          {activeTickets
            .filter((t) => t.status === 'preparing')
            .map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border-2 border-amber-400 overflow-hidden shadow-xl transition-all">
                <div className="bg-amber-600 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{ticket.order_number}</p>
                    <p className="text-white/80 text-xs">{ticket.table_number || 'Takeaway'} · {channelLabel[ticket.order_type] || ticket.order_type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-mono text-xs">
                    <Clock size={12} />
                    <span>{ticket.created_at || 'Proses'}</span>
                  </div>
                </div>
                <div className="bg-amber-50 px-4 py-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white">1x</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Paket Pesanan Artisan</p>
                      <p className="text-xs text-gray-500 italic">Sedang diracik Barista...</p>
                    </div>
                  </div>
                </div>
                <div className="bg-amber-50 border-t border-amber-200 px-4 py-3">
                  <button
                    onClick={() => updateOrderStatus(ticket.id, 'ready')}
                    className="w-full rounded-xl py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all shadow"
                  >
                    ✓ Tandai Siap Saji
                  </button>
                </div>
              </div>
            ))}
          {activeTickets.filter((t) => t.status === 'preparing').length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center text-gray-500 text-xs font-mono">
              [ 0 TIKET DIPROSES ]
            </div>
          )}
        </div>

        {/* Column 3: Ready */}
        <div className="space-y-4">
          {activeTickets
            .filter((t) => t.status === 'ready')
            .map((ticket) => (
              <div key={ticket.id} className="rounded-2xl border-2 border-green-400 overflow-hidden shadow-xl transition-all">
                <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{ticket.order_number}</p>
                    <p className="text-white/80 text-xs">{ticket.table_number || 'Takeaway'} · {channelLabel[ticket.order_type] || ticket.order_type}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-mono text-xs">
                    <CheckCircle size={13} />
                    <span>Siap</span>
                  </div>
                </div>
                <div className="bg-green-50 px-4 py-4 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">✓</span>
                    <div>
                      <p className="text-sm font-bold text-gray-800">Siap Diambil / Diantar</p>
                      <p className="text-xs text-gray-500 italic">Menunggu pelayan / customer</p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 border-t border-green-200 px-4 py-3">
                  <button
                    onClick={() => updateOrderStatus(ticket.id, 'completed')}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 active:scale-95 transition-all shadow"
                  >
                    <CheckCircle size={15} />
                    Pesanan Diambil (Selesai)
                  </button>
                </div>
              </div>
            ))}
          {activeTickets.filter((t) => t.status === 'ready').length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/10 p-8 text-center text-gray-500 text-xs font-mono">
              [ 0 TIKET SIAP ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

