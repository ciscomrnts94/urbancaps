import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

export const metadata = { title: "Categorías" };

export default function CategoriasPage() {
  return (
    <div className="container-x py-6">
      <header className="mb-6">
        <p className="eyebrow mb-1">Explora la tienda</p>
        <h1 className="font-display text-3xl md:text-4xl font-700">Todas las categorías</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="relative aspect-[4/3] rounded-[var(--radius)] overflow-hidden group"
          >
            {c.image && (
              <Image src={c.image} alt={c.name} fill sizes="(max-width:768px) 50vw, 33vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4">
              <h2 className="font-display text-lg md:text-xl font-600 text-white">{c.name}</h2>
              <p className="text-white/70 text-xs">{c.subcategories?.join(" · ")}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
