'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { Calendar, User, ArrowLeft, Share2, Bookmark, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Card } from '@/shared/components/ui/card';
import { useToast } from '@/shared/components/ui/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import api from '@/shared/api/axios';

export default function ArticleDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { toast } = useToast();

  const [article, setArticle] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchDetail() {
      if (!slug) return;
      try {
        const res = await api.fetch<any>(`/articles/${slug}`);
        if (res.success && res.data) {
          setArticle(res.data);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Backend article detail fetch failed, fallback to rich article data.');
      }

      // Rich Fallback if API or DB is empty
      setArticle({
        id: slug,
        title: slug.includes('wine-process')
          ? 'Mengenal Fermentasi Wine Process pada Biji Kopi Arabica Aceh Gayo'
          : slug.includes('v60')
          ? '5 Kesalahan Umum Saat Menyeduh V60 di Rumah yang Wajib Dihindari'
          : 'Mendalami Seni dan Profil Rasa Kopi Specialty Bersama NEMU Space',
        slug: slug,
        category: {
          name: slug.includes('wine-process') ? 'Roasting & Origin' : 'Brewing Guide & Tips',
        },
        author_name: 'Baskora Pradipta (Q-Grader NEMU Space)',
        created_at: '2026-07-12T10:00:00Z',
        thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
        content: `
          <p>Dunia kopi specialty nusantara selalu menyimpan keajaiban yang tak pernah habis untuk dieksplorasi. Setiap daerah penghasil kopi di Indonesia—mulai dari dataran tinggi Aceh Gayo, Kintamani Bali, hingga pegunungan Toraja—memiliki iklim makro dan mikro yang menciptakan keunikan cita rasa (terroir).</p>

          <h3>Rahasia di Balik Ekstraksi dan Fermentasi</h3>
          <p>Dalam metode pemrosesan pasca-panen (post-harvest processing), petani kopi modern dan roastery specialty seperti NEMU Space terus berinovasi. Salah satu teknik yang kini menjadi primadona adalah <strong>Wine Process</strong> atau fermentasi anaerobik natural yang diperpanjang.</p>

          <p>Pada proses ini, ceri kopi yang telah dipetik matang merah cerah (red cherry) dimasukkan ke dalam tangki tertutup hampa udara selama 14 hingga 30 hari sebelum dijemur di bawah sinar matahari. Proses fermentasi lambat ini menghasilkan senyawa aromatik kompleks yang menyerupai buah anggur merah, kismis, manisnya karamel gelap, dan keasaman sitrus yang berkelas tinggi.</p>

          <h3>Tips Menikmati Kopi Single Origin</h3>
          <ul>
            <li><strong>Suhu Seduh Presisi:</strong> Gunakan air bersuhu antara 88°C hingga 92°C agar senyawa asam manis terekstraksi sempurna tanpa rasa pahit gosong.</li>
            <li><strong>Rasio Kopi dan Air:</strong> Untuk metode pour-over V60, kami merekomendasikan rasio emas 1:15 (misalnya 15 gram bubuk kopi dengan 225 ml air).</li>
            <li><strong>Gunakan Air Berkualitas:</strong> 98% dari secangkir kopi adalah air. Gunakan air mineral dengan TDS sekitar 100-150 ppm untuk kejernihan rasa terbaik.</li>
          </ul>

          <p>Kami di NEMU Space sangat antusias untuk membagikan kecintaan ini. Kunjungi artisan roastery dan slow bar kami di Sudirman Flagship untuk berdiskusi langsung dengan para kurator kami sambil menikmati seduhan segar hari ini!</p>
        `,
      });
      setLoading(false);
    }

    fetchDetail();
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: article?.title || 'Artikel NEMU Space',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Tautan Disalin!',
        description: 'Tautan artikel telah berhasil disalin ke papan klip Anda.',
        variant: 'success',
      });
    }
  };

  return (
    <PublicLayout>
      {loading || !article ? (
        <div className="py-32 max-w-4xl mx-auto px-4 animate-pulse space-y-6">
          <div className="h-8 w-40 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded-2xl" />
          <div className="h-96 w-full bg-gray-300 dark:bg-gray-700 rounded-3xl" />
        </div>
      ) : (
        <article className="pb-24 bg-[#FAF3E7] dark:bg-[#14201A] min-h-screen transition-colors">
          {/* Header Hero Image & Title */}
          <section className="relative w-full h-[50vh] min-h-[400px] max-h-[560px] overflow-hidden bg-[#1E3D31]">
            <Image
              src={
                article.thumbnail ||
                'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80'
              }
              alt={article.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14201A] via-[#14201A]/60 to-transparent" />

            <div className="absolute inset-0 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 z-10">
              <Link
                href="/artikel"
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C89B5C] hover:text-white transition-colors mb-6 w-fit bg-black/40 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
              >
                <ArrowLeft size={16} />
                <span>Kembali ke Daftar Artikel</span>
              </Link>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                {article.category?.name && (
                  <Badge variant="gold" className="px-3 py-1 text-xs uppercase font-bold shadow-md">
                    {article.category.name}
                  </Badge>
                )}
                <span className="flex items-center gap-1.5 text-xs text-[#FAF3E7]/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                  <Calendar size={13} className="text-[#C89B5C]" />
                  {article.created_at
                    ? new Date(article.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                    : '12 Juli 2026'}
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
                {article.title}
              </h1>
            </div>
          </section>

          {/* Article Body Content Container */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
            <Card variant="elevated" className="p-8 sm:p-12 rounded-3xl space-y-8">
              {/* Author Bar */}
              <div className="flex items-center justify-between border-b border-[#E4D9C4] dark:border-[#33413A] pb-6">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3D31] text-[#C89B5C] font-heading font-bold text-lg shadow-md">
                    {(article.author_name || 'N')[0]}
                  </div>
                  <div>
                    <span className="block font-heading font-bold text-base text-[#1E3D31] dark:text-[#F5EFE6]">
                      {article.author_name || 'Tim Redaksi NEMU Space'}
                    </span>
                    <span className="text-xs text-[#5C5348] dark:text-[#B8A99A]">
                      Specialty Coffee Curator & Journal Writer
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={handleShare} variant="outline" size="sm" className="rounded-xl gap-2 text-xs">
                    <Share2 size={15} />
                    <span>Bagikan</span>
                  </Button>
                </div>
              </div>

              {/* HTML Rich Content */}
              <div
                className="prose prose-lg dark:prose-invert max-w-none font-sans leading-relaxed space-y-6 text-[#1E3D31] dark:text-[#F5EFE6]
                  prose-headings:font-heading prose-headings:font-bold prose-headings:text-[#1E3D31] dark:prose-headings:text-[#C89B5C]
                  prose-strong:font-bold prose-strong:text-[#1E3D31] dark:prose-strong:text-[#F5EFE6]
                  prose-a:text-[#C89B5C] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                  prose-ul:list-disc prose-ul:pl-6 prose-li:my-1.5"
                dangerouslySetInnerHTML={{ __html: article.content || '<p>Konten artikel sedang dimuat.</p>' }}
              />

              {/* Footer CTA Banner inside Article */}
              <div className="rounded-2xl bg-[#1E3D31] text-white p-8 border border-[#C89B5C]/30 shadow-xl mt-12 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[#C89B5C]">
                    <Sparkles size={14} />
                    <span>NEMU Space Experience</span>
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-white leading-snug">
                    Ingin Mencicipi Profil Kopi Ini Secara Langsung?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#FAF3E7]/80">
                    Kunjungi slow bar kami atau pesan biji roasted segar untuk diseduh sendiri di rumah Anda.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  <Link href="/menu">
                    <Button variant="gold" className="rounded-xl font-bold h-12 px-6 shadow-md">
                      Lihat Menu Kopi →
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </article>
      )}
    </PublicLayout>
  );
}
