"use client";

import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getAdminDashboardSummary, getAdminTopMenus, getLowStockItems } from "@/shared/services/dashboard.service";
import { Package, ShoppingBag, Utensils, AlertTriangle, CalendarDays } from "lucide-react";

const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

export default function AdminDashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['adminSummary'],
    queryFn: getAdminDashboardSummary,
  });

  const { data: topMenus, isLoading: loadingMenus } = useQuery({
    queryKey: ['adminTopMenus'],
    queryFn: getAdminTopMenus,
  });

  const { data: lowStock, isLoading: loadingStock } = useQuery({
    queryKey: ['adminLowStock'],
    queryFn: getLowStockItems,
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operational Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Pantau aktivitas harian, reservasi, dan stok bahan baku.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-brand-50 text-brand-600 rounded-xl">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Penjualan Hari Ini</p>
              <h3 className="text-2xl font-bold text-gray-900">{loadingSummary ? "..." : formatRupiah(summary?.today_sales || 0)}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Reservasi Hari Ini</p>
              <h3 className="text-2xl font-bold text-gray-900">{loadingSummary ? "..." : summary?.today_reservations || 0}</h3>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Peringatan Stok Menipis</p>
              <h3 className="text-2xl font-bold text-gray-900">{loadingStock ? "..." : lowStock?.length || 0} Item</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Menus */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Menu Terlaris (Bulan Ini)</h3>
          {loadingMenus ? (
             <div className="space-y-4 animate-pulse">
               {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
             </div>
          ) : topMenus && topMenus.length > 0 ? (
            <div className="space-y-4">
              {topMenus.slice(0, 5).map((menu, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{menu.menu_name}</p>
                      <p className="text-xs text-gray-500">{menu.total_quantity} porsi terjual</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600">{formatRupiah(menu.total_revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">Belum ada data penjualan.</div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Stok Menipis & Habis</h3>
          {loadingStock ? (
             <div className="space-y-4 animate-pulse">
               {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-700 rounded-lg" />)}
             </div>
          ) : lowStock && lowStock.length > 0 ? (
            <div className="space-y-4">
              {lowStock.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/50 dark:border-red-900/30 dark:bg-red-900/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-xs text-red-500 font-medium">Batas Minimum: {item.minimum_stock} {item.unit}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-lg">{item.current_stock} <span className="text-sm font-normal">{item.unit}</span></p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center text-center text-green-600 bg-green-50 rounded-xl border border-green-100">
              <Package className="w-10 h-10 mb-2 opacity-80" />
              <p className="font-medium">Semua stok bahan baku aman!</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
