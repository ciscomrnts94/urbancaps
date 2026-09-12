"use server";

import { getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/types";

/** Todos los productos activos (para búsqueda/favoritos en cliente). */
export async function fetchAllProducts(): Promise<Product[]> {
  return getProducts();
}

/** Productos por lista de IDs (favoritos). */
export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const all = await getProducts();
  return all.filter((p) => ids.includes(p.id));
}
