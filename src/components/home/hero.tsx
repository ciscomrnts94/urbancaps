import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="px-4 md:px-8 pt-3 md:pt-6">
      <div className="relative overflow-hidden rounded-[26px] bg-dark text-white min-h-[72vh] md:min-h-[62vh] flex items-end animate-scale-in">
        {/* Fondo */}
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: "url(https://picsum.photos/seed/urbancaps-hero2/1200/1500)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/40 to-transparent" />

        {/* Etiqueta superior */}
        <div className="absolute top-5 left-5">
          <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase font-semibold text-white/90 bg-white/10 badge-float rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" /> Nueva colección · 2026
          </span>
        </div>

        <div className="relative p-6 md:p-12 pb-8 w-full">
          <h1 className="font-display text-[42px] leading-[0.98] md:text-6xl font-700">
            Descubre tu
            <br />
            <span className="text-gold">próximo estilo</span>
          </h1>
          <p className="mt-3.5 text-white/75 text-[15px] max-w-sm leading-relaxed">
            Gorras, ropa y accesorios premium. Envíos a toda Colombia y pago contra entrega.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/categorias" className="btn-gold btn-pill px-7 py-3.5 text-sm inline-flex items-center gap-2">
              Comprar ahora <ArrowRight size={16} />
            </Link>
            <Link
              href="/categoria/gorras"
              className="btn-pill px-6 py-3.5 text-sm font-semibold border border-white/40 text-white hover:bg-white hover:text-ink transition-colors backdrop-blur-sm"
            >
              Ver gorras
            </Link>
          </div>
        </div>
      </div>

      {/* Franja de beneficios (scroll horizontal en móvil) */}
      <div className="flex md:grid md:grid-cols-4 gap-2.5 mt-3 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {[
          { t: "Envío gratis", s: "Desde $200.000" },
          { t: "Pago seguro", s: "Wompi · PSE · Nequi" },
          { t: "Contra entrega", s: "Ciudades principales" },
          { t: "Cambios fáciles", s: "Hasta 15 días" },
        ].map((b) => (
          <div key={b.t} className="shrink-0 min-w-[46%] md:min-w-0 rounded-2xl bg-bg-warm border border-line px-4 py-3">
            <p className="text-[13px] font-600">{b.t}</p>
            <p className="text-[11px] text-muted mt-0.5">{b.s}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
