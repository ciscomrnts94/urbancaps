import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Hero from "@/components/home/hero";
import CategoryRail from "@/components/home/category-rail";
import ProductRail from "@/components/product/product-rail";
import { getFeatured, getNewArrivals, getOnSale } from "@/lib/catalog";

export default async function HomePage() {
  const [featured, nuevos, ofertas] = await Promise.all([
    getFeatured(8),
    getNewArrivals(8),
    getOnSale(8),
  ]);

  return (
    <>
      <Hero />
      <CategoryRail />

      <ProductRail eyebrow="Selección" title="Destacados" products={featured} href="/categorias" />

      {/* Banner promocional */}
      <section className="px-4 md:px-8 py-6">
        <div className="relative overflow-hidden rounded-[26px] bg-dark text-white px-6 py-9 md:px-14 md:py-14">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle, rgba(198,161,91,0.4), transparent 70%)" }} />
          <div className="absolute -left-8 -bottom-12 w-44 h-44 rounded-full" style={{ background: "radial-gradient(circle, rgba(198,161,91,0.22), transparent 70%)" }} />
          <div className="relative flex flex-col md:flex-row md:items-center gap-5 justify-between">
            <div className="max-w-lg">
              <span className="inline-flex items-center gap-1.5 text-gold-soft text-[11px] font-semibold tracking-widest uppercase"><Sparkles size={13} /> Cupón de bienvenida</span>
              <h3 className="font-display text-[28px] md:text-4xl font-700 mt-2 leading-tight">
                10% OFF en tu <span className="text-gold">primera compra</span>
              </h3>
              <p className="mt-2 text-white/70 text-sm">
                Usa el código <b className="text-gold-soft tracking-wide">BIENVENIDO10</b> al finalizar tu compra.
              </p>
            </div>
            <Link href="/categorias" className="btn-gold btn-pill px-7 py-3.5 text-sm whitespace-nowrap inline-flex items-center gap-2 self-start md:self-auto">
              Aprovechar <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Nuevos (fondo cálido para separar) */}
      <div className="bg-bg-warm">
        <ProductRail eyebrow="Recién llegados" title="Nuevos productos" products={nuevos} href="/categorias" />
      </div>

      <ProductRail eyebrow="Precios especiales" title="Ofertas" products={ofertas} href="/categorias" />

      {/* CTA final */}
      <section className="px-4 md:px-8 py-10">
        <div className="text-center max-w-xl mx-auto">
          <p className="eyebrow mb-2">UrbanCaps</p>
          <h3 className="section-title text-[24px] md:text-3xl">
            Moda que se siente premium, precios que se sienten justos.
          </h3>
          <p className="mt-3 text-muted text-sm">
            Descubre todo nuestro catálogo y encuentra tu próximo favorito.
          </p>
          <Link href="/categorias" className="btn-dark btn-pill inline-flex items-center gap-2 px-8 py-3.5 text-sm mt-6">
            Ver todo el catálogo <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
