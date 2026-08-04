'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCashierSummary, getTodayReservations, TodayReservation } from '@/shared/services/dashboard.service';
import { TrendingUp, CreditCard, CalendarCheck, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
const t = {
  dashboard: {
    cashier: {
      loading: 'Memuat data...',
      errorTitle: 'Gagal Memuat',
      title: 'Dashboard Kasir',
      desc: 'Ringkasan aktivitas kasir hari ini',
      openPOS: 'Buka POS',
      revenue: 'Total Pendapatan Hari Ini',
      transactions: 'transaksi',
      reservations: 'Reservasi Hari Ini',
    }
  }
};

export function CashierDashboard() {
  const [data, setData] = useState<{ transaction_count: number; total_revenue: number; reservations: TodayReservation[] }>({ transaction_count: 0, total_revenue: 0, reservations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCashierData();
  }, []);

  const fetchCashierData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, reservationRes] = await Promise.all([
        getCashierSummary(),
        getTodayReservations(),
      ]);
      setData({
        transaction_count: summaryRes.transaction_count || 0,
        total_revenue: summaryRes.total_revenue || 0,
        reservations: reservationRes || [],
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch cashier dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center flex-col gap-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-foreground/60 font-medium">{t.dashboard.cashier.loading}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] w-full items-center justify-center">
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 max-w-lg text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-bold text-destructive mb-2">{t.dashboard.cashier.errorTitle}</h2>
          <p className="text-destructive/80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-foreground tracking-tight">
            {t.dashboard.cashier.title}
          </h1>
          <p className="text-foreground/70 font-medium">
            {t.dashboard.cashier.desc}
          </p>
        </div>
        <Link href="/dashboard/pos">
          <div className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-6 py-3 rounded-xl text-sm hover:bg-accent/90 transition-colors shadow-md cursor-pointer">
            <span>{t.dashboard.cashier.openPOS}</span>
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-md"
        >
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.cashier.revenue}</p>
          <h3 className="text-3xl font-bold font-heading text-foreground mb-2">
            {formatCurrency(data.total_revenue)}
          </h3>
          <p className="text-sm text-foreground/60">{data.transaction_count} {t.dashboard.cashier.transactions}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-6 rounded-2xl border border-border shadow-md"
        >
          <p className="text-sm font-semibold text-foreground/60 mb-1">{t.dashboard.cashier.reservations}</p>
          <h3 className="text-3xl font-bold font-heading text-foreground mb-2">
            {data.reservations.length}
          </h3>
          <div className="space-y-2">
            {data.reservations.slice(0, 3).map(res => (
              <div key={res.id} className="text-sm text-foreground/80">{res.customer_name} - {res.time}</div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
