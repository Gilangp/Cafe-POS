'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee,
  Menu as MenuIcon,
  X,
  Globe,
  Phone,
  Mail,
  Instagram,
  Facebook,
  Twitter,
  Send,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Calendar,
  Store,
  Utensils,
  Home,
  Info,
  Image as ImageIcon,
  MapPin,
  Clock,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage, LanguageProvider } from '@/shared/providers/language-context';
import { CartProvider } from '@/shared/providers/cart-context';
import { Toaster } from '@/shared/components/ui/toaster';
import api from '@/shared/api/axios';

export function PublicNavbar({ settings }: { settings?: any }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, locale, toggleLocale } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: t.header.home, icon: Home },
    { href: '/contact', label: t.header.about, icon: Info },
    { href: '/menu', label: t.header.menu, icon: Utensils },
    { href: '/reservation', label: t.header.reservations, icon: Calendar },
    { href: '/article', label: t.header.journal, icon: BookOpen },
    { href: '/gallery', label: t.header.gallery, icon: ImageIcon },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#1E3D31]/95 py-3.5 shadow-2xl backdrop-blur-xl border-b border-[#C89B5C]/25 dark:bg-[#14201A]/95'
          : 'bg-[#1E3D31]/90 py-4 border-b border-white/10 backdrop-blur-md dark:bg-[#14201A]/90'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <Link
          href="/"
          className="group flex items-center gap-3 shrink-0 focus:outline-none focus:ring-2 focus:ring-[#C89B5C] rounded-2xl p-1.5 transition-transform hover:opacity-95"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C89B5C] to-[#9e7641] shadow-lg shadow-[#C89B5C]/20 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            {settings?.general?.logo ? (
              <img src={settings.general.logo} alt="Logo" className="w-6 h-6 object-contain" />
            ) : (
              <Coffee size={22} className="text-[#1E3D31] stroke-[2.2]" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xl sm:text-2xl font-extrabold tracking-wide text-white">
                {settings?.general?.site_name ? (
                  <>
                    {settings.general.site_name.split(' ')[0]} <span className="text-[#C89B5C] font-light">{settings.general.site_name.split(' ').slice(1).join(' ')}</span>
                  </>
                ) : (
                  <>NEMU <span className="text-[#C89B5C] font-light">Space</span></>
                )}
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-[0.28em] text-[#E4D9C4]/80 font-sans font-medium -mt-1">
              {settings?.general?.site_tagline || 'Specialty Roastery'}
            </span>
          </div>
        </Link>

        {/* Center: Glass Navigation Pills (Desktop) */}
        <nav aria-label="Navigasi Utama Publik" className="hidden lg:flex items-center justify-center bg-black/20 border border-white/10 rounded-full px-2 py-1.5 backdrop-blur-md shadow-inner">
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-1.5 rounded-full text-[13px] font-medium tracking-wide transition-all duration-200 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#C89B5C] text-[#1E3D31] font-bold shadow-sm'
                    : 'text-white/85 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Action & Language Switcher */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            onClick={toggleLocale}
            aria-label={`Ganti bahasa ke ${locale === 'id' ? 'English' : 'Bahasa Indonesia'}`}
            title={`Ganti bahasa (${locale === 'id' ? 'ID ➔ EN' : 'EN ➔ ID'})`}
            className="flex h-10 items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 text-xs font-semibold text-white/90 transition-all hover:border-[#C89B5C] hover:bg-[#C89B5C]/15 hover:text-[#C89B5C] focus:outline-none focus:ring-2 focus:ring-[#C89B5C]"
          >
            <Globe size={15} className="text-[#C89B5C]" />
            <span className="uppercase font-mono text-[11px] font-bold">{locale}</span>
          </button>

        </div>

        {/* Mobile Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleLocale}
            aria-label="Ganti bahasa"
            className="flex h-9.5 w-9.5 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xs font-bold text-[#C89B5C]"
          >
            {locale.toUpperCase()}
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[38px] min-w-[38px] items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[#C89B5C]"
            aria-label="Buka navigasi mobile"
          >
            {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/15 bg-[#1E3D31]/98 dark:bg-[#14201A]/98 px-5 py-6 shadow-2xl lg:hidden animate-in slide-in-from-top duration-300 backdrop-blur-2xl">
          <nav aria-label="Navigasi mobile" className="space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex min-h-[46px] items-center gap-3 rounded-2xl px-4 text-sm font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'bg-[#C89B5C] text-[#1E3D31] font-bold shadow-md'
                      : 'text-white/90 hover:bg-white/10 hover:text-[#C89B5C]'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-[#1E3D31]' : 'text-[#C89B5C]'} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="mt-6 pt-5 border-t border-white/15 flex flex-col gap-3">
              <Link
                href="/reservation"
                onClick={() => setMobileOpen(false)}
                className="flex min-h-[46px] items-center justify-center gap-1.5 rounded-2xl border border-white/30 bg-[#C89B5C] text-xs font-bold uppercase tracking-wider text-[#1E3D31] hover:border-[#C89B5C] hover:text-[#1E3D31]"
              >
                <Calendar size={15} />
                <span>{t.header.reservations}</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function PublicFooter({ settings }: { settings?: any }) {
  const general = settings?.general;
  const socialMedia = settings?.social_media || [];
  
  const siteName = general?.site_name || 'NEMU Space';
  const siteTagline = general?.site_tagline || 'Handcrafted Coffee Curations';
  
  // address handling
  const address = general?.address || 'Jl. Kopi Specialty No. 88, Senopati\nJakarta Selatan, 12190';
  const operatingHours = general?.operating_hours || 'Senin - Jumat: 08:00 - 22:00\nSabtu - Minggu: 07:00 - 23:00';
  
  const phone = general?.phone || '+62 21 555 0123';
  const email = general?.email || 'hello@nemuspace.id';

  return (
    <footer className="relative overflow-hidden bg-[#1E3D31] dark:bg-[#14201A] text-white pt-20 pb-12 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid gap-16 lg:grid-cols-12 pb-16 border-b border-white/10">
          <div className="lg:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C89B5C]/20 border border-[#C89B5C]/40">
                {general?.logo ? (
                  <img src={general.logo} alt="Logo" className="w-6 h-6 object-contain" />
                ) : (
                  <Coffee size={24} className="text-[#C89B5C]" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-3xl font-bold tracking-wider text-white">{siteName}</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#C89B5C] -mt-1 font-sans font-semibold">
                  {siteTagline}
                </span>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-white/80">
              {general?.seo_description || 'NEMU Space menghadirkan nuansa kopi specialty bernilai seni tinggi, dipadukan dengan kenyamanan ruang interaktif dan pelayanan paripurna.'}
            </p>

            <div className="flex gap-3 pt-2">
              {socialMedia.length > 0 ? socialMedia.map((social: any) => (
                <a
                  key={social.id}
                  href={social.url}
                  aria-label={`${social.platform} ${siteName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 hover:border-[#C89B5C] hover:bg-[#C89B5C] hover:text-[#1E3D31] transition-all"
                >
                  {social.platform.toLowerCase() === 'instagram' ? <Instagram size={18} /> :
                   social.platform.toLowerCase() === 'facebook' ? <Facebook size={18} /> :
                   social.platform.toLowerCase() === 'twitter' ? <Twitter size={18} /> :
                   <Globe size={18} />}
                </a>
              )) : (
                <>
                  <a href="#" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 hover:border-[#C89B5C] hover:bg-[#C89B5C] hover:text-[#1E3D31] transition-all"><Instagram size={18} /></a>
                  <a href="#" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 hover:border-[#C89B5C] hover:bg-[#C89B5C] hover:text-[#1E3D31] transition-all"><Facebook size={18} /></a>
                  <a href="#" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/90 hover:border-[#C89B5C] hover:bg-[#C89B5C] hover:text-[#1E3D31] transition-all"><Twitter size={18} /></a>
                </>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <h4 className="font-heading text-lg font-bold text-white relative inline-block">
              Tautan Cepat
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#C89B5C] rounded-full"></span>
            </h4>
            <ul className="space-y-3 pt-2">
              {[
                { label: 'Beranda', href: '/' },
                { label: 'Katalog Menu', href: '/menu' },
                { label: 'Reservasi Tempat', href: '/reservation' },
                { label: 'Jurnal & Artikel', href: '/article' },
                { label: 'Galeri', href: '/gallery' },
              ].map((item, idx) => (
                <li key={idx}>
                  <Link href={item.href} className="text-sm text-white/80 hover:text-[#C89B5C] transition-colors flex items-center gap-2">
                    <ChevronRight size={14} className="text-[#C89B5C]/60" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <h4 className="font-heading text-lg font-bold text-white relative inline-block">
              Kunjungi Kami
              <span className="absolute -bottom-2 left-0 w-12 h-1 bg-[#C89B5C] rounded-full"></span>
            </h4>
            
            <div className="space-y-4 pt-2 text-sm text-white/90">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-[#C89B5C] shrink-0 mt-0.5" />
                <span className="leading-relaxed text-white/80">
                  {address.split('\n').map((line: string, i: number) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </span>
              </div>
              
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-[#C89B5C] shrink-0 mt-0.5" />
                <div className="space-y-1 text-white/80">
                  {operatingHours.split('\n').map((line: string, i: number) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Phone size={18} className="text-[#C89B5C] shrink-0" />
                <span className="text-white/80">{phone}</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-[#C89B5C] shrink-0" />
                <span className="text-white/80">{email}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <p>&copy; {new Date().getFullYear()} NEMU Space. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex gap-6">
            <Link href="/accessibility" className="hover:text-[#C89B5C] transition-colors flex items-center gap-1">
              <ShieldCheck size={14} className="text-[#C89B5C]" /> Kepatuhan WCAG 2.2 AA
            </Link>
            <Link href="#" className="hover:text-[#C89B5C] transition-colors">Privasi</Link>
            <Link href="/terms" className="hover:text-[#C89B5C] transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    // Also use the existing api.get if it works, or fallback to the proper path.
    api.get('/settings').then((res: any) => {
      // Handle the axios response format depending on whether there is an interceptor.
      const responseData = res.data?.data ? res.data : res;
      if (responseData && responseData.success) {
        setSettings(responseData.data);
      }
    }).catch(err => {
      console.warn('Failed to fetch global settings, falling back to defaults:', err);
    });
  }, []);

  return (
    <LanguageProvider>
      <CartProvider>
        <div className="min-h-screen flex flex-col bg-[#FAF3E7] dark:bg-[#14201A] selection:bg-[#C89B5C]/30 text-[#1E3D31] dark:text-[#F5EFE6] pt-20">
          <PublicNavbar settings={settings} />
          <main className="flex-1">{children}</main>
          <PublicFooter settings={settings} />
          <Toaster />
        </div>
      </CartProvider>
    </LanguageProvider>
  );
}
