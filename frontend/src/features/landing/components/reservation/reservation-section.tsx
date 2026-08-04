'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export function ReservationSection({ reservation }: { reservation?: any }) {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 sm:py-32 bg-[#FAF3E7] dark:bg-transparent">
      <div className="max-w-2xl mx-auto text-center px-4">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent bg-accent/10 px-4 py-2 rounded-full mb-6">
          <Calendar size={14} />
          <span>{t.header.reservations}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
          {t.reservations.title}
        </h2>
        <p className="text-base text-foreground/70 mb-8 max-w-xl mx-auto">
          {t.reservations.description}
        </p>
        <Link href="/reservation">
          <div className="inline-flex items-center gap-3 bg-primary text-background font-bold px-8 py-4 rounded-xl text-base hover:bg-primary/90 transition-colors shadow-lg cursor-pointer">
            <Calendar size={20} />
            <span>{t.cta.reserve}</span>
          </div>
        </Link>
      </div>
    </section>
  );
}
