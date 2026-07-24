'use client';

import * as React from 'react';
import { PublicLayout } from '@/shared/components/layout/public-layout';
import { BookOpen, Search, Calendar, User, ArrowRight, Sparkles, Tag } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Input } from '@/shared/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import api from '@/shared/api/axios';

export interface ArticleCategory {
  id: string | number;
  name: string;
  slug?: string;
  articles_count?: number;
}

export interface ArticleItem {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  thumbnail?: string;
  article_category_id?: string | number;
  category?: {
    id?: string | number;
    name?: string;
  };
  author_name?: string;
  created_at?: string;
  status?: string;
}

const fallbackCategories: ArticleCategory[] = [
  { id: 'all', name: 'Semua Artikel', articles_count: 6 },
  { id: 1, name: 'Roasting & Origin', articles_count: 2 },
  { id: 2, name: 'Brewing Guide & Tips', articles_count: 2 },
  { id: 3, name: 'Komunitas & Event', articles_count: 2 },
];

const fallbackArticles: ArticleItem[] = [
  {
    id: 1,
    title: 'Mengenal Fermentasi Wine Process pada Biji Kopi Arabica Aceh Gayo',
    slug: 'mengenal-fermentasi-wine-process-aceh-gayo',
    excerpt: 'Bagaimana proses fermentasi alami pasca-panen menciptakan sensasi asam manis menyerupai anggur merah pada biji kopi terbaik dari dataran tinggi Gayo.',
    thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80',
    article_category_id: 1,
    category: { name: 'Roasting & Origin' },
    author_name: 'Baskora Pradipta (Q-Grader)',
    created_at: '2026-07-12T10:00:00Z',
  },
  {
    id: 2,
    title: '5 Kesalahan Umum Saat Menyeduh V60 di Rumah yang Wajib Dihindari',
    slug: '5-kesalahan-umum-menyeduh-v60-di-rumah',
    excerpt: 'Dari suhu air yang terlalu mendidih hingga ukuran gilingan (grind size) yang tidak konsisten, berikut rahasia agar seduhan manual Anda setara barista.',
    thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80',
    article_category_id: 2,
    category: { name: 'Brewing Guide & Tips' },
    author_name: 'Gita Saraswati (Head Barista)',
    created_at: '2026-07-08T14:30:00Z',
  },
  {
    id: 3,
    title: 'NEMU Space Cupping Session: Menjelajahi Profil Rasa Kopi Kintamani & Toraja',
    slug: 'nemu-space-cupping-session-kintamani-toraja',
    excerpt: 'Liputan seru kegiatan cupping mingguan bersama komunitas pecinta kopi di Sudirman Flagship, mencicipi karakter sitrus segar berpadu rempah hangat.',
    thumbnail: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80',
    article_category_id: 3,
    category: { name: 'Komunitas & Event' },
    author_name: 'Tim Redaksi NEMU Space',
    created_at: '2026-07-02T09:15:00Z',
  },
  {
    id: 4,
    title: 'Perbedaan Japanese Iced Coffee vs Cold Brew: Mana yang Cocok Untukmu?',
    slug: 'perbedaan-japanese-iced-coffee-vs-cold-brew',
    excerpt: 'Sama-sama disajikan dingin, namun metode ekstraksi panas langsung ke atas es menghasilkan keasaman cerah yang sangat berbeda dengan seduhan dingin 18 jam.',
    thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80',
    article_category_id: 2,
    category: { name: 'Brewing Guide & Tips' },
    author_name: 'Gita Saraswati',
    created_at: '2026-06-25T11:00:00Z',
  },
];

export default function ArtikelPage() {
  const [categories, setCategories] = React.useState<ArticleCategory[]>(fallbackCategories);
  const [articles, setArticles] = React.useState<ArticleItem[]>(fallbackArticles);
  const [loading, setLoading] = React.useState(true);

  // Filters
  const [activeCatId, setActiveCatId] = React.useState<string | number>('all');
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    async function fetchArticles() {
      try {
        const [catRes, artRes] = await Promise.allSettled([
          api.fetch<any>('/articles/categories'),
          api.fetch<any>('/articles'),
        ]);

        if (catRes.status === 'fulfilled' && (catRes.value as any)?.success && (catRes.value as any).data?.length > 0) {
          setCategories([
            { id: 'all', name: 'Semua Artikel', articles_count: artRes.status === 'fulfilled' && (artRes.value as any)?.data ? (artRes.value as any).data.length : fallbackArticles.length },
            ...(catRes.value as any).data,
          ]);
        }

        if (artRes.status === 'fulfilled' && (artRes.value as any)?.success && (artRes.value as any).data?.length > 0) {
          setArticles((artRes.value as any).data);
        }
      } catch (err) {
        console.error('Failed to load dynamic articles, using fallbacks:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchArticles();
  }, []);

  const filteredArticles = React.useMemo(() => {
    return articles.filter((item) => {
      const matchCat =
        activeCatId === 'all' ||
        String(item.article_category_id) === String(activeCatId) ||
        String(item.category?.id) === String(activeCatId);
      const matchSearch =
        searchQuery === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.excerpt && item.excerpt.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [articles, activeCatId, searchQuery]);

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#1E3D31] text-white py-16 sm:py-20 border-b border-white/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-96 h-96 rounded-full bg-[#C89B5C]/15 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#C89B5C]/15 border border-[#C89B5C]/30 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#C89B5C] backdrop-blur-md">
              <Sparkles size={14} />
              <span>NEMU Space Journal & Stories</span>
            </div>
            <h1 className="font-heading text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Artikel & Wawasan Kopi
            </h1>
            <p className="text-sm sm:text-base text-[#FAF3E7]/80 leading-relaxed font-light">
              Dalami ilmu penyeduhan, cerita dari para petani kopi nusantara, serta jadwal kegiatan komunitas terbaru kami.
            </p>
          </div>

          <div className="w-full md:w-80">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari judul atau topik artikel..."
                className="h-12 w-full rounded-2xl border border-white/20 bg-white/10 py-2 pl-10 pr-4 text-xs font-medium text-white placeholder:text-white/50 focus:border-[#C89B5C] focus:outline-none backdrop-blur-md"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter Bar */}
      <section className="bg-[#FAF3E7] dark:bg-[#14201A] py-6 border-b border-[#E4D9C4] dark:border-[#33413A] sticky top-16 z-40 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {categories.map((cat) => {
            const isActive = String(activeCatId) === String(cat.id);
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCatId(cat.id)}
                className={`min-h-[44px] rounded-2xl px-5 text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-[#1E3D31] text-[#C89B5C] shadow-md dark:bg-[#C89B5C] dark:text-[#1E3D31]'
                    : 'bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] text-[#5C5348] dark:text-[#B8A99A] hover:border-[#1E3D31]'
                }`}
              >
                <span>{cat.name}</span>
                {cat.articles_count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#C89B5C]/20 text-[#C89B5C] dark:bg-[#1E3D31]/20 dark:text-[#1E3D31]' : 'bg-[#FAF3E7] dark:bg-[#14201A] text-[#5C5348]'
                    }`}
                  >
                    {cat.articles_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 sm:py-20 bg-[#FAF3E7] dark:bg-[#14201A] min-h-[550px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length === 0 ? (
            <div className="rounded-3xl bg-white dark:bg-[#1E2B24] border border-[#E4D9C4] dark:border-[#33413A] p-16 text-center space-y-4 max-w-xl mx-auto">
              <BookOpen size={52} className="text-[#C89B5C] mx-auto animate-bounce" />
              <h3 className="font-heading text-2xl font-bold text-[#1E3D31] dark:text-[#F5EFE6]">
                Artikel Tidak Ditemukan
              </h3>
              <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A]">
                Coba gunakan kata kunci pencarian yang lain atau pilih kategori &quot;Semua Artikel&quot;.
              </p>
              <Button onClick={() => { setActiveCatId('all'); setSearchQuery(''); }} variant="outline" className="rounded-xl mt-2">
                Reset Filter
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.map((art) => (
                <Card
                  key={art.id}
                  variant="interactive"
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white dark:bg-[#1E2B24] border-[#E4D9C4] dark:border-[#33413A]"
                >
                  <div>
                    {/* Thumbnail */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#FAF3E7]">
                      <Image
                        src={
                          art.thumbnail ||
                          'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80'
                        }
                        alt={art.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-108"
                      />
                      {art.category?.name && (
                        <div className="absolute top-4 left-4 z-10">
                          <Badge variant="gold" className="px-3 py-1 text-xs uppercase font-bold shadow-md">
                            {art.category.name}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-4 text-[11px] text-[#5C5348] dark:text-[#B8A99A]">
                        <span className="flex items-center gap-1">
                          <Calendar size={13} className="text-[#C89B5C]" />
                          {art.created_at
                            ? new Date(art.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '12 Jul 2026'}
                        </span>
                        <span className="flex items-center gap-1">
                          <User size={13} className="text-[#C89B5C]" />
                          {art.author_name || 'Tim NEMU Space'}
                        </span>
                      </div>

                      <h3 className="font-heading text-xl font-bold text-[#1E3D31] dark:text-[#F5EFE6] group-hover:text-[#C89B5C] transition-colors leading-snug line-clamp-2">
                        {art.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-[#5C5348] dark:text-[#B8A99A] leading-relaxed line-clamp-3">
                        {art.excerpt || 'Temukan ulasan mendalam tentang seni menyeduh kopi specialty bersama NEMU Space.'}
                      </p>
                    </div>
                  </div>

                  {/* Footer CTA */}
                  <div className="p-6 pt-0 border-t border-[#E4D9C4]/40 dark:border-[#33413A]/40 mt-3 pt-4 flex justify-between items-center">
                    <Link
                      href={`/artikel/${art.slug || art.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3D31] dark:text-[#C89B5C] hover:text-[#C89B5C] transition-colors group/btn"
                    >
                      <span>Baca Selengkapnya</span>
                      <ArrowRight size={15} className="transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
