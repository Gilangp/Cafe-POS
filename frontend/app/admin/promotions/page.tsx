'use client';

import { useState } from 'react';
import { Plus, Tag, Calendar, Percent, ToggleLeft, ToggleRight, Gift, Smartphone } from 'lucide-react';

const promotions = [
  { id: 1, name: 'Happy Hour Sore', code: 'HAPPY17', type: 'percent', value: 20, minOrder: 30000, channel: 'Semua', startDate: '2026-07-01', endDate: '2026-07-31', usageCount: 148, maxUsage: 500, active: true, description: 'Diskon 20% untuk semua minuman jam 17.00 - 19.00' },
  { id: 2, name: 'Buy 2 Get 1 Pastry', code: 'PASTRY2', type: 'bogo', value: 0, minOrder: 60000, channel: 'POS', startDate: '2026-07-10', endDate: '2026-07-20', usageCount: 42, maxUsage: 100, active: true, description: 'Beli 2 pastry gratis 1 pastry termurah' },
  { id: 3, name: 'Member Weekend', code: 'WEEKEND15', type: 'percent', value: 15, minOrder: 0, channel: 'Online', startDate: '2026-07-12', endDate: '2026-07-13', usageCount: 89, maxUsage: 200, active: false, description: 'Khusus member Silver & Gold setiap akhir pekan' },
  { id: 4, name: 'First Order Discount', code: 'FIRST25', type: 'percent', value: 25, minOrder: 0, channel: 'Online', startDate: '2026-01-01', endDate: '2026-12-31', usageCount: 213, maxUsage: 1000, active: true, description: 'Diskon 25% untuk order pertama via aplikasi' },
];

export default function PromotionsPage() {
  const [promos, setPromos] = useState(promotions);
  const toggle = (id: number) => setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-800">Promosi & Diskon</h1>
          <p className="text-sm text-gray-500 mt-1">{promos.filter(p => p.active).length} promo aktif</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors">
          <Plus size={16} /> Buat Promo Baru
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {promos.map(promo => {
          const usagePct = Math.round((promo.usageCount / promo.maxUsage) * 100);
          return (
            <div key={promo.id} className={`rounded-2xl bg-white border-2 p-5 shadow-sm transition-all ${promo.active ? 'border-[#BA935D]/30' : 'border-dashed border-gray-200 opacity-70'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-800">{promo.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{promo.description}</p>
                </div>
                <button onClick={() => toggle(promo.id)} className="ml-3 shrink-0 text-gray-400 hover:text-[#BA935D] transition-colors">
                  {promo.active ? <ToggleRight size={28} className="text-[#BA935D]" /> : <ToggleLeft size={28} />}
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="flex items-center gap-1 rounded-full bg-[#FAF6F0] border border-[#BA935D]/30 px-3 py-1 text-xs font-bold text-[#BA935D]">
                  <Tag size={10} /> {promo.code}
                </span>
                {promo.type === 'percent' && (
                  <span className="flex items-center gap-1 rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-700">
                    <Percent size={10} /> {promo.value}% diskon
                  </span>
                )}
                {promo.type === 'bogo' && (
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                    <Gift size={12} /> Buy 2 Get 1
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
                  <Smartphone size={12} /> {promo.channel}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-4">
                <Calendar size={11} />
                <span>{promo.startDate} — {promo.endDate}</span>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-500 font-semibold">Penggunaan</span>
                  <span className="font-bold text-gray-700">{promo.usageCount} / {promo.maxUsage}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div className={`h-full rounded-full transition-all ${usagePct > 80 ? 'bg-red-400' : 'bg-[#BA935D]'}`} style={{ width: `${usagePct}%` }} />
                </div>
                <p className="text-[10px] text-right text-gray-400 mt-1">{usagePct}% terpakai</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
