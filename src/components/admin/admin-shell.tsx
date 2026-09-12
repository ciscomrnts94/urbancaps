"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tags, Ticket,
  Palette, Store, Menu, X, ExternalLink,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/pedidos", label: "Pedidos", icon: ShoppingCart },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/cupones", label: "Cupones", icon: Ticket },
  { href: "/admin/personalizar", label: "Personalizar tienda", icon: Palette },
];

function NavLinks({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-gold-tint text-gold-strong" : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-soft flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-dark text-white fixed inset-y-0 left-0">
        <div className="h-16 flex items-center px-5 border-b border-white/10">
          <Link href="/admin" className="font-display text-xl font-700">
            Urban<span className="text-gold">Caps</span>
            <span className="block text-[10px] tracking-widest text-white/50 font-sans font-normal">PANEL ADMIN</span>
          </Link>
        </div>
        <NavLinks pathname={pathname} />
        <div className="p-3 border-t border-white/10">
          <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white">
            <Store size={18} /> Ver tienda <ExternalLink size={13} className="ml-auto" />
          </Link>
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex-1 lg:ml-64 min-w-0">
        {/* Top bar móvil */}
        <div className="lg:hidden sticky top-0 z-30 bg-dark text-white h-14 flex items-center px-4 gap-3">
          <button onClick={() => setOpen(true)} aria-label="Menú"><Menu size={22} /></button>
          <span className="font-display text-lg font-700">Urban<span className="text-gold">Caps</span> Admin</span>
        </div>

        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </div>

      {/* Drawer móvil */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 inset-y-0 w-64 bg-dark text-white flex flex-col">
            <div className="h-14 flex items-center justify-between px-5 border-b border-white/10">
              <span className="font-display text-lg font-700">Urban<span className="text-gold">Caps</span></span>
              <button onClick={() => setOpen(false)} aria-label="Cerrar"><X size={20} /></button>
            </div>
            <NavLinks pathname={pathname} onClick={() => setOpen(false)} />
            <div className="p-3 border-t border-white/10">
              <Link href="/" className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/10">
                <Store size={18} /> Ver tienda
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
