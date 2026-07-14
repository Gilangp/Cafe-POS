'use client';

import { useState } from 'react';
import { PublicLayout } from '@/components/public-layout';
import { BookOpen, Calendar, User, Tag, Search, ArrowRight, Sparkles, Coffee, Clock } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'Roasting Notes' | 'Brewing Tips' | 'Brand Story' | 'Sustainability';
  author: string;
  date: string;
  readTime: string;
}

const ARTICLES: Article[] = [
  {
    id: 'ART-01',
    title: 'Keindahan & Kompleksitas Profil Roasting Kopi Gayo Sumatra',
    excerpt: 'Mengapa tanah vulkanik dataran tinggi Gayo menghasilkan body yang tebal dengan sentuhan rempah alami? Bedah kurva sangrai bersama Master Roaster kami.',
    content: 'Dataran tinggi Gayo di Aceh Tengah berada pada ketinggian 1.200 hingga 1.500 meter di atas permukaan laut. Mikroiklim yang sejuk dipadukan dengan tanah vulkanik yang subur memberikan karakter khas pada buah kopi Arabika. Di Velvra Roastery, kami menerapkan profil pemanggangan *Medium-Light* untuk single origin Gayo. Tujuannya adalah mempertahankan keasaman segar rasa asam malat yang menyerupai apel hijau, sekaligus memunculkan manisnya gula merah (*brown sugar*) pada fase akhir pemanggangan sebelum *first crack* selesai.',
    category: 'Roasting Notes',
    author: 'Nadia Rahmawati (Head Roaster)',
    date: '12 Juli 2026',
    readTime: '4 Menit Baca',
  },
  {
    id: 'ART-02',
    title: 'Panduan Memilih Biji Kopi Terbaik: Espresso vs Filter V60',
    excerpt: 'Jangan salah pilih biji! Simak perbedaan utama spesifikasi roasting dan jenis proses pencucian (Washed vs Natural/Anaerobic) untuk metode seduh Anda.',
    content: 'Banyak pencinta kopi bertanya: apakah biji untuk espresso bisa dipakai untuk V60 manual brew? Jawaban singkatnya: bisa, namun hasilnya kurang optimal. Untuk espresso, mesin membutuhkan tekanan tinggi 9 bar sehingga profil sangrai yang sedikit lebih matang (*Medium to Medium-Dark*) atau berkarakter body tebal akan menghasilkan krema yang stabil dan rasa tidak terlalu tajam. Sebaliknya, metode tuang V60 lebih menyukai profil *Light to Medium* dengan proses *Natural* atau *Anaerobic Honey* untuk menonjolkan kejernihan aroma bunga (*floral*) dan buah-buahan eksotis.',
    category: 'Brewing Tips',
    author: 'Fajar Nugraha (Q-Grader)',
    date: '8 Juli 2026',
    readTime: '5 Menit Baca',
  },
  {
    id: 'ART-03',
    title: 'Mengapa Velvra Membayar 30% Di Atas Harga Pasar Komoditas Petani',
    excerpt: 'Filosofi Direct Trade bukan sekadar slogan pemasaran. Ini adalah komitmen kami demi keberlanjutan hidup petani lokal dan stabilitas kualitas panen.',
    content: 'Dalam rantai pasok kopi konvensional, petani kerap menjadi pihak yang paling dirugikan karena fluktuasi harga bursa komoditas global. Velvra memotong jalur tengkulak dengan membeli langsung biji kopi gabah (*green beans*) dari koperasi petani di Kintamani dan Toraja. Dengan membayar harga premium 30% lebih tinggi, petani memiliki modal berlebih untuk merawat pohon kopi secara organik, memetik hanya buah merah (*selective hand-picking*), dan menjaga kebersihan lantai jemur. Kualitas cangkir yang Anda nikmati adalah hasil dari kesejahteraan mereka.',
    category: 'Sustainability',
    author: 'Admin Velvra',
    date: '1 Juli 2026',
    readTime: '3 Menit Baca',
  },
  {
    id: 'ART-04',
    title: 'Rahasia Susu Oat Plant-Based yang Foamy, Gurih, dan Tidak Pecah',
    excerpt: 'Bagaimana barista kami mengukus susu nabati hingga menciptakan tekstur microfoam selembut awan untuk kreasi Golden Velvet Cappuccino.',
    content: 'Susu oat (*oat milk*) kini menjadi pilihan utama bagi pelanggan vegan maupun yang intoleran terhadap laktosa. Tantangan terbesar susu nabati adalah kecenderungannya untuk pecah (*curdle*) atau terpisah saat bercampur dengan keasaman espresso. Barista Velvra dilatih khusus untuk menjaga suhu pengukusan (*steaming*) di kisaran tepat 58°C - 62°C serta menggunakan merek oat milk berformula *barista edition* yang kaya protein nabati, menciptakan *microfoam* super mengilap yang mampu bertahan hingga tetes terakhir.',
    category: 'Brewing Tips',
    author: 'Nadia Rahmawati (Head Roaster)',
    date: '25 Juni 2026',
    readTime: '4 Menit Baca',
  },
];

const BLOG_CATEGORIES = ['Semua Artikel', 'Roasting Notes', 'Brewing Tips', 'Sustainability', 'Brand Story'];

export default function BlogPage() {
  const [activeCat, setActiveCat] = useState('Semua Artikel');
  const [searchQuery, setSearchQuery] = useState('');
  const [readingArticle, setReadingArticle] = useState<Article | null>(null);

  const filteredArticles = ARTICLES.filter((art) => {
    const matchCat = activeCat === 'Semua Artikel' || art.category === activeCat;
    const matchQuery = art.title.toLowerCase().includes(searchQuery.toLowerCase()) || art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  return (
    <PublicLayout>
      {/* Header Banner */}
      <section className="bg-[#12100E] text-white py-16 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#BA935D]">Jurnal Kopi & Edukasi (`GET /api/v1/pages/blog`)</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">Velvra Artisan Journal</h1>
          <p className="text-sm text-white/70 leading-relaxed max-w-2xl mx-auto">
            Kumpulan catatan riset dari ruang sangrai, panduan menyeduh manual di rumah, hingga cerita inspiratif di balik perkebunan kopi nusantara.
          </p>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="bg-[#FAF6F0] py-8 border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {BLOG_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={`min-h-[44px] rounded-xl px-5 text-xs font-bold transition-all shrink-0 ${
                  activeCat === cat
                    ? 'bg-[#12100E] text-[#BA935D] shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#BA935D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari topik artikel atau penulis..."
              className="min-h-[44px] w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 text-xs font-medium focus:border-[#BA935D] focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredArticles.length === 0 ? (
            <div className="rounded-3xl bg-white border border-gray-200 p-16 text-center space-y-3">
              <BookOpen size={48} className="text-gray-300 mx-auto" />
              <p className="font-serif text-xl font-bold text-gray-700">Artikel tidak ditemukan</p>
              <p className="text-xs text-gray-400">Silakan ganti kata kunci pencarian atau pilih kategori lain.</p>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2">
              {filteredArticles.map((art) => (
                <article
                  key={art.id}
                  onClick={() => setReadingArticle(art)}
                  className="rounded-3xl bg-white border-2 border-gray-100 p-8 shadow-sm transition-all hover:shadow-xl hover:border-[#BA935D]/60 flex flex-col justify-between cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-[#FAF6F0] border border-[#BA935D]/40 text-[#BA935D] px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        {art.category}
                      </span>
                      <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 font-mono">
                        <Clock size={13} /> {art.readTime}
                      </span>
                    </div>

                    <h2 className="font-serif text-2xl font-bold text-gray-900 group-hover:text-[#BA935D] transition-colors leading-snug">
                      {art.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-3">{art.excerpt}</p>
                  </div>

                  <div className="mt-8 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-[#BA935D]" />
                      <span>{art.author}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-[#12100E] group-hover:translate-x-1 transition-transform">
                      <span>Baca Selengkapnya</span>
                      <ArrowRight size={14} className="text-[#BA935D]" />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ARTICLE READER MODAL */}
      {readingArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-3xl max-h-[85vh] bg-white rounded-3xl p-8 sm:p-10 shadow-2xl overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <span className="rounded-full bg-[#12100E] text-[#BA935D] px-3 py-1 text-xs font-bold uppercase tracking-wider">
                {readingArticle.category}
              </span>
              <button
                onClick={() => setReadingArticle(null)}
                className="min-h-[44px] min-w-[44px] rounded-full bg-gray-100 font-bold text-gray-600 hover:bg-gray-200 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <h2 className="font-serif text-2xl sm:text-4xl font-bold text-gray-900 leading-tight">{readingArticle.title}</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                <span className="font-semibold text-gray-700">{readingArticle.author}</span>
                <span>●</span>
                <span>{readingArticle.date}</span>
                <span>●</span>
                <span>{readingArticle.readTime}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 text-sm text-gray-700 leading-relaxed space-y-4 font-sans">
              <p className="font-semibold text-gray-900 text-base border-l-4 border-[#BA935D] pl-4 italic">
                “{readingArticle.excerpt}”
              </p>
              <p>{readingArticle.content}</p>
              <p>
                Untuk berdiskusi lebih lanjut atau mencicipi hasil profil sangrai yang dibahas dalam jurnal ini, Anda dapat mengunjungi *cupping table* kami yang tersedia di setiap cabang Velvra.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setReadingArticle(null)}
                className="min-h-[44px] rounded-2xl bg-[#12100E] text-[#BA935D] px-8 text-xs font-bold uppercase tracking-wider shadow hover:bg-[#201d19]"
              >
                Tutup Artikel
              </button>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
