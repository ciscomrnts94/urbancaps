import { Suspense } from "react";
import SearchView from "@/components/product/search-view";

export const metadata = { title: "Buscar" };

export default function BuscarPage() {
  return (
    <div className="container-x py-6 min-h-[60vh]">
      <Suspense fallback={<p className="text-muted">Cargando…</p>}>
        <SearchView />
      </Suspense>
    </div>
  );
}
