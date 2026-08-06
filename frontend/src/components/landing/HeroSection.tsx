"use client";

import Image from "next/image";
import Link from "next/link";
import { type PublicHeroBanner, type PublicSettings } from "@/shared/services/public.service";

interface HeroSectionProps {
  activeHero: PublicHeroBanner | null;
  settings: PublicSettings;
}

export default function HeroSection({ activeHero, settings }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with modern overlay */}
      <div className="absolute inset-0 w-full h-full bg-[#11241c]">
        {activeHero?.image ? (
          <img 
            src={activeHero.image}
            alt={activeHero.title || "Hero Background"}
            className="w-full h-full object-cover opacity-60 scale-105 animate-[slow-pan_20s_ease-in-out_infinite_alternate]"
          />
        ) : (
          <img
            src="/images/hero-bg.jpg"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-60 scale-105 animate-[slow-pan_20s_ease-in-out_infinite_alternate]"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent" />
      </div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full pt-32 pb-24">
        <div className="max-w-2xl transform transition-all duration-1000 translate-y-0 opacity-100">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
             <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
             <span className="text-white/90 text-xs font-semibold tracking-widest uppercase">
               Premium Experience
             </span>
          </div>

          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-[1.15]">
            {activeHero?.title || settings.site_tagline || "RACIKAN SPESIAL."}
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-10 font-medium max-w-xl leading-relaxed">
            {activeHero?.subtitle || "Nikmati racikan kopi autentik dan suasana yang menenangkan, dirancang khusus untuk Anda."}
          </p>
          
          <div className="flex flex-wrap items-center gap-6">
            <Link 
              href={activeHero?.button_link || "#menu"}
              className="inline-flex items-center justify-center bg-accent text-primary font-bold px-8 py-4 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 text-lg shadow-[0_0_40px_-10px_rgba(200,155,92,0.6)]"
            >
              {activeHero?.button_text || "Eksplor Menu"}
            </Link>
            <Link 
              href="#reservation"
              className="inline-flex items-center justify-center bg-transparent border-2 border-white/30 text-white font-bold px-8 py-4 rounded-full hover:bg-white/10 transition-all duration-300 text-lg backdrop-blur-sm"
            >
              Reservasi Meja
            </Link>
          </div>
        </div>
      </div>

      {/* Decorative bottom fade to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary to-transparent z-10 pointer-events-none" />
    </section>
  );
}
