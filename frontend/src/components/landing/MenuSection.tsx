"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { type PublicMenu } from "@/shared/services/public.service";

const formatRupiah = (val: number | string) => `Rp ${Number(val).toLocaleString("id-ID")}`;

interface MenuSectionProps {
  bestSellers: PublicMenu[];
}

export default function MenuSection({ bestSellers }: MenuSectionProps) {
  return (
    <section id="menu" className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3 block">
              Favorit Pelanggan
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Barista Recommends
            </h2>
          </div>
          <Link href="/menu" className="text-sm font-semibold text-primary hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent pb-1 w-max">
            Lihat Semua Menu
          </Link>
        </div>
        
        {bestSellers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="h-64 bg-muted relative overflow-hidden">
                  {item.image ? (
                    <img 
                      src={item.image} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  ) : (
                    <Image 
                      src="/images/hero-bg.jpg" 
                      alt={item.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700 ease-out" 
                    />
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                     <Star className="w-3.5 h-3.5 text-accent" fill="currentColor" /> Favorit
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow bg-white relative">
                  
                  <span className="text-xs text-accent font-bold uppercase tracking-widest mb-2 block">
                    {item.category?.name || "Lainnya"}
                  </span>
                  <h3 className="font-heading text-xl font-bold text-primary leading-tight mb-3 group-hover:text-accent transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-lg text-primary">
                      {formatRupiah(item.price)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-white/50">
            Belum ada rekomendasi menu saat ini.
          </div>
        )}
      </div>
    </section>
  );
}
