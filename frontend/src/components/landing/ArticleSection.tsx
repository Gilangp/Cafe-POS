"use client";

import Link from "next/link";
import { type PublicArticle } from "@/shared/services/public.service";
import { ArrowRight } from "lucide-react";

interface ArticleSectionProps {
  articles: PublicArticle[];
}

export default function ArticleSection({ articles }: ArticleSectionProps) {
  return (
    <section id="articles" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <span className="text-accent text-xs font-bold tracking-widest uppercase mb-3 block">
              Jurnal & Pembaruan
            </span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-primary tracking-tight">
              Cerita & Artikel
            </h2>
          </div>
          <Link href="/article" className="text-sm font-semibold text-primary hover:text-accent transition-colors border-b-2 border-transparent hover:border-accent pb-1 w-max">
            Lihat Semua Jurnal
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles && articles.length > 0 ? (
            articles.slice(0, 3).map((article) => (
              <Link href={`/article/${article.slug}`} key={article.id} className="group flex flex-col">
                <div className="rounded-2xl overflow-hidden mb-6 bg-muted relative aspect-[4/3]">
                   {article.image || article.thumbnail_url ? (
                      <img 
                        src={article.image || article.thumbnail_url} 
                        alt={article.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                        loading="lazy"
                      />
                   ) : (
                      <div className="w-full h-full bg-primary/5 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-in-out">
                         <span className="text-primary/20 font-bold">No Image</span>
                      </div>
                   )}
                </div>
                
                <div className="mb-3">
                  <span className="text-[11px] font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">
                    {(typeof article.category === 'object' ? article.category.name : article.category) || "Artikel"}
                  </span>
                </div>
                
                <h3 className="font-heading text-2xl font-bold mb-3 text-primary group-hover:text-accent transition-colors leading-snug">
                  {article.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-6">
                  {article.excerpt || article.content}
                </p>
                
                <div className="mt-auto flex items-center text-sm font-bold text-primary group-hover:text-accent transition-colors">
                  Baca Selengkapnya
                  <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-1 md:col-span-3 text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-white/50">
              Belum ada artikel tersedia.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
