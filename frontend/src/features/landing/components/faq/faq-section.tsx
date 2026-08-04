'use client';

import * as React from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/providers/language-context';

export interface FaqData {
  id: string | number;
  question: string;
  answer: string;
}

export function FaqSection({ faqs }: { faqs?: FaqData[] }) {
  const { t } = useLanguage();
  const activeFaqs = faqs && faqs.length > 0 ? faqs : t.faq.defaultFaqs;
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 sm:py-32 bg-background relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Header */}
        <div className="text-center space-y-3 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary dark:text-accent bg-primary/10 dark:bg-accent/15 px-3.5 py-1.5 rounded-full">
            <span>{t.faq.badge}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {t.faq.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t.faq.desc}
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {activeFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={faq.id}
                className={cn(
                  'rounded-3xl border transition-all duration-300 overflow-hidden',
                  isOpen
                    ? 'bg-card border-accent shadow-lg'
                    : 'bg-white/80 dark:bg-[#1E2B24]/80 border-border hover:border-[#1E3D31]/40'
                )}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex items-center justify-between gap-4 p-6 sm:p-7 text-left focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={cn(
                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
                        isOpen ? 'bg-accent text-primary' : 'bg-primary/10 text-primary dark:bg-white/10 dark:text-white'
                      )}
                    >
                      <HelpCircle size={18} />
                    </div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-foreground">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="text-muted-foreground shrink-0">
                    {isOpen ? <ChevronUp size={22} className="text-accent" /> : <ChevronDown size={22} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pl-11 border-l-2 border-accent/40 text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
