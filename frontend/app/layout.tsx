import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/components/app-providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Velvra — Premium Coffee Experience & Management Platform',
  description: 'Experience artisan coffee, curated menu, and seamless service. Velvra is a modern coffee shop management platform with POS, KDS, inventory, and CRM — all in one.',
  keywords: 'coffee shop, premium coffee, artisan coffee, POS, coffee management, Velvra',
  openGraph: {
    title: 'Velvra — Premium Coffee Experience',
    description: 'Where Every Sip Tells a Story. Discover artisan coffee, curated menu, and seamless digital service.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}