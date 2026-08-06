"use client";

import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicPromotion } from "@/shared/services/public.service";
import { Star } from "lucide-react";

const formatRupiah = (val: number | string) => `Rp ${Number(val).toLocaleString("id-ID")}`;

export default function PromoPage() {
  const { data: promotions, isLoading } = useQuery<PublicPromotion[]>({
    queryKey: ["publicPromotions"],
    queryFn: publicService.getPromotions,
  });

  const items = promotions ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <section className="bg-primary pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Promo Spesial</h1>
          <p className="text-white/80 max-w-xl text-lg font-medium">
            Penawaran terbatas dan diskon eksklusif untuk melengkapi momen spesial Anda.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-white border border-border/50 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {items.map((promo) => (
              <div key={promo.id} className="group relative rounded-3xl overflow-hidden bg-primary h-80 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                
                {promo.banner_url || (promo as any).image ? (
                   <img src={promo.banner_url || (promo as any).image} alt={promo.title} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:opacity-40 transition-opacity duration-500" />
                ) : (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12 transform">
                    <Star className="w-48 h-48 text-white" />
                  </div>
                )}
                
                <div className="absolute inset-0 p-10 flex flex-col justify-center z-10">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-accent text-xs font-bold tracking-widest uppercase">Special Offer</span>
                  </div>
                  
                  <h3 className="text-white font-heading font-bold text-3xl lg:text-4xl mb-4 leading-tight">
                    {promo.title}
                  </h3>
                  
                  <p className="text-white/80 text-base max-w-sm mb-8 font-medium">
                    {promo.type === 'diskon' ? `Diskon eksklusif sebesar ${promo.value}%` : `Potongan langsung senilai ${formatRupiah(promo.value || 0)}`}
                  </p>
                  
                  <div className="mt-auto">
                    {promo.end_date && (
                      <span className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold tracking-wider px-4 py-2 rounded-lg">
                        Berlaku s/d {new Date(promo.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-white/50">
            Belum ada promo saat ini.
          </div>
        )}
      </section>
    </div>
  );
}
