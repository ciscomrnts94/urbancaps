"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Check, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { passwordMeetsMin, friendlyAuthError } from "@/lib/auth/validation";

export default function SeguridadPage() {
  const { user } = useAuth();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!current) errs.current = "Ingresa tu contraseña actual.";
    if (!passwordMeetsMin(next)) errs.next = "Mínimo 8 caracteres, con una letra y un número.";
    if (confirm !== next) errs.confirm = "Las contraseñas no coinciden.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    const supabase = supabaseBrowser();
    // Verificar contraseña actual
    const { error: verifyErr } = await supabase.auth.signInWithPassword({ email: user?.email ?? "", password: current });
    if (verifyErr) { setErrors({ current: "La contraseña actual es incorrecta." }); setLoading(false); return; }
    // Actualizar
    const { error } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (error) { setErrors({ form: friendlyAuthError(error.message) }); return; }
    setDone(true);
    setCurrent(""); setNext(""); setConfirm("");
    setTimeout(() => setDone(false), 2500);
  }

  return (
    <div className="container-x py-6 max-w-lg">
      <Link href="/cuenta" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4"><ArrowLeft size={16} /> Mi cuenta</Link>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full bg-gold-tint grid place-items-center text-gold-strong"><ShieldCheck size={20} /></div>
        <h1 className="font-display text-2xl md:text-3xl font-700">Seguridad</h1>
      </div>

      {done && <div className="mb-4 rounded-xl border border-success/30 bg-success/5 text-success text-sm px-4 py-3 flex gap-2"><Check size={18} /> Contraseña actualizada correctamente.</div>}
      {errors.form && <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm px-4 py-3">{errors.form}</div>}

      <form onSubmit={submit} className="card p-5 space-y-4" noValidate>
        <h2 className="font-medium text-sm">Cambiar contraseña</h2>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Contraseña actual</label>
          <PasswordInput value={current} onChange={setCurrent} error={errors.current} />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Nueva contraseña</label>
          <PasswordInput value={next} onChange={setNext} autoComplete="new-password" error={errors.next} />
          <PasswordStrengthMeter value={next} />
        </div>
        <div>
          <label className="block text-xs font-medium text-ink-soft mb-1.5">Confirmar nueva contraseña</label>
          <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full h-12 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70">
          {loading ? (<><Loader2 size={18} className="animate-spin" /> Actualizando…</>) : "Actualizar contraseña"}
        </button>
      </form>
    </div>
  );
}
