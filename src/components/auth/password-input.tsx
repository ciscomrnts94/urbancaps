"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { passwordStrength } from "@/lib/auth/validation";

export function PasswordInput({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "current-password",
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <div className={`flex items-center border rounded-xl px-3.5 h-12 bg-bg transition-colors ${error ? "border-danger" : "border-line-strong focus-within:border-gold"}`}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="text-muted hover:text-ink p-1" aria-label={show ? "Ocultar" : "Mostrar"}>
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}

export function PasswordStrengthMeter({ value }: { value: string }) {
  if (!value) return null;
  const s = passwordStrength(value);
  const colors = ["#c0392b", "#e08a2b", "#c9a227", "#2e7d5b", "#2e7d5b"];
  const req = [
    { ok: s.checks.length, label: "8+ caracteres" },
    { ok: s.checks.upper, label: "Mayúscula" },
    { ok: s.checks.lower, label: "Minúscula" },
    { ok: s.checks.number, label: "Número" },
    { ok: s.checks.special, label: "Símbolo" },
  ];
  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ background: i <= s.score ? colors[s.score] : "var(--line-strong)" }} />
        ))}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs font-medium" style={{ color: colors[s.score] }}>{s.label}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
        {req.map((r) => (
          <span key={r.label} className={`text-[11px] inline-flex items-center gap-1 ${r.ok ? "text-success" : "text-muted-soft"}`}>
            {r.ok ? <Check size={11} /> : <X size={11} />} {r.label}
          </span>
        ))}
      </div>
    </div>
  );
}
