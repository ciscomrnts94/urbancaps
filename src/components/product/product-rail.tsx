import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Product } from "@/lib/types";
import ProductCard from "./product-card";

export default function ProductRail({
  title,
  eyebrow,
  products,
  href,
}: {
  title: string;
  eyebrow?: string;
  products: Product[];
  href?: string;
}) {
  if (products.length === 0) return null;
  return (
    <section className="py-6 md:py-8">
      <div className="container-x flex items-end justify-between mb-4">
        <div>
          {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
          <h2 className="section-title text-[22px] md:text-3xl">{title}</h2>
        </div>
        {href && (
          <Link href={href} className="text-[13px] text-gold-strong font-semibold inline-flex items-center gap-0.5 hover:gap-1.5 transition-all whitespace-nowrap">
            Ver todo <ChevronRight size={15} />
          </Link>
        )}
      </div>

      {/* Carrusel horizontal en móvil, se ve completo en desktop */}
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar px-4 md:px-8 snap-x snap-mandatory">
        {products.map((p) => (
          <div
            key={p.id}
            className="snap-start shrink-0 w-[43%] sm:w-[31%] md:w-[24%] lg:w-[23%] max-w-[280px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
