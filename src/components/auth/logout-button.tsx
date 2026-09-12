"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";

export default function LogoutButton({
  className = "",
  variant = "button",
}: {
  className?: string;
  variant?: "button" | "menu";
}) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {variant === "menu" ? (
        <button onClick={() => setOpen(true)} className={className}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className={`inline-flex items-center gap-2 ${className}`}>
          <LogOut size={16} /> Cerrar sesión
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => !busy && setOpen(false)} />
          <div className="relative bg-bg rounded-2xl shadow-lg w-full max-w-sm p-6 text-center animate-fade-up">
            <div className="w-12 h-12 rounded-full bg-danger/10 grid place-items-center mx-auto mb-3 text-danger">
              <LogOut size={22} />
            </div>
            <h3 className="font-display text-lg font-600">¿Quieres cerrar tu sesión?</h3>
            <p className="text-sm text-muted mt-1">Tendrás que iniciar sesión de nuevo para continuar.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setOpen(false)} disabled={busy} className="btn-outline flex-1 h-11 text-sm">Cancelar</button>
              <button onClick={confirm} disabled={busy} className="flex-1 h-11 text-sm rounded-[var(--radius)] bg-danger text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-70">
                {busy ? <Loader2 size={16} className="animate-spin" /> : "Cerrar sesión"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
