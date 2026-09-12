export type UserRole = "customer" | "store_admin" | "super_admin";

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  city: string | null;
  department: string | null;
  role: UserRole;
  created_at: string | null;
}

export interface Address {
  id: string;
  user_id: string;
  label: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  address: string;
  address_complement: string | null;
  neighborhood: string | null;
  city: string | null;
  department: string | null;
  postal_code: string | null;
  is_default: boolean;
  created_at: string | null;
}

export function fullName(p?: Profile | null): string {
  if (!p) return "";
  return [p.first_name, p.last_name].filter(Boolean).join(" ").trim();
}

export function initials(p?: Profile | null): string {
  if (!p) return "?";
  const a = (p.first_name ?? "").trim()[0] ?? "";
  const b = (p.last_name ?? "").trim()[0] ?? "";
  return (a + b).toUpperCase() || (p.email ?? "?")[0].toUpperCase();
}
