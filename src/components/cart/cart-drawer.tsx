"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP } from "@/lib/format";
import { STORE } from "@/lib/store-config";

export default function CartDrawer() {
  const hydrated = useHydrated();
  const { lines, drawerOpen, closeDrawer, setQuantity, removeLine } = useCart();
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());

  const threshold = STORE.shipping.freeShippingThreshold;
  const remaining = Math.max(0, threshold - subtotal);
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div
      className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!drawerOpen}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${drawerOpen ? "opacity-100" : "opacity-0"}`}
        onClick={closeDrawer}
      />

      {/* Panel */}
      <aside
        className={`absolute right-0 top-0 h-full w-full sm:w-[420px] bg-bg shadow-lg flex flex-col transition-transform duration-300 ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-5 h-[var(--header-h)] border-b border-line">
          <h2 className="font-display text-lg font-600 flex items-center gap-2">
            <ShoppingBag size={18} className="text-gold-strong" /> Tu carrito
          </h2>
          <button onClick={closeDrawer} aria-label="Cerrar" className="p-2 hover:bg-bg-soft rounded-lg">
            <X size={20} />
          </button>
        </div>

        {!hydrated || lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-3">
            <div className="w-16 h-16 rounded-full bg-bg-soft grid place-items-center">
              <ShoppingBag size={26} className="text-muted-soft" />
            </div>
            <p className="font-medium">Tu carrito está vacío</p>
            <p className="text-sm text-muted">Agrega productos para verlos aquí.</p>
            <button onClick={closeDrawer} className="btn-dark px-5 py-2.5 text-sm mt-2">
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            {/* Barra de envío gratis */}
            <div className="px-5 py-3 bg-gold-tint/60 border-b border-line">
              {remaining > 0 ? (
                <p className="text-xs text-ink-soft">
                  Te faltan <b className="text-gold-strong">{formatCOP(remaining)}</b> para el envío gratis 🎉
                </p>
              ) : (
                <p className="text-xs text-success font-medium">¡Tienes envío gratis! 🎉</p>
              )}
              <div className="mt-2 h-1.5 rounded-full bg-white overflow-hidden">
                <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* Líneas */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {lines.map((l) => (
                <div key={l.key} className="flex gap-3">
                  <div className="relative w-20 h-24 rounded-lg overflow-hidden bg-bg-soft shrink-0">
                    {l.image && (
                      <Image src={l.image} alt={l.name} fill sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/producto/${l.slug}`}
                        onClick={closeDrawer}
                        className="text-sm font-medium leading-tight line-clamp-2 hover:text-gold-strong"
                      >
                        {l.name}
                      </Link>
                      <button onClick={() => removeLine(l.key)} className="text-muted hover:text-danger p-1 -mr-1" aria-label="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-xs text-muted mt-0.5">
                      {[l.color, l.size].filter(Boolean).join(" · ")}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-line-strong rounded-lg">
                        <button
                          onClick={() => setQuantity(l.key, l.quantity - 1)}
                          className="p-1.5 hover:bg-bg-soft rounded-l-lg"
                          aria-label="Menos"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{l.quantity}</span>
                        <button
                          onClick={() => setQuantity(l.key, l.quantity + 1)}
                          disabled={l.quantity >= l.maxStock}
                          className="p-1.5 hover:bg-bg-soft rounded-r-lg disabled:opacity-30"
                          aria-label="Más"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-semibold">{formatCOP(l.unitPrice * l.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className="border-t border-line px-5 py-4 space-y-3 pb-safe">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">{formatCOP(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Descuento</span>
                  <span>-{formatCOP(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-1">
                <span>Total</span>
                <span>{formatCOP(subtotal - discount)}</span>
              </div>
              <p className="text-[11px] text-muted text-center">Envío calculado en el checkout.</p>
              <Link
                href="/checkout"
                onClick={closeDrawer}
                className="btn-gold w-full py-3.5 grid place-items-center text-sm"
              >
                CONTINUAR CON LA COMPRA
              </Link>
              <Link
                href="/carrito"
                onClick={closeDrawer}
                className="block text-center text-xs text-muted hover:text-ink underline"
              >
                Ver carrito completo
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
