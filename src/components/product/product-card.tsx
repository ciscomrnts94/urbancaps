"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCOP, discountPercent } from "@/lib/format";
import { totalStock } from "@/lib/catalog";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";

export default function ProductCard({ product }: { product: Product }) {
  const hydrated = useHydrated();
  const favIds = useFavorites((s) => s.ids);
  const toggle = useFavorites((s) => s.toggle);
  const isFav = hydrated && favIds.includes(product.id);

  const stock = totalStock(product);
  const soldOut = stock <= 0;
  const low = !soldOut && stock <= (product.lowStockThreshold ?? 5);
  const off = discountPercent(product.price, product.compareAtPrice);
  const img = product.images[0]?.url;
  const img2 = product.images[1]?.url;
  const colors = product.colors.slice(0, 5);

  return (
    <div className="group">
      <div className="relative">
        <Link href={`/producto/${product.slug}`} className="block press">
          <div className="relative aspect-[3/4] rounded-[18px] overflow-hidden bg-bg-gray">
            {img && (
              <Image
                src={img}
                alt={product.name}
                fill
                sizes="(max-width:768px) 48vw, 25vw"
                className={`object-cover transition-all duration-500 ${img2 ? "group-hover:opacity-0" : ""} ${soldOut ? "grayscale-[0.4]" : ""}`}
              />
            )}
            {img2 && (
              <Image
                src={img2}
                alt={product.name}
                fill
                sizes="(max-width:768px) 48vw, 25vw"
                className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            )}

            {/* Badges superiores */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {product.isNew && !soldOut && (
                <span className="badge badge-new badge-float">Nuevo</span>
              )}
              {off > 0 && !soldOut && (
                <span className="badge badge-float" style={{ background: "linear-gradient(135deg, var(--gold), var(--gold-strong))", color: "#fff" }}>
                  −{off}%
                </span>
              )}
            </div>

            {/* Agotado */}
            {soldOut && (
              <div className="absolute inset-0 bg-white/45 grid place-items-center">
                <span className="badge badge-glass badge-float px-3 py-1.5 text-[11px]">Agotado</span>
              </div>
            )}
          </div>
        </Link>

        {/* Favorito flotante */}
        <button
          onClick={() => toggle(product.id)}
          aria-label="Favorito"
          className="icon-btn absolute top-2.5 right-2.5 w-8 h-8"
        >
          <Heart size={15} className={isFav ? "fill-gold text-gold" : "text-ink"} strokeWidth={2.2} />
        </button>
      </div>

      {/* Info */}
      <div className="pt-2.5 px-0.5">
        {product.subcategory && (
          <p className="text-[10px] uppercase tracking-[0.12em] text-gold-strong font-semibold mb-0.5">{product.subcategory}</p>
        )}
        <Link href={`/producto/${product.slug}`}>
          <h3 className="text-[13.5px] font-medium leading-snug line-clamp-1 hover:text-gold-strong transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Precio */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-[15px] font-700 tracking-tight">{formatCOP(product.price)}</span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-[11px] text-muted-soft line-through">{formatCOP(product.compareAtPrice)}</span>
          )}
        </div>

        {/* Colores + disponibilidad */}
        <div className="flex items-center justify-between mt-2 min-h-[16px]">
          {colors.length > 0 ? (
            <div className="flex items-center gap-1">
              {colors.map((c) => (
                <span key={c.name} className="swatch" style={{ background: c.hex }} title={c.name} />
              ))}
              {product.colors.length > colors.length && (
                <span className="text-[10px] text-muted-soft ml-0.5">+{product.colors.length - colors.length}</span>
              )}
            </div>
          ) : <span />}

          {soldOut ? (
            <span className="stock-pill text-muted"><span className="dot bg-muted-soft" /> Agotado</span>
          ) : low ? (
            <span className="stock-pill text-warning"><span className="dot" style={{ background: "var(--warning)" }} /> ¡Últimas {stock}!</span>
          ) : (
            <span className="stock-pill text-success"><span className="dot" style={{ background: "var(--success)" }} /> Disponible</span>
          )}
        </div>
      </div>
    </div>
  );
}
