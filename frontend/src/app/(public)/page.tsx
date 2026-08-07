"use client";

import { useQuery } from "@tanstack/react-query";
import { publicService, type LandingData } from "@/shared/services/public.service";
import { Loader2 } from "lucide-react";

import HeroSection from "@/components/landing/HeroSection";
import CategorySection from "@/components/landing/CategorySection";
import MenuSection from "@/components/landing/MenuSection";
import PromoSection from "@/components/landing/PromoSection";
import GallerySection from "@/components/landing/GallerySection";
import ArticleSection from "@/components/landing/ArticleSection";
import ReservationSection from "@/components/landing/ReservationSection";

export default function LandingPage() {
  const { data, isLoading } = useQuery<LandingData>({
    queryKey: ["landingData"],
    queryFn: publicService.getLandingData,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
        <span className="text-primary font-bold font-heading text-xl">Memuat pengalaman premium...</span>
      </div>
    );
  }

  const settings = data?.settings ?? {};
  const heroBanners = data?.hero_banners ?? [];
  const activeHero = heroBanners.length > 0 ? heroBanners[0] : null;

  const menus = data?.menus ?? [];
  const uniqueCategories = Array.from(new Set(menus.map((m) => m.category?.name).filter(Boolean) as string[]));
  const categories = uniqueCategories.length > 0 ? uniqueCategories : ["Signature", "Coffee", "Non-Coffee", "Pastry", "Snack"];
  
  const bestSellers = data?.best_sellers ?? [];
  const promotions = data?.promotions ?? [];
  const galleries = data?.galleries ?? [];
  const articles = data?.articles ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground font-body scroll-smooth selection:bg-accent/30 selection:text-primary">
      {/* 1. Hero Banner */}
      <HeroSection activeHero={activeHero} settings={settings} />
      
      {/* 2. Handcrafted Curations (Kategori) */}
      <CategorySection categories={categories} />

      {/* 3. Barista Recommends (Best Sellers) */}
      <MenuSection bestSellers={bestSellers} />

      {/* 4. Promo Aktif */}
      <PromoSection promotions={promotions} />

      {/* 5. Galeri Foto */}
      <GallerySection galleries={galleries} />

      {/* 6. Cerita & Artikel */}
      <ArticleSection articles={articles} />

      {/* 7. Reservasi & Kontak */}
      <ReservationSection settings={settings} />
    </div>
  );
}
