'use client';

import * as React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/shared/providers/language-context';

export interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
}

export function GallerySection({ galleries }: { galleries?: GalleryImage[] }) {
  const { t } = useLanguage();
  
  if (!galleries || galleries.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-primary text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
            {t.header.gallery}
          </h2>
          <p className="text-base text-background/80 max-w-2xl mx-auto">
            {t.gallery.description}
          </p>
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {galleries.map((image) => (
            <div key={image.id} className="break-inside-avoid">
              <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Image 
                  src={image.image_url} 
                  alt={image.caption} 
                  width={400}
                  height={400}
                  className="w-full h-auto object-cover" 
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
