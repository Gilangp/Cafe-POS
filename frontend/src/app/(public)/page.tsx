"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, Phone, MessageCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicService, type LandingData } from "@/shared/services/public.service";
import toast from "react-hot-toast";

const formatRupiah = (val: number | string) => `Rp ${Number(val).toLocaleString("id-ID")}`;

const CURATIONS = [
  { shape: "40% 60% 70% 30% / 40% 50% 60% 50%" },
  { shape: "60% 40% 30% 70% / 50% 60% 40% 50%" },
  { shape: "50% 50% 60% 40% / 40% 40% 60% 60%" },
  { shape: "30% 70% 50% 50% / 50% 30% 70% 50%" },
  { shape: "70% 30% 40% 60% / 60% 50% 50% 40%" },
];

const initialReservationState = {
  name: "",
  phone: "",
  reservation_date: "",
  reservation_time: "19:00",
  guest_count: 1,
  notes: "",
};

export default function LandingPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<LandingData>({
    queryKey: ["landingData"],
    queryFn: publicService.getLandingData,
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [reservationForm, setReservationForm] = useState(initialReservationState);

  const mutation = useMutation({
    mutationFn: publicService.submitReservation,
    onSuccess: () => {
      toast.success("Reservasi Anda berhasil dikirim! Tim kami akan segera menghubungi Anda.");
      setReservationForm(initialReservationState);
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Gagal mengirim reservasi.";
      toast.error(errorMsg);
    },
  });

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReservationForm({ ...reservationForm, [e.target.name]: e.target.value });
  };

  const handleReservation = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(reservationForm);
  };
  
  if (typeof window !== "undefined") {
    window.onscroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
  }

  const bestSellers = data?.best_sellers ?? [];
  const menus = data?.menus ?? [];
  const uniqueCategories = Array.from(new Set(menus.map((m) => m.category?.name).filter(Boolean) as string[]));
  const categories = uniqueCategories.length > 0 ? uniqueCategories : ["Signature", "Coffee", "Non-Coffee", "Pastry", "Snack"];
  const promotions = data?.promotions ?? [];
  const articles = data?.articles ?? [];
  const galleries = data?.galleries ?? [];
  const settings = data?.settings ?? {};

  const heroBanners = data?.hero_banners ?? [];
  const activeHero = heroBanners.length > 0 ? heroBanners[0] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <span className="text-primary font-bold">Memuat...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body scroll-smooth">
      {/* ========== HERO BANNER ========== */}
      <section className="relative h-[600px] flex items-center overflow-hidden pt-20">
        <div className="absolute inset-0 w-full h-full bg-[#1e3932]">
          {activeHero?.image ? (
            <img 
              src={activeHero.image}
              alt={activeHero.title || "Hero Background"}
              className="w-full h-full object-cover mix-blend-overlay opacity-40"
            />
          ) : (
            <Image
              src="/images/hero-bg.jpg"
              alt="Hero Background"
              fill
              sizes="100vw"
              className="object-cover mix-blend-overlay opacity-40"
              priority
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-lg">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight uppercase">
              {activeHero?.title || settings.site_tagline || "RACIKAN SPESIAL"}
            </h1>
            <p className="text-lg text-white/90 mb-10 font-medium max-w-md leading-relaxed">
              {activeHero?.subtitle || "Nikmati racikan kopi autentik dan suasana yang menenangkan."}
            </p>
            <Link 
              href={activeHero?.button_link || "/menu"}
              className="inline-block bg-accent text-primary font-bold px-8 py-3.5 rounded-full hover:bg-white transition-colors"
            >
              {activeHero?.button_text || "Pesan Sekarang"}
            </Link>
          </div>
        </div>
      </section>
      
      {/* ========== HANDCRAFTED CURATIONS (KATEGORI) ========== */}
      {categories.length > 0 && (
        <section id="categories" className="py-20 bg-primary">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl font-bold text-white mb-12">
              Koleksi Pilihan
            </h2>
            
            <div className="flex flex-wrap justify-center gap-10 md:gap-16">
              {categories.slice(0, 5).map((cat, i) => {
                const shape = CURATIONS[i % CURATIONS.length].shape;
                return (
                  <div key={i} className="flex flex-col items-center gap-4 cursor-pointer group">
                    <div 
                      className="w-28 h-28 md:w-32 md:h-32 bg-white/10 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105"
                      style={{ borderRadius: shape }}
                    >
                      <Image 
                        src="/images/hero-bg.jpg" 
                        alt={cat} 
                        width={128} 
                        height={128} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    <span className="text-white font-semibold text-sm tracking-wide group-hover:text-accent transition-colors">
                      {cat}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========== BARISTA RECOMMENDS (BEST SELLERS) ========== */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-primary mb-10">
            Rekomendasi Barista
          </h2>
          
          {bestSellers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellers.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="bg-card rounded-xl overflow-hidden shadow-sm border border-border flex flex-col group hover:shadow-md transition-shadow"
                >
                  <div className="h-48 bg-muted relative">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <Image 
                        src="/images/hero-bg.jpg" 
                        alt={item.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover opacity-80" 
                      />
                    )}
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded text-[10px] font-bold text-primary shadow-sm flex items-center gap-1">
                       <Star className="w-3 h-3 text-accent" fill="currentColor" /> Favorit
                    </div>
                  </div>
                  
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-[10px] text-accent font-bold uppercase tracking-wider mb-1">
                      {item.category?.name || "Lainnya"}
                    </span>
                    <h3 className="font-bold text-primary leading-tight mb-2">{item.name}</h3>
                    <p className="text-[11px] text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
                    
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-lg text-primary">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Belum ada rekomendasi menu saat ini.
            </div>
          )}
        </div>
      </section>


      {/* ========== PROMO AKTIF (FR-04) ========== */}
      <section id="promo" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-primary mb-10">
            Promo Spesial
          </h2>
          {promotions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {promotions.map((promo) => (
                 <div key={promo.id} className="relative rounded-xl overflow-hidden bg-primary h-64 shadow-sm">
                    <div className="w-full h-full flex items-center justify-center opacity-10">
                       <Star className="w-16 h-16 text-white" />
                    </div>
                    <div className="absolute inset-0 p-8 flex flex-col justify-center">
                       <h3 className="text-white font-bold text-3xl mb-2">{promo.title}</h3>
                       <p className="text-white/80 text-sm max-w-sm mb-4">
                         {promo.type === 'diskon' ? `Diskon ${promo.value}%` : `Potongan ${formatRupiah(promo.value || 0)}`}
                       </p>
                       {promo.end_date && (
                         <span className="inline-block bg-white text-primary text-xs font-bold px-3 py-1.5 rounded w-max">
                           Berlaku s/d {new Date(promo.end_date).toLocaleDateString('id-ID')}
                         </span>
                       )}
                    </div>
                 </div>
               ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Belum ada promo saat ini.
            </div>
          )}
        </div>
      </section>

      {/* ========== GALERI FOTO (FR-06) ========== */}
      <section id="gallery" className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading text-3xl font-bold text-primary mb-10">
            Galeri Kami
          </h2>
          {galleries.length > 0 ? (
            <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {galleries.map((img) => (
                <div key={img.id} className="break-inside-avoid relative rounded-xl overflow-hidden group">
                   <img src={img.image} alt={img.caption || "Gallery item"} className="w-full object-cover" />
                   {img.caption && (
                     <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                       <p className="text-white text-center text-sm font-medium">{img.caption}</p>
                     </div>
                   )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground border-2 border-dashed border-border rounded-xl">
              Galeri belum tersedia.
            </div>
          )}
        </div>
      </section>

      {/* ========== ARTIKEL (FR-05) ========== */}
      <section id="articles" className="pt-20 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <h2 className="font-heading text-3xl font-bold">
            Cerita & Artikel
          </h2>
        </div>
        
        <div className="relative pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {articles.slice(0, 3).map((article) => (
                  <Link href={`/article/${article.slug}`} key={article.id} className="group">
                    <div className="mb-4">
                      <span className="text-xs font-bold text-accent tracking-widest uppercase">
                        {(typeof article.category === 'object' ? article.category.name : article.category) || "Artikel"}
                      </span>
                    </div>
                    <h3 className="font-heading text-2xl font-bold mb-3 group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-3">
                      {article.content}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-white/50 border-2 border-dashed border-white/20 rounded-xl">
                Belum ada artikel tersedia.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========== RESERVASI & KONTAK (FR-07, FR-08, FR-09) ========== */}
      <section id="reservation" className="py-20 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              
              {/* Form Reservasi */}
              <div>
                 <h2 className="font-heading text-3xl font-bold text-primary mb-4">Reservasi Tempat</h2>
                 <p className="text-muted-foreground mb-8 text-sm">Pastikan tempat Anda tersedia sebelum berkunjung. Silakan isi form di bawah ini untuk reservasi meja.</p>
                 
                 <form onSubmit={handleReservation} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-primary mb-2">Nama Lengkap</label>
                        <input name="name" type="text" value={reservationForm.name} onChange={handleFormChange} required className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-primary mb-2">No. Telepon / WA</label>
                        <input name="phone" type="tel" value={reservationForm.phone} onChange={handleFormChange} required className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-primary mb-2">Tanggal</label>
                        <input name="reservation_date" type="date" value={reservationForm.reservation_date} onChange={handleFormChange} required className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                      </div>
                       <div>
                        <label className="block text-sm font-bold text-primary mb-2">Jumlah Orang</label>
                        <input name="guest_count" type="number" min="1" value={reservationForm.guest_count} onChange={handleFormChange} required className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary mb-2">Catatan Khusus</label>
                      <textarea name="notes" rows={3} value={reservationForm.notes} onChange={handleFormChange} className="w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:border-primary" />
                    </div>
                    <button type="submit" disabled={mutation.isPending} className="w-full bg-primary text-white font-bold py-3 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {mutation.isPending ? "Mengirim..." : "Kirim Request Reservasi"}
                    </button>
                 </form>
              </div>

              {/* Maps & Kontak */}
              <div className="flex flex-col">
                 <h2 className="font-heading text-3xl font-bold text-primary mb-6">Lokasi Kami</h2>
                 <div className="w-full h-64 bg-muted rounded-xl overflow-hidden mb-8 border border-border">
                    {settings.maps_embed ? (
                       <iframe src={settings.maps_embed} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" />
                    ) : (
                       <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                          <MapPin className="w-10 h-10 mb-2 text-border" />
                          <span>Peta belum dikonfigurasi</span>
                       </div>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                         <Phone className="w-5 h-5 text-white" />
                       </div>
                       <div>
                         <p className="font-bold text-primary text-sm">Telepon</p>
                         <p className="text-muted-foreground text-sm">{settings.phone || "Tidak ada telepon"}</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
                         <MapPin className="w-5 h-5 text-white" />
                       </div>
                       <div>
                         <p className="font-bold text-primary text-sm">Alamat</p>
                         <p className="text-muted-foreground text-sm leading-relaxed">{settings.address || "Alamat belum diatur"}</p>
                       </div>
                    </div>
                 </div>

                 {/* WhatsApp CTA (FR-09) */}
                 <a 
                   href={settings.phone ? `https://wa.me/${settings.phone.replace(/\D/g,'')}` : "#"}
                   target="_blank"
                   rel="noreferrer"
                   className="mt-auto flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-md hover:bg-[#20bd5a] transition-colors w-max"
                 >
                   <MessageCircle className="w-5 h-5" />
                   Hubungi via WhatsApp
                 </a>
              </div>
           </div>
        </div>
      </section>


    </div>
  );
}
