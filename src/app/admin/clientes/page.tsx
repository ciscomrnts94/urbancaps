"use client";

import { useEffect, useMemo, useState } from "react";
import { Users, Mail, Phone, MapPin } from "lucide-react";
import { getAdminOrders } from "@/app/orders-actions";
import { formatCOP, formatDateCO } from "@/lib/format";

interface Customer {
  email: string; name: string; phone: string; city: string; department: string;
  orders: number; total: number; since: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminClientes() {
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => { getAdminOrders().then(setOrders).catch(() => setOrders([])); }, []);

  const customers = useMemo<Customer[]>(() => {
    if (!orders) return [];
    const map = new Map<string, Customer>();
    for (const o of orders) {
      const email = o.info.email || `${o.info.firstName}-${o.info.phone}`;
      const c = map.get(email);
      if (c) {
        c.orders += 1; c.total += o.total;
        if (o.createdAt < c.since) c.since = o.createdAt;
      } else {
        map.set(email, {
          email: o.info.email || "—", name: `${o.info.firstName} ${o.info.lastName}`.trim(),
          phone: o.info.phone || "—", city: o.info.city || "—", department: o.info.department || "",
          orders: 1, total: o.total, since: o.createdAt,
        });
      }
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [orders]);

  return (
    <div className="max-w-5xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Clientes</h1>
        <p className="text-sm text-muted">{orders ? customers.length : "…"} clientes</p>
      </div>

      {orders === null ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-lg" />)}</div>
      ) : customers.length === 0 ? (
        <div className="card p-10 text-center">
          <Users size={30} className="text-muted-soft mx-auto mb-3" />
          <p className="text-muted">Los clientes aparecerán aquí cuando hagan pedidos.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {customers.map((c) => (
            <div key={c.email} className="card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gold-tint grid place-items-center text-gold-strong font-600">{c.name.slice(0, 1).toUpperCase()}</div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{c.name}</p>
                  <p className="text-xs text-muted">Desde {formatDateCO(c.since)}</p>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-muted">
                <p className="flex items-center gap-2 truncate"><Mail size={13} /> {c.email}</p>
                <p className="flex items-center gap-2"><Phone size={13} /> {c.phone}</p>
                <p className="flex items-center gap-2"><MapPin size={13} /> {c.city}{c.department ? `, ${c.department}` : ""}</p>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-line text-sm">
                <span className="text-muted">{c.orders} pedido{c.orders !== 1 ? "s" : ""}</span>
                <span className="font-semibold">{formatCOP(c.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
