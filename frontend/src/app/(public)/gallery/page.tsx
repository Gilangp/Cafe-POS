"use client";

import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicGallery } from "@/shared/services/public.service";
import { Star } from "lucide-react";

export default function GalleryPage() {
  const { data: galleries, isLoading } = useQuery<PublicGallery[]>({
    queryKey: ["publicGalleries"],
    queryFn: publicService.getGalleries,
  });

  const items = galleries ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <section className="bg-primary pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Galeri</h1>
          <p className="text-white/80 max-w-xl text-lg font-medium">
            Kumpulan momen, sudut estetis, dan setiap racikan kopi yang kami buat dengan penuh cinta.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="break-inside-avoid h-64 rounded-2xl bg-white border border-border/50 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="break-inside-avoid relative rounded-2xl overflow-hidden group shadow-lg cursor-pointer bg-white border border-border/50">
                {item.image_url || (item as any).image ? (
                  <img 
                    src={item.image_url || (item as any).image} 
                    alt={item.caption ?? "Gallery"} 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-in-out">
                    <Star className="w-8 h-8 text-accent/40" />
                  </div>
                )}
                {item.caption && (
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                       {item.category && <span className="text-[10px] text-accent font-bold uppercase tracking-widest block mb-1">{item.category}</span>}
                       <p className="text-white text-sm font-medium">
                         {item.caption}
                       </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-white/50">
            Galeri belum tersedia.
          </div>
        )}
      </section>
    </div>
  );
}
