"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { fetchProductsByIds } from "@/app/catalog-actions";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";
import ProductGrid from "@/components/product/product-grid";

export default function FavoritosPage() {
  const hydrated = useHydrated();
  const ids = useFavorites((s) => s.ids);
  const [favs, setFavs] = useState<Product[] | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (ids.length === 0) { setFavs([]); return; }
    fetchProductsByIds(ids).then(setFavs).catch(() => setFavs([]));
  }, [hydrated, ids]);

  return (
    <div className="container-x py-6 min-h-[60vh]">
      <header className="mb-6">
        <p className="eyebrow mb-1">Tu lista</p>
        <h1 className="font-display text-3xl md:text-4xl font-700">Mis favoritos</h1>
      </header>

      {favs === null ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-[3/4] skeleton rounded-[18px]" />)}
        </div>
      ) : favs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-bg-soft grid place-items-center">
            <Heart size={26} className="text-muted-soft" />
          </div>
          <p className="font-medium">No tienes favoritos todavía</p>
          <p className="text-sm text-muted max-w-xs">Descubre productos y guarda los que te gusten tocando el corazón.</p>
          <Link href="/categorias" className="btn-dark btn-pill px-6 py-3 text-sm mt-2">Explorar</Link>
        </div>
      ) : (
        <ProductGrid products={favs} />
      )}
    </div>
  );
}
