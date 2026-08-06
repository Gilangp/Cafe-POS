"use client";

import { type PublicGallery } from "@/shared/services/public.service";

interface GallerySectionProps {
  galleries: PublicGallery[];
}

export default function GallerySection({ galleries }: GallerySectionProps) {
  return (
    <section id="gallery" className="py-24 bg-primary text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3 block">
              Momen Terbaik
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold tracking-tight">
              Galeri Kami
            </h2>
          </div>
          <p className="text-white/70 max-w-md text-sm md:text-base">
            Intip suasana nyaman, sudut estetis, dan setiap racikan kopi yang kami buat dengan penuh cinta.
          </p>
        </div>
        
        {galleries.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {galleries.map((img) => (
              <div key={img.id} className="break-inside-avoid relative rounded-2xl overflow-hidden group shadow-lg cursor-pointer">
                 <img 
                   src={img.image} 
                   alt={img.caption || "Gallery item"} 
                   className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                   loading="lazy"
                 />
                 {img.caption && (
                   <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                     <p className="text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                       {img.caption}
                     </p>
                   </div>
                 )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-white/50 border border-dashed border-white/20 rounded-2xl bg-black/10">
            Galeri belum tersedia.
          </div>
        )}
      </div>
    </section>
  );
}
