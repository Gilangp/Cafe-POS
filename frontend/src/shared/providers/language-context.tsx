'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Locale } from '@/shared/constants/index';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('id'); // Defaulting to Bahasa Indonesia for primary focus, swappable to EN

  useEffect(() => {
    const saved = localStorage.getItem('velvra_locale') as Locale;
    if (saved === 'en' || saved === 'id') {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('velvra_locale', newLocale);
    }
  };

  const toggleLocale = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  const value = {
    locale,
    setLocale,
    toggleLocale,
    t: translations[locale] || translations.id,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
