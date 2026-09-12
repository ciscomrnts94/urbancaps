"use client";

import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { useSettings, type StoreSettings } from "@/lib/settings-store";
import { useHydrated } from "@/components/cart/cart-provider";

export default function AdminPersonalizar() {
  const hydrated = useHydrated();
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const [form, setForm] = useState<StoreSettings>(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setForm(settings); }, [settings]);

  const set = (k: keyof StoreSettings, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  function save() {
    update(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const inputC = "w-full border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold bg-bg";
  const labelC = "block text-xs font-medium text-ink-soft mb-1.5";

  if (!hydrated) return <p className="text-muted">Cargando…</p>;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-700">Personalizar tienda</h1>
          <p className="text-sm text-muted">Ajusta la información de tu negocio</p>
        </div>
        <button onClick={save} className="btn-gold px-5 py-2.5 text-sm inline-flex items-center gap-2">
          {saved ? <><Check size={16} /> Guardado</> : <><Save size={16} /> Guardar</>}
        </button>
      </div>

      <div className="space-y-4">
        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Identidad</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelC}>Nombre de la tienda</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputC} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelC}>Eslogan</label>
              <input value={form.tagline} onChange={(e) => set("tagline", e.target.value)} className={inputC} />
            </div>
            <div>
              <label className={labelC}>URL del logo</label>
              <input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} className={inputC} placeholder="https://…" />
            </div>
            <div>
              <label className={labelC}>URL del banner</label>
              <input value={form.bannerUrl} onChange={(e) => set("bannerUrl", e.target.value)} className={inputC} placeholder="https://…" />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Contacto</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelC}>WhatsApp (con código país, sin +)</label>
              <input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} className={inputC} placeholder="573001234567" />
            </div>
            <div>
              <label className={labelC}>Teléfono</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputC} />
            </div>
            <div>
              <label className={labelC}>Correo</label>
              <input value={form.email} onChange={(e) => set("email", e.target.value)} className={inputC} />
            </div>
            <div>
              <label className={labelC}>Ciudad</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputC} />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Redes sociales</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelC}>Instagram</label>
              <input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={inputC} />
            </div>
            <div>
              <label className={labelC}>Facebook</label>
              <input value={form.facebook} onChange={(e) => set("facebook", e.target.value)} className={inputC} />
            </div>
            <div>
              <label className={labelC}>TikTok</label>
              <input value={form.tiktok} onChange={(e) => set("tiktok", e.target.value)} className={inputC} />
            </div>
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Envío</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelC}>Envío gratis desde (COP)</label>
              <input type="number" value={form.freeShippingThreshold} onChange={(e) => set("freeShippingThreshold", Number(e.target.value))} className={inputC} />
            </div>
            <div>
              <label className={labelC}>Tarifa base de envío (COP)</label>
              <input type="number" value={form.flatRate} onChange={(e) => set("flatRate", Number(e.target.value))} className={inputC} />
            </div>
          </div>
        </section>

        <p className="text-xs text-muted-soft pb-6">
          Los cambios se guardan en este dispositivo. Al conectar Supabase, se guardarán en la base de datos y se reflejarán en la tienda para todos los visitantes.
        </p>
      </div>
    </div>
  );
}
