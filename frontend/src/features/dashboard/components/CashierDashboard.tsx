'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCashierSummary, getTodayReservations, TodayReservation } from '@/shared/services/dashboard.service';
import { getActiveTickets, KdsTicket } from '@/shared/services/kds.service';
import { DollarSign, CalendarCheck, Loader2, AlertCircle, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const t = {
  dashboard: {
    cashier: {
      loading: 'Memuat data...', errorTitle: 'Gagal Memuat',
      title: 'Dashboard Kasir', desc: 'Ringkasan aktivitas kasir hari ini',
      openPOS: 'Buka POS', revenue: 'Total Pendapatan Hari Ini',
      transactions: 'transaksi', reservations: 'Reservasi Hari Ini',
      readyOrders: 'Pesanan Siap Disajikan', noReady: 'Belum ada pesanan siap.',
      table: 'Meja',
    }
  }
};

export function CashierDashboard() {
  const [data, setData] = useState<{ transaction_count: number; total_revenue: number; reservations: TodayReservation[] }>({ transaction_count: 0, total_revenue: 0, reservations: [] });
  const [readyTickets, setReadyTickets] = useState<KdsTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchCashierData(); fetchReadyTickets(); const i = setInterval(fetchReadyTickets, 15000); return () => clearInterval(i); }, []);

  const fetchCashierData = async () => {
    setError('');
    try {
      const [summaryRes, reservationRes] = await Promise.all([getCashierSummary(), getTodayReservations()]);
      setData({ transaction_count: summaryRes.transaction_count || 0, total_revenue: summaryRes.total_revenue || 0, reservations: reservationRes || [] });
    } catch (err: any) { setError(err?.response?.data?.message || 'Gagal memuat data'); }
    setLoading(false);
  };

  const fetchReadyTickets = async () => {
    try { const t = await getActiveTickets(); setReadyTickets((t || []).filter(tk => tk.status === 'siap')); } catch {}
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
        <p className="text-muted-foreground font-medium">{t.dashboard.cashier.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-8 max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">{t.dashboard.cashier.errorTitle}</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold font-heading text-foreground tracking-tight">{t.dashboard.cashier.title}</h1>
          <p className="text-muted-foreground font-medium">{t.dashboard.cashier.desc}</p>
        </div>
        <Link href="/dashboard/pos">
          <div className="inline-flex items-center gap-2 bg-accent text-primary font-semibold px-6 py-3 rounded-xl text-sm hover:bg-accent/90 transition-colors shadow-sm cursor-pointer">
            <span>{t.dashboard.cashier.openPOS}</span>
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-muted-foreground">{t.dashboard.cashier.revenue}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
              <DollarSign size={20} className="text-success" />
            </div>
          </div>
          <h3 className="text-3xl font-bold font-heading text-foreground mb-2">{formatCurrency(data.total_revenue)}</h3>
          <p className="text-sm text-muted-foreground">{data.transaction_count} {t.dashboard.cashier.transactions}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-muted-foreground">{t.dashboard.cashier.reservations}</p>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-500/10">
              <CalendarCheck size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-3xl font-bold font-heading text-foreground mb-2">{data.reservations.length}</h3>
          <div className="space-y-2">
            {data.reservations.slice(0, 3).map(res => (
              <div key={res.id} className="text-sm text-muted-foreground">{res.customer_name} - {res.time}</div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-border bg-muted/30 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-success" />
          <h2 className="text-lg font-semibold font-heading text-foreground">{t.dashboard.cashier.readyOrders}</h2>
          {readyTickets.length > 0 && (
            <span className="ml-auto bg-success/10 text-success text-xs font-bold px-2.5 py-0.5 rounded-full">{readyTickets.length}</span>
          )}
        </div>
        <div className="p-4">
          {readyTickets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {readyTickets.map(ticket => (
                <div key={ticket.id} className="flex items-center justify-between p-3 rounded-xl bg-success/5 border border-success/20">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">#{ticket.ticket_number || ticket.transaction?.invoice_number?.slice(-4)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {ticket.transaction?.customer_name || 'Pelanggan'}
                      {ticket.transaction?.order_type === 'dine_in' && ticket.transaction?.table_number ? ` · ${t.dashboard.cashier.table} ${ticket.transaction.table_number}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0 ml-3"><Clock size={12} />{ticket.elapsed_minutes}m</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">{t.dashboard.cashier.noReady}</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
