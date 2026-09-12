/**
 * Siembra el catálogo de ejemplo en Supabase.
 * Ejecutar: npx tsx scripts/seed.ts
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PRODUCTS, CATEGORIES } from "../src/lib/mock-data";
import { STORE } from "../src/lib/store-config";

// --- Cargar .env.local manualmente ---
function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) process.env[m[1]] = m[2].trim();
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !key) throw new Error("Faltan variables de Supabase en .env.local");

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log("→ Conectando a", url);

  // Limpiar (orden seguro por llaves foráneas)
  console.log("→ Limpiando tablas…");
  await db.from("variants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("product_images").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("products").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await db.from("categories").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  // Configuración de la tienda
  console.log("→ store_settings…");
  await db.from("store_settings").upsert({
    id: 1,
    name: STORE.name,
    tagline: STORE.tagline,
    whatsapp: STORE.whatsapp,
    email: STORE.email,
    phone: STORE.phone,
    city: STORE.city,
    instagram: STORE.social.instagram,
    facebook: STORE.social.facebook,
    tiktok: STORE.social.tiktok,
    currency: STORE.currency,
    free_shipping_threshold: STORE.shipping.freeShippingThreshold,
    flat_shipping_rate: STORE.shipping.flatRate,
  });

  // Categorías
  console.log("→ categorías…");
  const catRows = CATEGORIES.map((c, i) => ({
    name: c.name, slug: c.slug, image_url: c.image ?? null,
    subcategories: c.subcategories ?? [], position: i,
  }));
  const { data: cats, error: catErr } = await db.from("categories").insert(catRows).select("id, slug");
  if (catErr) throw catErr;
  const catBySlug = new Map(cats!.map((c) => [c.slug, c.id]));

  // Productos
  console.log("→ productos…");
  const prodRows = PRODUCTS.map((p) => ({
    slug: p.slug, name: p.name, sku: p.sku ?? null,
    category_id: catBySlug.get(p.categorySlug) ?? null,
    subcategory: p.subcategory ?? null, description: p.description,
    price: p.price, compare_at_price: p.compareAtPrice ?? null, cost: p.cost ?? null,
    video_url: p.videoUrl ?? null, featured: p.featured, is_new: p.isNew, active: p.active,
    low_stock_threshold: p.lowStockThreshold ?? 5, rating: p.rating ?? 5, review_count: p.reviewCount ?? 0,
  }));
  const { data: prods, error: prodErr } = await db.from("products").insert(prodRows).select("id, slug");
  if (prodErr) throw prodErr;
  const prodBySlug = new Map(prods!.map((p) => [p.slug, p.id]));

  // Imágenes y variantes
  console.log("→ imágenes y variantes…");
  const imageRows: Record<string, unknown>[] = [];
  const variantRows: Record<string, unknown>[] = [];
  for (const p of PRODUCTS) {
    const pid = prodBySlug.get(p.slug);
    if (!pid) continue;
    p.images.forEach((im, i) => imageRows.push({ product_id: pid, url: im.url, alt: im.alt ?? p.name, position: i }));
    for (const v of p.variants) {
      variantRows.push({
        product_id: pid, color: v.color ?? null, color_hex: v.colorHex ?? null,
        size: v.size ?? null, sku: v.sku ?? null, price: v.price ?? null, stock: v.stock,
      });
    }
  }
  const { error: imgErr } = await db.from("product_images").insert(imageRows);
  if (imgErr) throw imgErr;
  const { error: varErr } = await db.from("variants").insert(variantRows);
  if (varErr) throw varErr;

  console.log(`✓ Listo: ${cats!.length} categorías, ${prods!.length} productos, ${imageRows.length} imágenes, ${variantRows.length} variantes.`);
}

main().catch((e) => { console.error("✗ Error:", e.message ?? e); process.exit(1); });
