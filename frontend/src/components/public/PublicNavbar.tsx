"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Star, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { publicService, type LandingData } from "@/shared/services/public.service";
import { usePathname } from "next/navigation";

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  const { data } = useQuery<LandingData>({
    queryKey: ["landingData"],
    queryFn: publicService.getLandingData,
  });

  const settings = data?.settings ?? {};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  // On home page we might want it transparent at top, on other pages we might want it solid always.
  // Actually, since other pages have a dark green hero section, we can make it transparent at the top too!
  const navBg = isScrolled ? "bg-[#1e3932] shadow-lg py-4" : "bg-transparent py-6";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-full text-primary">
              <Star className="w-5 h-5" fill="currentColor" />
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-wide hidden sm:block">
              {settings.coffee_shop_name || "NEMU Space"}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-semibold text-white/90">
            <Link href="/menu" className="hover:text-accent transition-colors">Menu</Link>
            <Link href="/promo" className="hover:text-accent transition-colors">Promo</Link>
            <Link href="/gallery" className="hover:text-accent transition-colors">Galeri</Link>
            <Link href="/article" className="hover:text-accent transition-colors">Cerita</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link 
            href={isHome ? "#reservation" : "/#reservation"}
            className="hidden md:inline-flex bg-accent text-primary font-bold px-6 py-2.5 rounded-full hover:bg-white transition-colors text-sm"
          >
            Reservasi Meja
          </Link>
          <button className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors font-bold text-xs">
            ID
          </button>
        </div>
      </div>
    </nav>
  );
}
