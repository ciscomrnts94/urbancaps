"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";

export default function BottomNav() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const cartCount = useCart((s) => s.itemCount());
  const openDrawer = useCart((s) => s.openDrawer);
  const favCount = useFavorites((s) => s.ids.length);

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg/95 backdrop-blur border-t border-line pb-safe">
      <div className="grid grid-cols-5 h-[var(--bottomnav-h)]">
        {/* 4 links + botón carrito */}
        {[
          { href: "/", label: "Inicio", icon: Home },
          { href: "/categorias", label: "Categorías", icon: LayoutGrid },
          { href: "/buscar", label: "Buscar", icon: Search },
          { href: "/favoritos", label: "Favoritos", icon: Heart, badge: hydrated ? favCount : 0 },
        ].map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 relative"
            >
              {active && <span className="absolute top-0 w-8 h-1 rounded-full" style={{ background: "linear-gradient(90deg, var(--gold), var(--gold-strong))" }} />}
              <div className="relative">
                <Icon
                  size={22}
                  className={active ? "text-gold-strong" : "text-muted"}
                  strokeWidth={active ? 2.4 : 2}
                />
                {typeof badge === "number" && badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-gold text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] grid place-items-center px-1">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${active ? "text-gold-strong font-semibold" : "text-muted"}`}>
                {label}
              </span>
            </Link>
          );
        })}

        <button
          onClick={openDrawer}
          className="flex flex-col items-center justify-center gap-1 relative"
          aria-label="Carrito"
        >
          <div className="relative">
            <ShoppingBag size={22} className="text-muted" />
            {hydrated && cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-gold text-white text-[9px] font-bold rounded-full min-w-[15px] h-[15px] grid place-items-center px-1">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] text-muted">Carrito</span>
        </button>
      </div>
    </nav>
  );
}
