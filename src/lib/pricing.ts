import { STORE } from "./store-config";
import type { Coupon, ShippingMethod } from "./types";

/** Métodos de envío por defecto (configurables desde el admin). */
export const SHIPPING_METHODS: ShippingMethod[] = [
  {
    id: "estandar",
    label: "Envío estándar nacional",
    price: 15000,
    description: "3 a 5 días hábiles",
    freeOver: STORE.shipping.freeShippingThreshold,
  },
  {
    id: "express",
    label: "Envío express",
    price: 25000,
    description: "1 a 2 días hábiles",
  },
  {
    id: "recogida",
    label: "Recogida en tienda",
    price: 0,
    description: "Bogotá · sin costo",
  },
];

/** Tarifas especiales por ciudad (ejemplo; editable en admin). */
export const CITY_RATES: Record<string, number> = {
  Bogotá: 10000,
  Medellín: 12000,
  Cali: 12000,
  Barranquilla: 14000,
  Cartagena: 14000,
};

/** Calcula el costo de envío según método, subtotal y ciudad. */
export function shippingCost(
  method: ShippingMethod,
  subtotal: number,
  city?: string,
): number {
  if (method.freeOver && subtotal >= method.freeOver) return 0;
  if (method.id === "estandar" && city && CITY_RATES[city] != null) {
    return CITY_RATES[city];
  }
  return method.price;
}

/** Descuento aplicado por un cupón sobre el subtotal. */
export function couponDiscount(coupon: Coupon | null, subtotal: number): number {
  if (!coupon) return 0;
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) return 0;
  if (coupon.type === "percent") return Math.round((subtotal * coupon.value) / 100);
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  return 0;
}

/** Cupones de ejemplo (en producción vienen de la tabla `coupons`). */
export const DEMO_COUPONS: Coupon[] = [
  { code: "BIENVENIDO10", type: "percent", value: 10 },
  { code: "URBAN20", type: "percent", value: 20, minSubtotal: 150000 },
  { code: "ENVIOGRATIS", type: "free_shipping", value: 0 },
];

export function findCoupon(code: string): Coupon | undefined {
  return DEMO_COUPONS.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
}
