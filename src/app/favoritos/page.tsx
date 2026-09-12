"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { PRODUCTS } from "@/lib/mock-data";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";
import ProductGrid from "@/components/product/product-grid";

export default function FavoritosPage() {
  const hydrated = useHydrated();
  const ids = useFavorites((s) => s.ids);
  const favs = hydrated ? PRODUCTS.filter((p) => ids.includes(p.id)) : [];

  return (
    <div className="container-x py-6 min-h-[60vh]">
      <header className="mb-6">
        <p className="eyebrow mb-1">Tu lista</p>
        <h1 className="font-display text-3xl md:text-4xl font-700">Mis favoritos</h1>
      </header>

      {!hydrated ? null : favs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-bg-soft grid place-items-center">
            <Heart size={26} className="text-muted-soft" />
          </div>
          <p className="font-medium">Aún no tienes favoritos</p>
          <p className="text-sm text-muted max-w-xs">Toca el corazón en cualquier producto para guardarlo aquí.</p>
          <Link href="/categorias" className="btn-dark px-6 py-3 text-sm mt-2">Explorar productos</Link>
        </div>
      ) : (
        <ProductGrid products={favs} />
      )}
    </div>
  );
}
