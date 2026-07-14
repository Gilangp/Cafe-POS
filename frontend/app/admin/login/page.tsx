'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Lock, Mail, KeyRound, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';

export default function AdminLoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'pin' | 'email'>('pin');
  const [pin, setPin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
        // Valid PINs: 8888 (Super Admin), 1234 (Manager), 0000 (Barista KDS)
        if (valueToVerify === '8888' || valueToVerify === '1234' || valueToVerify === '0000') {
          const role = valueToVerify === '8888' ? 'Super Admin' : valueToVerify === '1234' ? 'Store Manager' : 'Barista Lead';
          const roleCode = valueToVerify === '8888' ? 'super_admin' : valueToVerify === '1234' ? 'store_manager' : 'barista';
          const session = {
            name: valueToVerify === '8888' ? 'Gilang P. (Owner)' : valueToVerify === '1234' ? 'Nadia (Manager)' : 'Budi (Barista Lead)',
            role,
            mode: 'PIN Auth',
            loggedAt: Date.now(),
          };
          localStorage.setItem('velvra_admin_session', JSON.stringify(session));
          localStorage.setItem('velvra_access_token', 'demo-token-' + roleCode + '-' + Date.now());
          useAuthStore.getState().setUser({
            id: valueToVerify === '8888' ? 1 : valueToVerify === '1234' ? 2 : 3,
            name: session.name,
            email: valueToVerify === '8888' ? 'gilang@velvracoffee.com' : 'staff@velvracoffee.com',
            role: roleCode,
            permissions: ['all'],
          });
          useAuthStore.getState().setToken('demo-token-' + roleCode + '-' + Date.now());
          router.push('/admin/pos');
        } else {
          setError('PIN tidak valid. Gunakan PIN demo: 8888 (Super Admin) atau 1234 (Manager)');
          setPin('');
          setLoading(false);
        }
      } else {
        // Email/password login check
        if (
          (email.toLowerCase().includes('admin') || email.toLowerCase().includes('gilang')) &&
          password.length >= 4
        ) {
          const session = {
            name: email.split('@')[0].toUpperCase(),
            role: 'Super Admin',
            mode: 'Email Auth',
            loggedAt: Date.now(),
          };
          localStorage.setItem('velvra_admin_session', JSON.stringify(session));
          localStorage.setItem('velvra_access_token', 'demo-token-super_admin-' + Date.now());
          useAuthStore.getState().setUser({
            id: 1,
            name: session.name,
            email: email,
            role: 'super_admin',
            permissions: ['all'],
          });
          useAuthStore.getState().setToken('demo-token-super_admin-' + Date.now());
          router.push('/admin/pos');
        } else {
          setError('Kredensial tidak tepat. Gunakan email: admin@velvracoffee.com dan password apa saja minimal 4 karakter');
          setLoading(false);
        }
      }
    }, 600);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    verifyLogin('', 'email');
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#12100E] px-4 py-12 text-white overflow-y-auto">
      {/* Glow Background Effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-[#BA935D]/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#BA935D]/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1A1715]/90 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#BA935D]/20 border border-[#BA935D]/30 text-[#BA935D] shadow-inner mb-4">
            <Coffee size={32} />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white">Velvra Portal</h1>
          <p className="mt-1 text-xs text-gray-400 uppercase tracking-widest font-semibold">
            Coffee Shop · Enterprise Management System
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 flex rounded-2xl bg-[#12100E] p-1.5 border border-white/5">
          <button
            onClick={() => { setTab('pin'); setError(null); setPin(''); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              tab === 'pin' ? 'bg-[#BA935D] text-[#12100E] shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <KeyRound size={15} /> Cepat via PIN
          </button>
          <button
            onClick={() => { setTab('email'); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
              tab === 'email' ? 'bg-[#BA935D] text-[#12100E] shadow-lg' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Mail size={15} /> Email / Kredensial
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400 animate-fadeIn">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* PIN Auth Mode */}
        {tab === 'pin' && (
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-3 mb-8">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl border-2 transition-all font-mono text-2xl font-bold ${
                    pin.length > idx
                      ? 'border-[#BA935D] bg-[#BA935D]/20 text-[#BA935D] shadow-[0_0_15px_rgba(186,147,93,0.3)]'
                      : 'border-white/10 bg-[#12100E] text-gray-600'
                  }`}
                >
                  {pin.length > idx ? '●' : '·'}
                </div>
              ))}
            </div>

            {/* Keypad */}
            <div className="grid w-full grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  disabled={loading}
                  onClick={() => handlePinInput(num)}
                  className="flex h-14 items-center justify-center rounded-2xl border border-white/5 bg-[#12100E] font-mono text-xl font-bold text-white transition-all hover:bg-white/10 active:scale-95 disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <button
                disabled={loading}
                onClick={() => setPin('')}
                className="flex h-14 items-center justify-center rounded-2xl border border-white/5 bg-[#12100E] text-xs font-bold text-red-400 uppercase tracking-wider transition-all hover:bg-red-500/10 active:scale-95"
              >
                Reset
              </button>
              <button
                disabled={loading}
                onClick={() => handlePinInput('0')}
                className="flex h-14 items-center justify-center rounded-2xl border border-white/5 bg-[#12100E] font-mono text-xl font-bold text-white transition-all hover:bg-white/10 active:scale-95"
              >
                0
              </button>
              <button
                disabled={loading || pin.length === 0}
                onClick={handleBackspace}
                className="flex h-14 items-center justify-center rounded-2xl border border-white/5 bg-[#12100E] text-xs font-bold text-[#BA935D] uppercase tracking-wider transition-all hover:bg-[#BA935D]/10 active:scale-95 disabled:opacity-30"
              >
                Hapus
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-gray-400">
              <ShieldCheck size={14} className="text-[#BA935D]" />
              <span>PIN Cepat Demo: <strong className="text-[#BA935D] font-mono">8888</strong> (Owner) · <strong className="text-[#BA935D] font-mono">1234</strong> (Manager)</span>
            </div>
          </div>
        )}

        {/* Email Auth Mode */}
        {tab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@velvracoffee.com"
                  className="w-full rounded-2xl border border-white/10 bg-[#12100E] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/10 bg-[#12100E] py-3.5 pl-11 pr-4 text-sm text-white placeholder:text-gray-600 focus:border-[#BA935D] focus:outline-none focus:ring-1 focus:ring-[#BA935D]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#BA935D] py-4 text-sm font-bold text-[#12100E] hover:bg-[#c9a36d] transition-all shadow-lg hover:shadow-[0_0_20px_rgba(186,147,93,0.4)] disabled:opacity-50"
              >
                <span>Masuk ke Portal Admin</span>
                <ArrowRight size={17} />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-gray-400 text-center">
              <ShieldCheck size={14} className="text-[#BA935D]" />
              <span>Email Demo: <strong className="text-[#BA935D]">admin@velvracoffee.com</strong> · Pass: apapun</span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
