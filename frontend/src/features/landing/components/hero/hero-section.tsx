'use client';

import Image from 'next/image';
import { Sparkles, ShieldCheck, Flame, Clock } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative overflow-hidden bg-[#12100E] pt-28 pb-32 md:pt-36 md:pb-40 text-white">
      {/* Background Texture / Glows */}
      <div className="absolute inset-0 z-0 opacity-40">
        <Image
          src="/images/hero-bg.jpg"
          alt="Coffee Beans Background"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#12100E] via-[#12100E]/85 to-[#12100E]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12100E] via-transparent to-[#12100E]/60" />
      </div>

      {/* Decorative Gold Glow Circles */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[120px] pointer-events-none z-0" />
      <div className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-accent/15 blur-[100px] pointer-events-none z-0" />

      {/* Main Hero Content */}
      <div className="container-page relative z-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Left Column: Typography & CTAs */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
            <Sparkles size={14} className="text-primary animate-pulse" />
            <span className="font-serif text-xs italic tracking-wide text-primary">
              {t.hero.subtitle}
            </span>
          </div>

          {/* Main Title matching reference */}
          <h1 className="font-serif text-4xl font-bold leading-[1.15] sm:text-5xl md:text-6xl lg:text-7xl">
            {t.hero.titleLine1} <br />
            {t.hero.titleLine2} <span className="text-gold italic font-normal">{t.hero.titleHighlight}</span>
          </h1>

          {/* Description */}
          <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t.hero.description}
          </p>

          {/* CTA Buttons side-by-side matching screenshot exactly */}
          <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-5">
            <a href="#menu" className="btn-primary">
              {t.hero.exploreBtn}
            </a>
            <a href="#about" className="btn-secondary">
              {t.hero.learnBtn}
            </a>
          </div>
        </div>

        {/* Right Column: Floating Steaming Coffee Cup Visual */}
        <div className="lg:col-span-5 flex justify-center relative">
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 md:w-96 md:h-96 animate-float">
            {/* Soft Warm Halo Behind Cup */}
            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-primary/30 to-accent/20 blur-2xl" />
            
            {/* Cup Image */}
            <Image
              src="/images/espresso.png"
              alt="Steaming Velvet Brew Coffee Cup"
              fill
              className="object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.8)] z-10"
              priority
            />
          </div>
        </div>
      </div>

      {/* Bottom Floating Stats / Features Box overlapping into the cream section */}
      <div className="container-page relative z-20 mt-16 lg:mt-20">
        <div className="rounded-2xl border border-primary/30 bg-[#1A1715]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="grid gap-6 sm:grid-cols-3 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">{t.hero.stat1Title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t.hero.stat1Desc}
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <Flame size={24} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">{t.hero.stat2Title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t.hero.stat2Desc}
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:pl-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
                <Clock size={24} />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-white">{t.hero.stat3Title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/60">
                  {t.hero.stat3Desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}