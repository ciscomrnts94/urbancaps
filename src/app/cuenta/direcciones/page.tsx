"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, MapPin, Star, Pencil, Trash2, Loader2, X } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { DEPARTMENTS, citiesFor } from "@/lib/colombia";
import type { Address } from "@/lib/auth/types";

const EMPTY = {
  label: "Casa", first_name: "", last_name: "", phone: "",
  address: "", address_complement: "", neighborhood: "", city: "", department: "", postal_code: "",
};

export default function DireccionesPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Address[] | null>(null);
  const [editing, setEditing] = useState<Partial<Address> | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const supabase = supabaseBrowser();
    const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
    setItems((data as Address[]) ?? []);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!user || !editing) return;
    if (!editing.address?.trim() || !editing.city || !editing.department) return;
    setSaving(true);
    const supabase = supabaseBrowser();
    const payload = {
      user_id: user.id, label: editing.label || "Casa",
      first_name: editing.first_name ?? null, last_name: editing.last_name ?? null, phone: editing.phone ?? null,
      address: editing.address, address_complement: editing.address_complement ?? null,
      neighborhood: editing.neighborhood ?? null, city: editing.city, department: editing.department,
      postal_code: editing.postal_code ?? null,
    };
    if (editing.id) await supabase.from("addresses").update(payload).eq("id", editing.id);
    else await supabase.from("addresses").insert(payload);
    setEditing(null);
    setSaving(false);
    await load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar esta dirección?")) return;
    setItems((it) => it?.filter((x) => x.id !== id) ?? null);
    await supabaseBrowser().from("addresses").delete().eq("id", id);
  }

  async function makeDefault(id: string) {
    if (!user) return;
    const supabase = supabaseBrowser();
    await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    await load();
  }

  const inputC = "w-full border border-line-strong rounded-xl px-3.5 h-12 text-sm outline-none focus:border-gold bg-bg";
  const labelC = "block text-xs font-medium text-ink-soft mb-1.5";
  const set = (k: keyof typeof EMPTY, v: string) => setEditing((e) => ({ ...e, [k]: v }));

  return (
    <div className="container-x py-6 max-w-2xl">
      <Link href="/cuenta" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4"><ArrowLeft size={16} /> Mi cuenta</Link>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Mis direcciones</h1>
        <button onClick={() => setEditing({ ...EMPTY })} className="btn-gold px-4 h-10 text-sm inline-flex items-center gap-2"><Plus size={16} /> <span className="hidden sm:inline">Nueva</span></button>
      </div>

      {items === null ? (
        <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <div className="card p-8 text-center">
          <MapPin size={28} className="text-muted-soft mx-auto mb-3" />
          <p className="text-sm text-muted">No tienes direcciones guardadas.</p>
          <button onClick={() => setEditing({ ...EMPTY })} className="btn-dark px-5 py-2.5 text-sm mt-4">Agregar dirección</button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="badge badge-gold">{a.label}</span>
                  {a.is_default && <span className="text-xs text-gold-strong inline-flex items-center gap-1"><Star size={12} className="fill-gold text-gold" /> Principal</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditing(a)} className="p-1.5 text-muted hover:text-ink"><Pencil size={15} /></button>
                  <button onClick={() => remove(a.id)} className="p-1.5 text-danger"><Trash2 size={15} /></button>
                </div>
              </div>
              <p className="text-sm font-medium mt-2">{[a.first_name, a.last_name].filter(Boolean).join(" ")}</p>
              <p className="text-sm text-muted">{a.address}{a.address_complement ? `, ${a.address_complement}` : ""}</p>
              <p className="text-sm text-muted">{a.neighborhood ? `${a.neighborhood}, ` : ""}{a.city}, {a.department}</p>
              {a.phone && <p className="text-sm text-muted">{a.phone}</p>}
              {!a.is_default && <button onClick={() => makeDefault(a.id)} className="text-xs text-gold-strong hover:underline mt-2 inline-flex items-center gap-1"><Star size={12} /> Usar como principal</button>}
            </div>
          ))}
        </div>
      )}

      {/* Modal editar/crear */}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setEditing(null)} />
          <div className="relative bg-bg w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto p-5 animate-fade-up pb-safe">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-600">{editing.id ? "Editar dirección" : "Nueva dirección"}</h2>
              <button onClick={() => setEditing(null)} className="p-2 text-muted"><X size={20} /></button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2"><label className={labelC}>Etiqueta</label>
                <select value={editing.label ?? "Casa"} onChange={(e) => set("label", e.target.value)} className={inputC}>
                  <option>Casa</option><option>Trabajo</option><option>Otra</option>
                </select>
              </div>
              <div><label className={labelC}>Nombre</label><input value={editing.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} className={inputC} /></div>
              <div><label className={labelC}>Apellido</label><input value={editing.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} className={inputC} /></div>
              <div className="sm:col-span-2"><label className={labelC}>Dirección *</label><input value={editing.address ?? ""} onChange={(e) => set("address", e.target.value)} className={inputC} placeholder="Calle 123 # 45-67" /></div>
              <div className="sm:col-span-2"><label className={labelC}>Complemento</label><input value={editing.address_complement ?? ""} onChange={(e) => set("address_complement", e.target.value)} className={inputC} placeholder="Apto, torre…" /></div>
              <div><label className={labelC}>Barrio</label><input value={editing.neighborhood ?? ""} onChange={(e) => set("neighborhood", e.target.value)} className={inputC} /></div>
              <div><label className={labelC}>Teléfono</label><input value={editing.phone ?? ""} onChange={(e) => set("phone", e.target.value)} className={inputC} /></div>
              <div><label className={labelC}>Departamento *</label>
                <select value={editing.department ?? ""} onChange={(e) => { set("department", e.target.value); set("city", ""); }} className={inputC}>
                  <option value="">Selecciona…</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div><label className={labelC}>Ciudad *</label>
                <select value={editing.city ?? ""} onChange={(e) => set("city", e.target.value)} disabled={!editing.department} className={`${inputC} disabled:opacity-50`}>
                  <option value="">{editing.department ? "Selecciona…" : "Elige depto."}</option>{citiesFor(editing.department ?? "").map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditing(null)} className="btn-outline flex-1 h-11 text-sm">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-gold flex-1 h-11 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
