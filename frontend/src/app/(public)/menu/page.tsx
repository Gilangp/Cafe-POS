"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicService, type PublicMenu } from "@/shared/services/public.service";

const formatRupiah = (val: number | string) => `Rp ${Number(val).toLocaleString("id-ID")}`;

export default function MenuPage() {
  const { data: menus, isLoading } = useQuery<PublicMenu[]>({
    queryKey: ["publicMenus"],
    queryFn: () => publicService.getMenus(),
  });

  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  const allMenus = menus ?? [];
  const categories = Array.from(new Set(allMenus.map((m) => m.category?.name).filter(Boolean) as string[]));
  const activeCategory = selectedCat ?? categories[0] ?? "";
  
  const filteredMenus = allMenus.filter((m) => m.category?.name === activeCategory);

  return (
    <div className="min-h-screen bg-background text-foreground">


      {/* Hero */}
      <section className="bg-primary py-16">
        <div className="container-page text-center">
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-accent mb-4">Menu Kami</h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto">
            Setiap minuman dibuat dengan biji kopi pilihan dan teknik seduh artisan.
          </p>
        </div>
      </section>

      {/* Filter & Menu Grid */}
      <section className="container-page py-12">
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-accent text-primary"
                  : "border border-border text-foreground/70 hover:bg-muted/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-card p-6 shadow-md animate-pulse">
                <div className="aspect-[4/3] rounded-xl bg-muted mb-4" />
                <div className="h-4 bg-muted rounded w-1/4 mb-3" />
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                <div className="h-6 bg-muted rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : filteredMenus.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredMenus.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] rounded-xl bg-muted mb-4 flex items-center justify-center overflow-hidden">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-heading text-4xl text-accent/30">{item.name.charAt(0)}</span>
                  )}
                </div>
                {item.category && (
                  <span className="inline-block rounded-full bg-accent/10 text-accent text-xs font-semibold px-3 py-1 mb-3">
                    {item.category.name}
                  </span>
                )}
                <h3 className="font-heading text-lg font-semibold mb-2">{item.name}</h3>
                {item.description && <p className="text-sm text-muted-foreground mb-4">{item.description}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-accent font-bold text-lg">{formatRupiah(item.price)}</p>
                  {item.is_best_seller && (
                    <span className="rounded-full bg-accent text-primary text-xs font-bold px-3 py-1">Best Seller</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-12">Belum ada menu tersedia.</p>
        )}
      </section>


    </div>
  );
}
