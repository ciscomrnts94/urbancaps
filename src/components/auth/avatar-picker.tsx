"use client";

import { useRef, useState } from "react";
import { Camera, Plus, Trash2, RefreshCw } from "lucide-react";
import { optimizeAvatar } from "@/lib/image";

/**
 * Selector de foto de perfil: círculo grande con preview.
 * Permite elegir desde galería o cámara (móvil), optimiza la imagen y
 * entrega el File listo para subir mediante onPick.
 */
export default function AvatarPicker({
  initialUrl,
  size = 112,
  onPick,
}: {
  initialUrl?: string | null;
  size?: number;
  onPick: (file: File | null, previewUrl: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [busy, setBusy] = useState(false);

  async function handleFile(f: File | null) {
    if (!f) return;
    setBusy(true);
    try {
      const optimized = await optimizeAvatar(f);
      const url = URL.createObjectURL(optimized);
      setPreview(url);
      onPick(optimized, url);
    } finally {
      setBusy(false);
    }
  }

  function remove() {
    setPreview(null);
    onPick(null, null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative rounded-full grid place-items-center overflow-hidden ring-2 ring-gold-soft hover:ring-gold transition-all"
        style={{ width: size, height: size, background: preview ? undefined : "linear-gradient(135deg, var(--gold-tint), #fff)" }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Foto de perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="flex flex-col items-center text-gold-strong">
            <Plus size={26} />
            <span className="text-[11px] mt-0.5 font-medium">Agregar foto</span>
          </span>
        )}
        {busy && <span className="absolute inset-0 bg-black/40 grid place-items-center"><RefreshCw size={20} className="text-white animate-spin" /></span>}
        <span className="absolute bottom-0 inset-x-0 bg-black/45 text-white py-1 grid place-items-center">
          <Camera size={14} />
        </span>
      </button>

      {preview && (
        <div className="flex gap-3 text-xs">
          <button type="button" onClick={() => inputRef.current?.click()} className="text-gold-strong hover:underline inline-flex items-center gap-1">
            <RefreshCw size={12} /> Cambiar
          </button>
          <button type="button" onClick={remove} className="text-danger hover:underline inline-flex items-center gap-1">
            <Trash2 size={12} /> Eliminar
          </button>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif"
        capture="user"
        hidden
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
