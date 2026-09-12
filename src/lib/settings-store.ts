"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORE } from "./store-config";

export interface StoreSettings {
  name: string;
  tagline: string;
  whatsapp: string;
  email: string;
  phone: string;
  city: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  logoUrl: string;
  bannerUrl: string;
  freeShippingThreshold: number;
  flatRate: number;
}

const initial: StoreSettings = {
  name: STORE.name,
  tagline: STORE.tagline,
  whatsapp: STORE.whatsapp,
  email: STORE.email,
  phone: STORE.phone,
  city: STORE.city,
  instagram: STORE.social.instagram,
  facebook: STORE.social.facebook,
  tiktok: STORE.social.tiktok,
  logoUrl: "",
  bannerUrl: "",
  freeShippingThreshold: STORE.shipping.freeShippingThreshold,
  flatRate: STORE.shipping.flatRate,
};

interface SettingsState {
  settings: StoreSettings;
  update: (patch: Partial<StoreSettings>) => void;
  reset: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: initial,
      update: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      reset: () => set({ settings: initial }),
    }),
    { name: "urbancaps-settings" },
  ),
);
