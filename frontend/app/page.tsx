'use client';

import { LanguageProvider } from '@/context/language-context';
import { LandingHeader } from '@/components/landing/header';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { AboutSection } from '@/components/landing/about-section';
import { JourneySection } from '@/components/landing/journey-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { MenuSection } from '@/components/landing/menu-section';
import { LocationsSection } from '@/components/landing/locations-section';
import { CtaSection } from '@/components/landing/cta-section';
import { LandingFooter } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#FAF6F0] selection:bg-primary/30">
        <LandingHeader />
        <main>
          {/* Dark Hero Section matching Velvet Brew luxury theme */}
          <HeroSection />

          {/* Featured Coffee Grid 3x2 matching reference */}
          <FeaturesSection />

          {/* About Us — Serving Happiness with Polaroid Collage */}
          <AboutSection />

          {/* Our Journey — Bento Gallery Grid */}
          <JourneySection />

          {/* Post Cards From Our Regulars — Tilted Postcard Notes */}
          <TestimonialsSection />

          {/* Menu — Classic Bistro Dotted Leader Lines */}
          <MenuSection />

          {/* Our Coffee Shop — Stacked Interior & Opening Hours Pills */}
          <LocationsSection />

          {/* Get In Touch — Contact Details */}
          <CtaSection />
        </main>
        <LandingFooter />
      </div>
    </LanguageProvider>
  );
}