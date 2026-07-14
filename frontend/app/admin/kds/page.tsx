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

const statusConfig = {
  new: { label: 'Baru', color: 'bg-blue-500', text: 'text-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', header: 'bg-blue-500' },
  preparing: { label: 'Menyiapkan', color: 'bg-amber-500', text: 'text-amber-600', border: 'border-amber-200', bg: 'bg-amber-50', header: 'bg-amber-500' },
  ready: { label: 'Siap', color: 'bg-green-500', text: 'text-green-600', border: 'border-green-200', bg: 'bg-green-50', header: 'bg-green-500' },
};

const channelLabel: Record<string, string> = { pos: 'POS', online: 'Online', qr: 'QR' };

function ElapsedTimer({ createdAt }: { createdAt: Date }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const calc = () => setElapsed(Math.floor((Date.now() - createdAt.getTime()) / 1000));
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [createdAt]);
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isLate = mins >= 8;
  return (
    <span className={`font-mono text-sm font-bold ${isLate ? 'text-red-500 animate-pulse' : 'text-gray-600'}`}>
      {mins}:{String(secs).padStart(2, '0')}
    </span>
  );
}

export default function KdsPage() {
  const [tickets, setTickets] = useState<KdsTicket[]>(MOCK_TICKETS);

  const nextStatus = (current: KdsTicket['status']): KdsTicket['status'] => {
    if (current === 'new') return 'preparing';
    if (current === 'preparing') return 'ready';
    return 'ready';
  };

  const updateStatus = (id: string) => {
    setTickets((prev) =>
      prev.map((t) => t.id === id ? { ...t, status: nextStatus(t.status) } : t)
    );
  };

  const completeTicket = (id: string) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const counts = {
    new: tickets.filter((t) => t.status === 'new').length,
    preparing: tickets.filter((t) => t.status === 'preparing').length,
    ready: tickets.filter((t) => t.status === 'ready').length,
  };

  return (
    <div className="space-y-6 -m-6 lg:-m-8 p-6 lg:p-8 bg-[#0E0C0A] min-h-full">
      {/* KDS Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#BA935D]/20 border border-[#BA935D]/40">
            <ChefHat size={20} className="text-[#BA935D]" />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-white">Kitchen Display System</h1>
            <p className="text-xs text-white/40">Sudirman Flagship · Dapur Utama</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-1.5 text-blue-400"><span className="h-2 w-2 rounded-full bg-blue-500" />{counts.new} Baru</span>
            <span className="flex items-center gap-1.5 text-amber-400"><span className="h-2 w-2 rounded-full bg-amber-500" />{counts.preparing} Proses</span>
            <span className="flex items-center gap-1.5 text-green-400"><span className="h-2 w-2 rounded-full bg-green-500" />{counts.ready} Siap</span>
          </div>
          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 hover:border-[#BA935D]/50 hover:text-[#BA935D] transition-all">
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-3 gap-5 text-center">
        {(['new', 'preparing', 'ready'] as const).map((s) => (
          <div key={s} className={`rounded-full py-2 text-xs font-bold uppercase tracking-widest text-white ${statusConfig[s].color}`}>
            {statusConfig[s].label} ({counts[s]})
          </div>
        ))}
      </div>

      {/* Ticket Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {(['new', 'preparing', 'ready'] as const).map((status) => (
          <div key={status} className="space-y-4">
            {tickets
              .filter((t) => t.status === status)
              .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
              .map((ticket) => {
                const cfg = statusConfig[ticket.status];
                return (
                  <div
                    key={ticket.id}
                    className={`rounded-2xl border-2 ${cfg.border} overflow-hidden shadow-lg transition-all`}
                  >
                    {/* Ticket Header */}
                    <div className={`${cfg.header} px-4 py-3 flex items-center justify-between`}>
                      <div>
                        <p className="font-bold text-white text-sm">{ticket.orderId}</p>
                        <p className="text-white/80 text-xs">{ticket.table} · {channelLabel[ticket.channel]}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-white">
                        <Clock size={13} />
                        <ElapsedTimer createdAt={ticket.createdAt} />
                      </div>
                    </div>

                    {/* Ticket Body */}
                    <div className={`${cfg.bg} px-4 py-4 space-y-2`}>
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${cfg.color} text-[10px] font-bold text-white`}>
                            {item.qty}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-gray-800">{item.name}</p>
                            {item.notes && (
                              <p className="text-xs text-gray-500 italic flex items-center gap-1 mt-0.5">
                                <AlertCircle size={10} /> {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Ticket Actions */}
                    <div className={`${cfg.bg} border-t ${cfg.border} px-4 py-3`}>
                      {ticket.status !== 'ready' ? (
                        <button
                          onClick={() => updateStatus(ticket.id)}
                          className={`w-full rounded-xl py-2.5 text-sm font-bold text-white transition-all active:scale-95 ${cfg.color} hover:opacity-90`}
                        >
                          {ticket.status === 'new' ? '▶ Mulai Proses' : '✓ Tandai Siap'}
                        </button>
                      ) : (
                        <button
                          onClick={() => completeTicket(ticket.id)}
                          className="w-full flex items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 text-sm font-bold text-white hover:bg-green-700 active:scale-95 transition-all"
                        >
                          <CheckCircle size={15} />
                          Pesanan Diambil
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

            {tickets.filter((t) => t.status === status).length === 0 && (
              <div className={`rounded-2xl border-2 border-dashed ${statusConfig[status].border} p-8 text-center`}>
                <p className="text-sm text-gray-400">Tidak ada tiket</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
