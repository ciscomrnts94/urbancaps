"use client";

import { useState } from "react";
import { Package, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { useOrders, ORDER_STATUSES, ORDER_STATUS_LABEL } from "@/lib/orders-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP, formatDateCO } from "@/lib/format";
import { buildDemoOrders } from "@/lib/demo-orders";
import type { OrderStatus } from "@/lib/types";

const STATUS_TONE: Record<string, string> = {
  pendiente: "#fff4e0|#9a6b00",
  pago_pendiente: "#fff4e0|#9a6b00",
  pagado: "#e8f5ee|#2e7d5b",
  preparando: "#eef2ff|#3949ab",
  listo_envio: "#eef2ff|#3949ab",
  enviado: "#e7f3fb|#0369a1",
  entregado: "#e8f5ee|#2e7d5b",
  cancelado: "#fdeaea|#c0392b",
  reembolsado: "#f0f0f0|#6b6b73",
};

function StatusPill({ status }: { status: OrderStatus }) {
  const [bg, fg] = (STATUS_TONE[status] ?? "#f0f0f0|#6b6b73").split("|");
  return <span className="badge" style={{ background: bg, color: fg }}>{ORDER_STATUS_LABEL[status]}</span>;
}

export default function AdminPedidos() {
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const addOrder = useOrders((s) => s.addOrder);
  const setStatus = useOrders((s) => s.setStatus);
  const [open, setOpen] = useState<string | null>(null);

  function seed() {
    buildDemoOrders().forEach(addOrder);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-700">Pedidos</h1>
          <p className="text-sm text-muted">{hydrated ? orders.length : 0} pedidos</p>
        </div>
        {hydrated && orders.length === 0 && (
          <button onClick={seed} className="btn-outline px-4 py-2.5 text-sm inline-flex items-center gap-2">
            <Sparkles size={16} /> Generar ejemplos
          </button>
        )}
      </div>

      {!hydrated ? null : orders.length === 0 ? (
        <div className="card p-10 text-center">
          <Package size={30} className="text-muted-soft mx-auto mb-3" />
          <p className="text-muted">Aún no hay pedidos. Cuando un cliente compre, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const expanded = open === o.id;
            return (
              <div key={o.id} className="card overflow-hidden">
                <button onClick={() => setOpen(expanded ? null : o.id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-bg-soft/50">
                  {expanded ? <ChevronDown size={18} className="text-muted" /> : <ChevronRight size={18} className="text-muted" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">#{o.id}</p>
                    <p className="text-xs text-muted">{o.info.firstName} {o.info.lastName} · {formatDateCO(o.createdAt)}</p>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="font-semibold text-sm">{formatCOP(o.total)}</p>
                    <p className="text-xs text-muted">{o.lines.length} productos</p>
                  </div>
                  <StatusPill status={o.status} />
                </button>

                {expanded && (
                  <div className="border-t border-line p-4 grid md:grid-cols-2 gap-5">
                    <div>
                      <p className="eyebrow mb-2">Productos</p>
                      <div className="space-y-2">
                        {o.lines.map((l) => (
                          <div key={l.key} className="flex justify-between text-sm">
                            <span>{l.name} <span className="text-muted">({[l.color, l.size].filter(Boolean).join("/")}) ×{l.quantity}</span></span>
                            <span>{formatCOP(l.unitPrice * l.quantity)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-line text-sm space-y-1">
                        <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatCOP(o.subtotal)}</span></div>
                        {o.discount > 0 && <div className="flex justify-between text-success"><span>Descuento</span><span>-{formatCOP(o.discount)}</span></div>}
                        <div className="flex justify-between text-muted"><span>Envío</span><span>{o.shipping === 0 ? "GRATIS" : formatCOP(o.shipping)}</span></div>
                        <div className="flex justify-between font-700"><span>Total</span><span>{formatCOP(o.total)}</span></div>
                      </div>
                    </div>
                    <div>
                      <p className="eyebrow mb-2">Cliente y envío</p>
                      <div className="text-sm text-ink-soft space-y-1">
                        <p>{o.info.firstName} {o.info.lastName}</p>
                        <p className="text-muted">{o.info.phone} · {o.info.email}</p>
                        <p className="text-muted">{o.info.address}</p>
                        <p className="text-muted">{o.info.neighborhood ? `${o.info.neighborhood}, ` : ""}{o.info.city}, {o.info.department}</p>
                        <p className="text-muted">{o.paymentLabel} · {o.shippingLabel}</p>
                      </div>
                      <div className="mt-4">
                        <label className="eyebrow block mb-1.5">Cambiar estado</label>
                        <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                          className="w-full border border-line-strong rounded-lg px-3 h-10 text-sm bg-bg outline-none focus:border-gold">
                          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
