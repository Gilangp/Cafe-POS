'use client';

import * as React from 'react';
import { MapPin, Clock } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export interface LocationData {
  address: string;
  google_maps_embed: string;
  operational_hours: Array<{ day: string; open: string; close: string; is_open: boolean }>;
}

export function LocationSection({ location }: { location?: LocationData }) {
  const { t } = useLanguage();
  
  if (!location) {
    return null;
  }

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
                {t.locations.title}
              </h2>
              <p className="text-base text-foreground/70 mb-6">
                {t.locations.description}
              </p>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <MapPin className="text-accent" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-body text-foreground mb-2">{t.contact.addressLabel}</h3>
                <p className="text-base text-foreground/70">{location.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Clock className="text-accent" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold font-body text-foreground mb-3">{t.contact.operationalHours}</h3>
                <div className="space-y-2">
                  {location.operational_hours?.map(op => (
                    <div key={op.day} className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{op.day}</span>
                      <span className="text-foreground/70">
                        {op.is_open ? `${op.open} - ${op.close}` : t.contact.closed}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-xl border border-border h-[400px] lg:h-[500px] bg-background">
            {location.google_maps_embed ? (
              <iframe
                src={location.google_maps_embed}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <p className="text-foreground/50">{t.contact.mapNotAvailable}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
