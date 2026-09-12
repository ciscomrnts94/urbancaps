import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

export default function CategoryRail() {
  return (
    <section className="py-8">
      <div className="container-x mb-5">
        <p className="eyebrow mb-1">Explora</p>
        <h2 className="font-display text-2xl md:text-3xl font-600">Categorías</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 md:px-8">
        {CATEGORIES.map((c) => (
          <Link
            key={c.id}
            href={`/categoria/${c.slug}`}
            className="shrink-0 text-center group"
          >
            <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden bg-bg-soft ring-1 ring-line group-hover:ring-gold transition-all">
              {c.image && (
                <Image src={c.image} alt={c.name} fill sizes="112px" className="object-cover" />
              )}
            </div>
            <p className="mt-2 text-xs md:text-sm font-medium">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
