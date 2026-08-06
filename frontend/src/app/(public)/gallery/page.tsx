"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicGallery } from "@/shared/services/public.service";

export default function GalleryPage() {
  const { data: galleries, isLoading } = useQuery<PublicGallery[]>({
    queryKey: ["publicGalleries"],
    queryFn: publicService.getGalleries,
  });

  const items = galleries ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">


      <section className="bg-primary py-16">
        <div className="container-page text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-accent mb-4">Galeri</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Jelajahi suasana dan momen di NEMU Space.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.caption ?? "Gallery"} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="font-heading text-5xl text-accent/40">N</span>
                    </div>
                  )}
                </div>
                {item.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-primary/80 backdrop-blur-sm p-4">
                    {item.category && <span className="text-xs text-accent font-semibold uppercase tracking-wide">{item.category}</span>}
                    <h3 className="text-primary-foreground font-medium">{item.caption}</h3>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">Galeri belum tersedia.</p>
        )}
      </section>


    </div>
  );
}
