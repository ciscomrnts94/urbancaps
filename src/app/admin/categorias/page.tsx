"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Plus, Trash2, Tags } from "lucide-react";
import type { Category, Product } from "@/lib/types";
import { getAdminCategories, getAdminProducts, saveCategory, deleteCategoryAction } from "@/app/admin/actions";

const kebab = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export default function AdminCategorias() {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState("");
  const [subs, setSubs] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    const [c, p] = await Promise.all([getAdminCategories(), getAdminProducts()]);
    setCategories(c); setProducts(p);
  }
  useEffect(() => { load().catch(() => setCategories([])); }, []);

  async function add() {
    if (!name.trim()) return;
    setBusy(true);
    await saveCategory({
      name: name.trim(),
      slug: kebab(name),
      image: `https://picsum.photos/seed/${kebab(name)}/600/450`,
      subcategories: subs.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setName(""); setSubs("");
    await load();
    setBusy(false);
  }

  async function remove(c: Category) {
    if (!confirm(`¿Eliminar categoría "${c.name}"?`)) return;
    setCategories((cs) => cs?.filter((x) => x.id !== c.id) ?? null);
    await deleteCategoryAction(c.id);
  }

  const count = (slug: string) => products.filter((p) => p.categorySlug === slug).length;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">Categorías</h1>
        <p className="text-sm text-muted">Organiza tu catálogo</p>
      </div>

      <div className="card p-5 mb-5">
        <h2 className="font-display text-lg font-600 mb-3">Nueva categoría</h2>
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre (ej. Bolsos)" className="border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold" />
          <input value={subs} onChange={(e) => setSubs(e.target.value)} placeholder="Subcategorías (separadas por coma)" className="border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold" />
          <button onClick={add} disabled={busy} className="btn-gold px-4 h-11 text-sm inline-flex items-center gap-2 disabled:opacity-60"><Plus size={16} /> {busy ? "Añadiendo…" : "Añadir"}</button>
        </div>
      </div>

      {categories === null ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-lg" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <div className="relative aspect-[3/2] bg-bg-soft">
                {c.image && <Image src={c.image} alt={c.name} fill sizes="300px" className="object-cover" />}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm flex items-center gap-1.5"><Tags size={14} className="text-gold-strong" /> {c.name}</p>
                    <p className="text-xs text-muted">{count(c.slug)} productos · /{c.slug}</p>
                  </div>
                  <button onClick={() => remove(c)} className="p-2 text-danger hover:bg-danger/10 rounded-lg"><Trash2 size={15} /></button>
                </div>
                {c.subcategories && c.subcategories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {c.subcategories.map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-bg-soft text-muted">{s}</span>)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
