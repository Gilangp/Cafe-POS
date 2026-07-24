'use client';

import * as React from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { cn } from '@/shared/utils/utils';
import { useLanguage } from '@/shared/providers/language-context';

export interface FaqData {
  id: string | number;
  question: string;
  answer: string;
}

const defaultFaqs: FaqData[] = [
  {
    id: 1,
    question: 'Apa yang membedakan biji kopi specialty di NEMU Space?',
    answer: 'Seluruh biji kopi kami dikurasi langsung oleh Q-Grader bersertifikasi dari perkebunan single-origin terbaik nusantara (Aceh Gayo, Kintamani, Toraja, hingga Ijen). Kami melakukan sangrai dengan profil pemanggangan presisi untuk menonjolkan aroma dan karakter alami dari setiap origin.',
  },
  {
    id: 2,
    question: 'Apakah saya bisa melakukan reservasi meja untuk keperluan meeting atau acara khusus?',
    answer: 'Tentu! Anda dapat memesan meja melalui menu "Reservasi" di website kami. Untuk reservasi rombongan (>15 orang), ulang tahun, atau penyewaan area khusus (private area / workshop), tim admin kami akan langsung mengonfirmasi dan menyiapkan tata letak meja sesuai kebutuhan Anda.',
  },
  {
    id: 3,
    question: 'Bagaimana cara memeriksa status reservasi yang sudah diajukan?',
    answer: 'Anda dapat langsung memeriksa status reservasi tanpa perlu mendaftar akun, yaitu dengan membuka menu "Reservasi" lalu pilih tab "Cek Status Reservasi" dan memasukkan nomor WhatsApp serta tanggal reservasi yang Anda daftarkan.',
  },
  {
    id: 4,
    question: 'Apakah NEMU Space menyediakan fasilitas Wi-Fi dan stopkontak untuk bekerja (WFC)?',
    answer: 'Ya, kami menyediakan koneksi internet serat optik berkecepatan tinggi (100+ Mbps) serta stopkontak yang terdistribusi di setiap meja, baik di area indoor ber-AC maupun semi-outdoor lounge.',
  },
  {
    id: 5,
    question: 'Apakah tersedia opsi susu nabati (plant-based milk) dan menu non-kopi?',
    answer: 'Sangat lengkap! Kami menyediakan opsi Oat Milk dan Almond Milk untuk seluruh varian minuman berbasis espresso. Kami juga memiliki koleksi Artisan Tea, Matcha Ceremonial Grade, Pure Chocolate, dan berbagai hidangan pastry segar setiap hari.',
  },
];

export function FaqSection({ faqs }: { faqs?: FaqData[] }) {
  const { t } = useLanguage();
  const activeFaqs = faqs && faqs.length > 0 ? faqs : defaultFaqs;
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className="py-24 sm:py-32 bg-[#FAF3E7] dark:bg-[#1A2620] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Header */}
        <div className="text-center space-y-3 pb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#1E3D31] dark:text-[#C89B5C] bg-[#1E3D31]/10 dark:bg-[#C89B5C]/15 px-3.5 py-1.5 rounded-full">
            <Sparkles size={14} className="text-[#C89B5C]" />
            <span>{t.landing.faq.badge}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-[#1E3D31] dark:text-[#F5EFE6] leading-tight">
            {t.landing.faq.title}
          </h2>
          <p className="text-sm sm:text-base text-[#5C5348] dark:text-[#B8A99A]">
            {t.landing.faq.desc}
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
                    ? 'bg-white dark:bg-[#1E2B24] border-[#C89B5C] shadow-lg'
                    : 'bg-white/80 dark:bg-[#1E2B24]/80 border-[#E4D9C4] dark:border-[#33413A] hover:border-[#1E3D31]/40'
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
                        isOpen ? 'bg-[#C89B5C] text-[#1E3D31]' : 'bg-[#1E3D31]/10 text-[#1E3D31] dark:bg-white/10 dark:text-white'
                      )}
                    >
                      <HelpCircle size={18} />
                    </div>
                    <h3 className="font-heading text-base sm:text-lg font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                      {faq.question}
                    </h3>
                  </div>

                  <div className="text-[#5C5348] dark:text-[#B8A99A] shrink-0">
                    {isOpen ? <ChevronUp size={22} className="text-[#C89B5C]" /> : <ChevronDown size={22} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 sm:px-7 sm:pb-7 pt-0 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="pl-11 border-l-2 border-[#C89B5C]/40 text-sm sm:text-base text-[#5C5348] dark:text-[#B8A99A] leading-relaxed">
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
