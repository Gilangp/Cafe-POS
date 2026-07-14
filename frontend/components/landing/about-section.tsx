'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';

export function AboutSection() {
  const { t } = useLanguage();

  return (
    <section id="about" className="py-24 md:py-36 bg-[#FAF6F0] overflow-hidden">
      <div className="container-page grid items-center gap-16 lg:grid-cols-12 lg:gap-12">
        {/* Left Column: 3 Overlapping Polaroid Collage matching reference */}
        <div className="lg:col-span-6 relative min-h-[440px] sm:min-h-[520px] flex items-center justify-center">
          {/* Decorative background circle blur */}
          <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          {/* Polaroid 1 (Top Right / Center) */}
          <div className="absolute top-0 right-4 sm:right-12 w-48 sm:w-60 bg-white p-3 rounded-xl shadow-postcard rotate-[6deg] z-10 transition-transform duration-500 hover:rotate-0 hover:z-30">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-cream-200">
              <Image
                src="/images/latte.png"
                alt="Barista Latte Art"
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3 text-center">
              <span className="font-serif text-xs sm:text-sm font-bold text-foreground italic">
                {t.about.polaroid1}
              </span>
            </div>
          </div>

          {/* Polaroid 2 (Bottom Left) */}
          <div className="absolute bottom-4 left-2 sm:left-6 w-52 sm:w-64 bg-white p-3 sm:p-4 rounded-xl shadow-postcard rotate-[-8deg] z-20 transition-transform duration-500 hover:rotate-0 hover:z-30">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-cream-200">
              <Image
                src="/images/espresso.png"
                alt="Roasting Coffee Beans"
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3.5 text-center">
              <span className="font-serif text-sm sm:text-base font-bold text-foreground">
                {t.about.polaroid2}
              </span>
            </div>
          </div>

          {/* Polaroid 3 (Bottom Right Overlap) */}
          <div className="absolute -bottom-6 right-6 sm:right-16 w-48 sm:w-56 bg-white p-3 sm:p-3.5 rounded-xl shadow-postcard rotate-[3deg] z-20 transition-transform duration-500 hover:rotate-0 hover:z-30">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-cream-200">
              <Image
                src="/images/iced-macchiato.png"
                alt="Refreshing Brews"
                fill
                className="object-cover"
              />
            </div>
            <div className="mt-3 text-center">
              <span className="font-serif text-xs sm:text-sm font-bold text-primary italic">
                {t.about.polaroid3}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Typography & Story matching reference */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <span className="font-serif text-xl sm:text-2xl italic text-primary font-medium">
              {t.about.subtitle}
            </span>
            <h2 className="section-title text-foreground font-serif leading-tight">
              {t.about.title}
            </h2>
          </div>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
            {t.about.para1}
          </p>

          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground">
            {t.about.para2}
          </p>

          <div className="pt-4 flex items-center gap-6">
            <a href="#journey" className="btn-primary">
              {t.about.cta}
            </a>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold text-foreground">{t.about.est}</span>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">{t.about.company}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}