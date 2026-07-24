'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Coffee, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/shared/api/axios';
import { useAuthStore } from '@/store/auth.store';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [status, setStatus] = useState<'default' | 'loading' | 'error' | 'success'>('default');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setStatus('error');
      setErrorMessage('Email dan password wajib diisi.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('Format email tidak valid.');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password minimal 8 karakter.');
      return;
    }

    setStatus('loading');

    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data?.success) {
        setStatus('success');
        
        const { user, token } = response.data.data;
        const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : 'Unknown';
        
        // Simpan ke Global Store
        useAuthStore.getState().setToken(token);
        useAuthStore.getState().setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          role: userRole,
        });

        if (rememberMe) {
          localStorage.setItem('nemu_remember', email);
        }

        // Set cookie untuk Next.js Middleware
        document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 hari
        

        // Redirect berdasarkan role
        setTimeout(() => {
          const roleLower = userRole.toLowerCase();
          if (roleLower === 'kasir') window.location.href = '/dashboard/cashier/pos';
          else if (roleLower === 'dapur_barista') window.location.href = '/dashboard/admin/kds';
          else if (roleLower === 'owner') window.location.href = '/dashboard/owner';
          else window.location.href = '/dashboard/admin';
        }, 800);
      } else {
        setStatus('error');
        setErrorMessage(response.data?.message || 'Login gagal.');
      }
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Terjadi kesalahan jaringan atau server.');
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#FAF3E7] dark:bg-[#0A100D]">
      {/* Kolom Kiri: Branding (40%) - Sembunyi di Mobile */}
      <div className="hidden lg:flex lg:w-[40%] flex-col justify-between bg-[#1E3D31] text-white p-12 relative overflow-hidden">
        {/* Dekorasi Latar Belakang */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#C89B5C] blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-[#0A1A12] to-transparent" />
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C89B5C] to-[#9e7641] shadow-lg">
            <Coffee size={24} className="text-[#1E3D31] stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-wide">
              NEMU <span className="text-[#C89B5C] font-light">Space</span>
            </h1>
          </div>
        </div>

        <div className="relative z-10 max-w-sm">
          <h2 className="text-3xl font-heading font-bold leading-tight mb-4 text-white">
            Kelola operasional kedai kopi dengan lebih cerdas.
          </h2>
          <p className="text-white/80 text-sm leading-relaxed">
            Sistem manajemen terintegrasi untuk Owner, Admin, dan Kasir. Akses semua kebutuhan operasional NEMU Space dalam satu pintu yang aman dan cepat.
          </p>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          &copy; {new Date().getFullYear()} NEMU Space Specialty Roastery.
        </div>
      </div>

      {/* Kolom Kanan: Login Card (60%) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-[420px] sm:max-w-[480px] bg-white dark:bg-[#14201A] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-[#E4D9C4]/50 dark:border-white/10 p-8 sm:p-10"
        >
          {/* Header Mobile Only */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#C89B5C] to-[#9e7641] shadow-lg">
                <Coffee size={24} className="text-[#1E3D31] stroke-[2.5]" />
              </div>
              <h1 className="font-heading text-xl font-bold tracking-wide text-[#1E3D31] dark:text-white">
                NEMU <span className="text-[#C89B5C] font-light">Space</span>
              </h1>
            </div>
          </div>

          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-[#1E3D31] dark:text-white mb-2">Masuk ke Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Silakan masuk menggunakan akun yang telah diberikan.</p>
          </div>

          <AnimatePresence>
            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                  <div className="mt-0.5">•</div>
                  <span>{errorMessage}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-semibold text-[#1E3D31] dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  disabled={status === 'loading' || status === 'success'}
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B5C] focus:border-transparent bg-gray-50 dark:bg-[#1A2620] text-gray-900 dark:text-white transition-all disabled:opacity-60"
                  placeholder="admin@nemuspace.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('default');
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-[#1E3D31] dark:text-gray-300">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  disabled={status === 'loading' || status === 'success'}
                  className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C89B5C] focus:border-transparent bg-gray-50 dark:bg-[#1A2620] text-gray-900 dark:text-white transition-all disabled:opacity-60"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (status === 'error') setStatus('default');
                  }}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={status === 'loading' || status === 'success'}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  disabled={status === 'loading' || status === 'success'}
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-[#C89B5C] focus:ring-[#C89B5C] border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                  Ingat Saya
                </label>
              </div>

              <div className="text-sm">
                <a href="/forgot-password" className="font-semibold text-[#C89B5C] hover:text-[#b88c4d] transition-colors">
                  Lupa Password?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`group relative w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-[#1E3D31] transition-all shadow-md
                  ${status === 'success' ? 'bg-green-500 text-white' : 'bg-[#C89B5C] hover:bg-[#b88c4d]'} 
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C89B5C] disabled:opacity-70`}
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Memproses...
                  </>
                ) : status === 'success' ? (
                  'Login Berhasil'
                ) : (
                  <>
                    Masuk
                    <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
