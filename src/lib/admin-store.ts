"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Category, Product, Variant } from "./types";
import { PRODUCTS, CATEGORIES } from "./mock-data";

/**
 * Store del panel de administración.
 * Se siembra con el catálogo de ejemplo y persiste los cambios en localStorage.
 * Cuando se conecte Supabase, estas acciones harán llamadas a la base de datos.
 */
interface AdminState {
  products: Product[];
  categories: Category[];

  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleActive: (id: string) => void;
  setVariantStock: (productId: string, variantId: string, stock: number) => void;

  addCategory: (cat: Category) => void;
  deleteCategory: (id: string) => void;

  resetToSeed: () => void;
}

const seed = () => ({
  products: JSON.parse(JSON.stringify(PRODUCTS)) as Product[],
  categories: JSON.parse(JSON.stringify(CATEGORIES)) as Category[],
});

export const useAdmin = create<AdminState>()(
  persist(
    (set) => ({
      ...seed(),

      upsertProduct: (product) =>
        set((s) => {
          const exists = s.products.some((p) => p.id === product.id);
          return {
            products: exists
              ? s.products.map((p) => (p.id === product.id ? product : p))
              : [product, ...s.products],
          };
        }),

      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      toggleActive: (id) =>
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, active: !p.active } : p)),
        })),

      setVariantStock: (productId, variantId, stock) =>
        set((s) => ({
          products: s.products.map((p) =>
            p.id !== productId
              ? p
              : {
                  ...p,
                  variants: p.variants.map((v: Variant) =>
                    v.id === variantId ? { ...v, stock: Math.max(0, stock) } : v,
                  ),
                },
          ),
        })),

      addCategory: (cat) => set((s) => ({ categories: [...s.categories, cat] })),
      deleteCategory: (id) => set((s) => ({ categories: s.categories.filter((c) => c.id !== id) })),

      resetToSeed: () => set(seed()),
    }),
    { name: "urbancaps-admin" },
  ),
);

/* ---------- Helpers de inventario ---------- */

export function productTotalStock(p: Product): number {
  return p.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function isLowStock(p: Product): boolean {
  const total = productTotalStock(p);
  return total > 0 && total <= (p.lowStockThreshold ?? 5);
}

export function isOutOfStock(p: Product): boolean {
  return productTotalStock(p) <= 0;
}
