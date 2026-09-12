"use client";

import { useEffect, useState } from "react";
import { Ticket, Trash2, Plus, Loader2 } from "lucide-react";
import { getCoupons, saveCoupon, deleteCoupon, toggleCoupon, type AdminCoupon } from "@/app/coupons-actions";
import { formatCOP } from "@/lib/format";

export default function AdminCupones() {
  const [coupons, setCoupons] = useState<AdminCoupon[] | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState<AdminCoupon["type"]>("percent");
  const [value, setValue] = useState(10);
  const [min, setMin] = useState(0);
  const [starts, setStarts] = useState("");
  const [ends, setEnds] = useState("");
  const [maxUses, setMaxUses] = useState(0);
  const [busy, setBusy] = useState(false);

  async function load() { try { setCoupons(await getCoupons()); } catch { setCoupons([]); } }
  useEffect(() => { load(); }, []);

  async function create() {
    if (!code.trim()) return;
    setBusy(true);
    await saveCoupon({
      code, type, value: Number(value),
      min_subtotal: min > 0 ? Number(min) : null,
      starts_at: starts || null, ends_at: ends || null,
      max_uses: maxUses > 0 ? Number(maxUses) : null, active: true,
    });
    setCode(""); setValue(10); setMin(0); setStarts(""); setEnds(""); setMaxUses(0);
    await load();
    setBusy(false);
  }

  function describe(c: AdminCoupon) {
    if (c.type === "percent") return `${c.value}% de descuento`;
    if (c.type === "fixed") return `${formatCOP(c.value)} de descuento`;
    return "Envío gratis";
  }

  const inputC = "w-full border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold bg-bg";
  const labelC = "block text-xs font-medium text-ink-soft mb-1.5";

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Cupones y promociones</h1>
        <p className="text-sm text-muted">Crea códigos de descuento para tus clientes</p>
      </div>

      <div className="card p-5 mb-5">
        <h2 className="font-display text-lg font-600 mb-3">Nuevo cupón</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div><label className={labelC}>Código</label><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="BIENVENIDO10" className={inputC} /></div>
          <div><label className={labelC}>Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as AdminCoupon["type"])} className={inputC}>
              <option value="percent">Porcentaje %</option><option value="fixed">Monto fijo $</option><option value="free_shipping">Envío gratis</option>
            </select>
          </div>
          <div><label className={labelC}>Valor</label><input type="number" value={value} onChange={(e) => setValue(Number(e.target.value))} disabled={type === "free_shipping"} className={`${inputC} disabled:opacity-50`} /></div>
          <div><label className={labelC}>Compra mínima</label><input type="number" value={min} onChange={(e) => setMin(Number(e.target.value))} placeholder="Opcional" className={inputC} /></div>
          <div><label className={labelC}>Inicia (opcional)</label><input type="date" value={starts} onChange={(e) => setStarts(e.target.value)} className={inputC} /></div>
          <div><label className={labelC}>Termina (opcional)</label><input type="date" value={ends} onChange={(e) => setEnds(e.target.value)} className={inputC} /></div>
          <div><label className={labelC}>Usos máx. (opcional)</label><input type="number" value={maxUses} onChange={(e) => setMaxUses(Number(e.target.value))} placeholder="Ilimitado" className={inputC} /></div>
        </div>
        <button onClick={create} disabled={busy} className="btn-gold px-5 py-2.5 text-sm mt-4 inline-flex items-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Crear cupón
        </button>
      </div>

      {coupons === null ? (
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}</div>
      ) : (
        <div className="space-y-2">
          {coupons.map((c) => (
            <div key={c.id} className="card p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gold-tint grid place-items-center text-gold-strong"><Ticket size={18} /></div>
              <div className="flex-1 min-w-0">
                <p className="font-mono font-semibold text-sm tracking-wide">{c.code}</p>
                <p className="text-xs text-muted">
                  {describe(c)}{c.min_subtotal ? ` · desde ${formatCOP(c.min_subtotal)}` : ""}
                  {c.ends_at ? ` · hasta ${new Date(c.ends_at).toLocaleDateString("es-CO")}` : ""}
                  {c.max_uses ? ` · máx ${c.max_uses}` : ""}
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={c.active} onChange={async () => { await toggleCoupon(c.id, !c.active); load(); }} className="accent-[var(--gold-strong)]" />
                {c.active ? "Activo" : "Inactivo"}
              </label>
              <button onClick={async () => { setCoupons((cs) => cs?.filter((x) => x.id !== c.id) ?? null); await deleteCoupon(c.id); }} className="p-2 text-danger hover:bg-danger/10 rounded-lg"><Trash2 size={15} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
