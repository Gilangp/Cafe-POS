import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-gray-50 dark:bg-gray-900">
      <ThemeProvider>
        <div className="flex min-h-screen w-full">
          {/* LEFT: Hero Section (Desktop Only) */}
          <div className="relative hidden lg:flex lg:w-1/2 bg-primary flex-col justify-between overflow-hidden">
            {/* Background elements for modern look */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900/40 via-primary to-primary-900 z-0"></div>
            <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-accent/20 blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-10 mix-blend-overlay z-0"></div>

            <div className="relative z-10 flex flex-col justify-center h-full px-16 xl:px-24">
              <Link href="/" className="inline-flex items-center gap-3 mb-12 w-fit group">
                <div className="flex items-center justify-center w-10 h-10 bg-accent rounded-xl text-primary shadow-lg shadow-accent/30 group-hover:scale-105 transition-transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <span className="font-heading font-bold text-2xl text-white tracking-wide">
                  NEMU
                </span>
              </Link>

              <h1 className="text-4xl xl:text-5xl font-bold text-white font-heading mb-6 leading-tight">
                Selamat Datang Kembali
              </h1>
              <p className="text-lg text-slate-300 font-body mb-12 max-w-md leading-relaxed">
                Masuk untuk mengelola seluruh operasional coffee shop Anda dalam satu platform cerdas.
              </p>

              <div className="grid grid-cols-2 gap-4 max-w-md">
                {[
                  "Inventory Management",
                  "Point of Sales (POS)",
                  "Sistem Reservasi",
                  "Membership Program"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-200 bg-slate-800/40 border border-slate-700/50 rounded-lg py-3 px-4 backdrop-blur-sm">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    <span className="font-medium text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 px-16 xl:px-24 pb-12">
              <p className="text-slate-400 text-sm">
                &copy; {new Date().getFullYear()} NEMU Space. All rights reserved.
              </p>
            </div>
          </div>

          {/* RIGHT: Login Form */}
          <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 relative z-10 w-full lg:w-1/2">
            <div className="w-full max-w-md">
              {children}
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
