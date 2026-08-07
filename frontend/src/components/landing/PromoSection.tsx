"use client";

import { Star } from "lucide-react";
import Link from "next/link";
import { type PublicPromotion } from "@/shared/services/public.service";

const formatRupiah = (val: number | string) => `Rp ${Number(val).toLocaleString("id-ID")}`;

interface PromoSectionProps {
  promotions: PublicPromotion[];
}

export default function PromoSection({ promotions }: PromoSectionProps) {
  return (
    <section id="promo" className="py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3 block">
              Penawaran Terbatas
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Promo Spesial
            </h2>
          </div>
          <Link href="/promo" className="text-sm font-semibold text-primary hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent pb-1 w-max">
            Lihat Semua Promo
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promotions && promotions.length > 0 ? (
            promotions.map((promo) => (
              <div key={promo.id} className="group relative rounded-3xl overflow-hidden bg-primary h-80 shadow-lg transform hover:-translate-y-1 transition-all duration-300">
                {/* Background Graphics */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900 to-primary" />
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/10 rounded-full blur-3xl group-hover:bg-accent/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700" />
                
                <div className="absolute inset-0 w-full h-full flex items-center justify-center opacity-5 group-hover:opacity-10 transition-opacity duration-500 group-hover:scale-110 group-hover:rotate-12 transform">
                  <Star className="w-48 h-48 text-white" />
                </div>
                
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
            ))
          ) : (
            <div className="col-span-1 md:col-span-2 text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-white/50">
              Belum ada promo saat ini.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
