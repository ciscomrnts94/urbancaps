"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Coupon } from "@/lib/types";

export interface AdminCoupon {
  id: string;
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  min_subtotal: number | null;
  starts_at: string | null;
  ends_at: string | null;
  max_uses: number | null;
  active: boolean;
}

/** Cupones (admin). */
export async function getCoupons(): Promise<AdminCoupon[]> {
  const db = getSupabaseAdmin();
  const { data } = await db.from("coupons").select("*").order("code");
  return (data as AdminCoupon[]) ?? [];
}

export async function saveCoupon(c: Partial<AdminCoupon>): Promise<{ ok: boolean; error?: string }> {
  const db = getSupabaseAdmin();
  const payload = {
    code: (c.code ?? "").trim().toUpperCase(),
    type: c.type, value: c.value ?? 0,
    min_subtotal: c.min_subtotal || null,
    starts_at: c.starts_at || null, ends_at: c.ends_at || null,
    max_uses: c.max_uses || null, active: c.active ?? true,
  };
  const { error } = await db.from("coupons").upsert(payload, { onConflict: "code" });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<void> {
  await getSupabaseAdmin().from("coupons").delete().eq("id", id);
}

export async function toggleCoupon(id: string, active: boolean): Promise<void> {
  await getSupabaseAdmin().from("coupons").update({ active }).eq("id", id);
}

/** Validar un cupón contra la base de datos (checkout/carrito). */
export async function validateCoupon(code: string, subtotal: number): Promise<{ ok: boolean; coupon?: Coupon; error?: string }> {
  const db = getSupabaseServer();
  if (!db) return { ok: false, error: "No disponible." };
  const { data } = await db.from("coupons").select("*").eq("code", code.trim().toUpperCase()).eq("active", true).maybeSingle();
  if (!data) return { ok: false, error: "Cupón no válido." };

  const now = new Date();
  if (data.starts_at && new Date(data.starts_at) > now) return { ok: false, error: "Este cupón aún no está activo." };
  if (data.ends_at && new Date(data.ends_at) < now) return { ok: false, error: "Este cupón ya expiró." };
  if (data.max_uses != null && (data.used_count ?? 0) >= data.max_uses) return { ok: false, error: "Este cupón alcanzó su límite de usos." };
  if (data.min_subtotal && subtotal < data.min_subtotal) {
    return { ok: false, error: `Válido en compras desde $${data.min_subtotal.toLocaleString("es-CO")}.` };
  }
  return { ok: true, coupon: { code: data.code, type: data.type, value: data.value, minSubtotal: data.min_subtotal ?? undefined } };
}
