import { CATEGORIES as MOCK_CATEGORIES, PRODUCTS as MOCK_PRODUCTS } from "./mock-data";
import { getSupabaseServer } from "./supabase/server";
import type { Category, Product, Variant } from "./types";

/**
 * Capa de acceso a datos del catálogo.
 * Lee de Supabase cuando está configurado; si no, usa el catálogo de ejemplo.
 * Ante cualquier error de red, cae de vuelta al catálogo de ejemplo.
 */

const PRODUCT_SELECT =
  "id, slug, name, sku, subcategory, description, price, compare_at_price, cost, video_url, featured, is_new, active, low_stock_threshold, rating, review_count, created_at, categories(slug), product_images(id, url, alt, position), variants(id, color, color_hex, size, sku, price, stock)";

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapProduct(row: any): Product {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a: any, b: any) => (a.position ?? 0) - (b.position ?? 0))
    .map((im: any) => ({ id: im.id, url: im.url, alt: im.alt ?? row.name }));

  const variants: Variant[] = (row.variants ?? []).map((v: any) => ({
    id: v.id, color: v.color ?? undefined, colorHex: v.color_hex ?? undefined,
    size: v.size ?? undefined, sku: v.sku ?? undefined, price: v.price ?? undefined, stock: v.stock ?? 0,
  }));

  // Colores y tallas únicos derivados de las variantes.
  const colorMap = new Map<string, string>();
  const sizes: string[] = [];
  for (const v of variants) {
    if (v.color && !colorMap.has(v.color)) colorMap.set(v.color, v.colorHex ?? "#ccc");
    if (v.size && !sizes.includes(v.size)) sizes.push(v.size);
  }

  return {
    id: row.id, slug: row.slug, name: row.name, sku: row.sku ?? undefined,
    categorySlug: row.categories?.slug ?? "",
    subcategory: row.subcategory ?? undefined, description: row.description ?? "",
    price: row.price, compareAtPrice: row.compare_at_price ?? null, cost: row.cost ?? null,
    images: images.length ? images : [{ id: "ph", url: `https://picsum.photos/seed/${row.slug}/900/1100`, alt: row.name }],
    videoUrl: row.video_url ?? null,
    featured: row.featured, isNew: row.is_new, active: row.active,
    colors: [...colorMap.entries()].map(([name, hex]) => ({ name, hex })),
    sizes, variants,
    lowStockThreshold: row.low_stock_threshold ?? 5,
    rating: row.rating ?? 5, reviewCount: row.review_count ?? 0,
    createdAt: row.created_at ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

async function fetchAll(): Promise<Product[] | null> {
  const db = getSupabaseServer();
  if (!db) return null;
  const { data, error } = await db.from("products").select(PRODUCT_SELECT).eq("active", true);
  if (error || !data) return null;
  return data.map(mapProduct);
}

/* ---------------- API pública ---------------- */

export async function getCategories(): Promise<Category[]> {
  const db = getSupabaseServer();
  if (db) {
    const { data } = await db.from("categories").select("id, name, slug, image_url, subcategories, position").order("position");
    if (data) return data.map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image_url ?? undefined, subcategories: c.subcategories ?? [] }));
  }
  return MOCK_CATEGORIES;
}

export async function getCategoryBySlug(slug: string): Promise<Category | undefined> {
  return (await getCategories()).find((c) => c.slug === slug);
}

export async function getProducts(): Promise<Product[]> {
  return (await fetchAll()) ?? MOCK_PRODUCTS.filter((p) => p.active);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const db = getSupabaseServer();
  if (db) {
    const { data } = await db.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("active", true).maybeSingle();
    if (data) return mapProduct(data);
  }
  return MOCK_PRODUCTS.find((p) => p.slug === slug && p.active);
}

export async function getFeatured(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.featured).slice(0, limit);
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.isNew).slice(0, limit);
}

export async function getOnSale(limit = 8): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.compareAtPrice && p.compareAtPrice > p.price).slice(0, limit);
}

export async function getByCategory(slug: string): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.categorySlug === slug);
}

export async function getRelated(product: Product, limit = 4): Promise<Product[]> {
  const all = await getProducts();
  return all.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const all = await getProducts();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categorySlug.includes(q) ||
      (p.subcategory ?? "").toLowerCase().includes(q),
  );
}

/* ---------- Helpers de stock / variantes (sin cambios) ---------- */

export function totalStock(product: Product): number {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isSoldOut(product: Product): boolean {
  return totalStock(product) <= 0;
}

export function findVariant(product: Product, color?: string, size?: string): Variant | undefined {
  return product.variants.find((v) => (color ? v.color === color : true) && (size ? v.size === size : true));
}

export function variantStock(product: Product, color?: string, size?: string): number {
  return findVariant(product, color, size)?.stock ?? 0;
}

export function colorHasStock(product: Product, color: string): boolean {
  return product.variants.some((v) => v.color === color && v.stock > 0);
}

export function sizeHasStock(product: Product, size: string): boolean {
  return product.variants.some((v) => v.size === size && v.stock > 0);
}

export function priceForVariant(product: Product, variant?: Variant): number {
  return variant?.price ?? product.price;
}
