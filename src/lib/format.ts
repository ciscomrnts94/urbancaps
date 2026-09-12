import { STORE } from "./store-config";

/**
 * Formatea un valor numérico como pesos colombianos.
 * Ejemplo: 89900 -> "$89.900"
 */
export function formatCOP(value: number): string {
  const formatted = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: STORE.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
  // Intl inserta un espacio no separable tras "$" en algunos entornos; lo limpiamos.
  return formatted.replace(/\s/g, "").replace("COP", "$");
}

/** Versión corta sin símbolo: 89900 -> "89.900" */
export function formatNumberCO(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 0,
  }).format(Math.round(value || 0));
}

/** Porcentaje de descuento entre precio anterior y precio actual. */
export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Fecha legible en formato colombiano. */
export function formatDateCO(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}
