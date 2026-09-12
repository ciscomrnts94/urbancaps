import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getByCategory, getCategoryBySlug } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/mock-data";
import CategoryView from "@/components/product/category-view";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategoryBySlug(slug);
  return { title: cat?.name ?? "Categoría" };
}

export default async function CategoryPage({ params }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getByCategory(slug);

  return (
    <div className="container-x py-6">
      <header className="mb-6">
        <p className="eyebrow mb-1">Categoría</p>
        <h1 className="font-display text-3xl md:text-4xl font-700">{category.name}</h1>
        <p className="text-muted text-sm mt-1">{products.length} productos</p>
      </header>
      <CategoryView products={products} subcategories={category.subcategories ?? []} />
    </div>
  );
}
