import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase con clave de servicio (service_role).
 * ⚠️ SOLO servidor. Nunca importar desde un componente cliente.
 * Se usa en las acciones de administración (crear/editar productos, etc.).
 */
let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase no está configurado (falta URL o SERVICE_ROLE_KEY).");
  if (!adminClient) adminClient = createClient(url, key, { auth: { persistSession: false } });
  return adminClient;
}

export function adminConfigured(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
