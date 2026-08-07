import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import PublicNavbar from "@/components/public/PublicNavbar";
import PublicFooter from "@/components/public/PublicFooter";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });

export const metadata: Metadata = {
  title: "NEMU Space — Premium Coffee & Specialty Roastery",
  description:
    "Experience artisan handcrafted coffee curations, slow-bar specialty brews, and seamless digital service at NEMU Space.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.variable} ${outfit.variable} font-body antialiased flex flex-col min-h-screen`}>
      <PublicNavbar />
      <main className="flex-grow">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
