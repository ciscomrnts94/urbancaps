"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search as SearchIcon } from "lucide-react";
import { PRODUCTS, CATEGORIES } from "@/lib/mock-data";
import ProductGrid from "./product-grid";
import Link from "next/link";

export default function SearchView() {
  const params = useSearchParams();
  const router = useRouter();
  const initial = params.get("q") ?? "";
  const [q, setQ] = useState(initial);

  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return PRODUCTS.filter(
      (p) =>
        p.active &&
        (p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.categorySlug.includes(term) ||
          (p.subcategory ?? "").toLowerCase().includes(term)),
    );
  }, [q]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.replace(`/buscar?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <>
      <form onSubmit={onSubmit} className="flex items-center gap-2 border border-line-strong rounded-[var(--radius)] px-4 h-12 mb-6 focus-within:border-gold">
        <SearchIcon size={18} className="text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="¿Qué estás buscando?"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </form>

      {!q.trim() ? (
        <div>
          <p className="eyebrow mb-3">Búsquedas populares</p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="chip px-4 h-9 text-sm">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted mb-5">
            {results.length} resultado{results.length !== 1 ? "s" : ""} para “{q}”
          </p>
          {results.length > 0 ? (
            <ProductGrid products={results} />
          ) : (
            <p className="text-center text-muted py-16">No encontramos productos. Prueba con otra palabra.</p>
          )}
        </>
      )}
    </>
  );
}
