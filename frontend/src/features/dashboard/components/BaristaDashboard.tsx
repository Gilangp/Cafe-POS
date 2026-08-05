'use client';

import React, { useEffect, useState } from 'react';
import { getActiveTickets, updateTicketStatus, KdsTicket } from '@/shared/services/kds.service';
import { Loader2, ChefHat, CheckCircle2, Clock, PlayCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function BaristaDashboard() {
  const [tickets, setTickets] = useState<KdsTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      const data = await getActiveTickets();
      setTickets(data || []);
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Gagal memuat tiket pesanan KDS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: 'diterima' | 'diproses' | 'siap' | 'disajikan') => {
    setIsUpdating(id);
    try {
      await updateTicketStatus(id, newStatus);
      await fetchTickets();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Gagal memperbarui status pesanan.');
    } finally {
      setIsUpdating(null);
    }
  };

  const pendingTickets = tickets.filter(t => t.status === 'diterima');
  const processingTickets = tickets.filter(t => t.status === 'diproses');
  const readyTickets = tickets.filter(t => t.status === 'siap');

  const TicketCard = ({ ticket }: { ticket: KdsTicket }) => {
    const isLate = ticket.elapsed_minutes > 15;
    const isWarning = ticket.elapsed_minutes > 10;
    
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-xl border border-border shadow-sm p-4 flex flex-col relative overflow-hidden group hover:border-accent/30 transition-all"
      >
        <div className="flex justify-between items-start mb-3 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-md uppercase tracking-wider">
                #{ticket.ticket_number || ticket.transaction.invoice_number.slice(-4)}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                ticket.transaction.order_type === 'takeaway' 
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {ticket.transaction.order_type === 'takeaway' ? 'TAKEAWAY' : `DINE IN ${ticket.transaction.table_number ? `(Meja ${ticket.transaction.table_number})` : ''}`}
              </span>
            </div>
            <h3 className="font-semibold text-foreground truncate max-w-[180px]">
              {ticket.transaction.customer_name || 'Pelanggan'}
            </h3>
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${
            isLate ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
            : isWarning ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
            : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
          }`}>
            <Clock size={12} />
            {ticket.elapsed_minutes} m
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar mb-3 max-h-[150px]">
          <ul className="space-y-2">
            {ticket.items.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-sm">
                <span className="font-bold text-muted-foreground min-w-[20px]">{item.quantity}x</span>
                <div className="flex-1">
                  <span className="font-semibold text-foreground">{item.menu_name_snapshot}</span>
                  {item.note && (
                    <p className="text-xs text-muted-foreground mt-0.5 border-l-2 border-border pl-2 italic">
                      {item.note}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto pt-3 border-t border-border">
          {ticket.status === 'diterima' && (
            <button
              onClick={() => handleUpdateStatus(ticket.id, 'diproses')}
              disabled={isUpdating === ticket.id}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50"
            >
              {isUpdating === ticket.id ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
              Mulai Proses
            </button>
          )}
          {ticket.status === 'diproses' && (
            <button
              onClick={() => handleUpdateStatus(ticket.id, 'siap')}
              disabled={isUpdating === ticket.id}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-accent hover:bg-accent/90 text-primary transition-colors disabled:opacity-50"
            >
              {isUpdating === ticket.id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Pesanan Siap
            </button>
          )}
          {ticket.status === 'siap' && (
            <button
              onClick={() => handleUpdateStatus(ticket.id, 'disajikan')}
              disabled={isUpdating === ticket.id}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-colors disabled:opacity-50"
            >
              {isUpdating === ticket.id ? <Loader2 size={16} className="animate-spin" /> : <ChefHat size={16} />}
              Tandai Selesai / Disajikan
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Memuat tiket dapur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="max-w-md rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h2 className="mb-2 text-lg font-semibold text-destructive">Gagal Memuat KDS</h2>
          <p className="text-sm text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] min-h-[600px] overflow-hidden -m-4 sm:m-0">
      <div className="flex items-center justify-between px-4 sm:px-0 mb-4 shrink-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            Kitchen Display <span className="bg-accent text-primary text-xs px-2 py-1 rounded-lg uppercase tracking-wider font-heading">Live</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Papan antrian pesanan real-time.</p>
        </div>
        <button 
          onClick={fetchTickets}
          className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors shadow-sm"
        >
          <RefreshCw size={14} className={isUpdating ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-x-auto custom-scrollbar gap-4 pb-4 px-4 sm:px-0">
        
        <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col bg-muted/30 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
            <h2 className="text-base font-semibold flex items-center gap-2 text-foreground">
              <span className="w-3 h-3 rounded-full bg-red-400 animate-pulse"></span>
              Pesanan Baru
            </h2>
            <span className="bg-card px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm text-muted-foreground">
              {pendingTickets.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            <AnimatePresence>
              {pendingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
              {pendingTickets.length === 0 && (
                <div className="h-32 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  Tidak ada pesanan baru
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col bg-muted/30 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
            <h2 className="text-base font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <ChefHat size={18} />
              Sedang Diproses
            </h2>
            <span className="bg-card px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm text-blue-600 dark:text-blue-400">
              {processingTickets.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            <AnimatePresence>
              {processingTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
              {processingTickets.length === 0 && (
                <div className="h-32 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  Belum ada pesanan diproses
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex-1 min-w-[300px] max-w-[400px] flex flex-col bg-muted/30 rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border bg-card/50 flex items-center justify-between shrink-0">
            <h2 className="text-base font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={18} />
              Selesai / Siap
            </h2>
            <span className="bg-card px-2.5 py-0.5 rounded-lg text-xs font-bold shadow-sm text-emerald-600 dark:text-emerald-400">
              {readyTickets.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            <AnimatePresence>
              {readyTickets.map(ticket => <TicketCard key={ticket.id} ticket={ticket} />)}
              {readyTickets.length === 0 && (
                <div className="h-32 flex items-center justify-center text-sm font-medium text-muted-foreground">
                  Kosong
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
}
