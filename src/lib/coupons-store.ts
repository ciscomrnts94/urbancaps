"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEMO_COUPONS } from "./pricing";
import type { Coupon } from "./types";

export interface AdminCoupon extends Coupon {
  id: string;
  active: boolean;
}

interface CouponsState {
  coupons: AdminCoupon[];
  add: (c: AdminCoupon) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
}

const seed: AdminCoupon[] = DEMO_COUPONS.map((c, i) => ({ ...c, id: `cup-${i}`, active: true }));

export const useCoupons = create<CouponsState>()(
  persist(
    (set) => ({
      coupons: seed,
      add: (c) => set((s) => ({ coupons: [c, ...s.coupons] })),
      remove: (id) => set((s) => ({ coupons: s.coupons.filter((x) => x.id !== id) })),
      toggle: (id) => set((s) => ({ coupons: s.coupons.map((x) => (x.id === id ? { ...x, active: !x.active } : x)) })),
    }),
    { name: "urbancaps-coupons" },
  ),
);
