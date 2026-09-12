"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCOP, discountPercent } from "@/lib/format";
import { isSoldOut } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";

export default function ProductCard({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const favIds = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const isFav = hydrated && favIds.includes(product.id);

  const soldOut = isSoldOut(product);
  const off = discountPercent(product.price, product.compareAtPrice);
  const img = product.images[0]?.url;
  const img2 = product.images[1]?.url;

  return (
    <div className="group relative">
      <Link href={`/producto/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden bg-bg-soft">
          {img && (
            <Image
              src={img}
              alt={product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            />
          )}
          {img2 && (
            <Image
              src={img2}
              alt={product.name}
              fill
              sizes="(max-width:768px) 50vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {product.isNew && !soldOut && <span className="badge badge-new">Nuevo</span>}
            {off > 0 && !soldOut && <span className="badge badge-sale">-{off}%</span>}
          </div>

          {soldOut && (
            <div className="absolute inset-0 bg-white/60 grid place-items-center">
              <span className="badge badge-soldout text-xs px-3 py-1.5">Agotado</span>
            </div>
          )}
        </div>
      </Link>

      {/* Favorito */}
      <button
        onClick={() => toggle(product.id)}
        aria-label="Favorito"
        className="absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur shadow-sm hover:scale-110 transition-transform"
      >
        <Heart
          size={16}
          className={isFav ? "fill-gold text-gold" : "text-ink"}
          strokeWidth={2}
        />
      </button>

      {/* Info */}
      <div className="pt-2.5">
        <p className="text-[11px] uppercase tracking-wide text-muted-soft">{product.subcategory ?? ""}</p>
        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-sm font-medium leading-tight line-clamp-2 hover:text-gold-strong transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm font-semibold">{formatCOP(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-muted-soft line-through">{formatCOP(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
