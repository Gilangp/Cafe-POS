'use client';

import * as React from 'react';

export function PwaRegistrar() {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[NEMU Space PWA] Service Worker registered successfully with scope:', registration.scope);
          })
          .catch((error) => {
            console.warn('[NEMU Space PWA] Service Worker registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
