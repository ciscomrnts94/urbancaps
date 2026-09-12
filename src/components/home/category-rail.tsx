import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

export default function CategoryRail() {
  return (
    <section className="py-6">
      <div className="container-x mb-4 flex items-end justify-between">
        <div>
          <p className="eyebrow mb-1">Explora</p>
          <h2 className="section-title text-[22px] md:text-3xl">Categorías</h2>
        </div>
      </div>
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-4 md:px-8">
        {CATEGORIES.map((c) => (
          <Link key={c.id} href={`/categoria/${c.slug}`} className="shrink-0 text-center group press">
            <div className="relative w-[76px] h-[76px] md:w-24 md:h-24 rounded-[22px] overflow-hidden bg-bg-gray ring-1 ring-line group-hover:ring-gold transition-all">
              {c.image && <Image src={c.image} alt={c.name} fill sizes="96px" className="object-cover" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />
            </div>
            <p className="mt-2 text-[12px] font-medium">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
