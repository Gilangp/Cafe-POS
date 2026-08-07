"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Package, ShoppingBag, Utensils, AlertTriangle, CalendarDays } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary, getSalesChart, getTopMenus } from "@/shared/services/dashboard.service";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const formatRupiah = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

export default function OwnerDashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['ownerSummary'],
    queryFn: getDashboardSummary,
  });

  const { data: chartData, isLoading: loadingChart } = useQuery({
    queryKey: ['ownerSalesChart', 'weekly'],
    queryFn: () => getSalesChart('weekly'),
  });

  const { data: topMenus, isLoading: loadingMenus } = useQuery({
    queryKey: ['ownerTopMenus'],
    queryFn: getTopMenus,
  });

  // Chart Options
  const chartOptions: ApexOptions = {
    colors: ["#C89B5C", "#2F2F2F"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    xaxis: {
      categories: chartData?.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      }) || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (val) => `Rp ${(val / 1000000).toFixed(1)}Jt` },
    },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] }
    },
    tooltip: {
      y: { formatter: (val) => formatRupiah(val) }
    }
  };

  const chartSeries = [
    { name: "Pendapatan", data: chartData?.map(d => d.revenue) || [] }
  ];

  const donutOptions: ApexOptions = {
    chart: { fontFamily: "Outfit, sans-serif", type: "donut" },
    labels: topMenus?.slice(0, 5).map(m => m.menu_name) || [],
    colors: ["#C89B5C", "#4A4A4A", "#8F8F8F", "#D9D9D9", "#F2F2F2"],
    dataLabels: { enabled: false },
    legend: { position: "bottom", fontFamily: "Outfit" },
    tooltip: {
      y: { formatter: (val) => `${val} terjual` }
    }
  };

  const donutSeries = topMenus?.slice(0, 5).map(m => m.total_quantity) || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Ringkasan performa bisnis dan analitik keseluruhan.</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Pendapatan Bulan Ini", value: loadingSummary ? "..." : formatRupiah(summary?.this_month_revenue || 0), icon: TrendingUp },
          { title: "Pendapatan Hari Ini", value: loadingSummary ? "..." : formatRupiah(summary?.today_revenue || 0), icon: ShoppingBag },
          { title: "Total Transaksi", value: loadingSummary ? "..." : summary?.total_transactions_all_time || 0, icon: Users },
          { title: "Reservasi Hari Ini", value: loadingSummary ? "..." : summary?.today_reservations_count || 0, icon: CalendarDays },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400 rounded-xl">
                <item.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{item.title}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Grafik Pendapatan (7 Hari Terakhir)</h3>
          {loadingChart ? (
             <div className="w-full h-[300px] flex items-center justify-center animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" />
          ) : (
            <div className="w-full h-[300px] -ml-2">
              <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={300} />
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/50">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Top 5 Menu Terlaris</h3>
          {loadingMenus ? (
             <div className="w-full h-[300px] flex items-center justify-center animate-pulse bg-gray-50 dark:bg-gray-800/50 rounded-xl" />
          ) : donutSeries.length > 0 ? (
            <div className="w-full h-[300px] flex items-center justify-center">
              <ReactApexChart options={donutOptions} series={donutSeries} type="donut" height={320} />
            </div>
          ) : (
             <div className="w-full h-[300px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <Utensils className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-gray-500 text-sm">Belum ada data penjualan menu</p>
             </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
