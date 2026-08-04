'use client';

import * as React from 'react';
import { Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export interface ContactData {
  phone: string;
  whatsapp: string;
  email: string;
  social_media: Array<{ platform: string; url: string }>;
}

export function ContactSection({ contact }: { contact?: ContactData }) {
  const { t } = useLanguage();
  
  if (!contact) {
    return null;
  }

  return (
    <section className="py-20 bg-primary text-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
          {t.contact.title}
        </h2>
        <p className="text-base text-background/80 mb-12 max-w-2xl mx-auto">
          {t.contact.description}
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8 mb-12">
          <a 
            href={`https://wa.me/${contact.whatsapp}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-3 px-6 py-3 bg-accent text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors shadow-md"
          >
            <Phone size={20} />
            <span>{t.contact.whatsapp}</span>
          </a>
          <a 
            href={`mailto:${contact.email}`} 
            className="flex items-center gap-3 px-6 py-3 bg-background/10 text-background border border-background/20 rounded-lg font-semibold hover:bg-background/20 transition-colors"
          >
            <Mail size={20} />
            <span>{t.contact.emailLabel}</span>
          </a>
        </div>
        
        <div className="flex justify-center items-center gap-6">
          {contact.social_media?.map(social => {
            const Icon = social.platform === 'Instagram' ? Instagram : social.platform === 'Facebook' ? Facebook : null;
            return Icon ? (
              <a 
                key={social.platform} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-3 bg-background/10 rounded-full hover:bg-accent hover:text-primary transition-all"
              >
                <Icon size={24} />
              </a>
            ) : null;
          })}
        </div>
      </div>
    </section>
  );
}
