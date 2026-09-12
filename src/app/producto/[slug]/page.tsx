import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProductBySlug, getRelated, getProducts } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/mock-data";
import Gallery from "@/components/product/gallery";
import ProductDetail from "@/components/product/product-detail";
import ProductRail from "@/components/product/product-rail";

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description.slice(0, 155),
    openGraph: { images: product.images[0]?.url ? [product.images[0].url] : [] },
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = await getRelated(product, 8);
  const category = CATEGORIES.find((c) => c.slug === product.categorySlug);

  return (
    <>
      <div className="container-x py-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-muted mb-4 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-ink">Inicio</Link>
          <ChevronRight size={13} />
          {category && (
            <>
              <Link href={`/categoria/${category.slug}`} className="hover:text-ink whitespace-nowrap">
                {category.name}
              </Link>
              <ChevronRight size={13} />
            </>
          )}
          <span className="text-ink truncate">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <Gallery images={product.images} name={product.name} />
          <ProductDetail product={product} />
        </div>

        {/* Descripción */}
        <div className="mt-12 max-w-3xl">
          <h2 className="font-display text-xl font-600 mb-3">Descripción</h2>
          <p className="text-ink-soft leading-relaxed whitespace-pre-line">{product.description}</p>

          <div className="mt-6 card p-5">
            <h3 className="font-medium mb-3 text-sm">Información de envío</h3>
            <ul className="text-sm text-muted space-y-1.5">
              <li>• Envío a toda Colombia (3 a 5 días hábiles).</li>
              <li>• Envío gratis en compras superiores a $200.000 COP.</li>
              <li>• Pago contra entrega disponible en ciudades principales.</li>
              <li>• Cambios y devoluciones hasta 15 días después de recibir.</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-line">
        <ProductRail title="También te puede gustar" products={related} />
      </div>
    </>
  );
}
