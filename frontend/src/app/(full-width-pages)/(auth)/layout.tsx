import GridShape from "@/components/common/GridShape";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-primary relative hidden lg:flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
            <div className="relative items-center justify-center flex z-1 w-full">
              {/* <!-- ===== Common Grid Shape Start ===== --> */}
              <GridShape />
              <div className="flex flex-col items-center max-w-sm px-8 text-center">
                <Link href="/" className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-12 h-12 bg-accent rounded-full text-primary shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  </div>
                  <span className="font-heading font-bold text-3xl text-white tracking-wide drop-shadow-lg">
                    NEMU Space
                  </span>
                </Link>
                <h2 className="text-2xl font-bold text-white font-heading mb-3">
                  Sistem Manajemen Cerdas
                </h2>
                <p className="text-center text-gray-200 dark:text-white/80 font-body">
                  Kelola POS, inventaris, dan Kitchen Display System secara real-time dengan pengalaman yang seamless.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
