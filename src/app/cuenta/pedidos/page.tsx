"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Package, Truck } from "lucide-react";
import { getMyOrders } from "@/app/orders-actions";
import { ORDER_STATUS_LABEL } from "@/lib/orders-store";
import { formatCOP, formatDateCO } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function MisPedidosPage() {
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => { getMyOrders().then(setOrders).catch(() => setOrders([])); }, []);

  return (
    <div className="container-x py-6 max-w-2xl">
      <Link href="/cuenta" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4"><ArrowLeft size={16} /> Mi cuenta</Link>
      <h1 className="font-display text-2xl md:text-3xl font-700 mb-6">Mis pedidos</h1>

      {orders === null ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <Package size={28} className="text-muted-soft mx-auto mb-3" />
          <p className="text-sm text-muted">Todavía no tienes pedidos.</p>
          <Link href="/categorias" className="btn-gold btn-pill inline-block px-5 py-2.5 text-sm mt-4">Empezar a comprar</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} className="card p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <p className="font-medium text-sm">Pedido #{o.id}</p>
                  <p className="text-xs text-muted">{formatDateCO(o.createdAt)} · {o.lines.length} productos</p>
                </div>
                <div className="text-right">
                  <span className="badge badge-gold">{ORDER_STATUS_LABEL[o.status as OrderStatus] ?? o.status}</span>
                  <p className="font-semibold text-sm mt-1">{formatCOP(o.total)}</p>
                </div>
              </div>
              {o.trackingNumber && (
                <p className="text-xs text-gold-strong mt-2 flex items-center gap-1"><Truck size={13} /> {o.trackingCarrier}: {o.trackingNumber}</p>
              )}
              <div className="flex gap-2 mt-3 pt-3 border-t border-line overflow-x-auto no-scrollbar">
                {o.lines.map((l: any) => (
                  <span key={l.key} className="text-xs text-muted whitespace-nowrap bg-bg-soft rounded-full px-2.5 py-1">{l.name} ×{l.quantity}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
