"use client";

import Link from "next/link";
import { useState } from "react";
import { Package, Heart, MapPin, User, Shield, Settings, ChevronRight, ShieldCheck, Store, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import Avatar from "@/components/auth/avatar";
import LogoutButton from "@/components/auth/logout-button";
import { fullName } from "@/lib/auth/types";
import { useOrders, ORDER_STATUS_LABEL } from "@/lib/orders-store";
import { useFavorites } from "@/lib/favorites-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { formatCOP, formatDateCO } from "@/lib/format";
import { claimAdminIfFirst } from "@/app/auth-actions";
import { useRouter } from "next/navigation";

const CARDS = [
  { href: "/cuenta/perfil", icon: User, label: "Mi perfil", desc: "Datos personales" },
  { href: "/cuenta/direcciones", icon: MapPin, label: "Mis direcciones", desc: "Envíos guardados" },
  { href: "/favoritos", icon: Heart, label: "Favoritos", desc: "Tus productos guardados" },
  { href: "/cuenta/seguridad", icon: Shield, label: "Seguridad", desc: "Contraseña" },
];

export default function CuentaPage() {
  const router = useRouter();
  const { profile, user, loading } = useAuth();
  const hydrated = useHydrated();
  const orders = useOrders((s) => s.orders);
  const favCount = useFavorites((s) => s.ids.length);
  const [claiming, setClaiming] = useState(false);
  const [claimMsg, setClaimMsg] = useState("");

  const isAdmin = profile?.role === "store_admin" || profile?.role === "super_admin";
  const lastOrder = hydrated ? orders[0] : undefined;
  const memberYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : new Date().getFullYear();

  async function becomeAdmin() {
    setClaiming(true);
    const res = await claimAdminIfFirst();
    setClaiming(false);
    if (res.ok) { router.refresh(); window.location.reload(); }
    else setClaimMsg(res.error ?? "No fue posible.");
  }

  if (loading) {
    return (
      <div className="container-x py-6 space-y-4">
        <div className="skeleton h-20 rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <div className="container-x py-6 max-w-4xl">
      {/* Encabezado premium */}
      <div className="relative overflow-hidden rounded-2xl bg-dark text-white p-6 mb-5">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full" style={{ background: "radial-gradient(circle, rgba(198,161,91,0.35), transparent 70%)" }} />
        <div className="relative flex items-center gap-4">
          <Avatar profile={profile} size={64} />
          <div className="min-w-0">
            <p className="text-white/60 text-sm">Hola,</p>
            <h1 className="font-display text-2xl font-700 truncate">{fullName(profile) || "Bienvenido"} 👋</h1>
            <p className="text-white/50 text-xs mt-0.5">Miembro desde {memberYear}</p>
          </div>
        </div>
      </div>

      {/* Acceso admin */}
      {isAdmin ? (
        <Link href="/admin" className="flex items-center gap-3 card p-4 mb-5 hover:border-gold transition-colors">
          <div className="w-10 h-10 rounded-lg bg-gold-tint grid place-items-center text-gold-strong"><Store size={20} /></div>
          <div className="flex-1"><p className="font-medium text-sm">Panel de administración</p><p className="text-xs text-muted">Gestiona tu tienda</p></div>
          <ChevronRight size={18} className="text-muted" />
        </Link>
      ) : (
        <div className="card p-4 mb-5 bg-gold-tint/40">
          <div className="flex items-center gap-2 text-sm font-medium"><ShieldCheck size={16} className="text-gold-strong" /> ¿Eres el dueño de la tienda?</div>
          <p className="text-xs text-muted mt-1">Si aún no hay administrador, puedes reclamar el acceso al panel.</p>
          <button onClick={becomeAdmin} disabled={claiming} className="btn-dark px-4 h-9 text-xs mt-3 inline-flex items-center gap-2">
            {claiming ? <Loader2 size={14} className="animate-spin" /> : "Convertirme en administrador"}
          </button>
          {claimMsg && <p className="text-xs text-danger mt-2">{claimMsg}</p>}
        </div>
      )}

      {/* Tarjetas */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} className="card p-4 hover:border-gold transition-colors">
            <c.icon size={20} className="text-gold-strong mb-2" />
            <p className="text-sm font-medium">{c.label}</p>
            <p className="text-xs text-muted">{c.label === "Favoritos" && hydrated ? `${favCount} guardados` : c.desc}</p>
          </Link>
        ))}
      </div>

      {/* Último pedido */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-lg font-600">Mis pedidos</h2>
          <Link href="/cuenta/pedidos" className="text-sm text-gold-strong hover:underline">Ver todos</Link>
        </div>
        {!hydrated ? null : lastOrder ? (
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Pedido #{lastOrder.id}</p>
                <p className="text-xs text-muted">{formatDateCO(lastOrder.createdAt)} · {lastOrder.lines.length} productos</p>
              </div>
              <div className="text-right">
                <span className="badge badge-gold">{ORDER_STATUS_LABEL[lastOrder.status]}</span>
                <p className="font-semibold text-sm mt-1">{formatCOP(lastOrder.total)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="card p-6 text-center">
            <Package size={26} className="text-muted-soft mx-auto mb-2" />
            <p className="text-sm text-muted">Todavía no tienes pedidos.</p>
            <Link href="/categorias" className="btn-gold inline-block px-5 py-2.5 text-sm mt-3">Empezar a comprar</Link>
          </div>
        )}
      </section>

      {/* Configuración / salir */}
      <div className="card divide-y divide-line">
        <Link href="/cuenta/perfil" className="flex items-center gap-3 px-4 py-3.5 text-sm hover:bg-bg-soft">
          <Settings size={17} className="text-muted" /> Configuración de la cuenta <ChevronRight size={16} className="ml-auto text-muted" />
        </Link>
        <div className="px-4 py-3">
          <LogoutButton className="text-danger text-sm" />
        </div>
      </div>

      <p className="text-center text-xs text-muted-soft mt-4">{user?.email}</p>
    </div>
  );
}
