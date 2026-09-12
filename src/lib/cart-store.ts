"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, Coupon } from "./types";

interface CartState {
  lines: CartLine[];
  coupon: Coupon | null;
  drawerOpen: boolean;

  addLine: (line: Omit<CartLine, "key">) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, qty: number) => void;
  clear: () => void;
  applyCoupon: (coupon: Coupon | null) => void;

  openDrawer: () => void;
  closeDrawer: () => void;

  // selectores derivados
  itemCount: () => number;
  subtotal: () => number;
  discount: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      coupon: null,
      drawerOpen: false,

      addLine: (line) => {
        const key = `${line.productId}::${line.variantId}`;
        set((state) => {
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            const nextQty = Math.min(existing.quantity + line.quantity, line.maxStock);
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: nextQty, maxStock: line.maxStock } : l,
              ),
              drawerOpen: true,
            };
          }
          return {
            lines: [...state.lines, { ...line, key, quantity: Math.min(line.quantity, line.maxStock) }],
            drawerOpen: true,
          };
        });
      },

      removeLine: (key) =>
        set((state) => ({ lines: state.lines.filter((l) => l.key !== key) })),

      setQuantity: (key, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.key === key
                ? { ...l, quantity: Math.max(0, Math.min(qty, l.maxStock)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),

      clear: () => set({ lines: [], coupon: null }),
      applyCoupon: (coupon) => set({ coupon }),

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      itemCount: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      subtotal: () => get().lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0),
      discount: () => {
        const { coupon } = get();
        const sub = get().subtotal();
        if (!coupon) return 0;
        if (coupon.minSubtotal && sub < coupon.minSubtotal) return 0;
        if (coupon.type === "percent") return Math.round((sub * coupon.value) / 100);
        if (coupon.type === "fixed") return Math.min(coupon.value, sub);
        return 0; // free_shipping se aplica sobre el envío, no el subtotal
      },
    }),
    {
      name: "urbancaps-cart",
      partialize: (state) => ({ lines: state.lines, coupon: state.coupon }),
    },
  ),
);
