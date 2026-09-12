"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, Truck, ShieldCheck, RotateCcw, MessageCircle, Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatCOP, discountPercent } from "@/lib/format";
import { findVariant, colorHasStock, sizeHasStock } from "@/lib/catalog";
import { useCart } from "@/lib/cart-store";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { whatsappLink, productWhatsappMessage } from "@/lib/whatsapp";

export default function ProductDetail({ product }: { product: Product }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const addLine = useCart((s) => s.addLine);
  const toggleFav = useFavorites((s) => s.toggle);
  const isFav = useFavorites((s) => s.ids.includes(product.id)) && hydrated;

  const hasColors = product.colors.length > 0;
  const hasSizes = product.sizes.length > 0;
  const singleSize = product.sizes.length === 1;

  const [color, setColor] = useState<string | undefined>(hasColors ? undefined : undefined);
  const [size, setSize] = useState<string | undefined>(singleSize ? product.sizes[0] : undefined);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const variant = useMemo(() => findVariant(product, color, size), [product, color, size]);
  const stock = variant?.stock ?? 0;
  const unitPrice = variant?.price ?? product.price;
  const off = discountPercent(product.price, product.compareAtPrice);

  const needsColor = hasColors && !color;
  const needsSize = hasSizes && !singleSize && !size;
  const canAdd = !needsColor && !needsSize && stock > 0;

  function handleAdd(buyNow = false) {
    if (!canAdd || !variant) return;
    addLine({
      productId: product.id,
      variantId: variant.id,
      slug: product.slug,
      name: product.name,
      image: product.images[0]?.url,
      color,
      colorHex: product.colors.find((c) => c.name === color)?.hex,
      size,
      unitPrice,
      quantity: qty,
      maxStock: stock,
    });
    if (buyNow) {
      router.push("/checkout");
    } else {
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  }

  const waMessage = productWhatsappMessage(product.name, { color, size: singleSize ? undefined : size });

  return (
    <div className="mt-5">
      {/* Categoría / subcategoría */}
      <p className="text-[11px] uppercase tracking-wider text-muted-soft mb-1">
        {product.subcategory ?? product.categorySlug}
      </p>
      <div className="flex items-start justify-between gap-3">
        <h1 className="font-display text-2xl md:text-3xl font-600 leading-tight">{product.name}</h1>
        <button
          onClick={() => toggleFav(product.id)}
          className="shrink-0 p-2.5 rounded-full border border-line hover:border-gold transition-colors"
          aria-label="Guardar en favoritos"
        >
          <Heart size={20} className={isFav ? "fill-gold text-gold" : "text-ink"} />
        </button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-2 mt-2 text-sm text-muted">
        <span className="text-gold">★★★★★</span>
        <span>{product.rating?.toFixed(1)} · {product.reviewCount} reseñas</span>
      </div>

      {/* Precio */}
      <div className="flex items-center gap-3 mt-4">
        <span className="text-3xl font-700">{formatCOP(unitPrice)}</span>
        {product.compareAtPrice && product.compareAtPrice > unitPrice && (
          <>
            <span className="text-lg text-muted-soft line-through">{formatCOP(product.compareAtPrice)}</span>
            <span className="badge badge-sale">-{off}%</span>
          </>
        )}
      </div>

      {/* Colores */}
      {hasColors && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">
              Color{color ? <span className="text-muted font-normal">: {color}</span> : ""}
            </p>
            {needsColor && <span className="text-xs text-gold-strong">Selecciona un color</span>}
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.colors.map((c) => {
              const disabled = !colorHasStock(product, c.name);
              const activeC = color === c.name;
              return (
                <button
                  key={c.name}
                  disabled={disabled}
                  onClick={() => { setColor(c.name); }}
                  title={c.name}
                  className="relative w-9 h-9 rounded-full grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <span
                    className="w-8 h-8 rounded-full border"
                    style={{ background: c.hex, borderColor: c.hex === "#f6f6f2" ? "#ddd" : c.hex }}
                  />
                  {activeC && (
                    <span className="absolute inset-0 rounded-full ring-2 ring-gold-strong ring-offset-2" />
                  )}
                  {disabled && <span className="absolute w-9 h-px bg-danger rotate-45" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tallas */}
      {hasSizes && !singleSize && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Talla{size ? <span className="text-muted font-normal">: {size}</span> : ""}</p>
            {needsSize && <span className="text-xs text-gold-strong">Selecciona una talla</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => {
              // Si hay color elegido, deshabilita tallas sin stock para ese color.
              const stk = color
                ? findVariant(product, color, s)?.stock ?? 0
                : sizeHasStock(product, s) ? 1 : 0;
              const disabled = stk <= 0;
              return (
                <button
                  key={s}
                  disabled={disabled}
                  data-active={size === s}
                  onClick={() => setSize(s)}
                  className="chip min-w-[46px] h-11 px-3 text-sm font-medium"
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Disponibilidad */}
      <div className="mt-5 text-sm">
        {needsColor || needsSize ? (
          <span className="text-muted">Selecciona las opciones para ver disponibilidad.</span>
        ) : stock > 0 ? (
          <span className="text-success inline-flex items-center gap-1">
            <Check size={15} /> Disponible
            {stock <= (product.lowStockThreshold ?? 5) && (
              <span className="text-warning ml-1">· ¡Últimas {stock} unidades!</span>
            )}
          </span>
        ) : (
          <span className="text-danger font-medium">AGOTADO en esta combinación</span>
        )}
      </div>

      {/* Cantidad + acciones */}
      <div className="mt-5 flex items-center gap-3">
        <div className="flex items-center border border-line-strong rounded-[var(--radius)]">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 hover:bg-bg-soft rounded-l-[var(--radius)]" aria-label="Menos">
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-medium">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
            disabled={qty >= stock}
            className="p-3 hover:bg-bg-soft rounded-r-[var(--radius)] disabled:opacity-30"
            aria-label="Más"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          onClick={() => handleAdd(false)}
          disabled={!canAdd}
          className="btn-gold flex-1 py-3.5 text-sm inline-flex items-center justify-center gap-2"
        >
          {added ? (<><Check size={17} /> Agregado</>) : "Agregar al carrito"}
        </button>
      </div>

      <button
        onClick={() => handleAdd(true)}
        disabled={!canAdd}
        className="btn-dark w-full py-3.5 text-sm mt-3 disabled:opacity-40"
      >
        Comprar ahora
      </button>

      <a
        href={whatsappLink(waMessage)}
        target="_blank"
        rel="noopener"
        className="mt-3 w-full py-3.5 text-sm font-semibold rounded-[var(--radius)] border border-[#25D366] text-[#128C4B] inline-flex items-center justify-center gap-2 hover:bg-[#25D366]/10 transition-colors"
      >
        <MessageCircle size={18} /> Comprar por WhatsApp
      </a>

      {/* Beneficios */}
      <div className="mt-6 grid gap-3">
        {[
          { icon: Truck, t: "Envío a toda Colombia", s: "Gratis desde $200.000" },
          { icon: ShieldCheck, t: "Pago 100% seguro", s: "Wompi · PSE · Nequi · Contra entrega" },
          { icon: RotateCcw, t: "Cambios y devoluciones", s: "Hasta 15 días" },
        ].map((b) => (
          <div key={b.t} className="flex items-center gap-3 text-sm">
            <div className="w-9 h-9 rounded-full bg-gold-tint grid place-items-center text-gold-strong">
              <b.icon size={17} />
            </div>
            <div>
              <p className="font-medium">{b.t}</p>
              <p className="text-muted text-xs">{b.s}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
