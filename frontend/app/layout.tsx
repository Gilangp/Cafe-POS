import type { Metadata } from 'next';
import { Inter, Poppins, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/app-providers';
import { PwaRegistrar } from '@/components/pwa-registrar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-playfair', display: 'swap' });

export const metadata: Metadata = {
  title: 'NEMU Space — Premium Coffee & Specialty Roastery',
  description: 'Experience artisan handcrafted coffee curations, slow-bar specialty brews, and seamless digital service at NEMU Space.',
  keywords: 'coffee shop, nemu space, artisan coffee, specialty roastery, POS, KDS, coffee management',
  manifest: '/manifest.json',
  openGraph: {
    title: 'NEMU Space — Handcrafted Coffee Curations',
    description: 'Where every cup tells a story of craftsmanship and quality. Discover artisan coffee curations and seamless digital service.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#1E3D31" />
      </head>
      <body className={`${inter.variable} ${poppins.variable} ${playfair.variable} font-sans antialiased`}>
        <AppProviders>
          <PwaRegistrar />
          {children}
        </AppProviders>
      </body>
    </html>
  );
}