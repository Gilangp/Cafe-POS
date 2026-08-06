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
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";
  const navBg = isScrolled 
    ? "bg-primary/85 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] py-4 border-b border-white/10" 
    : "bg-gradient-to-b from-primary/80 to-transparent py-6";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ease-out ${navBg}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-12">
          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-3 group">
            <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-xl text-primary shadow-lg shadow-accent/20 group-hover:scale-105 transition-transform duration-300">
              <Star className="w-5 h-5" fill="currentColor" strokeWidth={1.5} />
            </div>
            <span className="font-heading font-bold text-xl text-white tracking-wide hidden sm:block group-hover:text-accent transition-colors duration-300">
              {settings.coffee_shop_name || "NEMU Space"}
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/90">
            <Link href="/menu" className={`hover:text-accent transition-colors duration-300 ${pathname === '/menu' ? 'text-accent' : ''}`}>Menu</Link>
            <Link href="/promo" className={`hover:text-accent transition-colors duration-300 ${pathname === '/promo' ? 'text-accent' : ''}`}>Promo</Link>
            <Link href="/gallery" className={`hover:text-accent transition-colors duration-300 ${pathname === '/gallery' ? 'text-accent' : ''}`}>Galeri</Link>
            <Link href="/article" className={`hover:text-accent transition-colors duration-300 ${pathname.startsWith('/article') ? 'text-accent' : ''}`}>Cerita</Link>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <Link 
            href={isHome ? "#reservation" : "/#reservation"}
            className="hidden md:inline-flex bg-accent text-primary font-bold px-6 py-2.5 rounded-full hover:bg-white hover:scale-105 transition-all duration-300 text-sm shadow-lg shadow-accent/20"
          >
            Reservasi Meja
          </Link>
          <Link href="/login" className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white/90 cursor-pointer hover:bg-white/10 hover:border-white/40 transition-all duration-300 group">
            <User className="w-4 h-4 group-hover:text-accent transition-colors" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
