/** Validaciones de formularios de autenticación (mensajes en español). */

export function validEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());
}

/** Teléfono colombiano: 10 dígitos (celular) o con indicativo. */
export function validPhoneCO(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 13;
}

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  label: "Muy débil" | "Débil" | "Media" | "Segura" | "Muy segura";
  checks: { lower: boolean; upper: boolean; number: boolean; special: boolean; length: boolean };
}

export function passwordStrength(pw: string): PasswordStrength {
  const checks = {
    length: pw.length >= 8,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.max(0, Math.min(4, passed - 1)) as 0 | 1 | 2 | 3 | 4;
  const labels = ["Muy débil", "Débil", "Media", "Segura", "Muy segura"] as const;
  return { score, label: labels[score], checks };
}

/** Requisito mínimo para aceptar una contraseña. */
export function passwordMeetsMin(pw: string): boolean {
  return pw.length >= 8 && /[a-z]/.test(pw) && /[0-9]/.test(pw);
}

/** Traduce errores comunes de Supabase Auth a mensajes amigables. */
export function friendlyAuthError(message?: string): string {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login")) return "Correo o contraseña incorrectos.";
  if (m.includes("email not confirmed")) return "Debes confirmar tu correo antes de ingresar.";
  if (m.includes("already registered") || m.includes("already been registered") || m.includes("exists"))
    return "Este correo ya está registrado. Intenta iniciar sesión.";
  if (m.includes("rate limit") || m.includes("too many")) return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (m.includes("password")) return "La contraseña no cumple los requisitos.";
  if (m.includes("network") || m.includes("fetch")) return "Error de conexión. Revisa tu internet.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}
