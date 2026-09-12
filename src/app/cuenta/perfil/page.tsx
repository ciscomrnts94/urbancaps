"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, Check } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import AvatarPicker from "@/components/auth/avatar-picker";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { uploadAvatar } from "@/app/auth-actions";
import { DEPARTMENTS, citiesFor } from "@/lib/colombia";
import { fullName } from "@/lib/auth/types";

export default function PerfilPage() {
  const { profile, user, refreshProfile, loading } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [department, setDepartment] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name ?? "");
      setLastName(profile.last_name ?? "");
      setPhone(profile.phone ?? "");
      setWhatsapp(profile.whatsapp ?? "");
      setDepartment(profile.department ?? "");
      setCity(profile.city ?? "");
    }
  }, [profile]);

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    setUploadingPhoto(true);
    const fd = new FormData();
    fd.append("file", file);
    await uploadAvatar(fd);
    await refreshProfile();
    setUploadingPhoto(false);
  }

  async function save() {
    if (!user) return;
    setSaving(true);
    const supabase = supabaseBrowser();
    await supabase.from("profiles").update({
      first_name: firstName.trim(), last_name: lastName.trim(),
      phone: phone.trim(), whatsapp: whatsapp.trim(),
      department: department || null, city: city || null,
    }).eq("id", user.id);
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const inputC = "w-full border border-line-strong rounded-xl px-3.5 h-12 text-sm outline-none focus:border-gold bg-bg";
  const labelC = "block text-xs font-medium text-ink-soft mb-1.5";

  return (
    <div className="container-x py-6 max-w-2xl">
      <Link href="/cuenta" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4"><ArrowLeft size={16} /> Mi cuenta</Link>
      <h1 className="font-display text-2xl md:text-3xl font-700 mb-6">Mi perfil</h1>

      {loading ? (
        <div className="space-y-4"><div className="skeleton h-28 rounded-2xl" /><div className="skeleton h-64 rounded-2xl" /></div>
      ) : (
        <>
          {/* Foto */}
          <div className="card p-6 mb-4 flex flex-col items-center text-center">
            <div className="relative">
              <AvatarPicker initialUrl={profile?.avatar_url} size={110} onPick={onPickAvatar} />
              {uploadingPhoto && <p className="text-xs text-gold-strong mt-2 flex items-center gap-1 justify-center"><Loader2 size={12} className="animate-spin" /> Subiendo foto…</p>}
            </div>
            <p className="font-display text-lg font-600 mt-3">{fullName(profile) || "Sin nombre"}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>

          {/* Datos */}
          <div className="card p-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelC}>Nombre</label><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputC} /></div>
              <div><label className={labelC}>Apellido</label><input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputC} /></div>
              <div><label className={labelC}>Teléfono</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputC} placeholder="300 123 4567" /></div>
              <div><label className={labelC}>WhatsApp</label><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className={inputC} placeholder="300 123 4567" /></div>
              <div>
                <label className={labelC}>Departamento</label>
                <select value={department} onChange={(e) => { setDepartment(e.target.value); setCity(""); }} className={inputC}>
                  <option value="">Selecciona…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className={labelC}>Ciudad</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} disabled={!department} className={`${inputC} disabled:opacity-50`}>
                  <option value="">{department ? "Selecciona…" : "Elige departamento"}</option>
                  {citiesFor(department).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelC}>Correo electrónico</label><input value={user?.email ?? ""} disabled className={`${inputC} opacity-60`} /></div>
          </div>

          <button onClick={save} disabled={saving} className="btn-gold w-full h-12 text-sm mt-5 inline-flex items-center justify-center gap-2 disabled:opacity-70">
            {saving ? (<><Loader2 size={18} className="animate-spin" /> Guardando…</>) : saved ? (<><Check size={18} /> Guardado</>) : (<><Save size={17} /> Guardar cambios</>)}
          </button>
        </>
      )}
    </div>
  );
}
