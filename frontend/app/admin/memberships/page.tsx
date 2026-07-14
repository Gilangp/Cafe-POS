'use client';

import { Star, Users, Gift, TrendingUp } from 'lucide-react';

const tiers = [
  { name: 'Bronze', minPoints: 0, maxPoints: 999, color: 'bg-orange-400', members: 128, perks: ['Diskon 5% setiap transaksi', 'Poin 1x per Rp 1.000 belanja', 'Newsletter eksklusif'] },
  { name: 'Silver', minPoints: 1000, maxPoints: 4999, color: 'bg-gray-400', members: 87, perks: ['Diskon 10% setiap transaksi', 'Poin 1.5x per Rp 1.000', 'Free birthday drink', 'Early access menu baru'] },
  { name: 'Gold', minPoints: 5000, maxPoints: 99999, color: 'bg-amber-400', members: 34, perks: ['Diskon 15% setiap transaksi', 'Poin 2x per Rp 1.000', 'Free birthday cake', 'Priority queue POS', 'Monthly surprise gift'] },
];

const recentRedemptions = [
  { member: 'Anisa Putri', tier: 'Gold', reward: 'Free Latte', points: 500, date: '14 Jul 2026' },
  { member: 'Rina Mahardika', tier: 'Gold', reward: 'Diskon 20%', points: 300, date: '13 Jul 2026' },
  { member: 'David Chen', tier: 'Silver', reward: 'Free Croissant', points: 200, date: '13 Jul 2026' },
  { member: 'Budi Santoso', tier: 'Bronze', reward: 'Free Espresso Shot', points: 100, date: '12 Jul 2026' },
];

const tierBadge: Record<string, string> = {
  Gold: 'bg-amber-100 text-amber-700',
  Silver: 'bg-gray-100 text-gray-600',
  Bronze: 'bg-orange-100 text-orange-700',
};

export default function MembershipsPage() {
  const totalMembers = tiers.reduce((s, t) => s + t.members, 0);
  const totalPointsIssued = 2450000;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-gray-800">Membership & Loyalty</h1>
        <p className="text-sm text-gray-500 mt-1">{totalMembers} total member aktif</p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Member', value: String(totalMembers), icon: Users, color: 'bg-[#BA935D]' },
          { label: 'Poin Terdistribusi', value: totalPointsIssued.toLocaleString('id-ID'), icon: Star, color: 'bg-violet-500' },
          { label: 'Reward Ditukar', value: '312', icon: Gift, color: 'bg-green-500' },
        ].map(s => (
          <div key={s.label} className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm flex items-center gap-4">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 font-serif">{s.value}</p>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {tiers.map(tier => (
          <div key={tier.name} className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className={`${tier.color} px-5 py-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2 text-white">
                <Star size={18} className="fill-white" />
                <h3 className="font-serif text-xl font-bold">{tier.name}</h3>
              </div>
              <div className="text-right text-white">
                <p className="text-2xl font-bold font-serif">{tier.members}</p>
                <p className="text-[10px] opacity-80 uppercase tracking-wider">Member</p>
              </div>
            </div>
            <div className="p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                {tier.minPoints.toLocaleString()} – {tier.maxPoints === 99999 ? '∞' : tier.maxPoints.toLocaleString()} poin
              </p>
              <ul className="space-y-2">
                {tier.perks.map(perk => (
                  <li key={perk} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 text-green-500 text-base leading-none">✓</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Redemptions */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-serif text-lg font-bold text-gray-800">Penukaran Reward Terbaru</h2>
          <TrendingUp size={16} className="text-gray-400" />
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400">
              <th className="px-6 py-3">Member</th>
              <th className="px-6 py-3">Tier</th>
              <th className="px-6 py-3">Reward</th>
              <th className="px-6 py-3">Poin</th>
              <th className="px-6 py-3">Tanggal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {recentRedemptions.map((r, i) => (
              <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3.5 text-sm font-semibold text-gray-800">{r.member}</td>
                <td className="px-6 py-3.5">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${tierBadge[r.tier]}`}>{r.tier}</span>
                </td>
                <td className="px-6 py-3.5 text-sm text-gray-600">{r.reward}</td>
                <td className="px-6 py-3.5 text-sm font-bold text-[#BA935D]">-{r.points} poin</td>
                <td className="px-6 py-3.5 text-xs text-gray-400">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
