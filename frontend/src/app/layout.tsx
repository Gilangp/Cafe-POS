import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '@/styles/globals.css';
import "flatpickr/dist/flatpickr.css";

// Provider dari project Anda
import { AppProviders } from '@/shared/providers/app-providers';
import { PwaRegistrar } from '@/shared/lib/pwa-registrar';

// Provider dari template
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  title: 'NEMU Space — Dashboard',
  description: 'NEMU Space Management System',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/images/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#1E3D31" />
      </head>
      <body className={`${inter.variable} ${outfit.variable} font-body bg-background text-foreground dark:bg-boxdark-2`}>
        <AppProviders>
          <ThemeProvider>
            <SidebarProvider>
              <PwaRegistrar />
              {children}
            </SidebarProvider>
          </ThemeProvider>
        </AppProviders>
      </body>
    </html>
  );
}
