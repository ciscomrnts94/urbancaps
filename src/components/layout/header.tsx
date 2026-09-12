"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Search, ShoppingBag, Heart, User, Menu, X, Package, MapPin, Settings, Store } from "lucide-react";
import { STORE } from "@/lib/store-config";
import { CATEGORIES } from "@/lib/mock-data";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { useFavorites } from "@/lib/favorites-store";
import { useAuth } from "@/components/auth/auth-provider";
import Avatar from "@/components/auth/avatar";
import LogoutButton from "@/components/auth/logout-button";
import { fullName } from "@/lib/auth/types";

export default function Header() {
  const router = useRouter();
  const hydrated = useHydrated();
  const count = useCart((s) => s.itemCount());
  const openDrawer = useCart((s) => s.openDrawer);
  const favCount = useFavorites((s) => s.ids.length);
  const { user, profile } = useAuth();
  const isAdmin = profile?.role === "store_admin" || profile?.role === "super_admin";

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [q, setQ] = useState("");
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/buscar?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
      setMenuOpen(false);
    }
  }

  const accountLinks = [
    { href: "/cuenta", label: "Mi cuenta", icon: User },
    { href: "/cuenta/pedidos", label: "Mis pedidos", icon: Package },
    { href: "/favoritos", label: "Favoritos", icon: Heart },
    { href: "/cuenta/direcciones", label: "Direcciones", icon: MapPin },
    { href: "/cuenta/seguridad", label: "Seguridad", icon: Settings },
  ];

  return (
    <>
      <div className="bg-ink text-white text-[11px] md:text-xs tracking-wide text-center py-2 px-4">
        Envío <span className="text-gold-soft font-semibold">GRATIS</span> en compras superiores a $200.000 · Pago contra entrega disponible
      </div>

      <header className="sticky top-0 z-40 bg-bg/95 backdrop-blur border-b border-line">
        <div className="container-x flex items-center gap-3 h-[var(--header-h)]">
          <button aria-label="Menú" className="md:hidden -ml-1 p-2 rounded-lg hover:bg-bg-soft" onClick={() => setMenuOpen(true)}>
            <Menu size={22} />
          </button>

          <Link href="/" className="flex items-center gap-2 mr-auto md:mr-0">
            <span className="font-display text-xl md:text-2xl font-700 tracking-tight">
              Urban<span className="text-gold">Caps</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 mx-auto text-sm font-medium">
            {CATEGORIES.slice(0, 6).map((c) => (
              <Link key={c.id} href={`/categoria/${c.slug}`} className="text-ink-soft hover:text-gold-strong transition-colors">
                {c.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-2">
            <button aria-label="Buscar" className="p-2 rounded-lg hover:bg-bg-soft" onClick={() => setSearchOpen((v) => !v)}>
              <Search size={20} />
            </button>
            <Link href="/favoritos" aria-label="Favoritos" className="hidden md:inline-flex relative p-2 rounded-lg hover:bg-bg-soft">
              <Heart size={20} />
              {hydrated && favCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 grid place-items-center px-1">{favCount}</span>
              )}
            </Link>

            {/* Usuario (desktop) */}
            <div ref={userRef} className="hidden md:block relative">
              {hydrated && user ? (
                <button onClick={() => setUserMenu((v) => !v)} className="p-1 rounded-full hover:ring-2 hover:ring-gold-soft transition-all" aria-label="Cuenta">
                  <Avatar profile={profile} size={30} />
                </button>
              ) : (
                <Link href="/login" aria-label="Ingresar" className="p-2 rounded-lg hover:bg-bg-soft inline-flex"><User size={20} /></Link>
              )}

              {userMenu && user && (
                <div className="absolute right-0 top-full mt-2 w-60 card shadow-lg p-2 animate-fade-up">
                  <div className="flex items-center gap-3 px-2 py-2 border-b border-line mb-1">
                    <Avatar profile={profile} size={38} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{fullName(profile) || "Mi cuenta"}</p>
                      <p className="text-xs text-muted truncate">{user.email}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-gold-strong hover:bg-bg-soft">
                      <Store size={16} /> Panel de administración
                    </Link>
                  )}
                  {accountLinks.map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setUserMenu(false)} className="flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm hover:bg-bg-soft">
                      <l.icon size={16} className="text-muted" /> {l.label}
                    </Link>
                  ))}
                  <div className="border-t border-line mt-1 pt-1">
                    <LogoutButton variant="menu" className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm text-danger hover:bg-danger/5" />
                  </div>
                </div>
              )}
            </div>

            <button aria-label="Carrito" onClick={openDrawer} className="relative p-2 rounded-lg hover:bg-bg-soft">
              <ShoppingBag size={20} />
              {hydrated && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 grid place-items-center px-1">{count}</span>
              )}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-line bg-bg animate-fade-up">
            <form onSubmit={submitSearch} className="container-x py-3 flex items-center gap-2">
              <Search size={18} className="text-muted" />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar productos, categorías…" className="flex-1 bg-transparent outline-none text-sm py-1" />
              <button type="button" onClick={() => setSearchOpen(false)} className="p-1 text-muted hover:text-ink"><X size={18} /></button>
            </form>
          </div>
        )}
      </header>

      {/* Menú lateral (móvil) */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-[85%] max-w-xs bg-bg shadow-lg flex flex-col animate-fade-up pt-safe">
            <div className="flex items-center justify-between px-5 h-[var(--header-h)] border-b border-line">
              <span className="font-display text-xl font-700">Urban<span className="text-gold">Caps</span></span>
              <button onClick={() => setMenuOpen(false)} className="p-2" aria-label="Cerrar"><X size={22} /></button>
            </div>

            {/* Usuario en móvil */}
            {hydrated && user ? (
              <Link href="/cuenta" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-5 py-4 border-b border-line hover:bg-bg-soft">
                <Avatar profile={profile} size={44} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{fullName(profile) || "Mi cuenta"}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                </div>
              </Link>
            ) : (
              <div className="px-5 py-4 border-b border-line flex gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="btn-gold flex-1 h-10 grid place-items-center text-sm">Iniciar sesión</Link>
                <Link href="/registro" onClick={() => setMenuOpen(false)} className="btn-outline flex-1 h-10 grid place-items-center text-sm">Crear cuenta</Link>
              </div>
            )}

            <form onSubmit={submitSearch} className="px-5 py-4 border-b border-line flex items-center gap-2">
              <Search size={18} className="text-muted" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar…" className="flex-1 bg-transparent outline-none text-sm" />
            </form>

            <nav className="flex-1 overflow-y-auto py-2">
              <p className="eyebrow px-5 pt-3 pb-1">Categorías</p>
              {CATEGORIES.map((c) => (
                <Link key={c.id} href={`/categoria/${c.slug}`} onClick={() => setMenuOpen(false)} className="block px-5 py-3 text-[15px] hover:bg-bg-soft border-b border-line/60">
                  {c.name}
                </Link>
              ))}
              {hydrated && user && (
                <>
                  <p className="eyebrow px-5 pt-5 pb-1">Mi cuenta</p>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-5 py-3 text-[15px] text-gold-strong hover:bg-bg-soft"><Store size={17} /> Panel de administración</Link>
                  )}
                  {accountLinks.map((l) => (
                    <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="flex items-center gap-2.5 px-5 py-3 text-[15px] hover:bg-bg-soft">
                      <l.icon size={17} className="text-muted" /> {l.label}
                    </Link>
                  ))}
                  <div className="px-5 py-3">
                    <LogoutButton className="text-danger text-[15px]" />
                  </div>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
