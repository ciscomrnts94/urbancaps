"use client";

import { createContext, useContext, useEffect, useState } from "react";

const HydrationContext = createContext(false);

/** Devuelve true sólo tras el montaje en cliente (evita mismatch SSR con localStorage). */
export function useHydrated() {
  return useContext(HydrationContext);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return (
    <HydrationContext.Provider value={hydrated}>
      {children}
    </HydrationContext.Provider>
  );
}
