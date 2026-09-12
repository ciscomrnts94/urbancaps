"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowLeft, Plus, Trash2, Star, ArrowUp, ArrowDown, Upload, Save } from "lucide-react";
import type { Product, ProductImage, Variant } from "@/lib/types";
import { saveProduct, uploadProductImage } from "@/app/admin/actions";
import { CATEGORIES } from "@/lib/mock-data";

const PRESET_COLORS = [
  { name: "Negro", hex: "#141414" }, { name: "Blanco", hex: "#f6f6f2" },
  { name: "Gris", hex: "#8a8a8f" }, { name: "Rojo", hex: "#b3202b" },
  { name: "Azul", hex: "#243b6b" }, { name: "Verde", hex: "#2f5d43" },
  { name: "Beige", hex: "#d8c7a6" }, { name: "Café", hex: "#5b4632" },
  { name: "Dorado", hex: "#c6a15b" }, { name: "Rosa", hex: "#d98ba0" },
];

function kebab(s: string): string {
  const noAccents = s.normalize("NFD").replace(/[̀-ͯ]/g, "");
  return noAccents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildVariants(
  productId: string,
  colors: { name: string; hex: string }[],
  sizes: string[],
  prev: Variant[],
): Variant[] {
  const colorList = colors.length ? colors : [{ name: "", hex: "" }];
  const sizeList = sizes.length ? sizes : ["Única"];
  const out: Variant[] = [];
  for (const c of colorList) {
    for (const s of sizeList) {
      const existing = prev.find((v) => (v.color ?? "") === c.name && (v.size ?? "") === s);
      out.push({
        id: existing?.id ?? `${productId}-${kebab(c.name || "u")}-${kebab(s)}`,
        color: c.name || undefined,
        colorHex: c.hex || undefined,
        size: s,
        sku: `${productId.toUpperCase()}-${(c.name || "U").slice(0, 2).toUpperCase()}-${s}`,
        stock: existing?.stock ?? 0,
      });
    }
  }
  return out;
}

export default function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name ?? "");
  const [sku, setSku] = useState(initial?.sku ?? "");
  const [categorySlug, setCategorySlug] = useState(initial?.categorySlug ?? CATEGORIES[0].slug);
  const [subcategory, setSubcategory] = useState(initial?.subcategory ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState(initial?.compareAtPrice ?? 0);
  const [cost, setCost] = useState(initial?.cost ?? 0);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [isNew, setIsNew] = useState(initial?.isNew ?? true);
  const [active, setActive] = useState(initial?.active ?? true);
  const [lowStock, setLowStock] = useState(initial?.lowStockThreshold ?? 5);

  const [images, setImages] = useState<ProductImage[]>(initial?.images ?? []);
  const [colors, setColors] = useState(initial?.colors ?? []);
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? []);
  const [variants, setVariants] = useState<Variant[]>(initial?.variants ?? []);
  const [newSize, setNewSize] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const pid = initial?.id ?? (kebab(name) || `prod-${Date.now()}`);

  function regen(nextColors = colors, nextSizes = sizes) {
    setVariants(buildVariants(pid, nextColors, nextSizes, variants));
  }

  /* ---- Imágenes ---- */
  function addImageUrl() {
    if (!imgUrl.trim()) return;
    setImages((im) => [...im, { id: `img-${Date.now()}`, url: imgUrl.trim(), alt: name }]);
    setImgUrl("");
  }
  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await uploadProductImage(fd);
        if (res.url) {
          setImages((im) => [...im, { id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url: res.url!, alt: file.name }]);
        } else if (res.error) {
          setError("No se pudo subir la imagen: " + res.error);
        }
      }
    } finally {
      setUploading(false);
    }
  }
  const moveImg = (i: number, dir: -1 | 1) =>
    setImages((im) => {
      const j = i + dir;
      if (j < 0 || j >= im.length) return im;
      const copy = [...im];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  const makeMain = (i: number) => setImages((im) => (i === 0 ? im : [im[i], ...im.filter((_, k) => k !== i)]));
  const removeImg = (id: string) => setImages((im) => im.filter((x) => x.id !== id));

  /* ---- Colores / tallas ---- */
  function toggleColor(c: { name: string; hex: string }) {
    const exists = colors.some((x) => x.name === c.name);
    const next = exists ? colors.filter((x) => x.name !== c.name) : [...colors, c];
    setColors(next);
    regen(next, sizes);
  }
  function addSize() {
    const s = newSize.trim();
    if (!s || sizes.includes(s)) return;
    const next = [...sizes, s];
    setSizes(next);
    setNewSize("");
    regen(colors, next);
  }
  function removeSize(s: string) {
    const next = sizes.filter((x) => x !== s);
    setSizes(next);
    regen(colors, next);
  }
  const addPreset = (label: string, arr: string[]) => { setSizes(arr); regen(colors, arr); };

  function setStock(variantId: string, stock: number) {
    setVariants((vs) => vs.map((v) => (v.id === variantId ? { ...v, stock: Math.max(0, stock) } : v)));
  }

  async function save() {
    setError("");
    if (!name.trim() || price <= 0) {
      setError("Completa al menos el nombre y un precio válido.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const vlist = variants.length ? variants : buildVariants(pid, colors, sizes, []);
    const product: Product = {
      id: pid,
      slug: initial?.slug ?? kebab(name),
      name: name.trim(),
      sku: sku || pid.toUpperCase(),
      categorySlug,
      subcategory: subcategory || undefined,
      description: description.trim() || "Producto de la tienda.",
      price: Number(price),
      compareAtPrice: compareAtPrice > 0 ? Number(compareAtPrice) : null,
      cost: cost > 0 ? Number(cost) : null,
      images: images.length ? images : [{ id: "ph", url: `https://picsum.photos/seed/${kebab(name)}/900/1100`, alt: name }],
      videoUrl: null,
      featured, isNew, active,
      colors, sizes: sizes.length ? sizes : ["Única"],
      variants: vlist,
      lowStockThreshold: Number(lowStock),
      rating: initial?.rating ?? 5, reviewCount: initial?.reviewCount ?? 0,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    };
    setSaving(true);
    try {
      const res = await saveProduct(product);
      if (res.ok) {
        router.push("/admin/productos");
        router.refresh();
      } else {
        setError(res.error ?? "No se pudo guardar el producto.");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } finally {
      setSaving(false);
    }
  }

  const cat = CATEGORIES.find((c) => c.slug === categorySlug);

  const inputC = "w-full border border-line-strong rounded-lg px-3 h-11 text-sm outline-none focus:border-gold bg-bg";
  const labelC = "block text-xs font-medium text-ink-soft mb-1.5";

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.push("/admin/productos")} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} /> Volver a productos
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl md:text-3xl font-700">{isEdit ? "Editar producto" : "Nuevo producto"}</h1>
        <button onClick={save} disabled={saving} className="btn-gold px-5 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-60">
          <Save size={16} /> {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-danger/30 bg-danger/5 text-danger text-sm px-4 py-3">{error}</div>
      )}

      <div className="space-y-4">
        {/* Información básica */}
        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Información</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className={labelC}>Nombre del producto *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputC} placeholder="Ej. Gorra Classic Gold" />
            </div>
            <div>
              <label className={labelC}>SKU</label>
              <input value={sku} onChange={(e) => setSku(e.target.value)} className={inputC} placeholder="Se genera automáticamente" />
            </div>
            <div>
              <label className={labelC}>Categoría</label>
              <select value={categorySlug} onChange={(e) => { setCategorySlug(e.target.value); setSubcategory(""); }} className={inputC}>
                {CATEGORIES.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelC}>Subcategoría</label>
              <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className={inputC}>
                <option value="">— Ninguna —</option>
                {cat?.subcategories?.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className={labelC}>Descripción</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="w-full border border-line-strong rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gold bg-bg resize-y" placeholder="Describe el producto…" />
            </div>
          </div>
        </section>

        {/* Precios */}
        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Precios (COP)</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelC}>Precio de venta *</label>
              <input type="number" value={price || ""} onChange={(e) => setPrice(Number(e.target.value))} className={inputC} placeholder="89900" />
            </div>
            <div>
              <label className={labelC}>Precio anterior (tachado)</label>
              <input type="number" value={compareAtPrice || ""} onChange={(e) => setCompareAtPrice(Number(e.target.value))} className={inputC} placeholder="119900" />
            </div>
            <div>
              <label className={labelC}>Costo (interno)</label>
              <input type="number" value={cost || ""} onChange={(e) => setCost(Number(e.target.value))} className={inputC} placeholder="45000" />
            </div>
          </div>
        </section>

        {/* Imágenes */}
        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-1">Fotografías</h2>
          <p className="text-xs text-muted mb-4">La primera imagen es la principal. Sube desde tu celular o PC, o pega una URL.</p>

          <div className="flex flex-wrap gap-3 mb-4">
            {images.map((im, i) => (
              <div key={im.id} className="relative w-24 h-28 rounded-lg overflow-hidden bg-bg-soft border border-line group">
                <Image src={im.url} alt={im.alt ?? ""} fill sizes="96px" className="object-cover" unoptimized={im.url.startsWith("data:")} />
                {i === 0 && <span className="absolute top-1 left-1 badge badge-gold text-[9px] px-1.5 py-0.5">Principal</span>}
                <div className="absolute inset-x-0 bottom-0 bg-black/60 flex justify-center gap-0.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => makeMain(i)} className="text-white/90 hover:text-gold p-0.5" title="Hacer principal"><Star size={13} /></button>
                  <button onClick={() => moveImg(i, -1)} className="text-white/90 hover:text-gold p-0.5" title="Mover"><ArrowUp size={13} /></button>
                  <button onClick={() => moveImg(i, 1)} className="text-white/90 hover:text-gold p-0.5" title="Mover"><ArrowDown size={13} /></button>
                  <button onClick={() => removeImg(im.id)} className="text-white/90 hover:text-danger p-0.5" title="Eliminar"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
            <button onClick={() => fileRef.current?.click()} disabled={uploading} className="w-24 h-28 rounded-lg border-2 border-dashed border-line-strong grid place-items-center text-muted hover:border-gold hover:text-gold-strong disabled:opacity-60">
              <div className="text-center">
                <Upload size={20} className={`mx-auto ${uploading ? "animate-pulse" : ""}`} />
                <span className="text-[10px] block mt-1">{uploading ? "Subiendo…" : "Subir"}</span>
              </div>
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
          </div>

          <div className="flex gap-2">
            <input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://…  (pegar URL de imagen)" className={inputC} />
            <button onClick={addImageUrl} className="btn-dark px-4 text-sm shrink-0">Añadir</button>
          </div>
        </section>

        {/* Colores y tallas */}
        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-1">Colores y tallas</h2>
          <p className="text-xs text-muted mb-4">Elige colores y tallas; el inventario se genera por cada combinación.</p>

          <label className={labelC}>Colores</label>
          <div className="flex flex-wrap gap-2 mb-5">
            {PRESET_COLORS.map((c) => {
              const on = colors.some((x) => x.name === c.name);
              return (
                <button key={c.name} onClick={() => toggleColor(c)}
                  className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full border text-xs ${on ? "border-gold-strong bg-gold-tint" : "border-line-strong"}`}>
                  <span className="w-5 h-5 rounded-full border" style={{ background: c.hex, borderColor: "#ddd" }} />
                  {c.name}
                </button>
              );
            })}
          </div>

          <label className={labelC}>Tallas</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {sizes.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 chip px-3 h-9 text-sm" data-active="true">
                {s}
                <button onClick={() => removeSize(s)} className="text-muted hover:text-danger ml-1"><Trash2 size={12} /></button>
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input value={newSize} onChange={(e) => setNewSize(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())} placeholder="Añadir talla (ej. M, 40, Única)" className="border border-line-strong rounded-lg px-3 h-9 text-sm outline-none focus:border-gold w-52" />
            <button onClick={addSize} className="btn-dark px-3 h-9 text-sm inline-flex items-center gap-1"><Plus size={14} /> Añadir</button>
            <span className="text-xs text-muted">Rápido:</span>
            <button onClick={() => addPreset("ropa", ["XS", "S", "M", "L", "XL", "XXL"])} className="text-xs underline text-gold-strong">Ropa (XS–XXL)</button>
            <button onClick={() => addPreset("cap", ["Única"])} className="text-xs underline text-gold-strong">Única</button>
            <button onClick={() => addPreset("zapato", ["37", "38", "39", "40", "41", "42", "43"])} className="text-xs underline text-gold-strong">Calzado (37–43)</button>
          </div>
        </section>

        {/* Matriz de stock */}
        {variants.length > 0 && (
          <section className="card p-5">
            <h2 className="font-display text-lg font-600 mb-1">Inventario por variante</h2>
            <p className="text-xs text-muted mb-4">Define las unidades disponibles de cada combinación. En 0 se muestra “Agotado” y no se puede comprar.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[380px]">
                <thead>
                  <tr className="text-left text-xs text-muted uppercase">
                    <th className="py-2 pr-3 font-semibold">Color</th>
                    <th className="py-2 pr-3 font-semibold">Talla</th>
                    <th className="py-2 pr-3 font-semibold w-32">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v) => (
                    <tr key={v.id} className="border-t border-line">
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-2">
                          {v.colorHex && <span className="w-4 h-4 rounded-full border" style={{ background: v.colorHex, borderColor: "#ddd" }} />}
                          {v.color ?? "—"}
                        </span>
                      </td>
                      <td className="py-2 pr-3">{v.size}</td>
                      <td className="py-2 pr-3">
                        <input type="number" value={v.stock} onChange={(e) => setStock(v.id, Number(e.target.value))}
                          className={`w-24 border rounded-lg px-2 h-9 text-sm outline-none focus:border-gold ${v.stock <= 0 ? "border-danger/50 text-danger" : "border-line-strong"}`} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Opciones */}
        <section className="card p-5">
          <h2 className="font-display text-lg font-600 mb-4">Opciones</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { label: "Producto destacado", v: featured, set: setFeatured },
              { label: "Producto nuevo", v: isNew, set: setIsNew },
              { label: "Activo (visible en la tienda)", v: active, set: setActive },
            ].map((o) => (
              <label key={o.label} className="flex items-center gap-3 border border-line-strong rounded-lg px-4 py-3 cursor-pointer">
                <input type="checkbox" checked={o.v} onChange={(e) => o.set(e.target.checked)} className="accent-[var(--gold-strong)] w-4 h-4" />
                <span className="text-sm">{o.label}</span>
              </label>
            ))}
            <div className="flex items-center gap-3 border border-line-strong rounded-lg px-4 py-3">
              <span className="text-sm flex-1">Alerta de stock bajo en</span>
              <input type="number" value={lowStock} onChange={(e) => setLowStock(Number(e.target.value))} className="w-16 border border-line-strong rounded px-2 h-8 text-sm" />
            </div>
          </div>
        </section>

        <div className="flex justify-end gap-2 pb-8">
          <button onClick={() => router.push("/admin/productos")} className="btn-outline px-5 py-2.5 text-sm">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-gold px-6 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-60"><Save size={16} /> {saving ? "Guardando…" : "Guardar producto"}</button>
        </div>
      </div>
    </div>
  );
}
