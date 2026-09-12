"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { TrendingUp, ShoppingCart, Users, Package, AlertTriangle, DollarSign } from "lucide-react";
import type { Product } from "@/lib/types";
import { getAdminProducts } from "@/app/admin/actions";
import { useOrders } from "@/lib/orders-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP, formatNumberCO } from "@/lib/format";
import { ventasSemana, ventasMes, topProductos, topCategorias, resumen } from "@/lib/admin-analytics";
import { BarChart, LineChart, HBarList } from "@/components/admin/charts";

const total = (p: Product) => p.variants.reduce((s, v) => s + v.stock, 0);
const isOut = (p: Product) => total(p) <= 0;
const isLow = (p: Product) => { const t = total(p); return t > 0 && t <= (p.lowStockThreshold ?? 5); };

function KPI({ icon: Icon, label, value, tone = "gold" }: { icon: React.ElementType; label: string; value: string; tone?: "gold" | "ink" | "danger" }) {
  const toneClass = tone === "danger" ? "text-danger bg-danger/10" : tone === "ink" ? "text-ink bg-bg-soft" : "text-gold-strong bg-gold-tint";
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg grid place-items-center ${toneClass}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-muted mt-3">{label}</p>
      <p className="text-xl font-700 mt-0.5">{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const hydrated = useHydrated();
  const [products, setProducts] = useState<Product[]>([]);
  const orders = useOrders((s) => s.orders);

  useEffect(() => { getAdminProducts().then(setProducts).catch(() => setProducts([])); }, []);

  const r = resumen();
  const productCount = products.length;
  const outOfStock = products.filter(isOut).length;
  const lowStock = products.filter(isLow);
  const realOrders = hydrated ? orders.length : 0;

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Dashboard</h1>
        <p className="text-sm text-muted">Resumen de tu tienda</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
        <KPI icon={DollarSign} label="Ventas hoy" value={formatCOP(r.ventasHoy)} />
        <KPI icon={TrendingUp} label="Ventas del mes" value={formatCOP(r.ventasMes)} />
        <KPI icon={ShoppingCart} label="Pedidos" value={formatNumberCO(r.pedidos + realOrders)} />
        <KPI icon={Users} label="Clientes" value={formatNumberCO(r.clientes)} />
        <KPI icon={Package} label="Productos" value={formatNumberCO(productCount)} tone="ink" />
        <KPI icon={AlertTriangle} label="Agotados" value={formatNumberCO(outOfStock)} tone="danger" />
      </div>

      {/* Gráficos */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-600">Ventas de la semana</h2>
            <span className="badge badge-gold">Ejemplo</span>
          </div>
          <BarChart data={ventasSemana()} />
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
          {hydrated && <HBarList data={topProductos(products)} />}
        </div>
        <div className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Categorías más vendidas</h2>
          <HBarList data={topCategorias()} unit="%" />
        </div>
      </div>

      {/* Alertas de stock bajo */}
      {hydrated && lowStock.length > 0 && (
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
