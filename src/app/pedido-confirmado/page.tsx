"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package } from "lucide-react";
import { useOrders } from "@/lib/orders-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP } from "@/lib/format";

function Confirmation() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  return (
    <div className="container-x py-12 max-w-lg mx-auto text-center">
      <div className="w-20 h-20 rounded-full bg-gold-tint grid place-items-center mx-auto mb-5">
        <CheckCircle2 size={40} className="text-gold-strong" />
      </div>
      <h1 className="font-display text-3xl font-700">¡Pedido confirmado!</h1>
      <p className="text-muted mt-2">Gracias por tu compra. Te contactaremos para coordinar la entrega.</p>

      {id && (
        <div className="card p-5 mt-6 text-left">
          <div className="flex items-center gap-2 text-sm">
            <Package size={16} className="text-gold-strong" />
            <span className="text-muted">Número de pedido:</span>
            <span className="font-semibold">#{id}</span>
          </div>
          {hydrated && order && (
            <div className="mt-4 pt-4 border-t border-line space-y-1.5 text-sm">
              {order.lines.map((l) => (
                <div key={l.key} className="flex justify-between">
                  <span className="text-muted">{l.name} ×{l.quantity}</span>
                  <span>{formatCOP(l.unitPrice * l.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between font-700 pt-2 border-t border-line mt-2">
                <span>Total</span><span>{formatCOP(order.total)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-7 justify-center">
        <Link href="/cuenta" className="btn-dark px-6 py-3 text-sm">Ver mis pedidos</Link>
        <Link href="/categorias" className="btn-outline px-6 py-3 text-sm">Seguir comprando</Link>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense fallback={<div className="container-x py-12 text-center text-muted">Cargando…</div>}>
      <Confirmation />
    </Suspense>
  );
}
