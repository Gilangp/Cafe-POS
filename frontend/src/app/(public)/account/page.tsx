'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomerLayout } from '@/features/users/customer-layout';
import {
  Star,
  Gift,
  ShoppingBag,
  Calendar,
  User,
  QrCode,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Heart,
  Utensils,
  Trash2,
  Lock,
} from 'lucide-react';

const REWARDS = [
  { id: 1, title: 'Free French Butter Croissant', points: 500, category: 'Pastry', desc: 'Satu croissant segar gratis untuk dinikmati dengan kopi Anda.', validUntil: '31 Agustus 2026' },
  { id: 2, title: 'Diskon 20% Semua Minuman', points: 350, category: 'Diskon', desc: 'Potongan harga 20% untuk pembelian minuman ukuran apapun.', validUntil: '15 September 2026' },
  { id: 3, title: 'Free Signature Cold Brew 18H', points: 600, category: 'Minuman', desc: 'Satu cup Cold Brew 18 jam dengan rasa bold dan menyegarkan.', validUntil: '31 Agustus 2026' },
  { id: 4, title: 'Voucher Dine-In Rp 50.000', points: 1000, category: 'Voucher', desc: 'Potongan langsung Rp 50.000 untuk minimal transaksi Rp 150.000.', validUntil: '30 Oktober 2026' },
];

const ORDER_HISTORY = [
  { id: '#ORD-1042', date: '14 Jul 2026 · 09:32', branch: 'Sudirman Flagship', items: 'Velvet Espresso, French Butter Croissant', total: 68000, status: 'Selesai', pointsEarned: +68 },
  { id: '#ORD-0988', date: '11 Jul 2026 · 15:10', branch: 'Kemang Artisan Bar', items: 'Iced Macchiato Cloud x2, Brownie Valrhona', total: 129000, status: 'Selesai', pointsEarned: +129 },
  { id: '#ORD-0912', date: '5 Jul 2026 · 19:45', branch: 'Sudirman Flagship', items: 'Artisan Avocado Toast, Caramel Sea Salt Latte', total: 98000, status: 'Selesai', pointsEarned: +98 },
];

const MY_RESERVATIONS = [
  { id: 'RES-8942', date: '16 Jul 2026', time: '18:00 WIB', branch: 'Sudirman Flagship', guests: 4, area: 'Main Dining Hall', status: 'Confirmed' },
  { id: 'RES-7311', date: '2 Jul 2026', time: '14:30 WIB', branch: 'Kemang Artisan Bar', guests: 2, area: 'Outdoor Garden Terrace', status: 'Completed' },
];

function CustomerAccountContent() {
  const searchParams = useSearchParams();
  const initialTab = (searchParams?.get('tab') as 'rewards' | 'orders' | 'reservations' | 'profile') || 'rewards';
  const [activeTab, setActiveTab] = useState<'rewards' | 'orders' | 'reservations' | 'profile'>(initialTab);
  const [myPoints, setMyPoints] = useState(4850);
  const [redeemedAlert, setRedeemedAlert] = useState('');
  const [reorderAlert, setReorderAlert] = useState('');

  // Profile Form state
  const [name, setName] = useState('Rina Mahardika');
  const [email, setEmail] = useState('rina@velvra.id');
  const [phone, setPhone] = useState('081234567890');
  const [profileSaved, setProfileSaved] = useState(false);

  // Allergen & Dietary Preferences state (PORT-006)
  const [dietaryPrefs, setDietaryPrefs] = useState({
    glutenFree: false,
    dairyFree: true,
    nutAllergy: false,
    vegan: false,
    lowSugar: true,
    halalPreference: true,
  });

  // GDPR Soft-Delete state (PORT-007)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);

  const handleRedeem = (reward: typeof REWARDS[0]) => {
    if (myPoints < reward.points) {
      setRedeemedAlert('Poin Anda tidak mencukupi untuk menukar reward ini.');
      setTimeout(() => setRedeemedAlert(''), 3000);
      return;
    }
    setMyPoints((prev) => prev - reward.points);
    setRedeemedAlert(`Berhasil menukar ${reward.title}! Voucher tersimpan di e-wallet.`);
    setTimeout(() => setRedeemedAlert(''), 4000);
  };

  const handleReorder = (orderId: string) => {
    setReorderAlert(`Pesanan ${orderId} berhasil dimasukkan ke Keranjang! Buka menu Pesan Online untuk checkout.`);
    setTimeout(() => setReorderAlert(''), 4000);
  };

  const toggleDietary = (key: keyof typeof dietaryPrefs) => {
    setDietaryPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGdprSoftDelete = () => {
    setAccountDeleted(true);
    setShowDeleteModal(false);
  };

  const fmt = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);

  if (accountDeleted) {
    return (
      <CustomerLayout>
        <div className="max-w-2xl mx-auto my-20 bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-xl space-y-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
            <Trash2 size={40} />
          </div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Akun Anda Telah Dinonaktifkan (GDPR Soft-Delete)</h1>
          <p className="text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
            Sesuai kepatuhan privasi GDPR & perlindungan data pribadi (<strong className="text-gray-800">PORT-007</strong>), seluruh riwayat pesanan, saldo poin loyalitas, dan data kontak Anda telah ditandai untuk penghapusan permanen dari server aktif Velvra.
          </p>
          <div className="pt-4">
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-2xl bg-[#12100E] px-8 py-4 text-sm font-bold text-[#BA935D] shadow-lg hover:bg-[#201d19] transition-all"
            >
              Kembali ke Beranda Utama
            </a>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      {/* Top Banner */}
      <div className="bg-[#12100E] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Member Welcome & Card Visualizer */}
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#BA935D] to-[#e4ca9f] text-[#12100E] font-serif font-bold text-2xl shadow-xl border-2 border-white/20">
              RM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-bold text-white">{name}</h1>
                <span className="flex items-center gap-1 rounded-full bg-[#BA935D] px-3 py-0.5 text-xs font-bold text-[#12100E]">
                  <Star size={12} className="fill-[#12100E]" /> Gold Member
                </span>
              </div>
              <p className="text-xs text-white/60 mt-1">Bergabung sejak Maret 2024 · ID: VELVRA-88219</p>
            </div>
          </div>

          {/* Digital Membership Gold Card */}
          <div className="w-full sm:w-96 rounded-3xl bg-gradient-to-br from-[#BA935D] via-[#c6a26c] to-[#8d6935] p-6 text-[#12100E] shadow-2xl relative overflow-hidden border border-white/30">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] font-bold opacity-80">Velvra Privilege</p>
                <p className="font-serif text-2xl font-bold tracking-wide">Gold Tier</p>
              </div>
              <div className="rounded-xl bg-[#12100E] p-2 text-white">
                <QrCode size={32} />
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-[#12100E]/20 pt-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Loyalty Balance</p>
                <p className="font-serif text-3xl font-bold tracking-tight">{myPoints.toLocaleString('id-ID')} <span className="text-sm font-sans font-semibold">Pts</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase opacity-80">150 Pts lagi menuju</p>
                <p className="text-xs font-bold">Free Signature Beverage</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab System */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 border-b border-gray-200 mb-8 scrollbar-hide">
          {[
            { id: 'rewards', label: 'Tukar Poin & Reward', icon: Gift },
            { id: 'orders', label: 'Riwayat Pesanan (PORT-001)', icon: ShoppingBag },
            { id: 'reservations', label: 'Reservasi Saya', icon: Calendar },
            { id: 'profile', label: 'Profil, Alergen & Privasi', icon: User },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'bg-[#12100E] text-[#BA935D] shadow-lg'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
              }`}
            >
              <tab.icon size={17} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Reward & Loyalty */}
        {activeTab === 'rewards' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {redeemedAlert && (
              <div className={`rounded-2xl p-4 text-sm font-bold flex items-center justify-between ${
                redeemedAlert.includes('Berhasil') ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                <span>{redeemedAlert}</span>
                <span className="text-xs uppercase opacity-70 font-semibold">Info Poin</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {REWARDS.map((reward) => {
                const canRedeem = myPoints >= reward.points;
                return (
                  <div
                    key={reward.id}
                    className={`flex flex-col justify-between rounded-3xl bg-white border-2 p-6 shadow-sm transition-all hover:shadow-md ${
                      canRedeem ? 'border-gray-200 hover:border-[#BA935D]/50' : 'border-dashed border-gray-200 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="rounded-full bg-[#FAF6F0] border border-[#BA935D]/30 px-3 py-1 text-xs font-bold text-[#BA935D]">
                          {reward.category}
                        </span>
                        <span className="font-serif text-lg font-bold text-[#12100E]">{reward.points} Pts</span>
                      </div>
                      <h3 className="font-serif text-xl font-bold text-gray-800 leading-snug">{reward.title}</h3>
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">{reward.desc}</p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-[11px] text-gray-400">Berlaku s.d. {reward.validUntil}</span>
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canRedeem}
                        className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all shadow-sm ${
                          canRedeem
                            ? 'bg-[#12100E] text-[#BA935D] hover:bg-[#201d19] active:scale-95'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {canRedeem ? 'Tukar Poin' : 'Poin Kurang'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Orders History & Reorder (PORT-001) */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {reorderAlert && (
              <div className="rounded-2xl bg-green-100 border border-green-300 p-4 text-sm font-bold text-green-800 flex items-center justify-between">
                <span>{reorderAlert}</span>
                <a href="/menu" className="underline text-xs">Buka Keranjang →</a>
              </div>
            )}

            <div className="space-y-4">
              {ORDER_HISTORY.map((order) => (
                <div key={order.id} className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#BA935D]/40 transition-all">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-gray-800">{order.id}</span>
                      <span className="rounded-full bg-green-100 text-green-700 px-3 py-0.5 text-xs font-bold">
                        {order.status}
                      </span>
                      <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                        +{order.pointsEarned} Pts
                      </span>
                    </div>
                    <p className="text-sm font-bold text-gray-800 pt-1">{order.items}</p>
                    <p className="text-xs text-gray-400">{order.date} · Cabang <strong className="text-gray-600">{order.branch}</strong></p>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                    <div className="text-left md:text-right">
                      <p className="text-xs text-gray-400 uppercase font-semibold">Total Tagihan</p>
                      <p className="font-serif text-lg font-bold text-[#BA935D]">{fmt(order.total)}</p>
                    </div>
                    <button
                      onClick={() => handleReorder(order.id)}
                      className="flex items-center gap-2 rounded-2xl bg-[#12100E] px-5 py-3 text-xs font-bold text-[#BA935D] hover:bg-[#201d19] active:scale-95 transition-all shadow-md"
                    >
                      <RefreshCw size={14} />
                      <span>Pesan Lagi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Reservations */}
        {activeTab === 'reservations' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {MY_RESERVATIONS.map((res) => (
              <div key={res.id} className="rounded-3xl bg-white border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-gray-800">{res.id}</span>
                    <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${
                      res.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {res.status}
                    </span>
                  </div>
                  <p className="font-serif text-lg font-bold text-gray-800 pt-1">{res.branch} · {res.area}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock size={13} className="text-[#BA935D]" /> {res.date} pukul {res.time} · {res.guests} Tamu
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href="/reserve"
                    className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
                  >
                    Reschedule
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Profile, Allergen (PORT-006) & GDPR Privacy (PORT-007) */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
            {/* Left 2 Columns: Profile & Dietary Preferences */}
            <div className="lg:col-span-2 space-y-8">
              {/* Profile Contact Details */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h2 className="font-serif text-xl font-bold text-gray-800">Profil Pribadi & Kontak</h2>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200 flex items-center gap-1">
                    <ShieldCheck size={14} /> Terverifikasi
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nama Lengkap</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Alamat Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Nomor WhatsApp</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 px-4 text-sm text-gray-800 focus:border-[#BA935D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-between">
                  {profileSaved && <span className="text-xs font-bold text-green-600">✓ Perubahan berhasil disimpan!</span>}
                  <button
                    onClick={() => { setProfileSaved(true); setTimeout(() => setProfileSaved(false), 3000); }}
                    className="ml-auto rounded-2xl bg-[#12100E] px-8 py-3.5 text-sm font-bold text-[#BA935D] shadow-lg hover:bg-[#201d19] active:scale-95 transition-all"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>

              {/* Allergen & Dietary Preferences (PORT-006) */}
              <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#BA935D]">PORT-006 Compliance</span>
                    <h2 className="font-serif text-xl font-bold text-gray-800 flex items-center gap-2 mt-0.5">
                      <Utensils size={20} className="text-[#BA935D]" />
                      <span>Preferensi Alergen & Diet</span>
                    </h2>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Pilih preferensi diet dan alergen Anda. Pilihan ini akan secara otomatis diinformasikan kepada barista dan dapur saat Anda memesan atau melakukan reservasi.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {[
                    { key: 'dairyFree' as const, label: 'Dairy-Free (Preferensi Susu Nabati / Oat/Almond)' },
                    { key: 'lowSugar' as const, label: 'Low Sugar / Less Sweetness Default' },
                    { key: 'glutenFree' as const, label: 'Gluten-Free (Bebas Gluten / Gandum)' },
                    { key: 'nutAllergy' as const, label: 'Nut Allergy (Alergi Kacang & Produk Turunannya)' },
                    { key: 'vegan' as const, label: 'Strict Vegan (100% Nabati Tanpa Telur/Susu)' },
                    { key: 'halalPreference' as const, label: 'Halal Certified Ingredients Only' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex items-start gap-3.5 rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                        dietaryPrefs[item.key]
                          ? 'border-[#BA935D] bg-[#FAF6F0]'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={dietaryPrefs[item.key]}
                        onChange={() => toggleDietary(item.key)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#BA935D] focus:ring-[#BA935D]"
                      />
                      <span className="text-xs font-bold text-gray-800 leading-snug">{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: GDPR Soft-Delete & Privacy Right (PORT-007) */}
            <div className="space-y-6">
              <div className="bg-red-50 rounded-3xl border border-red-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                  <AlertTriangle size={18} className="text-red-600 shrink-0" />
                  <span>Perlindungan Privasi GDPR (PORT-007)</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  Penghapusan Akun & Soft-Delete Data
                </h3>
                <p className="text-xs text-red-800/80 leading-relaxed">
                  Sesuai regulasi GDPR dan hak atas perlindungan data pribadi, Anda dapat mengajukan penghapusan akun mandiri (*soft-delete*). Data identitas, riwayat transaksi, dan saldo poin akan diarsipkan atau dinonaktifkan dari sistem publik kami.
                </p>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-red-600 py-3.5 text-xs font-bold text-white hover:bg-red-700 active:scale-95 transition-all shadow-md"
                >
                  <Trash2 size={15} />
                  <span>Ajukan Penghapusan Akun (Soft-Delete)</span>
                </button>
              </div>

              <div className="bg-[#FAF6F0] rounded-3xl border border-[#BA935D]/30 p-6 space-y-3">
                <div className="flex items-center gap-2 text-[#BA935D] font-bold text-xs">
                  <Lock size={15} />
                  <span>Privasi & Keamanan Enkripsi</span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Semua informasi pribadi yang tersimpan di portal Velvra diproteksi dengan enkripsi SSL 256-bit dan tidak pernah dibagikan kepada pihak ketiga.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* GDPR Soft-Delete Confirmation Modal (PORT-007) */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 space-y-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-gray-900">Konfirmasi Hapus Akun?</h3>
              <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                Tindakan ini akan memicu alur <strong className="text-red-600 font-bold">GDPR Soft-Delete (PORT-007)</strong>. Saldo <strong className="text-gray-900">{myPoints} Pts</strong> dan seluruh benefit Gold Member akan dibekukan seketika.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-2xl border border-gray-300 py-3.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Batal & Pertahankan
              </button>
              <button
                type="button"
                onClick={handleGdprSoftDelete}
                className="flex-1 rounded-2xl bg-red-600 py-3.5 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-lg"
              >
                Ya, Hapus Akun Saya
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  );
}

export default function CustomerAccountPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#12100E]" />}>
      <CustomerAccountContent />
    </Suspense>
  );
}
