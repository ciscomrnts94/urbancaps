"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthShell from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { validEmail, friendlyAuthError } from "@/lib/auth/validation";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/cuenta";
  const denied = params.get("denied");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!validEmail(email)) errs.email = "El correo electrónico no es válido.";
    if (!password) errs.password = "Ingresa tu contraseña.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) {
      setErrors({ form: friendlyAuthError(error.message) });
      setLoading(false);
      return;
    }
    router.push(redirect);
    router.refresh();
  }

  return (
    <>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-700">Bienvenido de nuevo</h2>
        <p className="text-muted mt-1.5">Ingresa a tu cuenta para continuar</p>
      </div>

      {denied && (
        <div className="mb-4 rounded-xl border border-warning/30 bg-warning/10 text-warning text-sm px-4 py-3 flex gap-2">
          <AlertCircle size={18} className="shrink-0" /> No tienes permiso para acceder a esa sección.
        </div>
      )}
      {errors.form && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm px-4 py-3 flex gap-2">
          <AlertCircle size={18} className="shrink-0" /> {errors.form}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Correo electrónico</label>
          <div className={`flex items-center border rounded-xl px-3.5 h-12 bg-bg transition-colors ${errors.email ? "border-danger" : "border-line-strong focus-within:border-gold"}`}>
            <Mail size={18} className="text-muted mr-2" />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com" autoComplete="email"
              className="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Contraseña</label>
          <PasswordInput value={password} onChange={setPassword} error={errors.password} />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-ink-soft cursor-pointer">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[var(--gold-strong)] w-4 h-4" />
            Recordarme
          </label>
          <Link href="/recuperar" className="text-sm text-gold-strong hover:underline">¿Olvidaste tu contraseña?</Link>
        </div>

        <button type="submit" disabled={loading} className="btn-gold w-full h-12 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? (<><Loader2 size={18} className="animate-spin" /> Iniciando sesión…</>) : (<>Iniciar sesión <ArrowRight size={17} /></>)}
        </button>
      </form>

      {/* Separador */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs text-muted-soft">O continúa con</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" disabled title="Próximamente" className="h-11 rounded-xl border border-line-strong text-sm font-medium inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
          <GoogleIcon /> Google
        </button>
        <button type="button" disabled title="Próximamente" className="h-11 rounded-xl border border-line-strong text-sm font-medium inline-flex items-center justify-center gap-2 opacity-60 cursor-not-allowed">
          <AppleIcon /> Apple
        </button>
      </div>

      <p className="text-center text-sm text-muted mt-8">
        ¿No tienes una cuenta?{" "}
        <Link href="/registro" className="text-gold-strong font-medium hover:underline">Crear cuenta</Link>
      </p>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/></svg>
  );
}
function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.04c-.03-2.9 2.37-4.3 2.48-4.36-1.35-1.98-3.46-2.25-4.21-2.28-1.79-.18-3.5 1.05-4.4 1.05-.91 0-2.31-1.03-3.8-1-1.95.03-3.76 1.14-4.76 2.89-2.03 3.52-.52 8.73 1.45 11.59.96 1.4 2.11 2.97 3.61 2.91 1.45-.06 2-.94 3.74-.94 1.75 0 2.24.94 3.77.91 1.56-.03 2.55-1.42 3.5-2.83 1.1-1.62 1.56-3.19 1.58-3.27-.03-.02-3.03-1.17-3.06-4.63ZM14.2 3.62C15 2.66 15.53 1.32 15.38 0c-1.14.05-2.53.76-3.35 1.72-.74.85-1.38 2.21-1.21 3.51 1.27.1 2.57-.65 3.38-1.61Z"/></svg>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<div className="text-muted">Cargando…</div>}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
