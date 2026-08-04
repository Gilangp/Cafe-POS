'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { HeroSlider, type HeroBannerData } from '@/features/landing/components/hero/hero-slider';
import { AboutSection, type AboutUsItem } from '@/features/landing/components/about/about-section';
import { CurationsSection, type CategoryData } from '@/features/landing/components/categories/curations-section';
import { BaristaRecommendsSection, type MenuData } from '@/features/landing/components/featured-menu/barista-recommends';
import { PromotionsSection, type PromotionData } from '@/features/landing/components/promotion/promotions-section';
import { TestimonialsSection, type TestimonialData } from '@/features/landing/components/testimonial/testimonials-section';
import { FaqSection, type FaqData } from '@/features/landing/components/faq/faq-section';
import { ArticlesSection } from '@/features/landing/components/article/articles-section';
import { GallerySection } from '@/features/landing/components/gallery/gallery-section';
import { ReservationSection } from '@/features/landing/components/reservation/reservation-section';
import { LocationSection } from '@/features/landing/components/location/location-section';
import { ContactSection } from '@/features/landing/components/contact/contact-section';
import api from '@/shared/api/axios';

export default function LandingPage() {
  const [landingData, setLandingData] = React.useState<{
    hero_banners?: HeroBannerData[];
    about_us?: AboutUsItem[];
    best_seller_menus?: MenuData[];
    faqs?: FaqData[];
    testimonials?: TestimonialData[];
    promotions?: PromotionData[];
    categories?: CategoryData[];
    articles?: any[];
    galleries?: any[];
    location?: any;
    contact?: any;
    reservation?: any;
  }>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchLandingData() {
      try {
        const [response] = await Promise.allSettled([api.fetch<any>('/landing-page')]);

        const data: typeof landingData = {};

        if (response.status === 'fulfilled' && (response.value as any)?.success) {
          const resData = (response.value as any).data || {};
          data.hero_banners = resData.hero_banners;
          data.about_us = resData.about_us;
          data.best_seller_menus = resData.best_seller_menus;
          data.faqs = resData.faqs;
          data.testimonials = resData.testimonials;
          data.promotions = resData.promotions;
          data.categories = resData.categories;
          data.articles = resData.articles;
          data.galleries = resData.galleries;
          data.location = resData.settings;
          data.contact = resData.settings;
          data.reservation = resData.reservations;
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

        {/* 8. Articles Section */}
        <ArticlesSection articles={landingData.articles} />

        {/* 9. Gallery Section */}
        <GallerySection galleries={landingData.galleries} />

        {/* 10. Reservation Section */}
        <ReservationSection reservation={landingData.reservation} />

        {/* 11. Location Section */}
        <LocationSection location={landingData.location} />

        {/* 12. Contact Section */}
        <ContactSection contact={landingData.contact} />
       </div>
    </PublicLayout>
  );
}