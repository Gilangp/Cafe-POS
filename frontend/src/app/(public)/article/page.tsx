"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicArticle } from "@/shared/services/public.service";
import { ArrowRight, Star } from "lucide-react";

export default function ArticlePage() {
  const { data: articles, isLoading } = useQuery<PublicArticle[]>({
    queryKey: ["publicArticles"],
    queryFn: publicService.getArticles,
  });

  const items = articles ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <section className="bg-primary pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-transparent z-10" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-20">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Cerita & Jurnal</h1>
          <p className="text-white/80 max-w-xl text-lg font-medium">
            Artikel, tips, dan inspirasi di balik setiap seduhan kopi kami.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white border border-border/50 p-6 shadow-sm animate-pulse h-80" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((article) => (
              <Link href={`/article/${article.slug}`} key={article.id} className="group flex flex-col">
                <div className="rounded-2xl overflow-hidden mb-6 bg-muted relative aspect-[4/3] shadow-sm">
                   {article.thumbnail_url || (article as any).image ? (
                      <img 
                        src={article.thumbnail_url || (article as any).image} 
                        alt={article.title} 
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                        loading="lazy"
                      />
                   ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-in-out">
                         <Star className="w-8 h-8 text-primary/20" />
                      </div>
                   )}
                </div>
                
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-accent tracking-widest uppercase bg-accent/10 px-3 py-1 rounded-full">
                    {(typeof article.category === 'object' ? article.category.name : article.category) || "Artikel"}
                  </span>
                  {article.published_at && (
                    <span className="text-xs font-medium text-muted-foreground">
                      {new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  )}
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
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground border border-dashed border-border/60 rounded-2xl bg-white/50">
            Belum ada artikel tersedia.
          </div>
        )}
      </section>
    </div>
  );
}
