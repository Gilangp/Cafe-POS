'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Lock, Mail, KeyRound, ArrowRight, ShieldCheck, AlertCircle, Sparkles, User, Store, Shield, ChefHat } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

const ROLES_INFO = [
  {
    code: 'barista',
    title: 'Kasir & POS',
    pin: '1111',
    desc: 'Akses transaksi kasir, struk thermal, & check-in reservasi meja',
    icon: Store,
    badge: 'POS Terminal',
    redirect: '/kasir/pos',
  },
  {
    code: 'kds',
    title: 'Dapur / Barista KDS',
    pin: '2222',
    desc: 'Layar antrean dapur, timer pesanan, & notifikasi real-time',
    icon: ChefHat,
    badge: 'Kitchen Display',
    redirect: '/admin/kds',
  },
  {
    code: 'store_manager',
    title: 'Admin & Store Manager',
    pin: '1234',
    desc: 'Manajemen menu, stok inventori, promo, & persetujuan reservasi',
    icon: Shield,
    badge: 'Management',
    redirect: '/admin',
  },
  {
    code: 'super_admin',
    title: 'Owner / Executive',
    pin: '8888',
    desc: 'Laporan laba rugi, audit log sistem, analitik bisnis, & backup',
    icon: User,
    badge: 'Executive',
    redirect: '/admin/analytics',
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'pin' | 'email'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRoleCode, setSelectedRoleCode] = useState<string>('barista');

  const handlePinInput = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyLogin(nextPin, 'pin');
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const verifyLogin = (valueToVerify: string, mode: 'pin' | 'email') => {
    setLoading(true);
    setError(null);

    setTimeout(() => {
      if (mode === 'pin') {
        const matchedRole = ROLES_INFO.find((r) => r.pin === valueToVerify);
        if (matchedRole) {
          const session = {
            name: matchedRole.code === 'super_admin' ? 'Gilang P. (Owner)' : matchedRole.code === 'store_manager' ? 'Nadia (Manager)' : matchedRole.code === 'kds' ? 'Budi (Barista Lead)' : 'Risa (Kasir Shift 1)',
            role: matchedRole.title,
            roleCode: matchedRole.code,
            mode: 'PIN Auth',
            loggedAt: Date.now(),
          };
          localStorage.setItem('velvra_admin_session', JSON.stringify(session));
          localStorage.setItem('velvra_access_token', 'nemu-token-' + matchedRole.code + '-' + Date.now());
          useAuthStore.getState().setUser({
            id: matchedRole.code === 'super_admin' ? 1 : matchedRole.code === 'store_manager' ? 2 : matchedRole.code === 'kds' ? 3 : 4,
            name: session.name,
            email: `${matchedRole.code}@nemuspace.com`,
            role: matchedRole.code,
            permissions: ['all'],
          });
          useAuthStore.getState().setToken('nemu-token-' + matchedRole.code + '-' + Date.now());
          router.push(matchedRole.redirect);
        } else {
          setError('PIN tidak valid. Gunakan PIN demo di bawah untuk memilih peran/role.');
          setPin('');
          setLoading(false);
        }
      } else {
        if (
          (email.toLowerCase().includes('admin') || email.toLowerCase().includes('owner') || email.toLowerCase().includes('kasir') || email.toLowerCase().includes('nemu')) &&
          password.length >= 4
        ) {
          const targetRole = ROLES_INFO.find((r) => r.code === selectedRoleCode) || ROLES_INFO[0];
          const session = {
            name: email.split('@')[0].toUpperCase(),
            role: targetRole.title,
            roleCode: targetRole.code,
            mode: 'Email Auth',
            loggedAt: Date.now(),
          };
          localStorage.setItem('velvra_admin_session', JSON.stringify(session));
          localStorage.setItem('velvra_access_token', 'nemu-token-' + targetRole.code + '-' + Date.now());
          useAuthStore.getState().setUser({
            id: 1,
            name: session.name,
            email: email,
            role: targetRole.code,
            permissions: ['all'],
          });
          useAuthStore.getState().setToken('nemu-token-' + targetRole.code + '-' + Date.now());
          router.push(targetRole.redirect);
        } else {
          setError('Kredensial tidak tepat. Masukkan email (misal: kasir@nemuspace.com) dan kata sandi minimal 4 karakter.');
          setLoading(false);
        }
      }
    }, 500);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    verifyLogin('', 'email');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#1E3D31] dark:bg-[#14201A] px-4 py-12 text-white relative overflow-x-hidden selection:bg-[#C89B5C]/30">
      {/* Dynamic Background Glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#C89B5C]/15 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#C89B5C]/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#163026]/95 dark:bg-[#1A2620]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C89B5C] to-[#9e7641] shadow-lg shadow-[#C89B5C]/20 text-[#1E3D31] mb-4">
            <Coffee size={34} className="stroke-[2.2]" />
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-wide text-white">
            NEMU <span className="text-[#C89B5C] font-light">Space</span> Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#E4D9C4]/80 uppercase tracking-[0.25em] font-sans font-medium">
            Specialty Roastery · Enterprise POS & Management
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex rounded-2xl bg-black/30 p-1.5 border border-white/10 max-w-md mx-auto">
          <button
            onClick={() => { setTab('pin'); setError(null); setPin(''); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
              tab === 'pin' ? 'bg-[#C89B5C] text-[#1E3D31] shadow-lg' : 'text-white/70 hover:text-white'
            }`}
          >
            <KeyRound size={16} /> Cepat via PIN (Shift)
          </button>
          <button
            onClick={() => { setTab('email'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition-all ${
              tab === 'email' ? 'bg-[#C89B5C] text-[#1E3D31] shadow-lg' : 'text-white/70 hover:text-white'
            }`}
          >
            <Mail size={16} /> Email Kredensial
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/40 bg-red-500/15 p-4 text-xs font-semibold text-red-300 animate-in fade-in">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-400" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* PIN Auth Mode */}
        {tab === 'pin' && (
          <div className="mt-8 flex flex-col items-center">
            {/* Role Demo Quick Picker */}
            <div className="w-full mb-8 space-y-3">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#C89B5C] text-center">
                ★ Pilih Role untuk Isi PIN Otomatis / Cepat:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ROLES_INFO.map((r) => {
                  const Icon = r.icon;
                  const isSelected = pin === r.pin;
                  return (
                    <button
                      key={r.code}
                      type="button"
                      onClick={() => {
                        setPin(r.pin);
                        verifyLogin(r.pin, 'pin');
                      }}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                        isSelected
                          ? 'bg-[#C89B5C] border-[#C89B5C] text-[#1E3D31] shadow-md scale-105 font-bold'
                          : 'bg-white/5 border-white/15 text-white/90 hover:bg-white/10 hover:border-[#C89B5C]/50'
                      }`}
                    >
                      <Icon size={18} className={isSelected ? 'text-[#1E3D31]' : 'text-[#C89B5C]'} />
                      <span className="text-xs font-bold mt-1.5 leading-tight">{r.title}</span>
                      <span className="text-[10px] font-mono mt-0.5 opacity-80">PIN: {r.pin}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PIN Display Dots */}
            <div className="flex items-center gap-3.5 mb-8">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all font-mono text-2xl font-extrabold ${
                    pin.length > idx
                      ? 'border-[#C89B5C] bg-[#C89B5C]/25 text-[#C89B5C] shadow-[0_0_20px_rgba(200,155,93,0.3)]'
                      : 'border-white/15 bg-black/25 text-gray-500'
                  }`}
                >
                  {pin.length > idx ? '●' : '·'}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid w-full max-w-sm grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  disabled={loading}
                  onClick={() => handlePinInput(num)}
                  className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 font-mono text-xl font-bold text-white transition-all hover:bg-white/10 hover:border-[#C89B5C]/40 active:scale-95 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                disabled={loading}
                onClick={() => setPin('')}
                className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-xs font-bold text-red-400 uppercase tracking-wider transition-all hover:bg-red-500/15 active:scale-95"
              >
                Reset
              </button>
              <button
                disabled={loading}
                onClick={() => handlePinInput('0')}
                className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 font-mono text-xl font-bold text-white transition-all hover:bg-white/10 hover:border-[#C89B5C]/40 active:scale-95"
              >
                0
              </button>
              <button
                disabled={loading || pin.length === 0}
                onClick={handleBackspace}
                className="flex h-14 items-center justify-center rounded-2xl border border-white/10 bg-black/25 text-xs font-bold text-[#C89B5C] uppercase tracking-wider transition-all hover:bg-[#C89B5C]/15 active:scale-95 disabled:opacity-30"
              >
                Hapus
              </button>
            </div>
          </div>
        )}

        {/* Email Auth Mode */}
        {tab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-5 max-w-md mx-auto">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#E4D9C4]/80 mb-2">
                Pilih Target Role Akses
              </label>
              <select
                value={selectedRoleCode}
                onChange={(e) => setSelectedRoleCode(e.target.value)}
                className="w-full rounded-2xl border border-white/15 bg-black/35 py-3.5 px-4 text-sm font-semibold text-white focus:border-[#C89B5C] focus:outline-none"
              >
                {ROLES_INFO.map((r) => (
                  <option key={r.code} value={r.code} className="bg-[#1E3D31] text-white">
                    {r.title} ({r.badge}) ➔ {r.redirect}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#E4D9C4]/80 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="kasir@nemuspace.com atau admin@nemuspace.com"
                  className="w-full rounded-2xl border border-white/15 bg-black/35 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#C89B5C] focus:outline-none focus:ring-1 focus:ring-[#C89B5C]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#E4D9C4]/80 mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/15 bg-black/35 py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-[#C89B5C] focus:outline-none focus:ring-1 focus:ring-[#C89B5C]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C89B5C] py-4 text-sm font-bold text-[#1E3D31] hover:bg-[#b88c4d] transition-all shadow-lg hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                <Sparkles size={18} />
                <span>Masuk ke Portal NEMU Space</span>
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-white/70 text-center">
              <ShieldCheck size={15} className="text-[#C89B5C]" />
              <span>Email Demo: <strong className="text-[#C89B5C]">kasir@nemuspace.com</strong> · Pass: apapun</span>
            </div>
          </form>
        )}

        {/* Footer Info */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#C89B5C]" />
            <span>Multi-Role RBAC & Offline-First POS Ready</span>
          </div>
          <span>&copy; {new Date().getFullYear()} NEMU Space Specialty Roastery</span>
        </div>
      </div>
    </div>
  );
}
