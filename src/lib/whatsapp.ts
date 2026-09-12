import { STORE } from "./store-config";
import { formatCOP } from "./format";
import type { CartLine, CheckoutInfo } from "./types";

/** Enlace a WhatsApp de la tienda con mensaje opcional. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${STORE.whatsapp}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Mensaje para "Comprar por WhatsApp" desde una ficha de producto. */
export function productWhatsappMessage(name: string, opts?: { color?: string; size?: string }): string {
  let msg = `¡Hola ${STORE.name}! 👋 Estoy interesado/a en:\n\n*${name}*`;
  if (opts?.color) msg += `\nColor: ${opts.color}`;
  if (opts?.size) msg += `\nTalla: ${opts.size}`;
  msg += `\n\n¿Me pueden dar más información? 😊`;
  return msg;
}

/** Mensaje de pedido completo (usado en checkout). */
export function orderWhatsappMessage(params: {
  orderId: string;
  lines: CartLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  info?: Partial<CheckoutInfo>;
  shippingLabel?: string;
  paymentLabel?: string;
}): string {
  const { orderId, lines, subtotal, discount, shipping, total, info, shippingLabel, paymentLabel } = params;
  let msg = `🛍️ *NUEVO PEDIDO ${STORE.name}*\n`;
  msg += `Pedido: *#${orderId}*\n\n`;
  msg += `*Productos:*\n`;
  for (const l of lines) {
    const opts = [l.color, l.size].filter(Boolean).join(" / ");
    msg += `• ${l.name}${opts ? ` (${opts})` : ""} x${l.quantity} — ${formatCOP(l.unitPrice * l.quantity)}\n`;
  }
  msg += `\n*Resumen:*\n`;
  msg += `Subtotal: ${formatCOP(subtotal)}\n`;
  if (discount > 0) msg += `Descuento: -${formatCOP(discount)}\n`;
  msg += `Envío${shippingLabel ? ` (${shippingLabel})` : ""}: ${shipping === 0 ? "GRATIS" : formatCOP(shipping)}\n`;
  msg += `*TOTAL: ${formatCOP(total)}*\n`;
  if (paymentLabel) msg += `\nPago: ${paymentLabel}\n`;
  if (info?.firstName) {
    msg += `\n*Datos de envío:*\n`;
    msg += `${info.firstName ?? ""} ${info.lastName ?? ""}\n`;
    if (info.phone) msg += `Tel: ${info.phone}\n`;
    if (info.address) msg += `${info.address}${info.addressComplement ? `, ${info.addressComplement}` : ""}\n`;
    if (info.neighborhood) msg += `Barrio: ${info.neighborhood}\n`;
    if (info.city || info.department) msg += `${info.city ?? ""}${info.department ? `, ${info.department}` : ""}\n`;
  }
  return msg;
}
