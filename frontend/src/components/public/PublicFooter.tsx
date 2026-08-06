"use client";

import Link from "next/link";
import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { publicService, type LandingData } from "@/shared/services/public.service";
import { usePathname } from "next/navigation";

export default function PublicFooter() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const { data } = useQuery<LandingData>({
    queryKey: ["landingData"],
    queryFn: publicService.getLandingData,
  });

  const settings = data?.settings ?? {};

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t-[8px] border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
          <div className="lg:col-span-4">
            <div className="w-14 h-14 bg-background rounded-full flex items-center justify-center mb-6">
              <Star className="w-8 h-8 text-primary" fill="currentColor" />
            </div>
            <h3 className="font-heading text-xl font-bold mb-3">{settings.coffee_shop_name || "NEMU Space"}</h3>
            <p className="text-white/70 text-sm leading-relaxed max-w-xs">
              {settings.tagline || "Memberikan pengalaman kopi terbaik dengan suasana yang menenangkan."}
            </p>
          </div>
          
          <div className="lg:col-span-2 lg:col-start-7">
            <h4 className="font-bold mb-6 text-sm">Navigasi</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              {isHome ? (
                <li><Link href="#" onClick={scrollToTop} className="hover:text-white transition-colors">Beranda</Link></li>
              ) : (
                <li><Link href="/" className="hover:text-white transition-colors">Beranda</Link></li>
              )}
              <li><Link href="/menu" className="hover:text-white transition-colors">Menu</Link></li>
              <li><Link href="/promo" className="hover:text-white transition-colors">Promo</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-bold mb-6 text-sm">Layanan</h4>
            <ul className="flex flex-col gap-3 text-sm text-white/70">
              <li><Link href={isHome ? "#reservation" : "/#reservation"} className="hover:text-white transition-colors">Reservasi</Link></li>
              <li><Link href="/gallery" className="hover:text-white transition-colors">Galeri</Link></li>
              <li><Link href="/article" className="hover:text-white transition-colors">Cerita</Link></li>
            </ul>
          </div>
          
          <div className="lg:col-span-2">
            <h4 className="font-bold mb-6 text-sm">Sosial Media</h4>
            <div className="flex gap-4">
                {settings.instagram && (
                  <a href={settings.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                    <span className="text-xs font-bold">Ig</span>
                  </a>
                )}
                {settings.facebook && (
                  <a href={settings.facebook} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white hover:text-primary transition-colors">
                    <span className="text-xs font-bold">Fb</span>
                  </a>
                )}
            </div>
          </div>
        </div>
        
        <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-white transition-colors">Syarat Ketentuan</Link>
          </div>
          <div>
            &copy; {new Date().getFullYear()} {settings.coffee_shop_name || "NEMU Space"}. All rights reserved.
          </div>
        </div>
        
      </div>
    </footer>
  );
}
