import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { STORE } from "@/lib/store-config";
import { CATEGORIES } from "@/lib/mock-data";
import { whatsappLink } from "@/lib/whatsapp";

function IconInstagram({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function IconFacebook({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="mt-16 bg-dark text-white/80">
      <div className="container-x py-12 grid gap-10 md:grid-cols-4">
        <div>
          <span className="font-display text-2xl font-700 text-white">
            Urban<span className="text-gold">Caps</span>
          </span>
          <p className="mt-3 text-sm leading-relaxed text-white/60 max-w-xs">
            {STORE.tagline}
          </p>
          <div className="flex gap-3 mt-5">
            <a href={STORE.social.instagram} target="_blank" rel="noopener" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-white transition-colors" aria-label="Instagram">
              <IconInstagram />
            </a>
            <a href={STORE.social.facebook} target="_blank" rel="noopener" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-white transition-colors" aria-label="Facebook">
              <IconFacebook />
            </a>
            <a href={whatsappLink()} target="_blank" rel="noopener" className="p-2 rounded-full bg-white/10 hover:bg-gold hover:text-white transition-colors" aria-label="WhatsApp">
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="eyebrow text-gold-soft mb-4">Comprar</h4>
          <ul className="space-y-2.5 text-sm">
            {CATEGORIES.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-white transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-gold-soft mb-4">Ayuda</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/envios" className="hover:text-white transition-colors">Envíos y entregas</Link></li>
            <li><Link href="/cuenta" className="hover:text-white transition-colors">Mi cuenta</Link></li>
            <li><Link href="/favoritos" className="hover:text-white transition-colors">Favoritos</Link></li>
            <li><a href={whatsappLink()} target="_blank" rel="noopener" className="hover:text-white transition-colors">Hablar por WhatsApp</a></li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-gold-soft mb-4">Contacto</h4>
          <ul className="space-y-2.5 text-sm text-white/70">
            <li>{STORE.city}</li>
            <li>{STORE.phone}</li>
            <li>{STORE.email}</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2 text-[10px] text-white/50">
            <span className="px-2 py-1 rounded bg-white/10">Wompi</span>
            <span className="px-2 py-1 rounded bg-white/10">PSE</span>
            <span className="px-2 py-1 rounded bg-white/10">Nequi</span>
            <span className="px-2 py-1 rounded bg-white/10">Mercado Pago</span>
            <span className="px-2 py-1 rounded bg-white/10">Contra entrega</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/50">
          <p>© {new Date().getFullYear()} {STORE.name}. Todos los derechos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-white transition-colors">Panel de administración</Link>
            <span>Precios en COP · Hecho en Colombia 🇨🇴</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
