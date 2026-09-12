"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, Loader2, MailCheck } from "lucide-react";
import AuthShell from "@/components/auth/auth-shell";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { validEmail } from "@/lib/auth/validation";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validEmail(email)) { setError("El correo electrónico no es válido."); return; }
    setLoading(true);
    const supabase = supabaseBrowser();
    // No revelamos si el correo existe o no (evita enumeración de cuentas).
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/restablecer`,
    });
    setLoading(false);
    setSent(true);
  }

  return (
    <AuthShell brandTitle={"Recupera\ntu cuenta"} brandSubtitle="Te ayudamos a volver a tu cuenta de forma segura.">
      {sent ? (
        <div className="text-center animate-fade-up">
          <div className="w-16 h-16 rounded-full bg-gold-tint grid place-items-center mx-auto mb-5">
            <MailCheck size={30} className="text-gold-strong" />
          </div>
          <h2 className="font-display text-2xl font-700">Revisa tu correo</h2>
          <p className="text-muted mt-2 text-sm">
            Si existe una cuenta con <b>{email}</b>, te enviamos instrucciones para restablecer tu contraseña.
          </p>
          <Link href="/login" className="btn-dark inline-flex items-center gap-2 px-6 h-12 text-sm mt-6">
            <ArrowLeft size={16} /> Volver al login
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="font-display text-3xl font-700">Recuperar contraseña</h2>
            <p className="text-muted mt-1.5 text-sm">Ingresa tu correo y te enviaremos instrucciones para recuperar tu cuenta.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-medium text-ink-soft mb-1.5">Correo electrónico</label>
              <div className={`flex items-center border rounded-xl px-3.5 h-12 bg-bg transition-colors ${error ? "border-danger" : "border-line-strong focus-within:border-gold"}`}>
                <Mail size={18} className="text-muted mr-2" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" className="flex-1 bg-transparent outline-none text-sm" />
              </div>
              {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full h-12 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Enviando…</>) : "Enviar instrucciones"}
            </button>
          </form>
          <p className="text-center text-sm text-muted mt-8">
            <Link href="/login" className="text-gold-strong font-medium hover:underline inline-flex items-center gap-1"><ArrowLeft size={14} /> Volver al login</Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
