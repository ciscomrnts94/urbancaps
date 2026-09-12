"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { Category, Product, Variant } from "@/lib/types";

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
  const colorMap = new Map<string, string>();
  const sizes: string[] = [];
  for (const v of variants) {
    if (v.color && !colorMap.has(v.color)) colorMap.set(v.color, v.colorHex ?? "#ccc");
    if (v.size && !sizes.includes(v.size)) sizes.push(v.size);
  }
  return {
    id: row.id, slug: row.slug, name: row.name, sku: row.sku ?? undefined,
    categorySlug: row.categories?.slug ?? "", subcategory: row.subcategory ?? undefined,
    description: row.description ?? "", price: row.price,
    compareAtPrice: row.compare_at_price ?? null, cost: row.cost ?? null,
    images, videoUrl: row.video_url ?? null,
    featured: row.featured, isNew: row.is_new, active: row.active,
    colors: [...colorMap.entries()].map(([name, hex]) => ({ name, hex })),
    sizes, variants, lowStockThreshold: row.low_stock_threshold ?? 5,
    rating: row.rating ?? 5, reviewCount: row.review_count ?? 0, createdAt: row.created_at ?? undefined,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function revalidateStore() {
  revalidatePath("/");
  revalidatePath("/categorias");
  revalidatePath("/admin/productos");
}

/* ---------------- Lectura ---------------- */

export async function getAdminProducts(): Promise<Product[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(mapProduct);
}

export async function getAdminCategories(): Promise<Category[]> {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("categories").select("id, name, slug, image_url, subcategories, position").order("position");
  if (error) throw new Error(error.message);
  return (data ?? []).map((c) => ({ id: c.id, name: c.name, slug: c.slug, image: c.image_url ?? undefined, subcategories: c.subcategories ?? [] }));
}

/* ---------------- Productos ---------------- */

export async function saveProduct(product: Product): Promise<{ ok: boolean; id?: string; error?: string }> {
  const db = getSupabaseAdmin();

  // Resolver category_id
  const { data: cat } = await db.from("categories").select("id").eq("slug", product.categorySlug).maybeSingle();

  const payload = {
    slug: product.slug, name: product.name, sku: product.sku ?? null,
    category_id: cat?.id ?? null, subcategory: product.subcategory ?? null,
    description: product.description, price: product.price,
    compare_at_price: product.compareAtPrice ?? null, cost: product.cost ?? null,
    video_url: product.videoUrl ?? null, featured: product.featured, is_new: product.isNew,
    active: product.active, low_stock_threshold: product.lowStockThreshold ?? 5,
    rating: product.rating ?? 5, review_count: product.reviewCount ?? 0,
  };

  const { data: saved, error } = await db.from("products").upsert(payload, { onConflict: "slug" }).select("id").single();
  if (error) return { ok: false, error: error.message };
  const pid = saved.id as string;

  // Reemplazar imágenes y variantes
  await db.from("product_images").delete().eq("product_id", pid);
  await db.from("variants").delete().eq("product_id", pid);

  if (product.images.length) {
    const imgs = product.images.map((im, i) => ({ product_id: pid, url: im.url, alt: im.alt ?? product.name, position: i }));
    const { error: ie } = await db.from("product_images").insert(imgs);
    if (ie) return { ok: false, error: ie.message };
  }
  if (product.variants.length) {
    const vars = product.variants.map((v) => ({
      product_id: pid, color: v.color ?? null, color_hex: v.colorHex ?? null,
      size: v.size ?? null, sku: v.sku ?? null, price: v.price ?? null, stock: v.stock,
    }));
    const { error: ve } = await db.from("variants").insert(vars);
    if (ve) return { ok: false, error: ve.message };
  }

  revalidateStore();
  revalidatePath(`/producto/${product.slug}`);
  return { ok: true, id: pid };
}

export async function deleteProductAction(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  await db.from("products").delete().eq("id", id);
  revalidateStore();
}

export async function setProductActive(id: string, active: boolean): Promise<void> {
  const db = getSupabaseAdmin();
  await db.from("products").update({ active }).eq("id", id);
  revalidateStore();
}

export async function setVariantStockAction(variantId: string, stock: number): Promise<void> {
  const db = getSupabaseAdmin();
  await db.from("variants").update({ stock: Math.max(0, stock) }).eq("id", variantId);
  revalidateStore();
}

/* ---------------- Categorías ---------------- */

export async function saveCategory(cat: Omit<Category, "id">): Promise<void> {
  const db = getSupabaseAdmin();
  await db.from("categories").upsert(
    { name: cat.name, slug: cat.slug, image_url: cat.image ?? null, subcategories: cat.subcategories ?? [] },
    { onConflict: "slug" },
  );
  revalidateStore();
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const db = getSupabaseAdmin();
  await db.from("categories").delete().eq("id", id);
  revalidateStore();
}

/* ---------------- Imágenes (Storage) ---------------- */

export async function uploadProductImage(formData: FormData): Promise<{ url?: string; error?: string }> {
  const db = getSupabaseAdmin();
  const file = formData.get("file") as File | null;
  if (!file) return { error: "Sin archivo" };
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `productos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await db.storage.from("products").upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) return { error: error.message };
  const { data } = db.storage.from("products").getPublicUrl(path);
  return { url: data.publicUrl };
}
