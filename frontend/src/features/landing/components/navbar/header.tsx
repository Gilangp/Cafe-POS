'use client';

import Link from 'next/link';
import { Coffee, Menu as MenuIcon, X, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '@/shared/providers/language-context';

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, locale, toggleLocale } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { href: '#home', label: t.header.home },
    { href: '#featured', label: t.header.featured },
    { href: '#about', label: t.header.about },
    { href: '#journey', label: t.header.journey },
    { href: '#reviews', label: t.header.reviews },
    { href: '#menu', label: t.header.menu },
    { href: '#locations', label: t.header.locations },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'border-b border-white/10 bg-[#12100E]/95 py-3.5 shadow-xl backdrop-blur-md'
          : 'bg-gradient-to-b from-[#12100E]/85 to-transparent py-5'
      }`}
    >
      <div className="container-page flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 border border-primary/40 transition-transform duration-300 group-hover:scale-110">
            <Coffee size={20} className="text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-2xl font-bold tracking-wider text-white">NEMU Space</span>
            <span className="text-[9px] uppercase tracking-[0.25em] text-primary/80 -mt-1 font-sans font-medium">Coffee & Eatery</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav aria-label="Main navigation" className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-semibold uppercase tracking-widest text-white/80 transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right Side: Icon-Only Language Toggle at far right */}
        <div className="hidden items-center gap-5 lg:flex">
          {/* Luxury Circular Icon-Only Language Switcher at far right */}
          <button
            onClick={toggleLocale}
            aria-label={`Switch language to ${locale === 'id' ? 'English' : 'Bahasa Indonesia'}`}
            title={`Click to switch language (${locale === 'id' ? 'ID ➔ EN' : 'EN ➔ ID'})`}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#1A1715]/90 text-white/80 transition-all duration-300 hover:border-[#BA935D] hover:bg-[#BA935D]/15 hover:text-[#BA935D] hover:scale-105 shadow-inner backdrop-blur-md group shrink-0"
          >
            <Globe size={18} className="transition-transform duration-500 group-hover:rotate-45" />
            {/* Tiny elegant active language indicator badge */}
            <span className="absolute -bottom-1 -right-1 flex h-4.5 w-5 items-center justify-center rounded-full bg-[#BA935D] text-[9px] font-bold text-[#110E0D] shadow-sm font-sans tracking-tight border border-[#12100E]">
              {locale.toUpperCase()}
            </span>
          </button>
        </div>

        {/* Mobile Controls: Icon-Only Language Toggle at far right before Hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={toggleLocale}
            aria-label={`Switch language to ${locale === 'id' ? 'English' : 'Bahasa Indonesia'}`}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-[#1A1715]/90 text-white/80 transition-all duration-300 hover:border-[#BA935D] hover:text-[#BA935D]"
          >
            <Globe size={16} />
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4.5 items-center justify-center rounded-full bg-[#BA935D] text-[8px] font-bold text-[#110E0D] shadow-sm font-sans border border-[#12100E]">
              {locale.toUpperCase()}
            </span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-white transition-colors hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#12100E]/98 px-6 py-6 shadow-2xl backdrop-blur-xl lg:hidden">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold uppercase tracking-wider text-white/80 transition-colors hover:bg-white/5 hover:text-primary"
              >
                {item.label}
              </Link>
            ))}
            </nav>
        </div>
      )}
    </header>
  );
}