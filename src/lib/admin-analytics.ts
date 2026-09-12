import type { Product } from "./types";

/**
 * Datos de analítica de DEMOSTRACIÓN para el dashboard.
 * Se reemplazarán por consultas reales cuando se conecte Supabase.
 * Deterministas (no aleatorios) para evitar diferencias servidor/cliente.
 */

const DIAS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export function ventasSemana(): { label: string; value: number }[] {
  const base = [820000, 640000, 910000, 1180000, 1450000, 1720000, 1250000];
  return DIAS.map((label, i) => ({ label, value: base[i] }));
}

export function ventasMes(): { label: string; value: number }[] {
  // 12 puntos (semanas/quincenas) para una línea de tendencia mensual.
  const base = [
    2.1, 2.6, 2.3, 3.0, 3.4, 3.1, 3.8, 4.2, 3.9, 4.6, 5.1, 4.8,
  ];
  return base.map((v, i) => ({ label: `S${i + 1}`, value: Math.round(v * 1_000_000) }));
}

export function resumen() {
  return {
    ventasHoy: 1_250_000,
    ventasMes: 18_750_000,
    pedidos: 124,
    clientes: 87,
  };
}

export function topProductos(products: Product[]): { name: string; value: number }[] {
  // Usa productos reales del catálogo con cifras de ejemplo de unidades vendidas.
  const sold = [142, 118, 96, 87, 73, 54];
  return products
    .filter((p) => p.featured)
    .slice(0, 6)
    .map((p, i) => ({ name: p.name, value: sold[i] ?? 40 - i * 5 }));
}

export function topCategorias(): { name: string; value: number }[] {
  return [
    { name: "Gorras", value: 34 },
    { name: "Camisetas", value: 26 },
    { name: "Zapatos", value: 18 },
    { name: "Chaquetas", value: 12 },
    { name: "Accesorios", value: 10 },
  ];
}
