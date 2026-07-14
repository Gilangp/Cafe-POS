'use client';

import { useLanguage } from '@/context/language-context';

export function MenuSection() {
  const { t } = useLanguage();

  return (
    <section id="menu" className="py-24 md:py-36 bg-[#FAF6F0]">
      <div className="container-page">
        {/* Section Title matching reference exactly */}
        <div className="text-center mb-20">
          <h2 className="section-title text-foreground font-serif">{t.menu.title}</h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-primary" />
        </div>

        {/* 2-Column Bistro Layout with Dotted Leader Lines */}
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Column 1: Coffee & Beverages */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-8 pb-3 border-b border-cream-300 flex items-center justify-between">
              <span>{t.menu.coffeeCategory}</span>
              <span className="text-xs font-sans uppercase tracking-widest text-primary font-bold">{t.menu.coffeeBadge}</span>
            </h3>

            <div className="space-y-8">
              {t.menu.coffeeItems.map((item) => (
                <div key={item.name} className="group">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <span className="menu-dots" />
                    <span className="font-serif text-lg font-bold text-primary shrink-0">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed pr-8">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Bakery & Desserts */}
          <div>
            <h3 className="font-serif text-2xl font-bold text-foreground mb-8 pb-3 border-b border-cream-300 flex items-center justify-between">
              <span>{t.menu.bakeryCategory}</span>
              <span className="text-xs font-sans uppercase tracking-widest text-primary font-bold">{t.menu.bakeryBadge}</span>
            </h3>

            <div className="space-y-8">
              {t.menu.bakeryItems.map((item) => (
                <div key={item.name} className="group">
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-serif text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {item.name}
                    </h4>
                    <span className="menu-dots" />
                    <span className="font-serif text-lg font-bold text-primary shrink-0">
                      {item.price}
                    </span>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed pr-8">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Online CTA */}
        <div className="mt-16 text-center">
          <a href="#locations" className="btn-primary">
            {t.menu.downloadBtn}
          </a>
        </div>
      </div>
    </section>
  );
}