"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus, Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP } from "@/lib/format";
import { findCoupon } from "@/lib/pricing";
import { STORE } from "@/lib/store-config";

export default function CarritoPage() {
  const hydrated = useHydrated();
  const { lines, setQuantity, removeLine, coupon, applyCoupon } = useCart();
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  function tryCoupon(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const found = findCoupon(code);
    if (!found) { setErr("Cupón no válido."); return; }
    if (found.minSubtotal && subtotal < found.minSubtotal) {
      setErr(`Válido en compras desde ${formatCOP(found.minSubtotal)}.`);
      return;
    }
    applyCoupon(found);
    setCode("");
  }

  const total = subtotal - discount;

  if (hydrated && lines.length === 0) {
    return (
      <div className="container-x py-6 min-h-[60vh] flex flex-col items-center justify-center text-center gap-3">
        <div className="w-16 h-16 rounded-full bg-bg-soft grid place-items-center">
          <ShoppingBag size={26} className="text-muted-soft" />
        </div>
        <h1 className="font-display text-2xl font-600">Tu carrito está vacío</h1>
        <p className="text-sm text-muted">Descubre nuestros productos y agrega tus favoritos.</p>
        <Link href="/categorias" className="btn-gold px-6 py-3 text-sm mt-2">Ir a la tienda</Link>
      </div>
    );
  }

  return (
    <div className="container-x py-6">
      <h1 className="font-display text-3xl font-700 mb-6">Carrito de compras</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Líneas */}
        <div className="divide-y divide-line">
          {hydrated && lines.map((l) => (
            <div key={l.key} className="flex gap-4 py-5">
              <Link href={`/producto/${l.slug}`} className="relative w-24 h-28 rounded-lg overflow-hidden bg-bg-soft shrink-0">
                {l.image && <Image src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <Link href={`/producto/${l.slug}`} className="font-medium hover:text-gold-strong">{l.name}</Link>
                  <button onClick={() => removeLine(l.key)} className="text-muted hover:text-danger p-1" aria-label="Eliminar">
                    <Trash2 size={17} />
                  </button>
                </div>
                <p className="text-sm text-muted mt-1">{[l.color, l.size].filter(Boolean).join(" · ")}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-line-strong rounded-lg">
                    <button onClick={() => setQuantity(l.key, l.quantity - 1)} className="p-2 hover:bg-bg-soft" aria-label="Menos"><Minus size={15} /></button>
                    <span className="w-9 text-center text-sm font-medium">{l.quantity}</span>
                    <button onClick={() => setQuantity(l.key, l.quantity + 1)} disabled={l.quantity >= l.maxStock} className="p-2 hover:bg-bg-soft disabled:opacity-30" aria-label="Más"><Plus size={15} /></button>
                  </div>
                  <span className="font-semibold">{formatCOP(l.unitPrice * l.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card p-5">
            <h2 className="font-display text-lg font-600 mb-4">Resumen</h2>

            {/* Cupón */}
            {coupon ? (
              <div className="flex items-center justify-between bg-gold-tint rounded-lg px-3 py-2 mb-4 text-sm">
                <span className="inline-flex items-center gap-1.5 text-gold-strong font-medium">
                  <Tag size={14} /> {coupon.code}
                </span>
                <button onClick={() => applyCoupon(null)} className="text-muted hover:text-danger"><X size={15} /></button>
              </div>
            ) : (
              <form onSubmit={tryCoupon} className="flex gap-2 mb-4">
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Código de descuento"
                  className="flex-1 border border-line-strong rounded-lg px-3 h-10 text-sm outline-none focus:border-gold uppercase"
                />
                <button className="btn-dark px-4 text-sm">Aplicar</button>
              </form>
            )}
            {err && <p className="text-xs text-danger -mt-2 mb-3">{err}</p>}

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCOP(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-success"><span>Descuento</span><span>-{formatCOP(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Envío</span><span className="text-muted">Calculado en checkout</span></div>
              <div className="flex justify-between text-lg font-700 pt-3 border-t border-line mt-3">
                <span>Total</span><span>{formatCOP(total)}</span>
              </div>
            </div>

            <Link href="/checkout" className="btn-gold w-full py-3.5 text-sm grid place-items-center mt-5">
              CONTINUAR CON LA COMPRA
            </Link>
            <Link href="/categorias" className="block text-center text-sm text-muted hover:text-ink mt-3">
              Seguir comprando
            </Link>
            <p className="text-[11px] text-muted-soft text-center mt-3">
              Precios en {STORE.currency}. Compra 100% segura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
