"use client";

import Image from "next/image";
import type { Profile } from "@/lib/auth/types";
import { initials } from "@/lib/auth/types";

/** Avatar del usuario: muestra la foto o, si no hay, sus iniciales en dorado. */
export default function Avatar({
  profile,
  size = 40,
  className = "",
}: {
  profile?: Profile | null;
  size?: number;
  className?: string;
}) {
  const url = profile?.avatar_url;
  const dim = { width: size, height: size };

  if (url) {
    return (
      <span
        className={`relative inline-block rounded-full overflow-hidden bg-bg-soft ring-1 ring-gold-soft ${className}`}
        style={dim}
      >
        <Image src={url} alt={initials(profile)} fill sizes={`${size}px`} className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`inline-grid place-items-center rounded-full text-white font-600 ring-1 ring-gold-strong/30 ${className}`}
      style={{
        ...dim,
        background: "linear-gradient(135deg, var(--gold), var(--gold-strong))",
        fontSize: size * 0.4,
      }}
      aria-hidden
    >
      {initials(profile)}
    </span>
  );
}
