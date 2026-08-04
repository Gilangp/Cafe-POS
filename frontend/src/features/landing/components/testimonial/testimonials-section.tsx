'use client';

import * as React from 'react';
import { Star, Quote, PenLine, Loader2 } from 'lucide-react';

import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { useToast } from '@/shared/components/ui/use-toast';
import { cn } from '@/shared/utils/utils';
import api from '@/shared/api/axios';
import { useLanguage } from '@/shared/providers/language-context';

export interface TestimonialData {
  id: string | number;
  customer_name?: string;
  name?: string;
  role?: string;
  rating?: number;
  comment?: string;
  quote?: string;
  avatar_url?: string;
}

const defaultTestimonials: TestimonialData[] = [
  {
    id: 1,
    name: 'Gita Saraswati',
    role: 'Architect & Daily Regular',
    rating: 5,
    quote: 'Suasana di NEMU Space benar-benar memantik inspirasi. V60 Aceh Gayo-nya memiliki kompleksitas aroma winey terbaik yang pernah saya coba di Jakarta.',
  },
  {
    id: 2,
    name: 'Baskora Pradipta',
    role: 'Creative Director',
    rating: 5,
    quote: 'Slow-bar experience di sini luar biasa. Barista sangat berpengetahuan tinggi menjelaskan profil roasting dan asal usul biji kopi secara mendetail.',
  },
  {
    id: 3,
    name: 'Nadya Larasati',
    role: 'Coffee Enthusiast',
    rating: 5,
    quote: 'Japanese Cold Drip Kintamani mereka adalah favorit mutlak! Pelayanan ramah, pemesanan digital kasir sangat cepat, dan pastry croissant-nya selalu renyah hangat.',
  },
  {
    id: 4,
    name: 'Dimas Anggara',
    role: 'Startup Founder',
    rating: 5,
    quote: 'Tempat meeting outdoor maupun indoor yang sangat nyaman. Koneksi Wi-Fi kencang dan musik latar yang diputar sangat pas untuk fokus bekerja.',
  },
];

export function TestimonialsSection({ testimonials }: { testimonials?: TestimonialData[] }) {
  const { t, locale } = useLanguage();
  const { toast } = useToast();
  const activeTestimonials = testimonials && testimonials.length > 0 ? testimonials : defaultTestimonials;

  const [isOpen, setIsOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    role: '',
    rating: 5,
    content: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post<any>('/testimonials', formData);
      if (res.data?.success) {
        toast({
          title: t.testimonials.reviewSubmitted,
          description: t.testimonials.reviewSubmittedDesc,
        });
        setIsOpen(false);
        setFormData({ name: '', role: '', rating: 5, content: '' });
      }
    } catch (err) {
      toast({
        title: t.testimonials.reviewFailed,
        description: t.testimonials.reviewFailedDesc,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reviews" className="py-24 sm:py-32 bg-background relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 pb-8">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary dark:text-accent bg-primary/10 dark:bg-accent/15 px-3.5 py-1.5 rounded-full">
            
            <span>{t.testimonials.badge}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-bold tracking-tight text-foreground leading-tight">
            {t.testimonials.title}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            {t.testimonials.desc}
          </p>
        </div>

        <div className="flex justify-center pb-16">
          <Button variant="gold" className="rounded-xl px-6 gap-2 font-bold shadow-md h-12" onClick={() => setIsOpen(true)}>
            <PenLine size={18} />
            <span>{t.testimonials.writeReview}</span>
          </Button>
          
          <Dialog
            open={isOpen}
            onOpenChange={setIsOpen}
            title={t.testimonials.shareExperience}
            description={t.testimonials.shareExperienceDesc}
            footer={
              <Button type="submit" form="testimonial-form" disabled={isSubmitting} variant="gold" className="w-full h-12 rounded-xl font-bold shadow-md text-base">
                {isSubmitting ? <Loader2 className="animate-spin mr-2" size={18} /> : null}
                {t.testimonials.submitReview}
              </Button>
            }
          >
            <form id="testimonial-form" onSubmit={handleSubmit} className="space-y-5 pt-2 pb-4">
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-foreground">{t.testimonials.fullName}</label>
                <Input required placeholder={t.testimonials.fullNamePlaceholder} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="rounded-xl h-12 border-border focus-visible:ring-[#C89B5C] bg-gray-50/50 dark:bg-[#14201A]" />
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-foreground">{t.testimonials.jobRole}</label>
                <Input placeholder={t.testimonials.jobRolePlaceholder} value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="rounded-xl h-12 border-border focus-visible:ring-[#C89B5C] bg-gray-50/50 dark:bg-[#14201A]" />
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-foreground">{t.testimonials.rating}</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="focus:outline-none"
                    >
                      <Star className={cn("h-6 w-6", formData.rating >= star ? "fill-[#C89B5C] text-accent" : "text-gray-300")} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2.5">
                <label className="text-sm font-bold text-foreground">{t.testimonials.yourReview}</label>
                <Textarea required placeholder={t.testimonials.yourReviewPlaceholder} rows={4} value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="rounded-xl border-border focus-visible:ring-[#C89B5C] bg-gray-50/50 dark:bg-[#14201A] resize-none p-4" />
              </div>
            </form>
          </Dialog>
        </div>

        {/* Testimonials Grid (Tilted Postcard Cards) */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pt-4">
          {activeTestimonials.map((item, idx) => {
            const rotations = ['rotate-[2deg]', 'rotate-[-3deg]', 'rotate-[4deg]', 'rotate-[-2deg]'];
            const rot = rotations[idx % rotations.length];

      const name = item.customer_name || item.name || t.testimonials.defaultRole;
      const quoteText = item.comment || item.quote || t.testimonials.defaultQuote;
            const rating = item.rating || 5;

            return (
              <div
                key={item.id}
                className={cn(
                  'group relative flex flex-col justify-between rounded-3xl bg-card p-6 sm:p-7 shadow-xl border border-border transition-all duration-300 hover:rotate-0 hover:-translate-y-2 hover:shadow-2xl hover:border-accent/60',
                  rot
                )}
              >
                {/* Quote Icon */}
                <div className="absolute top-4 right-6 text-[#E4D9C4]/40 dark:text-[#33413A] group-hover:text-accent/30 transition-colors pointer-events-none">
                  <Quote size={64} />
                </div>

                <div className="space-y-4">
                  {/* Stars */}
                  <div className="flex gap-1 text-accent">
                    {Array.from({ length: rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>

                  {/* Comment */}
                  <p className="font-sans text-sm sm:text-base leading-relaxed text-foreground/90 italic relative z-10">
                    &quot;{quoteText}&quot;
                  </p>
                </div>

                {/* Author Footer */}
                <div className="mt-8 pt-4 border-t border-border/60 dark:border-[#33413A] flex items-center justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-foreground">{name}</h4>
                    {item.role && (
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                        {item.role}
                      </span>
                    )}
                  </div>
                  {/* Stamp Graphic */}
                  <div className="h-9 w-9 rounded-full border-2 border-[#1E3D31]/30 dark:border-accent/40 flex items-center justify-center font-heading text-[11px] text-primary dark:text-accent font-bold rotate-12">
                    NEMU
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
