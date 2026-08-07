"use client";

import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getCashierSummary, getTodayReservations } from "@/shared/services/dashboard.service";
import { Calculator, CalendarDays, Clock, CreditCard, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

export default function CashierDashboard() {
  const { user } = useAuthStore();
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['cashierSummary'],
    queryFn: getCashierSummary,
  });

  const { data: reservations, isLoading: loadingReservations } = useQuery({
    queryKey: ['cashierReservations'],
    queryFn: getTodayReservations,
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Halo, {user?.name}! 👋</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Selamat bekerja, ini adalah ringkasan shift Anda saat ini.</p>
        </div>
      </div>

      {/* POS Shortcut (Giant Call to Action) */}
      <Link href="/pos" className="block group">
        <div className="bg-gradient-to-r from-brand-600 to-brand-500 rounded-3xl p-8 sm:p-10 shadow-lg shadow-brand-500/20 relative overflow-hidden transition-transform transform group-hover:scale-[1.01]">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-white">
              <h2 className="text-3xl font-extrabold mb-2">Buka Aplikasi POS</h2>
              <p className="text-brand-100 max-w-sm">Mulai melayani pelanggan dan catat transaksi baru sekarang.</p>
            </div>
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center group-hover:bg-white/30 transition-colors">
               <Calculator className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </Link>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pendapatan Shift Ini</p>
              <h3 className="text-3xl font-bold text-gray-900">{loadingSummary ? "..." : formatRupiah(summary?.total_revenue || 0)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Jumlah Transaksi Shift Ini</p>
              <h3 className="text-3xl font-bold text-gray-900">{loadingSummary ? "..." : summary?.transaction_count || 0} Trx</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Today Reservations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-gray-400" />
            Reservasi Hari Ini
          </h3>
          <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
            {reservations?.length || 0} Menunggu
          </span>
        </div>
        
        {loadingReservations ? (
             <div className="space-y-4 animate-pulse">
               {[...Array(2)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
             </div>
        ) : reservations && reservations.length > 0 ? (
          <div className="space-y-3">
            {reservations.map((res, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col">
                  <p className="font-semibold text-gray-900 dark:text-white text-lg">{res.customer_name}</p>
                  <p className="text-sm text-gray-500">Jam: <span className="font-bold text-brand-600">{res.time}</span> • {res.number_of_people} Orang</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center justify-center text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
             <CalendarDays className="w-8 h-8 text-gray-300 mb-2" />
             <p>Tidak ada reservasi hari ini.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
