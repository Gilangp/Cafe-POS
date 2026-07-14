'use client';

import Image from 'next/image';
import { Star, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

export function FeaturesSection() {
  const { t } = useLanguage();

  return (
    <section id="featured" className="py-24 md:py-32 bg-[#FAF6F0]">
      <div className="container-page">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="section-title text-foreground font-serif">{t.featured.title}</h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-primary" />
        </div>

        {/* 3x2 Grid exactly matching reference */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {t.featured.items.map((item) => (
            <div
              key={item.name}
              className="group relative flex flex-col justify-between rounded-3xl bg-white p-5 shadow-card-shadow transition-all duration-300 hover:-translate-y-1.5 hover:shadow-card-hover border border-cream-300/40"
            >
              <div>
                {/* Image Container */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-cream-200/50 mb-5">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Quick add cart hover button */}
                  <button
                    aria-label={`Add ${item.name} to cart`}
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#12100E] text-white opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 hover:bg-primary hover:scale-110"
                  >
                    <ShoppingBag size={18} />
                  </button>
                </div>

                {/* Title and Price */}
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-serif text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-serif text-lg font-bold text-primary shrink-0">
                    {item.price}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>

              {/* Rating Star Row */}
              <div className="mt-5 pt-4 border-t border-cream-200/60 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <div className="flex text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-primary text-primary" />
                  ))}
                </div>
                <span className="ml-1 text-muted-foreground font-medium">({item.rating})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
