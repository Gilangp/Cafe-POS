'use client';

import Image from 'next/image';
import { Coffee, Instagram, Facebook, Twitter, Send, Phone, Mail } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/shared/providers/language-context';

export function LandingFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative overflow-hidden bg-[#12100E] text-white pt-20 pb-12 border-t border-white/10">
      {/* Background Coffee Beans Glow */}
      <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
        <Image
          src="/images/hero-bg.jpg"
          alt="Coffee Beans Texture"
          fill
          className="object-cover object-bottom"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-[#12100E]/90 to-[#12100E]/80" />
      </div>

      <div className="container-page relative z-10">
        {/* Main Grid matching reference layout */}
        <div className="grid gap-16 lg:grid-cols-12 pb-16 border-b border-white/10">
          {/* Left Side: Brand & Contact Info */}
          <div className="lg:col-span-6 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 border border-primary/40 transition-transform duration-300 group-hover:scale-110">
                <Coffee size={24} className="text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-3xl font-bold tracking-wider text-white">NEMU Space</span>
                <span className="text-[10px] uppercase tracking-[0.3em] text-primary -mt-1 font-sans font-semibold">Coffee & Eatery</span>
              </div>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-white/70">
              {t.footer.brandDesc}
            </p>

            <div className="space-y-3 pt-2 text-sm text-white/80">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-primary shrink-0" />
                <span>+62 21 555 0123</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-primary shrink-0" />
                <span>hello@velvetbrew.id</span>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-[#12100E]"
              >
                <Instagram size={18} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-[#12100E]"
              >
                <Facebook size={18} />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white/80 transition-all duration-300 hover:border-primary hover:bg-primary hover:text-[#12100E]"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>&copy; {new Date().getFullYear()} NEMU Space. {t.footer.copyright}</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.footer.terms}</a>
            <a href="#" className="hover:text-primary transition-colors">{t.footer.cookies}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}