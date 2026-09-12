import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para el servidor.
 * Usa la clave anónima para lectura pública del catálogo (respeta RLS).
 * Devuelve null si no está configurado, para que el sitio siga funcionando
 * con el catálogo de ejemplo.
 */
let serverClient: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!serverClient) serverClient = createClient(url, key, { auth: { persistSession: false } });
  return serverClient;
}

export const supabaseEnabled =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
