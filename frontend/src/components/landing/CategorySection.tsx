"use client";

import Image from "next/image";

const CURATIONS = [
  { shape: "40% 60% 70% 30% / 40% 50% 60% 50%" },
  { shape: "60% 40% 30% 70% / 50% 60% 40% 50%" },
  { shape: "50% 50% 60% 40% / 40% 40% 60% 60%" },
  { shape: "30% 70% 50% 50% / 50% 30% 70% 50%" },
  { shape: "70% 30% 40% 60% / 60% 50% 50% 40%" },
];

interface CategorySectionProps {
  categories: string[];
}

export default function CategorySection({ categories }: CategorySectionProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section id="categories" className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative texture overlay */}
      <div className="absolute inset-0 opacity-10 bg-[url('/images/hero-bg.jpg')] bg-cover mix-blend-overlay pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center relative z-10">
        <div className="mb-16">
          <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3 block">
            Koleksi Kami
          </span>
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-white tracking-tight">
            Handcrafted Curations
          </h2>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {categories.slice(0, 5).map((cat, i) => {
            const shape = CURATIONS[i % CURATIONS.length].shape;
            return (
              <div key={i} className="flex flex-col items-center gap-6 cursor-pointer group">
                <div 
                  className="w-32 h-32 md:w-40 md:h-40 bg-white/5 flex items-center justify-center overflow-hidden transition-all duration-500 ease-out group-hover:scale-110 shadow-lg border border-white/10 group-hover:border-accent/50"
                  style={{ borderRadius: shape }}
                >
                  <Image 
                    src="/images/hero-bg.jpg" 
                    alt={cat} 
                    width={160} 
                    height={160} 
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110" 
                  />
                </div>
                <span className="text-white/80 font-bold text-sm tracking-widest uppercase group-hover:text-accent transition-colors duration-300">
                  {cat}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
