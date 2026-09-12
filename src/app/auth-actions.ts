"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServerAuth } from "@/lib/supabase/ssr-server";

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string;
}

/**
 * Crea la cuenta con el correo ya confirmado (para un registro fluido).
 * La contraseña se guarda con hash seguro por Supabase Auth (nunca en texto plano).
 */
export async function registerUser(input: RegisterInput): Promise<{ ok: boolean; error?: string }> {
  const admin = getSupabaseAdmin();
  const { error } = await admin.auth.admin.createUser({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    email_confirm: true,
    user_metadata: {
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      phone: input.phone.trim(),
      avatar_url: input.avatarUrl ?? null,
    },
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/**
 * Sube el avatar del usuario autenticado al bucket 'avatars' (vía service_role,
 * a la carpeta propia del usuario) y devuelve la URL pública.
 */
export async function uploadAvatar(formData: FormData): Promise<{ url?: string; error?: string }> {
  const auth = await supabaseServerAuth();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { error: "Sesión no válida." };

  const file = formData.get("file") as File | null;
  if (!file) return { error: "Sin archivo." };
  if (!file.type.startsWith("image/")) return { error: "El archivo debe ser una imagen." };
  if (file.size > 3 * 1024 * 1024) return { error: "La imagen supera 3 MB." };

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${user.id}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const admin = getSupabaseAdmin();
  const { error } = await admin.storage.from("avatars").upload(path, buffer, { contentType: file.type, upsert: true });
  if (error) return { error: error.message };

  const { data } = admin.storage.from("avatars").getPublicUrl(path);
  // Refleja el avatar en el perfil y en los metadatos del usuario
  await admin.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);
  await admin.auth.admin.updateUserById(user.id, { user_metadata: { ...user.user_metadata, avatar_url: data.publicUrl } });
  return { url: data.publicUrl };
}

/**
 * Bootstrap: el primer usuario puede reclamar el rol de administrador
 * (solo si aún no existe ningún administrador en la plataforma).
 */
export async function claimAdminIfFirst(): Promise<{ ok: boolean; role?: string; error?: string }> {
  const auth = await supabaseServerAuth();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return { ok: false, error: "Inicia sesión primero." };

  const admin = getSupabaseAdmin();
  const { count } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .in("role", ["store_admin", "super_admin"]);

  if ((count ?? 0) > 0) return { ok: false, error: "Ya existe un administrador." };

  const { error } = await admin.from("profiles").update({ role: "super_admin" }).eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  return { ok: true, role: "super_admin" };
}
