"use client";

import { useState } from "react";
import { Ticket, Trash2, Plus } from "lucide-react";
import { useCoupons, type AdminCoupon } from "@/lib/coupons-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP } from "@/lib/format";

export default function AdminCupones() {
  const hydrated = useHydrated();
  const coupons = useCoupons((s) => s.coupons);
  const add = useCoupons((s) => s.add);
  const remove = useCoupons((s) => s.remove);
  const toggle = useCoupons((s) => s.toggle);

  const [code, setCode] = useState("");
  const [type, setType] = useState<AdminCoupon["type"]>("percent");
  const [value, setValue] = useState(10);
  const [min, setMin] = useState(0);

  function create() {
    if (!code.trim()) return;
    add({
      id: `cup-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minSubtotal: min > 0 ? Number(min) : undefined,
      active: true,
    });
    setCode(""); setValue(10); setMin(0);
  }

  function describe(c: AdminCoupon) {
    if (c.type === "percent") return `${c.value}% de descuento`;
    if (c.type === "fixed") return `${formatCOP(c.value)} de descuento`;
    return "Envío gratis";
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Cupones y promociones</h1>
        <p className="text-sm text-muted">Crea códigos de descuento para tus clientes</p>
      </div>

      {/* Crear */}
      <div className="card p-5 mb-5">
        <h2 className="font-display text-lg font-600 mb-3">Nuevo cupón</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Código</label>
            <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BIENVENIDO10" className="w-full border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as AdminCoupon["type"])} className="w-full border border-line-strong rounded-lg px-3 h-11 text-sm bg-bg outline-none focus:border-gold">
              <option value="percent">Porcentaje %</option>
              <option value="fixed">Monto fijo $</option>
              <option value="free_shipping">Envío gratis</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Valor</label>
            <input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} disabled={type === "free_shipping"} className="w-full border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-ink-soft mb-1.5">Compra mínima</label>
            <input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} placeholder="Opcional" className="w-full border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold" />
          </div>
        </div>
        <button onClick={create} className="btn-gold px-5 py-2.5 text-sm mt-4 inline-flex items-center gap-2"><Plus size={16} /> Crear cupón</button>
      </div>

      {/* Listado */}
      {hydrated && (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-tint grid place-items-center text-gold-strong"><Ticket size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-sm tracking-wide">{c.code}</p>
                <p className="text-xs text-muted">{describe(c)}{c.minSubtotal ? ` · desde ${formatCOP(c.minSubtotal)}` : ""}</p>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={c.active} onChange={() => toggle(c.id)} className="accent-[var(--gold-strong)]" />
                {c.active ? "Activo" : "Inactivo"}
              </label>
              <button onClick={() => remove(c.id)} className="p-2 text-danger hover:bg-danger/10 rounded-lg"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
