"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicArticle } from "@/shared/services/public.service";

export default function ArticlePage() {
  const { data: articles, isLoading } = useQuery<PublicArticle[]>({
    queryKey: ["publicArticles"],
    queryFn: publicService.getArticles,
  });

  const items = articles ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">


      <section className="bg-primary py-16">
        <div className="container-page text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-accent mb-4">Cerita Kopi</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Artikel, tips, dan cerita di balik setiap cangkir.
          </p>
        </div>
      </section>

      <section className="container-page py-12">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-md animate-pulse">
                <div className="aspect-[16/9] bg-muted" />
                <div className="p-6">
                  <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                  <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                  <div className="h-4 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {items.map((article) => (
              <article key={article.id} className="rounded-2xl border border-border bg-card overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-[16/9] flex items-center justify-center overflow-hidden">
                  {article.thumbnail_url ? (
                    <img src={article.thumbnail_url} alt={article.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                      <span className="font-heading text-4xl text-accent/40">{article.title.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    {article.category && (
                      <span className="rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1">
                        {typeof article.category === "string" ? article.category : article.category.name}
                      </span>
                    )}
                    {article.published_at && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(article.published_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  <h2 className="font-heading text-xl font-semibold mb-3">{article.title}</h2>
                  {article.excerpt && <p className="text-sm text-muted-foreground mb-4">{article.excerpt}</p>}
                  <span className="text-sm font-medium text-accent">Baca selengkapnya &rarr;</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">Belum ada artikel tersedia.</p>
        )}
      </section>


    </div>
  );
}
