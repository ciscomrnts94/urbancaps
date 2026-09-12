"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BottomNav from "@/components/layout/bottom-nav";
import CartDrawer from "@/components/cart/cart-drawer";
import PWARegister from "@/components/pwa-register";

/**
 * Envuelve el contenido con el "chrome" de la tienda (header, footer, nav móvil,
 * carrito). En rutas del panel de administración (/admin) no se muestra, porque
 * el panel tiene su propio layout.
 */
export default function StoreChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const isAdmin = pathname.startsWith("/admin");
  const authRoutes = ["/login", "/registro", "/recuperar", "/restablecer"];
  const isAuth = authRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"));

  if (isAdmin || isAuth) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="flex-1 pb-[calc(var(--bottomnav-h)+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </main>
      <Footer />
      <BottomNav />
      <CartDrawer />
      <PWARegister />
    </>
  );
}
