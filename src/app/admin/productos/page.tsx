"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import type { Product } from "@/lib/types";
import { getAdminProducts, deleteProductAction, setProductActive } from "@/app/admin/actions";
import { formatCOP } from "@/lib/format";

function total(p: Product) {
  return p.variants.reduce((s, v) => s + v.stock, 0);
}

export default function AdminProductos() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    try {
      setProducts(await getAdminProducts());
    } catch {
      setProducts([]);
    }
  }
  useEffect(() => { load(); }, []);

  async function onDelete(p: Product) {
    if (!confirm(`¿Eliminar "${p.name}"?`)) return;
    setProducts((ps) => ps?.filter((x) => x.id !== p.id) ?? null);
    await deleteProductAction(p.id);
  }
  async function onToggle(p: Product) {
    setProducts((ps) => ps?.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)) ?? null);
    await setProductActive(p.id, !p.active);
  }

  const list = (products ?? []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  function stockBadge(p: Product) {
    const t = total(p);
    if (t <= 0) return <span className="badge badge-soldout">Agotado</span>;
    if (t <= (p.lowStockThreshold ?? 5)) return <span className="badge" style={{ background: "#fff4e0", color: "var(--warning)" }}>Stock bajo</span>;
    return <span className="badge" style={{ background: "#e8f5ee", color: "var(--success)" }}>En stock</span>;
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-700">Productos</h1>
          <p className="text-sm text-muted">{products ? products.length : "…"} productos en total</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn-gold px-4 py-2.5 text-sm inline-flex items-center gap-2">
          <Plus size={17} /> <span className="hidden sm:inline">Nuevo producto</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 border border-line-strong rounded-lg px-3 h-11 mb-4 bg-bg max-w-md">
        <Search size={17} className="text-muted" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar producto…" className="flex-1 bg-transparent outline-none text-sm" />
      </div>

      {products === null ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
        </div>
      ) : (
        <>
          {/* Tabla (desktop) */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg-soft text-left text-xs text-muted uppercase tracking-wide">
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="border-t border-line hover:bg-bg-soft/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-11 h-12 rounded-lg overflow-hidden bg-bg-soft shrink-0">
                          {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="44px" className="object-cover" unoptimized={p.images[0].url.startsWith("data:")} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[240px]">{p.name}</p>
                          <p className="text-xs text-muted">{p.categorySlug} · {p.variants.length} variantes</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium">{formatCOP(p.price)}</span>
                      {p.compareAtPrice ? <span className="block text-xs text-muted line-through">{formatCOP(p.compareAtPrice)}</span> : null}
                    </td>
                    <td className="px-4 py-3">{total(p)} {stockBadge(p)}</td>
                    <td className="px-4 py-3">
                      {p.active ? <span className="text-success text-xs font-medium">● Activo</span> : <span className="text-muted text-xs">○ Oculto</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => onToggle(p)} className="p-2 rounded-lg hover:bg-bg-soft text-muted" title={p.active ? "Ocultar" : "Mostrar"}>
                          {p.active ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <Link href={`/admin/productos/${p.id}`} className="p-2 rounded-lg hover:bg-bg-soft text-muted" title="Editar"><Pencil size={16} /></Link>
                        <button onClick={() => onDelete(p)} className="p-2 rounded-lg hover:bg-danger/10 text-danger" title="Eliminar"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length === 0 && <p className="text-center text-muted py-12">No hay productos.</p>}
          </div>

          {/* Tarjetas (móvil) */}
          <div className="md:hidden space-y-3">
            {list.map((p) => (
              <div key={p.id} className="card p-3 flex gap-3">
                <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-bg-soft shrink-0">
                  {p.images[0] && <Image src={p.images[0].url} alt={p.name} fill sizes="56px" className="object-cover" unoptimized={p.images[0].url.startsWith("data:")} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted">{formatCOP(p.price)} · {total(p)} u.</p>
                  <div className="mt-1">{stockBadge(p)}</div>
                </div>
                <div className="flex flex-col gap-1">
                  <Link href={`/admin/productos/${p.id}`} className="p-2 rounded-lg hover:bg-bg-soft text-muted"><Pencil size={15} /></Link>
                  <button onClick={() => onDelete(p)} className="p-2 rounded-lg text-danger"><Trash2 size={15} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
