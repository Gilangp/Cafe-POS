'use client';

import * as React from 'react';
import { PublicLayout } from '@/components/public-layout';
import { HeroSlider, type HeroBannerData } from '@/components/landing/hero-slider';
import { AboutSection, type AboutUsItem } from '@/components/landing/about-section';
import { CurationsSection, type CategoryData } from '@/components/landing/curations-section';
import { BaristaRecommendsSection, type MenuData } from '@/components/landing/barista-recommends';
import { PromotionsSection, type PromotionData } from '@/components/landing/promotions-section';
import { TestimonialsSection, type TestimonialData } from '@/components/landing/testimonials-section';
import { FaqSection, type FaqData } from '@/components/landing/faq-section';
import api from '@/lib/api';

export default function LandingPage() {
  const [landingData, setLandingData] = React.useState<{
    hero_banners?: HeroBannerData[];
    about_us?: AboutUsItem[];
    best_seller_menus?: MenuData[];
    faqs?: FaqData[];
    testimonials?: TestimonialData[];
    promotions?: PromotionData[];
    categories?: CategoryData[];
  }>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLandingData() {
      try {
        const [landingRes, promoRes, catRes] = await Promise.allSettled([
          api.fetch<any>('/landing-page'),
          api.fetch<any>('/promotions'),
          api.fetch<any>('/categories'),
        ]);

        const data: typeof landingData = {};

        if (landingRes.status === 'fulfilled' && (landingRes.value as any)?.success) {
          const resData = (landingRes.value as any).data || {};
          if (resData.hero_banners && resData.hero_banners.length > 0) {
            data.hero_banners = resData.hero_banners;
          }
          if (resData.about_us && resData.about_us.length > 0) {
            data.about_us = resData.about_us;
          }
          if (resData.best_seller_menus && resData.best_seller_menus.length > 0) {
            data.best_seller_menus = resData.best_seller_menus;
          }
          if (resData.faqs && resData.faqs.length > 0) {
            data.faqs = resData.faqs;
          }
          if (resData.testimonials && resData.testimonials.length > 0) {
            data.testimonials = resData.testimonials;
          }
        }

        if (promoRes.status === 'fulfilled' && (promoRes.value as any)?.success && (promoRes.value as any).data?.length > 0) {
          data.promotions = (promoRes.value as any).data;
        }

        if (catRes.status === 'fulfilled' && (catRes.value as any)?.success && (catRes.value as any).data?.length > 0) {
          data.categories = (catRes.value as any).data;
        }

        setLandingData(data);
      } catch (err) {
        console.error('Failed to fetch dynamic landing page data, using default high-quality fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLandingData();
  }, []);

  return (
    <PublicLayout>
      <div className="flex flex-col min-h-screen">
        {/* 1. Hero Banner Slider (Bab 14.2) */}
        <HeroSlider banners={landingData.hero_banners} />

        {/* 2. Tentang Kami Section */}
        <AboutSection aboutData={landingData.about_us} />

        {/* 3. Handcrafted Curations (Kategori Menu Kopi dengan foto bulat/organik berlatar gelap) */}
        <CurationsSection categories={landingData.categories} />

        {/* 4. Barista Recommends (Menu Favorit dengan grid kartu berlatar terang + badge Best Seller) */}
        <BaristaRecommendsSection menus={landingData.best_seller_menus} />

        {/* 5. Promo & Penawaran Eksklusif */}
        <PromotionsSection promotions={landingData.promotions} />

        {/* 6. Testimoni Pelanggan */}
        <TestimonialsSection testimonials={landingData.testimonials} />

        {/* 7. FAQ Accordion */}
        <FaqSection faqs={landingData.faqs} />
      </div>
    </PublicLayout>
  );
}