'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Coffee, ShoppingBag, Calendar, User, Menu, X, Globe, ChevronRight } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
}

export function CustomerHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // We can also retrieve cart count from global state / localStorage in full production
  const navItems = [
    { href: '/', label: 'Beranda', exact: true },
    { href: '/order', label: 'Pesan Online', icon: ShoppingBag },
    { href: '/reserve', label: 'Reservasi Meja', icon: Calendar },
    { href: '/account', label: 'Member & Poin', icon: User },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#12100E]/90 backdrop-blur-md border-b border-white/10 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#BA935D]/20 border border-[#BA935D]/40 group-hover:scale-105 transition-transform">
              <Coffee size={20} className="text-[#BA935D]" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-wider text-white group-hover:text-[#BA935D] transition-colors">
                Velvra
              </span>
              <p className="text-[9px] uppercase tracking-[0.25em] text-[#BA935D]/80 -mt-1 font-sans">
                Artisan Coffee Bar
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? 'bg-[#BA935D] text-[#12100E] font-bold shadow-lg shadow-[#BA935D]/20'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon && <item.icon size={16} className={active ? 'text-[#12100E]' : 'text-[#BA935D]'} />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            <Link
              href="/menu"
              className="hidden sm:flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#BA935D] to-[#d4af7a] px-5 py-2.5 text-sm font-bold text-[#12100E] shadow-md hover:opacity-95 active:scale-95 transition-all"
            >
              <ShoppingBag size={16} />
              <span>Pesan Sekarang</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-[#BA935D] hover:text-[#BA935D] transition-all"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#12100E] px-4 py-6 space-y-3 animate-in slide-in-from-top duration-200">
          {navItems.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-5 py-3.5 text-base font-semibold transition-all ${
                  active
                    ? 'bg-[#BA935D] text-[#12100E] font-bold'
                    : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon ? <item.icon size={18} className={active ? 'text-[#12100E]' : 'text-[#BA935D]'} /> : <Coffee size={18} className={active ? 'text-[#12100E]' : 'text-[#BA935D]'} />}
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={16} className={active ? 'text-[#12100E]' : 'text-white/40'} />
              </Link>
            );
          })}

          <div className="pt-4 border-t border-white/10">
            <Link
              href="/menu"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#BA935D] py-4 text-sm font-bold text-[#12100E] shadow-lg"
            >
              <ShoppingBag size={18} />
              <span>Buka Katalog & Pesan</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
