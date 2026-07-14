'use client';

import Image from 'next/image';
import { useLanguage } from '@/context/language-context';

export function JourneySection() {
  const { t } = useLanguage();

  return (
    <section id="journey" className="py-24 md:py-32 bg-[#FAF6F0]">
      <div className="container-page">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="section-title text-foreground font-serif">{t.journey.title}</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary" />
        </div>

        {/* Masonry / Bento Grid matching reference */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-6">
          {/* Column 1: Tall left item + small item */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl bg-cream-200 shadow-card-shadow group">
              <Image
                src="/images/iced-macchiato.png"
                alt="Cold Brew Pouring"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                <span className="font-serif text-white font-bold text-lg">{t.journey.coldBrewTitle}</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-cream-200 shadow-card-shadow group">
              <Image
                src="/images/espresso.png"
                alt="Roasted Beans"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                <span className="font-serif text-white font-bold text-lg">{t.journey.ethicalTitle}</span>
              </div>
            </div>
          </div>

          {/* Column 2: Center Featured Pour Over / Brewing Ritual */}
          <div className="flex flex-col justify-center">
            <div className="relative aspect-[3/5] sm:h-full w-full min-h-[400px] overflow-hidden rounded-3xl bg-cream-200 shadow-card-shadow group">
              <Image
                src="/images/latte.png"
                alt="Artisan Pour Over V60 Brewing"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6 sm:p-8">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">{t.journey.v60Badge}</span>
                  <h3 className="font-serif text-white font-bold text-xl sm:text-2xl mt-1">{t.journey.v60Title}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3: 3 stacked items or 2 items */}
          <div className="flex flex-col gap-5 lg:gap-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-cream-200 shadow-card-shadow group">
              <Image
                src="/images/brownie.png"
                alt="Dessert Crafting"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                <span className="font-serif text-white font-bold text-lg">{t.journey.dessertTitle}</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-cream-200 shadow-card-shadow group">
              <Image
                src="/images/croissant.png"
                alt="Freshly Baked Croissant"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                <span className="font-serif text-white font-bold text-lg">{t.journey.bakeryTitle}</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-cream-200 shadow-card-shadow group">
              <Image
                src="/images/cappuccino.png"
                alt="Latte Art Mastery"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-6">
                <span className="font-serif text-white font-bold text-lg">{t.journey.foamTitle}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
