"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { getAdminProducts } from "@/app/admin/actions";
import ProductForm from "@/components/admin/product-form";

export default function EditarProductoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null | undefined>(undefined);

  useEffect(() => {
    getAdminProducts()
      .then((ps) => setProduct(ps.find((p) => p.id === id) ?? null))
      .catch(() => setProduct(null));
  }, [id]);

  if (product === undefined) {
    return (
      <div className="max-w-4xl space-y-3">
        <div className="skeleton h-10 w-48 rounded-lg" />
        <div className="skeleton h-64 rounded-lg" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="max-w-4xl">
        <p className="text-muted">Producto no encontrado.</p>
        <Link href="/admin/productos" className="text-gold-strong underline text-sm">Volver a productos</Link>
      </div>
    );
  }

  return <ProductForm initial={product} />;
}
