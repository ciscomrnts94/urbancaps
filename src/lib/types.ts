/**
 * Modelo de dominio de la tienda.
 * Estos tipos reflejan el esquema de Supabase (ver supabase/schema.sql).
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  subcategories?: string[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

/**
 * Una variante = combinación única de opciones (ej. color + talla).
 * El stock se controla por variante.
 */
export interface Variant {
  id: string;
  color?: string;
  colorHex?: string;
  size?: string;
  sku?: string;
  stock: number;
  /** Precio específico de la variante (opcional, si difiere del producto). */
  price?: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku?: string;
  categorySlug: string;
  subcategory?: string;
  description: string;
  price: number; // precio de venta base (COP)
  compareAtPrice?: number | null; // precio anterior (tachado)
  cost?: number | null; // costo interno (solo admin)
  images: ProductImage[];
  videoUrl?: string | null;
  featured: boolean;
  isNew: boolean;
  active: boolean;
  /** Opciones disponibles (para render de selectores). */
  colors: { name: string; hex: string }[];
  sizes: string[];
  variants: Variant[];
  /** Umbral de stock bajo (para alertas en admin). */
  lowStockThreshold?: number;
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
}

/** Línea del carrito: referencia a una variante concreta. */
export interface CartLine {
  key: string; // productId::variantId
  productId: string;
  variantId: string;
  slug: string;
  name: string;
  image?: string;
  color?: string;
  colorHex?: string;
  size?: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export type OrderStatus =
  | "pendiente"
  | "pago_pendiente"
  | "pagado"
  | "preparando"
  | "listo_envio"
  | "enviado"
  | "entregado"
  | "cancelado"
  | "reembolsado";

export interface CheckoutInfo {
  firstName: string;
  lastName: string;
  idNumber?: string; // cédula (opcional)
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  addressComplement?: string;
  neighborhood?: string; // barrio
  city: string;
  department: string; // departamento
  postalCode?: string;
  notes?: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  price: number;
  description?: string;
  freeOver?: number;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed" | "free_shipping";
  value: number;
  minSubtotal?: number;
}
