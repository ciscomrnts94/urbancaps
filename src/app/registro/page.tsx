"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Loader2, AlertCircle, Mail, Phone, User } from "lucide-react";
import AuthShell from "@/components/auth/auth-shell";
import AvatarPicker from "@/components/auth/avatar-picker";
import { PasswordInput, PasswordStrengthMeter } from "@/components/auth/password-input";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { registerUser, uploadAvatar } from "@/app/auth-actions";
import { validEmail, validPhoneCO, passwordMeetsMin, friendlyAuthError } from "@/lib/auth/validation";

type Errors = Record<string, string>;

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("Creando cuenta…");

  function validateStep(s: number): boolean {
    const e: Errors = {};
    if (s === 1) {
      if (!firstName.trim()) e.firstName = "Ingresa tu nombre.";
      if (!lastName.trim()) e.lastName = "Ingresa tu apellido.";
    }
    if (s === 2) {
      if (!validEmail(email)) e.email = "El correo electrónico no es válido.";
      if (!validPhoneCO(phone)) e.phone = "Ingresa un teléfono válido.";
      if (!passwordMeetsMin(password)) e.password = "Mínimo 8 caracteres, con una letra y un número.";
      if (confirm !== password) e.confirm = "Las contraseñas no coinciden.";
    }
    if (s === 3) {
      if (!terms) e.terms = "Debes aceptar los términos y condiciones.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(3, s + 1));
  }
  function back() {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  }

  async function submit() {
    if (!validateStep(3)) return;
    setLoading(true);
    setLoadingLabel("Creando cuenta…");
    try {
      const reg = await registerUser({ email, password, firstName, lastName, phone });
      if (!reg.ok) {
        setErrors({ form: friendlyAuthError(reg.error) });
        if ((reg.error ?? "").toLowerCase().includes("registered") || (reg.error ?? "").toLowerCase().includes("exists")) setStep(2);
        setLoading(false);
        return;
      }
      // Iniciar sesión
      const supabase = supabaseBrowser();
      const { error: signErr } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signErr) {
        setErrors({ form: friendlyAuthError(signErr.message) });
        setLoading(false);
        return;
      }
      // Subir foto (si hay)
      if (avatarFile) {
        setLoadingLabel("Subiendo foto…");
        const fd = new FormData();
        fd.append("file", avatarFile);
        await uploadAvatar(fd);
      }
      router.push("/cuenta");
      router.refresh();
    } catch {
      setErrors({ form: "Ocurrió un error. Inténtalo de nuevo." });
      setLoading(false);
    }
  }

  const inputBase = (err?: string) =>
    `flex items-center border rounded-xl px-3.5 h-12 bg-bg transition-colors ${err ? "border-danger" : "border-line-strong focus-within:border-gold"}`;

  return (
    <AuthShell brandTitle={"Únete a\nUrbanCaps"} brandSubtitle="Crea tu cuenta y disfruta una experiencia de compra personalizada.">
      <div className="mb-6">
        <h2 className="font-display text-3xl font-700">Crea tu cuenta</h2>
        <p className="text-muted mt-1.5 text-sm">Únete y disfruta de una experiencia de compra personalizada.</p>
      </div>

      {/* Progreso */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted mb-1.5">
          <span>Paso {step} de 3</span>
          <span>{step === 1 ? "Información personal" : step === 2 ? "Cuenta" : "Confirmación"}</span>
        </div>
        <div className="h-1.5 rounded-full bg-bg-soft overflow-hidden">
          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(step / 3) * 100}%`, background: "linear-gradient(to right, var(--gold), var(--gold-strong))" }} />
        </div>
      </div>

      {errors.form && (
        <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 text-danger text-sm px-4 py-3 flex gap-2">
          <AlertCircle size={18} className="shrink-0" /> {errors.form}
        </div>
      )}

      {/* Paso 1 */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-up">
          <div className="flex justify-center py-2">
            <AvatarPicker onPick={(f) => setAvatarFile(f)} />
          </div>
          <Field label="Nombre" error={errors.firstName}>
            <div className={inputBase(errors.firstName)}>
              <User size={18} className="text-muted mr-2" />
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Carlos" autoComplete="given-name" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </Field>
          <Field label="Apellido" error={errors.lastName}>
            <div className={inputBase(errors.lastName)}>
              <User size={18} className="text-muted mr-2" />
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Mendoza" autoComplete="family-name" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </Field>
          <button onClick={next} className="btn-gold w-full h-12 text-sm inline-flex items-center justify-center gap-2">
            Continuar <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* Paso 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-fade-up">
          <Field label="Correo electrónico" error={errors.email}>
            <div className={inputBase(errors.email)}>
              <Mail size={18} className="text-muted mr-2" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" autoComplete="email" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </Field>
          <Field label="Teléfono / WhatsApp" error={errors.phone}>
            <div className={inputBase(errors.phone)}>
              <Phone size={18} className="text-muted mr-2" />
              <span className="text-sm text-muted mr-1">+57</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="300 123 4567" autoComplete="tel" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
          </Field>
          <Field label="Contraseña">
            <PasswordInput value={password} onChange={setPassword} autoComplete="new-password" error={errors.password} />
            <PasswordStrengthMeter value={password} />
          </Field>
          <Field label="Confirmar contraseña">
            <PasswordInput value={confirm} onChange={setConfirm} autoComplete="new-password" error={errors.confirm} />
          </Field>
          <div className="flex gap-3 pt-1">
            <button onClick={back} className="btn-outline h-12 px-5 text-sm inline-flex items-center gap-1"><ArrowLeft size={16} /> Atrás</button>
            <button onClick={next} className="btn-gold flex-1 h-12 text-sm inline-flex items-center justify-center gap-2">Continuar <ArrowRight size={17} /></button>
          </div>
        </div>
      )}

      {/* Paso 3 */}
      {step === 3 && (
        <div className="space-y-5 animate-fade-up">
          <div className="card p-4 space-y-2 text-sm">
            <p className="font-medium">Revisa tus datos</p>
            <div className="text-muted space-y-1">
              <p>{firstName} {lastName}</p>
              <p>{email}</p>
              <p>+57 {phone}</p>
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="accent-[var(--gold-strong)] w-4 h-4 mt-0.5" />
            <span className="text-sm text-ink-soft">Acepto los <span className="text-gold-strong">términos y condiciones</span> y la <span className="text-gold-strong">política de privacidad</span>.</span>
          </label>
          {errors.terms && <p className="text-xs text-danger -mt-2">{errors.terms}</p>}
          <div className="flex gap-3">
            <button onClick={back} disabled={loading} className="btn-outline h-12 px-5 text-sm inline-flex items-center gap-1"><ArrowLeft size={16} /> Atrás</button>
            <button onClick={submit} disabled={loading} className="btn-gold flex-1 h-12 text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? (<><Loader2 size={18} className="animate-spin" /> {loadingLabel}</>) : "Crear cuenta"}
            </button>
          </div>
        </div>
      )}

      <p className="text-center text-sm text-muted mt-8">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="text-gold-strong font-medium hover:underline">Iniciar sesión</Link>
      </p>
    </AuthShell>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-soft mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}
