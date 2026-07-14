import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PublicNavbar, PublicFooter, PublicLayout } from '@/components/public-layout';
import { LanguageProvider } from '@/context/language-context';

describe('1. PublicNavbar Component Tests (Phase F6 WCAG 2.2 AA Navigation)', () => {
  it('renders all public navigation links and brand logo correctly', () => {
    render(
      <LanguageProvider>
        <PublicNavbar />
      </LanguageProvider>
    );

    expect(screen.getByText('Velvra')).toBeDefined();
    expect(screen.getByText('Beranda')).toBeDefined();
    expect(screen.getByText('Tentang Kami')).toBeDefined();
    expect(screen.getByText('Katalog Menu')).toBeDefined();
    expect(screen.getByText('Cabang')).toBeDefined();
    expect(screen.getByText('Karir')).toBeDefined();
    expect(screen.getByText('Event & Kelas')).toBeDefined();
    expect(screen.getByText('Jurnal')).toBeDefined();
    expect(screen.getByText('Galeri')).toBeDefined();
    expect(screen.getByText('WCAG AA')).toBeDefined();
  });

  it('contains proper accessibility aria-label attributes for mobile drawer and language switch buttons', () => {
    render(
      <LanguageProvider>
        <PublicNavbar />
      </LanguageProvider>
    );

    const langBtn = screen.getByRole('button', { name: /Ganti bahasa/i });
    expect(langBtn).toBeDefined();

    const mobileBtn = screen.getByRole('button', { name: /Buka navigasi mobile/i });
    expect(mobileBtn).toBeDefined();
  });

  it('toggles mobile drawer navigation when mobile button is clicked', () => {
    render(
      <LanguageProvider>
        <PublicNavbar />
      </LanguageProvider>
    );

    const mobileBtn = screen.getByRole('button', { name: /Buka navigasi mobile/i });
    fireEvent.click(mobileBtn);

    const mobileNav = screen.getByRole('navigation', { name: /Navigasi mobile/i });
    expect(mobileNav).toBeDefined();
  });
});

describe('2. PublicFooter & Newsletter Subscription Tests (Phase F6 Tier Privilege)', () => {
  it('renders newsletter subscription form and legal accessibility links', () => {
    render(
      <LanguageProvider>
        <PublicFooter />
      </LanguageProvider>
    );

    expect(screen.getByText('Daftar Newsletter & Privilege Gold Tier')).toBeDefined();
    expect(screen.getByPlaceholderText('Alamat email Anda...')).toBeDefined();
    expect(screen.getByText(/Kepatuhan WCAG 2.2 AA/i)).toBeDefined();
  });
});

describe('3. PublicLayout Integration Test', () => {
  it('wraps children inside LanguageProvider and renders navbar and footer seamlessly', () => {
    render(
      <PublicLayout>
        <div data-testid="child-content">Tested Page Content</div>
      </PublicLayout>
    );

    expect(screen.getByTestId('child-content').textContent).toBe('Tested Page Content');
    expect(screen.getAllByText('Velvra')[0]).toBeDefined();
  });
});
