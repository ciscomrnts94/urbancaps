"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import ProductGrid from "./product-grid";

type Sort = "destacados" | "precio_asc" | "precio_desc" | "nuevos";

export default function CategoryView({
  products,
  subcategories,
}: {
  products: Product[];
  subcategories: string[];
}) {
  const [sub, setSub] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>("destacados");

  const filtered = useMemo(() => {
    let list = sub ? products.filter((p) => p.subcategory === sub) : [...products];
    switch (sort) {
      case "precio_asc": list.sort((a, b) => a.price - b.price); break;
      case "precio_desc": list.sort((a, b) => b.price - a.price); break;
      case "nuevos": list.sort((a, b) => Number(b.isNew) - Number(a.isNew)); break;
      default: list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return list;
  }, [products, sub, sort]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between mb-6">
        {/* Subcategorías */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-1 px-1">
          <button
            data-active={sub === null}
            onClick={() => setSub(null)}
            className="chip px-4 h-9 text-sm whitespace-nowrap"
          >
            Todos
          </button>
          {subcategories.map((s) => (
            <button
              key={s}
              data-active={sub === s}
              onClick={() => setSub(s)}
              className="chip px-4 h-9 text-sm whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Orden */}
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="border border-line-strong rounded-lg px-3 h-9 text-sm bg-bg shrink-0"
        >
          <option value="destacados">Destacados</option>
          <option value="nuevos">Nuevos primero</option>
          <option value="precio_asc">Precio: menor a mayor</option>
          <option value="precio_desc">Precio: mayor a menor</option>
        </select>
      </div>

      <ProductGrid products={filtered} />
    </>
  );
}
