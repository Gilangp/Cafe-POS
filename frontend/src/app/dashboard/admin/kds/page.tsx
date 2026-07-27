'use client';

import { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  Volume2,
  VolumeX,
  Zap,
  Play,
  Check,
  PackageCheck,
  UtensilsCrossed,
  Timer,
  BellRing,
  Circle,
  AlertCircle,
  Coffee
} from 'lucide-react';
import { useRealtimeOrders, LiveOrder } from '@/features/cashier/hooks/use-realtime-orders';

const channelLabel: Record<string, string> = {
  dine_in: 'Makan di Tempat',
  takeaway: 'Bawa Pulang',
  delivery: 'Delivery',
  online: 'Online',
};

function getTicketTiming(timestamp?: number, fallbackText?: string) {
  if (!timestamp) return { elapsed: fallbackText || 'Baru Saja', level: 'normal', color: 'text-gray-500 dark:text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800', pulse: false };
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  const minutes = Math.floor(seconds / 60);
  const remSec = seconds % 60;
  
  let elapsed = '';
  if (minutes >= 60) {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    elapsed = `${hrs}j ${mins}m`;
  } else {
    elapsed = `${minutes < 10 ? '0' : ''}${minutes}:${remSec < 10 ? '0' : ''}${remSec}`;
  }
  
  if (minutes >= 10) return { elapsed, level: 'critical', color: 'text-red-600', bg: 'bg-red-500 text-white shadow-sm animate-pulse', pulse: true };
  if (minutes >= 5) return { elapsed, level: 'warning', color: 'text-accent', bg: 'bg-accent/10 text-accent font-bold border border-accent/20', pulse: false };
  return { elapsed, level: 'normal', color: 'text-primary', bg: 'bg-gray-100 dark:bg-white/10 text-primary dark:text-cream-100', pulse: false };
}

export default function KdsPage() {
  const { orders, loading, liveConnected, newAlert, updateOrderStatus, toggleOrderItemDone } = useRealtimeOrders();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTicker((prev) => prev + 1), 1000);
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
    <div className="flex flex-col h-[calc(100vh-180px)] gap-6">
      
      {/* Realtime Alert Popup */}
      {newAlert && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300 rounded-2xl bg-white dark:bg-[#1A2620] p-5 shadow-card-shadow border border-black/5 dark:border-white/5 flex items-center gap-4 max-w-sm">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-accent shadow-sm">
            <BellRing size={24} className="animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold font-heading text-primary dark:text-cream-100">Pesanan Baru Masuk</p>
            <p className="text-xs text-primary/60 dark:text-cream-400/60 mt-1 truncate">
              {newAlert.order_number} • {newAlert.table_number || channelLabel[newAlert.order_type]}
            </p>
          </div>
        </div>
      )}

      {/* Standard Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 shrink-0">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-extrabold font-heading text-primary dark:text-cream-100 tracking-tight flex items-center gap-3">
            Kitchen Display
            <span className={`px-2.5 py-1 leading-none rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border h-fit mt-1 ${
                liveConnected
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'bg-red-500/10 text-red-500 border-red-500/30'
              }`}>
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${liveConnected ? 'bg-accent animate-pulse' : 'bg-red-500'}`} />
              {liveConnected ? 'Live Sync' : 'Offline'}
            </span>
          </h1>
          <p className="text-primary/70 dark:text-cream-400 font-medium">
            Monitor dan kelola antrean pesanan secara realtime.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-[#1A2620] rounded-xl p-1 border border-black/5 dark:border-white/5 shadow-sm">
             <div className="flex flex-col items-center px-4 py-1 border-r border-black/5 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold text-primary/60 dark:text-cream-400/60 tracking-wider">Baru</span>
                <span className="text-lg font-black text-primary dark:text-cream-100 leading-none mt-1">{counts.new}</span>
             </div>
             <div className="flex flex-col items-center px-4 py-1 border-r border-black/5 dark:border-white/5">
                <span className="text-[10px] uppercase font-bold text-primary/60 dark:text-cream-400/60 tracking-wider">Proses</span>
                <span className="text-lg font-black text-accent leading-none mt-1">{counts.preparing}</span>
             </div>
             <div className="flex flex-col items-center px-4 py-1">
                <span className="text-[10px] uppercase font-bold text-primary/60 dark:text-cream-400/60 tracking-wider">Siap</span>
                <span className="text-lg font-black text-primary dark:text-cream-100 leading-none mt-1">{counts.ready}</span>
             </div>
          </div>

          <div className="flex gap-2">
            <button onClick={testKitchenPing} className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-[#1A2620] text-primary/60 dark:text-cream-400/60 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors border border-black/5 dark:border-white/5 shadow-sm" title="Test Ping">
              <BellRing size={18} />
            </button>
            <button onClick={() => setAudioEnabled(!audioEnabled)} className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors border shadow-sm ${audioEnabled ? 'bg-accent/10 text-accent border-accent/30' : 'bg-white dark:bg-[#1A2620] text-primary/40 dark:text-cream-400/40 border-black/5 dark:border-white/5'}`} title={audioEnabled ? 'Mute' : 'Unmute'}>
              {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Main Board Container */}
      <div className="flex-1 min-h-0 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex lg:grid lg:grid-cols-3 gap-6 lg:gap-8 h-full min-w-max lg:min-w-0 px-1">
          
          {/* COLUMN 1: NEW */}
          <div className="w-[85vw] sm:w-[350px] lg:w-auto flex flex-col h-full shrink-0">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-10 h-10 bg-primary text-accent rounded-xl flex items-center justify-center shadow-sm">
                <Zap size={20} className="stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-bold font-heading text-primary dark:text-cream-100 flex-1">
                Pesanan Baru
              </h2>
              <span className="bg-primary text-accent px-2.5 py-0.5 rounded-lg text-sm font-bold shadow-sm">
                {counts.new}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar pb-10">
              {activeTickets.filter((t) => ['pending', 'confirmed'].includes(t.status)).map((ticket) => {
                const timing = getTicketTiming(ticket.created_timestamp, ticket.created_at);
                const allItemsDone = ticket.items && ticket.items.length > 0 && ticket.items.every((it) => it.done);

                return (
                  <div key={ticket.id} className="bg-white dark:bg-[#1A2620] p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow flex flex-col gap-4 group transition-all shrink-0 hover:-translate-y-1 hover:shadow-lg">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black font-heading text-primary/70 dark:text-cream-400/70">
                            #{ticket.order_number.split('-').pop()}
                          </h3>
                          {ticket.source === 'live' && <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[8px] tracking-widest font-bold uppercase">Live</span>}
                       </div>
                       <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${timing.bg}`}>
                          <Clock size={12} className={timing.level === 'critical' ? 'animate-spin-slow' : ''} />
                          {timing.elapsed}
                       </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-widest uppercase ${
                            ticket.order_type === 'takeaway' ? 'bg-[#1E3D31] text-accent' : 'bg-accent text-white'
                          }`}>
                            {ticket.order_type === 'takeaway' ? 'TAKEAWAY' : 'DINE IN'}
                          </span>
                          <span className="text-sm font-extrabold text-primary dark:text-cream-100">
                            {ticket.customer_name && ticket.customer_name !== 'Pelanggan' 
                              ? `${ticket.customer_name} ${ticket.table_number && ticket.table_number !== 'Pesanan Kasir' && ticket.table_number !== 'Takeaway' ? `(M.${ticket.table_number})` : ''}`
                              : (ticket.table_number && ticket.table_number !== 'Pesanan Kasir' && ticket.table_number !== 'Takeaway' 
                                  ? `Meja ${ticket.table_number}` 
                                  : 'Walk-in')}
                          </span>
                        </div>
                      <div className="text-xs font-bold bg-gray-100 dark:bg-white/10 px-2.5 py-1 rounded-lg text-primary/60 dark:text-cream-400/60">
                        {ticket.items_count} Item
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col gap-2.5 flex-1">
                       {ticket.items?.map(item => (
                          <div key={item.id} className="flex items-start gap-3 text-left">
                             <div className="mt-0.5 shrink-0 text-gray-300 dark:text-gray-600">
                                <Circle size={18}/>
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start gap-2">
                                  <span className="text-[15px] font-bold leading-snug text-primary dark:text-cream-100">{item.name}</span>
                                  <span className="text-sm font-black text-primary/80 dark:text-cream-400/80 shrink-0 mt-0.5">x{item.qty}</span>
                               </div>
                               {item.note && (
                                 <div className="flex flex-wrap gap-1 mt-1.5">
                                   {item.note.split(',').map((n, i) => (
                                     <span key={i} className="px-1.5 py-0.5 rounded bg-amber-100/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[10px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                                       {n.trim()}
                                     </span>
                                   ))}
                                 </div>
                               )}
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Action */}
                    <button onClick={() => updateOrderStatus(ticket.id, 'preparing')} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 bg-primary text-accent hover:bg-primary/90 shadow-md">
                      Mulai Proses
                    </button>
                  </div>
                );
              })}
              {counts.new === 0 && (
                <div className="h-40 flex flex-col items-center justify-center rounded-2xl text-primary/30 dark:text-cream-400/30">
                  <UtensilsCrossed size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-bold">Belum Ada Tiket Baru</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 2: PREPARING */}
          <div className="w-[85vw] sm:w-[350px] lg:w-auto flex flex-col h-full shrink-0">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-10 h-10 bg-accent text-primary rounded-xl flex items-center justify-center shadow-sm">
                <ChefHat size={20} className="stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-bold font-heading text-primary dark:text-cream-100 flex-1">
                Sedang Diproses
              </h2>
              <span className="bg-accent text-primary px-2.5 py-0.5 rounded-lg text-sm font-bold shadow-sm">
                {counts.preparing}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar pb-10">
              {activeTickets.filter((t) => t.status === 'preparing').map((ticket) => {
                const timing = getTicketTiming(ticket.created_timestamp, ticket.created_at);
                const allItemsDone = ticket.items && ticket.items.length > 0 && ticket.items.every((it) => it.done);

                return (
                  <div key={ticket.id} className="bg-white dark:bg-[#1A2620] p-5 rounded-2xl border border-black/5 dark:border-white/5 shadow-card-shadow flex flex-col gap-4 group transition-all shrink-0 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                    {/* Top edge indicator for processing */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-accent/70" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black font-heading text-primary/70 dark:text-cream-400/70">
                            #{ticket.order_number.split('-').pop()}
                          </h3>
                       </div>
                       <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${timing.bg}`}>
                          <Clock size={12} className={timing.level === 'critical' ? 'animate-spin-slow' : ''} />
                          {timing.elapsed}
                       </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-widest uppercase ${
                            ticket.order_type === 'takeaway' ? 'bg-[#1E3D31] text-accent' : 'bg-accent text-white'
                          }`}>
                            {ticket.order_type === 'takeaway' ? 'TAKEAWAY' : 'DINE IN'}
                          </span>
                          <span className="text-sm font-extrabold text-primary dark:text-cream-100">
                            {ticket.customer_name && ticket.customer_name !== 'Pelanggan' 
                              ? `${ticket.customer_name} ${ticket.table_number && ticket.table_number !== 'Pesanan Kasir' && ticket.table_number !== 'Takeaway' ? `(M.${ticket.table_number})` : ''}`
                              : (ticket.table_number && ticket.table_number !== 'Pesanan Kasir' && ticket.table_number !== 'Takeaway' 
                                  ? `Meja ${ticket.table_number}` 
                                  : 'Walk-in')}
                          </span>
                        </div>
                      <div className="text-xs font-bold bg-accent/10 text-accent px-2.5 py-1 rounded-lg">
                        Proses {ticket.items_count} Item
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col gap-2.5 flex-1">
                       {ticket.items?.map(item => (
                          <button key={item.id} onClick={() => toggleOrderItemDone(ticket.id, item.id)} className={`flex items-start gap-3 group text-left transition-all ${item.done ? 'opacity-40' : 'hover:opacity-80'}`}>
                             <div className={`mt-0.5 shrink-0 transition-colors ${item.done ? 'text-accent' : 'text-gray-300 dark:text-gray-600 group-hover:text-gray-400'}`}>
                                {item.done ? <CheckCircle2 size={18} className="fill-accent/20" /> : <Circle size={18}/>}
                             </div>
                             <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start gap-2">
                                  <span className={`text-[15px] font-bold leading-snug ${item.done ? 'line-through text-primary/40' : 'text-primary dark:text-cream-100'}`}>{item.name}</span>
                                  <span className="text-sm font-black text-primary/80 dark:text-cream-400/80 shrink-0 mt-0.5">x{item.qty}</span>
                               </div>
                               {item.note && (
                                 <div className={`flex flex-wrap gap-1 mt-1.5 ${item.done ? 'opacity-40 grayscale' : ''}`}>
                                   {item.note.split(',').map((n, i) => (
                                     <span key={i} className="px-1.5 py-0.5 rounded bg-amber-100/50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[10px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-400">
                                       {n.trim()}
                                     </span>
                                   ))}
                                 </div>
                               )}
                             </div>
                          </button>
                       ))}
                    </div>

                    {/* Action */}
                    <button 
                      onClick={() => updateOrderStatus(ticket.id, 'ready')} 
                      disabled={!allItemsDone}
                      className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 ${
                        allItemsDone 
                          ? 'bg-accent text-primary hover:bg-[#b88c4d] shadow-md cursor-pointer' 
                          : 'bg-gray-100 dark:bg-black/30 text-primary/40 dark:text-cream-400/40 border border-black/5 dark:border-white/5 cursor-not-allowed'
                      }`}>
                      {allItemsDone ? <Check size={18} className="stroke-[3]" /> : null}
                      {allItemsDone ? 'Pesanan Siap' : 'Centang Semua Item Dulu'}
                    </button>
                  </div>
                );
              })}
              {counts.preparing === 0 && (
                <div className="h-40 flex flex-col items-center justify-center rounded-2xl text-primary/30 dark:text-cream-400/30">
                  <ChefHat size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-bold">Dapur Kosong</p>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: READY */}
          <div className="w-[85vw] sm:w-[350px] lg:w-auto flex flex-col h-full shrink-0">
            <div className="flex items-center gap-3 mb-6 px-1">
              <div className="w-10 h-10 bg-primary text-cream-100 rounded-xl flex items-center justify-center shadow-sm">
                <PackageCheck size={20} className="stroke-[2.5]" />
              </div>
              <h2 className="text-lg font-bold font-heading text-primary dark:text-cream-100 flex-1">
                Pesanan Siap
              </h2>
              <span className="bg-primary text-accent px-2.5 py-0.5 rounded-lg text-sm font-bold shadow-sm">
                {counts.ready}
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4 custom-scrollbar pb-10">
              {activeTickets.filter((t) => t.status === 'ready').map((ticket) => {
                const timing = getTicketTiming(ticket.created_timestamp, ticket.created_at);

                return (
                  <div key={ticket.id} className="bg-white dark:bg-[#1A2620] p-5 rounded-2xl border border-primary/20 shadow-card-shadow flex flex-col gap-4 group transition-all shrink-0 hover:-translate-y-1 hover:shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-4">
                       <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black font-heading text-primary/70 dark:text-cream-400/70">
                            #{ticket.order_number.split('-').pop()}
                          </h3>
                       </div>
                       <div className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${timing.bg}`}>
                          <Clock size={12} />
                          {timing.elapsed}
                       </div>
                    </div>

                    {/* Order Info */}
                    <div className="flex items-center justify-between pb-4 border-b border-black/5 dark:border-white/5 mb-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-[4px] text-[10px] font-black tracking-widest uppercase ${
                            ticket.order_type === 'takeaway' ? 'bg-[#1E3D31] text-accent' : 'bg-accent text-white'
                          }`}>
                            {ticket.order_type === 'takeaway' ? 'TAKEAWAY' : 'DINE IN'}
                          </span>
                          <span className="text-sm font-extrabold text-primary dark:text-cream-100">
                            {ticket.customer_name && ticket.customer_name !== 'Pelanggan' 
                              ? `${ticket.customer_name} ${ticket.table_number && ticket.table_number !== 'Pesanan Kasir' && ticket.table_number !== 'Takeaway' ? `(M.${ticket.table_number})` : ''}`
                              : (ticket.table_number && ticket.table_number !== 'Pesanan Kasir' && ticket.table_number !== 'Takeaway' 
                                  ? `Meja ${ticket.table_number}` 
                                  : 'Walk-in')}
                          </span>
                        </div>
                      <div className="text-xs font-bold bg-primary/5 dark:bg-white/5 text-primary dark:text-cream-100 px-2.5 py-1 rounded-lg">
                        Pick-up ({ticket.items_count})
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="flex flex-col gap-2.5 flex-1">
                       {ticket.items?.map(item => (
                          <div key={item.id} className="flex items-start gap-3 text-left">
                             <div className="mt-0.5 shrink-0 text-primary">
                                <CheckCircle2 size={18} className="fill-primary/10" />
                             </div>
                             <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
                                <span className="text-[15px] font-bold leading-snug text-primary/70 dark:text-cream-400/70">{item.name}</span>
                                <span className="text-sm font-black text-primary/60 dark:text-cream-400/60 shrink-0 mt-0.5">x{item.qty}</span>
                             </div>
                          </div>
                       ))}
                    </div>

                    {/* Action */}
                    <button onClick={() => updateOrderStatus(ticket.id, 'completed')} className="w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 mt-2 bg-primary text-cream-100 hover:bg-primary/90 shadow-md">
                      <CheckCircle2 size={18} className="stroke-[3]" />
                      Selesai Diantar / Pick-up
                    </button>
                  </div>
                );
              })}
              {counts.ready === 0 && (
                <div className="h-40 flex flex-col items-center justify-center rounded-2xl text-primary/30 dark:text-cream-400/30">
                  <PackageCheck size={40} className="mb-3 opacity-50" />
                  <p className="text-sm font-bold">Semua Pesanan Diambil</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
