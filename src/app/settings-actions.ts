"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface StoreSettingsDB {
  name: string;
  tagline: string | null;
  logo_url: string | null;
  banner_url: string | null;
  whatsapp: string | null;
  email: string | null;
  phone: string | null;
  city: string | null;
  instagram: string | null;
  facebook: string | null;
  tiktok: string | null;
  free_shipping_threshold: number;
  flat_shipping_rate: number;
}

/** Lee la configuración pública de la tienda (o null si no hay). */
export async function getStoreSettings(): Promise<StoreSettingsDB | null> {
  const db = getSupabaseServer();
  if (!db) return null;
  const { data } = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  return (data as StoreSettingsDB) ?? null;
}

/** Guarda la configuración (admin). */
export async function saveStoreSettings(patch: Partial<StoreSettingsDB>): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin();
  const { error } = await db.from("store_settings").upsert({ id: 1, ...patch });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/");
  return { ok: true };
}
