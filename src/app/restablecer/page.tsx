"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2 } from "lucide-react";
import AuthShell from "@/components/auth/auth-shell";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { passwordMeetsMin, friendlyAuthError } from "@/lib/auth/validation";

export default function RestablecerPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string; form?: string }>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // El enlace del correo establece una sesión temporal de recuperación.
  useEffect(() => {
    const supabase = supabaseBrowser();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => { if (data.session) setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!passwordMeetsMin(password)) errs.password = "Mínimo 8 caracteres, con una letra y un número.";
    if (confirm !== password) errs.confirm = "Las contraseñas no coinciden.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const supabase = supabaseBrowser();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) { setErrors({ form: friendlyAuthError(error.message) }); return; }
    setDone(true);
    setTimeout(() => { router.push("/cuenta"); router.refresh(); }, 1600);
  }

  return (
    <AuthShell brandTitle={"Nueva\ncontraseña"} brandSubtitle="Elige una contraseña segura para proteger tu cuenta.">
      {done ? (
        <div className="text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-gold-tint grid place-items-center mx-auto mb-5">
            <CheckCircle2 size={30} className="text-gold-strong" />
          </div>
          <h2 className="font-display text-2xl font-700">¡Contraseña actualizada!</h2>
          <p className="text-muted mt-2 text-sm">Te estamos redirigiendo a tu cuenta…</p>
        </div>
      ) : (
        <>
          <div className="mb-8 flex items-start gap-3">
            <div className="w-11 h-11 rounded-full bg-gold-tint grid place-items-center text-gold-strong shrink-0"><ShieldCheck size={20} /></div>
            <div>
              <h2 className="font-display text-2xl font-700">Restablecer contraseña</h2>
              <p className="text-muted mt-1 text-sm">Crea una nueva contraseña para tu cuenta.</p>
            </div>
          </div>

          {!ready && (
            <div className="mb-4 rounded-xl border border-line bg-bg-soft text-muted text-sm px-4 py-3">
              Abre esta página desde el enlace que te enviamos por correo para continuar.
            </div>
          )}
          {errors.form && <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm px-4 py-3">{errors.form}</div>}

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1.5">Nueva contraseña</label>
              <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" error={errors.password} />
              <PasswordStrengthMeter value={password} />
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1.5">Confirmar contraseña</label>
              <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
            </div>
            <button type="submit" disabled={loading || !ready} className="btn-gold w-full h-12 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Actualizando…</>) : "Actualizar contraseña"}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-8">
            <Link href="/login" className="text-gold-strong font-medium hover:underline">Volver al login</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
