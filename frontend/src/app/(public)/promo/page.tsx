"use client";

import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicPromotion } from "@/shared/services/public.service";
import { Star } from "lucide-react";

export default function PromoPage() {
  const { data: promotions, isLoading } = useQuery<PublicPromotion[]>({
    queryKey: ["publicPromotions"],
    queryFn: publicService.getPromotions,
  });

  const items = promotions ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="bg-primary py-16">
        <div className="container-page text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-accent mb-4">Promo Spesial</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Nikmati berbagai penawaran menarik dari NEMU Space.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((promo) => (
              <div key={promo.id} className="relative rounded-xl overflow-hidden bg-primary h-64 shadow-md group">
                {promo.banner_url ? (
                  <img src={promo.banner_url} alt={promo.title} className="w-full h-full object-cover mix-blend-overlay opacity-60 transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10">
                     <Star className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 p-8 flex flex-col justify-center">
                   <h3 className="text-white font-bold text-3xl mb-2">{promo.title}</h3>
                   <p className="text-white/80 text-sm max-w-sm mb-4">{promo.description}</p>
                   {promo.end_date && (
                     <span className="inline-block bg-white text-primary text-xs font-bold px-3 py-1.5 rounded w-max">
                       Berlaku s/d {new Date(promo.end_date).toLocaleDateString('id-ID')}
                     </span>
                   )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12 border-2 border-dashed border-border rounded-xl">Belum ada promo saat ini.</p>
        )}
      </section>
    </div>
  );
}
