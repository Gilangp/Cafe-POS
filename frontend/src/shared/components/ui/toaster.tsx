'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import { Toast } from './toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div
      aria-label="Notifikasi Sistem"
      className="fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-4 pointer-events-none sm:top-6 sm:right-6"
    >
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onDismiss={dismiss} />
      ))}
    </div>
  );
}
