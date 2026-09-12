import Link from "next/link";
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
      <section className="container-x py-8">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gold-tint px-7 py-10 md:px-14 md:py-16 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="max-w-lg text-center md:text-left">
            <p className="eyebrow mb-2">Cupón de bienvenida</p>
            <h3 className="font-display text-2xl md:text-4xl font-700">
              10% OFF en tu primera compra
            </h3>
            <p className="mt-2 text-ink-soft text-sm">
              Usa el código <b className="text-gold-strong tracking-wide">BIENVENIDO10</b> al finalizar tu compra.
            </p>
          </div>
          <Link href="/categorias" className="btn-gold px-7 py-3.5 text-sm whitespace-nowrap">
            Aprovechar ahora
          </Link>
        </div>
      </section>

      <ProductRail eyebrow="Recién llegados" title="Nuevos productos" products={nuevos} href="/categorias" />
      <ProductRail eyebrow="Precios especiales" title="Ofertas" products={ofertas} href="/categorias" />

      {/* CTA final */}
      <section className="container-x py-10">
        <div className="text-center max-w-xl mx-auto">
          <p className="eyebrow mb-2">UrbanCaps</p>
          <h3 className="font-display text-2xl md:text-3xl font-600">
            Moda que se siente premium, precios que se sienten justos.
          </h3>
          <p className="mt-3 text-muted text-sm">
            Descubre todo nuestro catálogo y encuentra tu próximo favorito.
          </p>
          <Link href="/categorias" className="btn-dark inline-block px-8 py-3.5 text-sm mt-6">
            Ver todo el catálogo
          </Link>
        </div>
      </section>
    </>
  );
}
