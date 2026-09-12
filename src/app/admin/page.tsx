"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, DollarSign } from "lucide-react";
import type { Product } from "@/lib/types";
import { getAdminProducts } from "@/app/admin/actions";
import { getAdminOrders } from "@/app/orders-actions";
import { formatCOP, formatNumberCO } from "@/lib/format";
import { ventasSemana as demoSemana, ventasMes, topProductos as demoTop, topCategorias } from "@/lib/admin-analytics";
import { BarChart, LineChart, HBarList } from "@/components/admin/charts";

const total = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);
const isOut = (p: Product) => total(p) <= 0;
const isLow = (p: Product) => { const t = total(p); return t > 0 && t <= (p.lowStockThreshold ?? 5); };
const VALID = (s: string) => s !== "cancelado" && s !== "reembolsado";

function KPI({ icon: Icon, label, value, tone = "gold" }: { icon: React.ElementType; label: string; value: string; tone?: "gold" | "ink" | "danger" }) {
  const toneClass = tone === "danger" ? "text-danger bg-danger/10" : tone === "ink" ? "text-ink bg-bg-soft" : "text-gold-strong bg-gold-tint";
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg grid place-items-center ${toneClass}`}><Icon size={18} /></div>
      <p className="text-xs text-muted mt-3">{label}</p>
      <p className="text-xl font-700 mt-0.5">{value}</p>
    </div>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[] | null>(null);

  useEffect(() => {
    getAdminProducts().then(setProducts).catch(() => setProducts([]));
    getAdminOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const stats = useMemo(() => {
    const os = (orders ?? []).filter((o) => VALID(o.status));
    const now = new Date();
    const startDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let hoy = 0, mes = 0;
    const emails = new Set<string>();
    for (const o of os) {
      const d = new Date(o.createdAt);
      if (d >= startDay) hoy += o.total;
      if (d >= startMonth) mes += o.total;
      if (o.info?.email) emails.add(o.info.email);
    }
    // Serie semanal real (últimos 7 días)
    const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const semana = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(startDay); d.setDate(d.getDate() - (6 - i));
      const dayTotal = os.filter((o) => { const od = new Date(o.createdAt); return od.toDateString() === d.toDateString(); }).reduce((s, o) => s + o.total, 0);
      return { label: days[d.getDay()], value: dayTotal };
    });
    // Top productos reales
    const map = new Map<string, number>();
    for (const o of os) for (const l of o.lines) map.set(l.name, (map.get(l.name) ?? 0) + l.quantity);
    const top = [...map.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
    return { hoy, mes, pedidos: os.length, clientes: emails.size, semana, top, hasData: os.length > 0 };
  }, [orders]);

  const outOfStock = products.filter(isOut).length;
  const lowStock = products.filter(isLow);

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Dashboard</h1>
        <p className="text-sm text-muted">Resumen de tu tienda</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <KPI icon={DollarSign} label="Ventas hoy" value={formatCOP(stats.hoy)} />
        <KPI icon={TrendingUp} label="Ventas del mes" value={formatCOP(stats.mes)} />
        <KPI icon={ShoppingCart} label="Pedidos" value={formatNumberCO(stats.pedidos)} />
        <KPI icon={Users} label="Clientes" value={formatNumberCO(stats.clientes)} />
        <KPI icon={Package} label="Productos" value={formatNumberCO(products.length)} tone="ink" />
        <KPI icon={AlertTriangle} label="Agotados" value={formatNumberCO(outOfStock)} tone="danger" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-600">Ventas de la semana</h2>
            {!stats.hasData && <span className="badge badge-gold">Ejemplo</span>}
          </div>
          <BarChart data={stats.hasData ? stats.semana : demoSemana()} />
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-600">Tendencia mensual</h2>
            <span className="badge badge-gold">Ejemplo</span>
          </div>
          <LineChart data={ventasMes()} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Productos más vendidos</h2>
          <HBarList data={stats.hasData ? stats.top : demoTop(products)} />
        </div>
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-600">Categorías más vendidas</h2>
            <span className="badge badge-gold">Ejemplo</span>
          </div>
          <HBarList data={topCategorias()} unit="%" />
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="card p-5">
          <h2 className="font-display text-lg font-600 mb-3 flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" /> Stock bajo
          </h2>
          <div className="space-y-2">
            {lowStock.map((p) => (
              <Link key={p.id} href={`/admin/productos/${p.id}`} className="flex items-center justify-between text-sm py-2 border-b border-line last:border-0 hover:text-gold-strong">
                <span>{p.name}</span>
                <span className="text-warning font-medium">{total(p)} unidades</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
/* eslint-enable @typescript-eslint/no-explicit-any */
