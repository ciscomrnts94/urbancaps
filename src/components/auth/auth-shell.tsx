import Link from "next/link";

/**
 * Layout premium para pantallas de autenticación.
 * Desktop: composición dividida (marca a la izquierda, formulario a la derecha).
 * Móvil: vertical, optimizado para una mano.
 */
export default function AuthShell({
  children,
  brandTitle = "Estilo urbano,\nacabado premium",
  brandSubtitle = "Moda y accesorios seleccionados. Envíos a toda Colombia.",
}: {
  children: React.ReactNode;
  brandTitle?: string;
  brandSubtitle?: string;
}) {
  return (
    <div className="min-h-screen flex bg-bg">
      {/* Panel de marca (desktop) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-dark text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: "url(https://picsum.photos/seed/urbancaps-auth/1200/1600)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="relative flex flex-col justify-between p-12 xl:p-16 w-full animate-fade-up">
          <Link href="/" className="font-display text-2xl font-700">
            Urban<span className="text-gold">Caps</span>
          </Link>
          <div>
            <p className="eyebrow text-gold-soft mb-3">Bienvenido</p>
            <h1 className="font-display text-4xl xl:text-5xl font-700 leading-[1.1] whitespace-pre-line">
              {brandTitle}
            </h1>
            <p className="mt-4 text-white/70 max-w-sm">{brandSubtitle}</p>
          </div>
          <p className="text-xs text-white/40">© {new Date().getFullYear()} UrbanCaps · Hecho en Colombia 🇨🇴</p>
        </div>
      </div>

      {/* Área del formulario */}
      <div className="flex-1 flex flex-col">
        {/* Encabezado móvil */}
        <div className="lg:hidden pt-safe">
          <div className="px-5 h-16 flex items-center justify-between">
            <Link href="/" className="font-display text-xl font-700">
              Urban<span className="text-gold">Caps</span>
            </Link>
            <Link href="/" className="text-sm text-muted hover:text-ink">Tienda</Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-5 py-8">
          <div className="w-full max-w-[400px] animate-fade-up">{children}</div>
        </div>
      </div>
    </div>
  );
}
