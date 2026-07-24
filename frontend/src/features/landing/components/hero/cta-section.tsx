'use client';

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export function CtaSection() {
  const { t } = useLanguage();

  return (
    <section id="contact" className="py-20 md:py-28 bg-[#FAF6F0] border-t border-cream-300/60">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Left Column: Get In Touch Typography & Paragraph */}
        <div className="lg:col-span-6 space-y-4">
          <h2 className="section-title text-foreground font-serif">
            {t.contact.title}
          </h2>
          <p className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-xl">
            {t.contact.description}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-bold uppercase tracking-widest text-primary">
            <span>• {t.contact.wholesale}</span>
            <span>• {t.contact.events}</span>
            <span>• {t.contact.academy}</span>
          </div>
        </div>

        {/* Right Column: Contact Cards matching reference */}
        <div className="lg:col-span-6 grid gap-4 sm:grid-cols-2">
          {/* Card 1: Address */}
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card-shadow border border-cream-300/40">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e1a17] text-white">
              <MapPin size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.contact.addressLabel}</span>
              <p className="font-serif text-sm sm:text-base font-bold text-foreground mt-0.5">
                {t.contact.addressVal}
              </p>
            </div>
          </div>

          {/* Card 2: Phone */}
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card-shadow border border-cream-300/40">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e1a17] text-white">
              <Phone size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.contact.phoneLabel}</span>
              <p className="font-serif text-sm sm:text-base font-bold text-foreground mt-0.5">
                {t.contact.phoneVal}
              </p>
            </div>
          </div>

          {/* Card 3: Email */}
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card-shadow border border-cream-300/40">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e1a17] text-white">
              <Mail size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.contact.emailLabel}</span>
              <p className="font-serif text-sm sm:text-base font-bold text-foreground mt-0.5">
                {t.contact.emailVal}
              </p>
            </div>
          </div>

          {/* Card 4: Operating Status */}
          <div className="flex items-start gap-4 rounded-2xl bg-white p-5 shadow-card-shadow border border-cream-300/40">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#1e1a17] text-white">
              <Clock size={18} className="text-primary" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">{t.contact.statusLabel}</span>
              <p className="font-serif text-sm sm:text-base font-bold text-green-700 mt-0.5 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {t.contact.statusVal}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
