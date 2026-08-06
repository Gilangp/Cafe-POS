"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicMenu } from "@/shared/services/public.service";
import { Star } from "lucide-react";
import Image from "next/image";

const formatRupiah = (val: number | string) => `Rp ${Number(val).toLocaleString("id-ID")}`;

export default function MenuPage() {
  const { data: menus, isLoading } = useQuery<PublicMenu[]>({
    queryKey: ["publicMenus"],
    queryFn: () => publicService.getMenus(),
  });

  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const allMenus = menus ?? [];
  const categories = Array.from(new Set(allMenus.map((m) => m.category?.name).filter(Boolean) as string[]));
  const activeCategory = selectedCat ?? categories[0] ?? "";
  
  const filteredMenus = allMenus.filter((m) => m.category?.name === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <section className="bg-primary pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
           <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Eksplorasi Menu</h1>
          <p className="text-white/80 max-w-xl text-lg font-medium">
            Temukan racikan kopi autentik dan berbagai hidangan spesial, dikurasi khusus untuk pengalaman bersantai Anda.
          </p>
        </div>
      </section>

      {/* Filter & Menu Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="flex flex-wrap gap-3 mb-12 justify-center lg:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold tracking-wide uppercase transition-all duration-300 shadow-sm ${
                activeCategory === cat
                  ? "bg-accent text-primary scale-105"
                  : "bg-white text-primary/70 hover:bg-muted/50 hover:text-primary border border-border/60"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-border/50 p-6 shadow-sm animate-pulse h-80" />
            ))}
          </div>
        ) : filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredMenus.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="h-56 bg-muted relative overflow-hidden">
                  {item.image_url || (item as any).image ? (
                    <img 
                      src={item.image_url || (item as any).image} 
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
                  {item.is_best_seller && (
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold text-primary shadow-sm flex items-center gap-1.5">
                       <Star className="w-3.5 h-3.5 text-accent" fill="currentColor" /> Favorit
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex flex-col flex-grow bg-white">
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
            Belum ada menu tersedia untuk kategori ini.
          </div>
        )}
      </section>
    </div>
  );
}
