'use client';

import { useState } from 'react';
import { Star, Users, Gift, TrendingUp, Check } from 'lucide-react';
import { useCustomers } from '@/features/users/hooks/use-customers';

const tierBadge: Record<string, string> = {
  Gold: 'bg-amber-100 text-amber-700 font-bold',
  Silver: 'bg-gray-100 text-gray-600 font-bold',
  Bronze: 'bg-orange-100 text-orange-700 font-bold',
};

export default function MembershipsPage() {
  const { customers, usingLive } = useCustomers();
  const [redemptions, setRedemptions] = useState([
    { member: 'Anisa Putri', tier: 'Gold', reward: 'Free Latte', points: 500, date: '14 Jul 2026' },
    { member: 'Rina Mahardika', tier: 'Gold', reward: 'Diskon 20%', points: 300, date: '13 Jul 2026' },
    { member: 'David Chen', tier: 'Silver', reward: 'Free Croissant', points: 200, date: '13 Jul 2026' },
    { member: 'Budi Santoso', tier: 'Bronze', reward: 'Free Espresso Shot', points: 100, date: '12 Jul 2026' },
  ]);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const bronzeCount = customers.filter((c) => c.tier === 'Bronze').length;
  const silverCount = customers.filter((c) => c.tier === 'Silver').length;
  const goldCount = customers.filter((c) => c.tier === 'Gold').length;
  const totalPointsIssued = customers.reduce((sum, c) => sum + c.points, 0);

  const tiers = [
    {
      name: 'Bronze',
      minPoints: 0,
      maxPoints: 1199,
      color: 'bg-orange-400',
      members: bronzeCount,
      perks: ['Diskon 5% setiap transaksi', 'Poin 1x per Rp 1.000 belanja', 'Newsletter eksklusif'],
    },
    {
      name: 'Silver',
      minPoints: 1200,
      maxPoints: 3499,
      color: 'bg-gray-400',
      members: silverCount,
      perks: ['Diskon 10% setiap transaksi', 'Poin 1.5x per Rp 1.000', 'Free birthday drink', 'Early access menu baru'],
    },
    {
      name: 'Gold',
      minPoints: 3500,
      maxPoints: 99999,
      color: 'bg-amber-400',
      members: goldCount,
      perks: ['Diskon 15% setiap transaksi', 'Poin 2x per Rp 1.000', 'Free birthday cake', 'Priority queue POS', 'Surprise gift'],
    },
  ];

  const handleSimulateRedemption = () => {
    const randomMember = customers[Math.floor(Math.random() * customers.length)] || { name: 'Member Setia', tier: 'Silver' };
    const newRedeem = {
      member: randomMember.name,
      tier: randomMember.tier,
      reward: 'Voucher Diskon Rp 25.000',
      points: 250,
      date: 'Baru saja',
    };
    setRedemptions((prev) => [newRedeem, ...prev]);
    setActionStatus(`Simulasi berhasil: ${randomMember.name} menukarkan 250 poin dengan Voucher Diskon Rp 25.000!`);
    setTimeout(() => setActionStatus(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Membership & Loyalty Tiers</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
 Live Customer Tiers
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Standar / Agregasi
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">{customers.length} total member aktif terdistribusi ke dalam 3 tier eksklusif</p>
        </div>
        <button
          onClick={handleSimulateRedemption}
          className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
        >
          <Gift size={16} /> Simulasi Tukar Reward
        </button>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          {actionStatus}
        </div>
      )}

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Member Aktif', value: String(customers.length), icon: Users, color: 'bg-[#BA935D]' },
          { label: 'Total Poin Terakumulasi', value: totalPointsIssued.toLocaleString('id-ID'), icon: Star, color: 'bg-violet-500' },
          { label: 'Reward Ditukarkan', value: `${redemptions.length} kali`, icon: Gift, color: 'bg-green-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${s.color} text-white shadow-sm`}>
              <s.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 font-serif">{s.value}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <div key={tier.name} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between">
            <div>
              <div className={`${tier.color} px-5 py-4 flex items-center justify-between shadow-inner`}>
                <div className="flex items-center gap-2 text-white">
                  <Star size={18} className="fill-white" />
                  <h3 className="font-serif text-xl font-bold">{tier.name}</h3>
                </div>
                <div className="text-right text-white">
                  <p className="text-2xl font-bold font-serif">{tier.members}</p>
                  <p className="text-[10px] opacity-80 uppercase tracking-wider font-bold">Member</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 pb-2 border-b border-gray-100">
                  {tier.minPoints.toLocaleString()} – {tier.maxPoints === 99999 ? '∞' : tier.maxPoints.toLocaleString()} poin
                </p>
                <ul className="space-y-2">
                  {tier.perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-0.5 text-green-500 text-base leading-none font-bold">✓</span>
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Redemptions */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-800">Riwayat Penukaran Reward Loyalty</h2>
          <TrendingUp size={16} className="text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                <th className="px-6 py-3.5">Member</th>
                <th className="px-6 py-3.5">Tier</th>
                <th className="px-6 py-3.5">Reward Yang Ditukar</th>
                <th className="px-6 py-3.5">Poin Terpotong</th>
                <th className="px-6 py-3.5">Tanggal / Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {redemptions.map((r, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">{r.member}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tierBadge[r.tier]}`}>{r.tier}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 font-medium">{r.reward}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#BA935D] font-mono">-{r.points} pts</td>
                  <td className="px-6 py-4 text-xs text-gray-400">{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
