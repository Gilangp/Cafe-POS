'use client';

import { useState } from 'react';
import { Search, Star, Phone, Mail, ShoppingBag, Plus, Sparkles, Loader2, Gift, Check, X } from 'lucide-react';
import { useCustomers, CustomerMember } from '@/hooks/useCustomers';

const tierStyle: Record<string, { badge: string; bg: string }> = {
  Gold: { badge: 'bg-amber-100 text-amber-700 font-bold', bg: 'border-amber-200' },
  Silver: { badge: 'bg-gray-100 text-gray-600 font-bold', bg: 'border-gray-200' },
  Bronze: { badge: 'bg-orange-100 text-orange-700 font-bold', bg: 'border-orange-200' },
};

const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
const avatarColors = ['bg-[#BA935D]', 'bg-blue-500', 'bg-violet-500', 'bg-teal-500', 'bg-rose-500'];

export default function CrmPage() {
  const { customers, loading, usingLive, addCustomer, addPointsFromTransaction } = useCustomers();
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  // Modal New Member
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  const filtered = customers.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) return;

    setFormLoading(true);
    await addCustomer({
      name: formName,
      email: formEmail || `${formName.toLowerCase().replace(/\s+/g, '')}@velvracoffee.com`,
      phone: formPhone,
    });

    setFormLoading(false);
    setIsAddModalOpen(false);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setActionStatus('Member baru berhasil didaftarkan! (Bonus +100 Poin Loyalty diberikan)');
    setTimeout(() => setActionStatus(null), 4000);
  };

  const handleRewardBonus = async (id: string | number, name: string) => {
    await addPointsFromTransaction(id, 50000); // simulate Rp 50.000 spend (+50 pts)
    setActionStatus(`+50 Poin Loyalty berhasil ditambahkan ke member ${name}!`);
    setTimeout(() => setActionStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-bold text-gray-800">Pelanggan & CRM</h1>
            {usingLive ? (
              <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                <Sparkles size={13} /> Live Supabase CRM
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Mode Standar / Lokal
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Akumulasi poin loyalty otomatis (`Rp 1.000 = 1 poin`) terintegrasi dari transaksi POS & Online
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2.5 text-sm font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors shadow-sm"
        >
          <Plus size={16} /> Registrasi Member Baru
        </button>
      </div>

      {/* Action Notification */}
      {actionStatus && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 animate-fadeIn">
          <Check size={18} className="text-emerald-600" />
          {actionStatus}
        </div>
      )}

      {/* Summary Stats / Tier filter buttons */}
      <div className="grid gap-4 sm:grid-cols-4">
        <button
          onClick={() => setTierFilter('all')}
          className={`rounded-2xl border p-4 transition-all text-left ${
            tierFilter === 'all'
              ? 'bg-[#12100E] text-[#BA935D] border-[#12100E] shadow-md'
              : 'bg-white border-gray-100 text-gray-700 hover:border-[#BA935D]'
          }`}
        >
          <p className="text-xs font-bold uppercase tracking-wider opacity-80">Semua Member</p>
          <p className="text-2xl font-bold mt-1 font-serif">{customers.length}</p>
        </button>
        {[
          { label: 'Gold', tier: 'Gold', value: customers.filter((c) => c.tier === 'Gold').length, color: 'bg-amber-400' },
          { label: 'Silver', tier: 'Silver', value: customers.filter((c) => c.tier === 'Silver').length, color: 'bg-gray-400' },
          { label: 'Bronze', tier: 'Bronze', value: customers.filter((c) => c.tier === 'Bronze').length, color: 'bg-orange-400' },
        ].map((s) => (
          <button
            key={s.label}
            onClick={() => setTierFilter(s.tier)}
            className={`rounded-2xl border p-4 transition-all flex items-center justify-between text-left ${
              tierFilter === s.tier
                ? 'bg-[#12100E] text-[#BA935D] border-[#12100E] shadow-md'
                : 'bg-white border-gray-100 text-gray-700 hover:border-[#BA935D]'
            }`}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">{s.label} Tier</p>
              <p className="text-2xl font-bold mt-1 font-serif">{s.value}</p>
            </div>
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color} text-white font-bold text-lg font-serif shadow-sm`}>
              <Star size={18} />
            </div>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama, email, atau no. telepon member..."
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
        />
      </div>

      {/* Customer Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Loader2 size={36} className="animate-spin mb-3 text-[#BA935D]" />
          <p className="text-sm font-semibold">Memuat data member loyalty...</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c, i) => (
            <div key={c.id} className={`rounded-2xl bg-white border-2 ${tierStyle[c.tier].bg} p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}>
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${avatarColors[i % avatarColors.length]} text-white font-bold text-sm shadow-sm`}>
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                      <span className={`text-[10px] rounded-full px-2 py-0.5 flex items-center gap-1 ${tierStyle[c.tier].badge}`}>
                        <Star size={10} className="fill-current" />
                        {c.tier}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Terakhir transaksi: {c.lastVisit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-xl bg-[#FAF6F0] p-3 text-center border border-[#E5D7C3]/50">
                    <p className="text-lg font-bold text-[#BA935D] font-serif">{c.orders}</p>
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Order</p>
                  </div>
                  <div className="rounded-xl bg-[#FAF6F0] p-3 text-center border border-[#E5D7C3]/50">
                    <p className="text-lg font-bold text-gray-800 font-serif">{c.points.toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-[#BA935D] font-bold uppercase tracking-wider">Poin Loyalty</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-3">
                  Akumulasi belanja: <strong className="text-gray-900 font-serif font-bold">{fmt(c.totalSpend)}</strong>
                </p>

                <div className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-[#BA935D]" /> {c.phone}
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail size={13} className="text-[#BA935D]" /> {c.email}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => handleRewardBonus(c.id, c.name)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition-all border border-amber-200/60"
                >
                  <Gift size={13} /> +50 Bonus Poin
                </button>
                <button
                  onClick={() => alert(`Menampilkan riwayat order member: ${c.name}`)}
                  className="flex items-center justify-center rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
                >
                  <ShoppingBag size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Registrasi Member Baru */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
              <h2 className="font-serif text-xl font-bold text-gray-800">Daftarkan Member Loyalty Baru</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Jessica Iskandar"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Nomor WhatsApp / Telepon <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="jessica@email.com"
                  className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-[#BA935D] focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-[#FAF6F0] p-3 text-xs text-gray-600 border border-[#E5D7C3] flex items-center gap-2">
                <Gift size={16} className="text-[#BA935D] shrink-0" />
                <span>Member baru akan otomatis mendapatkan <strong>+100 Poin Welcome Bonus</strong> dan terdaftar di tier <strong>Bronze</strong>.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex items-center gap-2 rounded-xl bg-[#12100E] px-5 py-2 text-xs font-bold text-[#BA935D] hover:bg-[#1e1a17] transition-colors disabled:opacity-50"
                >
                  {formLoading && <Loader2 size={13} className="animate-spin" />}
                  Simpan Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
