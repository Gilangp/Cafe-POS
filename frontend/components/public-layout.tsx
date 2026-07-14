'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Coffee, Menu as MenuIcon, X, Globe, Phone, Mail, Instagram, Facebook, Twitter, Send, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage, LanguageProvider } from '@/context/language-context';

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, locale, toggleLocale } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'Beranda' },
    { href: '/about', label: 'Tentang Kami' },
    { href: '/menu', label: 'Katalog Menu' },
    { href: '/branches', label: 'Cabang' },
    { href: '/careers', label: 'Karir' },
    { href: '/events', label: 'Event & Kelas' },
    { href: '/blog', label: 'Jurnal' },
    { href: '/gallery', label: 'Galeri' },
    { href: '/accessibility', label: 'WCAG AA' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-[#12100E]/95 py-3 shadow-xl backdrop-blur-md'
          : 'bg-[#12100E] py-4 border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#BA935D] rounded-xl p-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BA935D]/20 border border-[#BA935D]/40 transition-transform duration-300 group-hover:scale-110">
            <Coffee size={20} className="text-[#BA935D]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-wider text-white">Velvra</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-[#BA935D] -mt-1 font-sans font-medium">Velvet Brew</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav aria-label="Navigasi Utama Publik" className="hidden xl:flex items-center gap-5">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-bold uppercase tracking-wider text-white/80 transition-colors hover:text-[#BA935D] focus:outline-none focus:ring-2 focus:ring-[#BA935D] rounded-lg px-2 py-1"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Action Buttons */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/order"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#BA935D] px-6 text-xs font-bold uppercase tracking-wider text-[#12100E] shadow-md hover:bg-[#c8a169] focus:outline-none focus:ring-2 focus:ring-white transition-all"
          >
            Pesan Online
          </Link>

          <Link
            href="/reserve"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/30 bg-white/5 px-5 text-xs font-bold uppercase tracking-wider text-white hover:border-[#BA935D] hover:text-[#BA935D] focus:outline-none focus:ring-2 focus:ring-[#BA935D] transition-all"
          >
            Reservasi
          </Link>

          <button
            onClick={toggleLocale}
            aria-label={`Ganti bahasa ke ${locale === 'id' ? 'English' : 'Bahasa Indonesia'}`}
            title={`Ganti bahasa (${locale === 'id' ? 'ID ➔ EN' : 'EN ➔ ID'})`}
            className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-[#1A1715]/90 text-white/80 transition-all hover:border-[#BA935D] hover:bg-[#BA935D]/15 hover:text-[#BA935D] focus:outline-none focus:ring-2 focus:ring-[#BA935D] shrink-0"
          >
            <Globe size={18} />
            <span className="absolute -bottom-1 -right-1 flex h-4.5 w-5 items-center justify-center rounded-full bg-[#BA935D] text-[9px] font-bold text-[#110E0D] shadow-sm font-sans border border-[#12100E]">
              {locale.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-3 xl:hidden">
          <Link
            href="/order"
            className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#BA935D] px-4 text-[11px] font-bold uppercase tracking-wider text-[#12100E]"
          >
            Pesan
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-white/20 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-[#BA935D]"
            aria-label="Buka navigasi mobile"
          >
            {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#12100E]/98 px-6 py-6 shadow-2xl xl:hidden animate-in fade-in">
          <nav aria-label="Navigasi mobile" className="flex flex-col gap-2">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center rounded-xl px-4 text-sm font-bold uppercase tracking-wider text-white/90 hover:bg-white/10 hover:text-[#BA935D]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3">
              <Link
                href="/order"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-xl bg-[#BA935D] text-xs font-bold uppercase text-[#12100E]"
              >
                Pesan Online
              </Link>
              <Link
                href="/reserve"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[44px] items-center justify-center rounded-xl border border-white/30 text-xs font-bold uppercase text-white"
              >
                Reservasi
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#12100E] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-6 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#BA935D]/20 border border-[#BA935D]/40">
                <Coffee size={24} className="text-[#BA935D]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold tracking-wider text-white">Velvra</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#BA935D] -mt-1 font-sans font-semibold">Velvet Brew Co.</span>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-white/70">
              Velvra Roastery & Artisan Lounge adalah perwujudan dedikasi kami dalam menghadirkan biji kopi nusantara grade specialty dengan teknik pemanggangan presisi dan pelayanan slow-bar berkelas internasional.
            </p>

            <div className="space-y-3 pt-2 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-[#BA935D] shrink-0" />
                <span>+62 21 555 0123 / +62 811 8899 7766</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-[#BA935D] shrink-0" />
                <span>experience@velvra.id · careers@velvra.id</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a
                href="#"
                aria-label="Instagram Velvra"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:border-[#BA935D] hover:bg-[#BA935D] hover:text-[#12100E] transition-all"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Facebook Velvra"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:border-[#BA935D] hover:bg-[#BA935D] hover:text-[#12100E] transition-all"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter Velvra"
                className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 hover:border-[#BA935D] hover:bg-[#BA935D] hover:text-[#12100E] transition-all"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-center">
            <div className="rounded-3xl border border-[#BA935D]/30 bg-[#1A1715]/90 p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl space-y-4">
              <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                <span>Daftar Newsletter & Privilege Gold Tier</span>
              </h3>
              <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
                Dapatkan informasi eksklusif mengenai jadwal cupping session gratis, peluncuran batch kopi seasonal (*single-origin*), serta undangan pre-tasting menu baru langsung di e-mail Anda.
              </p>

              <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 pt-2">
                <input
                  type="email"
                  placeholder="Alamat email Anda..."
                  required
                  className="min-h-[44px] w-full rounded-2xl border border-white/20 bg-white/5 px-5 text-sm text-white placeholder:text-white/40 focus:border-[#BA935D] focus:outline-none"
                />
                <button
                  type="submit"
                  className="min-h-[44px] rounded-2xl bg-[#BA935D] px-6 text-xs font-bold uppercase tracking-wider text-[#12100E] hover:bg-[#c8a169] shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Langganan</span>
                  <Send size={15} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} Velvra (Velvet Brew Co.). Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <Link href="/accessibility" className="hover:text-[#BA935D] transition-colors flex items-center gap-1">
              <ShieldCheck size={14} /> Kepatuhan WCAG 2.2 AA
            </Link>
            <Link href="/about" className="hover:text-[#BA935D] transition-colors">Privasi</Link>
            <Link href="/branches" className="hover:text-[#BA935D] transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col bg-[#FAF6F0] selection:bg-[#BA935D]/30 text-gray-800 pt-20">
        <PublicNavbar />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </LanguageProvider>
  );
}
