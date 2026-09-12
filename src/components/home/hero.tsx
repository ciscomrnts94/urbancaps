import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="container-x pt-4 md:pt-8">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-dark text-white min-h-[440px] md:min-h-[520px] flex items-end">
        {/* Fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-70"
          style={{ backgroundImage: "url(https://picsum.photos/seed/urbancaps-hero/1400/900)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />

        <div className="relative p-7 md:p-14 max-w-xl animate-fade-up">
          <p className="eyebrow text-gold-soft mb-3">Nueva colección · 2026</p>
          <h1 className="font-display text-4xl md:text-6xl font-700 leading-[1.05]">
            Estilo urbano,
            <br />
            <span className="text-gold">acabado premium</span>
          </h1>
          <p className="mt-4 text-white/75 text-sm md:text-base max-w-md">
            Gorras, ropa y accesorios seleccionados. Envíos a toda Colombia y pago contra entrega.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/categorias" className="btn-gold px-6 py-3.5 text-sm inline-flex items-center gap-2">
              Comprar ahora <ArrowRight size={16} />
            </Link>
            <Link
              href="/categoria/gorras"
              className="px-6 py-3.5 text-sm font-semibold rounded-[var(--radius)] border border-white/40 text-white hover:bg-white hover:text-ink transition-colors"
            >
              Ver gorras
            </Link>
          </div>
        </div>
      </div>

      {/* Franja de beneficios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
        {[
          { t: "Envío nacional", s: "Gratis desde $200.000" },
          { t: "Pago seguro", s: "Wompi · PSE · Nequi" },
          { t: "Contra entrega", s: "En ciudades principales" },
          { t: "Cambios fáciles", s: "Hasta 15 días" },
        ].map((b) => (
          <div key={b.t} className="card px-4 py-3 text-center md:text-left">
            <p className="text-sm font-semibold">{b.t}</p>
            <p className="text-xs text-muted">{b.s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
