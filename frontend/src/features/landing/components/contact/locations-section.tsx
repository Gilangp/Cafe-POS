'use client';

import Image from 'next/image';
import { Clock, MapPin } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export function LocationsSection() {
  const { t } = useLanguage();

  return (
    <section id="locations" className="py-24 md:py-36 bg-[#FAF6F0] overflow-hidden">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: Stacked Rounded Interior Cards matching reference */}
        <div className="lg:col-span-6 relative min-h-[440px] sm:min-h-[520px] flex items-center justify-center">
          {/* Background Decorative Glow */}
          <div className="absolute -left-12 top-1/3 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />

          {/* Top/Back Interior Card */}
          <div className="absolute top-4 left-4 sm:left-12 w-64 sm:w-80 h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-[-4deg] z-10 transition-transform duration-500 hover:rotate-0 hover:z-30">
            <Image
              src="/images/hero-bg.jpg"
              alt="Velvet Brew Flagship Lounge Interior"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
              <span className="font-serif text-white font-bold text-sm sm:text-base">{t.locations.loungeLabel}</span>
            </div>
          </div>

          {/* Bottom/Front Overlapping Card */}
          <div className="absolute bottom-4 right-4 sm:right-12 w-64 sm:w-80 h-72 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white rotate-[4deg] z-20 transition-transform duration-500 hover:rotate-0 hover:z-30">
            <Image
              src="/images/iced-macchiato.png"
              alt="Bar Counter & Espresso Bar"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-5">
              <span className="font-serif text-white font-bold text-sm sm:text-base">{t.locations.barLabel}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Title & Pill Opening Hours Cards matching reference */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-2">
            <span className="font-serif text-xl sm:text-2xl italic text-primary font-medium">
              {t.locations.subtitle}
            </span>
            <h2 className="section-title text-foreground font-serif">
              {t.locations.title}
            </h2>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
            {t.locations.description}
          </p>

          {/* Pill Hours/Contact Cards */}
          <div className="space-y-4 pt-2">
            {/* Pill 1: Mon - Fri Hours */}
            <div className="flex items-center gap-4 rounded-full border border-cream-300 bg-white/80 p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e1a17] text-white">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.locations.monFri}</span>
                <p className="font-serif text-base sm:text-lg font-bold text-foreground">{t.locations.monFriHours}</p>
              </div>
            </div>

            {/* Pill 2: Saturday Hours */}
            <div className="flex items-center gap-4 rounded-full border border-cream-300 bg-white/80 p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e1a17] text-white">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.locations.saturday}</span>
                <p className="font-serif text-base sm:text-lg font-bold text-foreground">{t.locations.saturdayHours}</p>
              </div>
            </div>

            {/* Pill 3: Sunday Hours */}
            <div className="flex items-center gap-4 rounded-full border border-cream-300 bg-white/80 p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e1a17] text-white">
                <Clock size={20} className="text-primary" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.locations.sunday}</span>
                <p className="font-serif text-base sm:text-lg font-bold text-foreground">{t.locations.sundayHours}</p>
              </div>
            </div>

            {/* Pill 4: Flagship Address */}
            <div className="flex items-center gap-4 rounded-full border border-cream-300 bg-white/80 p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#1e1a17] text-white">
                <MapPin size={20} className="text-primary" />
              </div>
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.locations.flagshipLabel}</span>
                <p className="font-serif text-base font-bold text-foreground">{t.locations.flagshipAddress}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}