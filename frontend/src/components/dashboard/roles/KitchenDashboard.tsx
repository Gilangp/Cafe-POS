"use client";

import React from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, Monitor, Clock, PlayCircle } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function KitchenDashboard() {
  const { user } = useAuthStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-4xl mx-auto text-center pt-10"
    >
      <div className="inline-flex items-center justify-center p-4 bg-brand-50 text-brand-600 rounded-full mb-4 shadow-sm border border-brand-100">
        <UtensilsCrossed className="w-10 h-10" />
      </div>
      
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Halo, {user?.name}!</h2>
      <p className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mb-10">
        Untuk melihat pesanan yang masuk secara real-time, silakan buka aplikasi Kitchen Display System (KDS).
      </p>

      <Link href="/kds" className="inline-flex group">
        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full px-8 py-4 shadow-lg shadow-gray-900/20 dark:shadow-white/20 flex items-center gap-3 transition-transform transform group-hover:scale-105">
          <Monitor className="w-6 h-6" />
          <span className="font-bold text-lg">Buka Layar KDS Sekarang</span>
          <PlayCircle className="w-6 h-6 opacity-80" />
        </div>
      </Link>

      {/* Decorative Stats Preview */}
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto mt-16 text-left">
         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock className="w-5 h-5"/></div>
            <div>
              <p className="text-xs text-gray-500">Target Waktu</p>
              <p className="font-bold text-gray-900 dark:text-white">&lt; 15 Menit</p>
            </div>
         </div>
         <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><UtensilsCrossed className="w-5 h-5"/></div>
            <div>
              <p className="text-xs text-gray-500">Status Dapur</p>
              <p className="font-bold text-green-600">Online</p>
            </div>
         </div>
      </div>
    </motion.div>
  );
}
