'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/shared/providers/language-context';

export interface Article {
  id: string;
  slug: string;
  title: string;
  thumbnail: string;
  category: {
    name: string;
  };
}

export function ArticlesSection({ articles }: { articles?: Article[] }) {
  const { t } = useLanguage();
  
  if (!articles || articles.length === 0) {
    return null;
  }

  const recentArticles = articles.slice(0, 3);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
            {t.articles.title}
          </h2>
          <p className="text-base text-foreground/70 max-w-2xl mx-auto">
            {t.articles.desc}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentArticles.map((article) => (
            <Link key={article.id} href={`/article/${article.slug}`}>
              <div className="bg-card rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group cursor-pointer border border-border">
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-background">
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                    {article.category.name}
                  </span>
                  <h3 className="text-lg font-semibold font-body text-foreground mt-2 mb-3 line-clamp-2">
                    {article.title}
                  </h3>
                  <div className="flex items-center text-accent font-medium text-sm group-hover:gap-2 transition-all">
                    <span>{t.articles.readMore}</span>
                    <ArrowRight size={16} className="ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
