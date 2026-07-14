'use client';

import { Star } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export function TestimonialsSection() {
  const { t } = useLanguage();

  return (
    <section id="reviews" className="py-24 md:py-36 bg-[#FAF3E8] relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />

      <div className="container-page">
        {/* Section Title matching reference exactly */}
        <div className="text-center mb-20">
          <h2 className="section-title text-foreground font-serif leading-tight">
            {t.testimonials.titleLine1} <br />
            {t.testimonials.titleLine2} <span className="text-gold italic font-normal">{t.testimonials.titleHighlight}</span>
          </h2>
          <div className="mx-auto mt-4 h-1 w-16 rounded-full bg-primary" />
        </div>

        {/* Scattered Tilted Postcards Grid */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 px-2 sm:px-6">
          {t.testimonials.cards.map((card, index) => (
            <div
              key={card.author}
              className={`group relative flex flex-col justify-between rounded-xl ${card.bgColor} p-6 sm:p-7 shadow-postcard transition-all duration-300 hover:rotate-0 hover:scale-105 hover:z-30 ${card.rotation}`}
            >
              {/* Masking tape on top */}
              <div className="mask-tape" />

              <div>
                {/* Star rating */}
                <div className="flex gap-1 mb-4 text-primary mt-2">
                  {Array.from({ length: card.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="font-serif text-sm sm:text-base leading-relaxed text-foreground/90 italic">
                  &quot;{card.quote}&quot;
                </p>
              </div>

              {/* Author & Signature */}
              <div className="mt-8 pt-4 border-t border-foreground/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-foreground">{card.author}</h4>
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                    {card.role}
                  </span>
                </div>
                {/* Stamp graphic element */}
                <div className="h-8 w-8 rounded-full border border-primary/40 flex items-center justify-center font-serif text-[10px] text-primary font-bold rotate-12">
                  VB
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
