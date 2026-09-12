"use server";

import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServerAuth } from "@/lib/supabase/ssr-server";
import type { CheckoutInfo } from "@/lib/types";

export interface OrderItemInput {
  variant_id: string;
  product_id: string;
  name: string;
  color?: string;
  size?: string;
  unit_price: number;
  quantity: number;
}

export interface CreateOrderInput {
  orderId: string;
  items: OrderItemInput[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string | null;
  paymentMethod: string;
  shippingMethod: string;
  contact: CheckoutInfo;
}

const ERR_MAP: Record<string, string> = {
  STOCK_INSUFICIENTE: "Uno de los productos ya no tiene stock suficiente.",
  VARIANTE_NO_EXISTE: "Un producto del carrito ya no está disponible.",
};

/** Crea el pedido en Supabase (valida y descuenta stock de forma atómica). */
export async function createOrder(input: CreateOrderInput): Promise<{ ok: boolean; id?: string; error?: string }> {
  const db = getSupabaseAdmin();

  // Cliente autenticado (si hay sesión)
  let customerId: string | null = null;
  try {
    const auth = await supabaseServerAuth();
    const { data } = await auth.auth.getUser();
    customerId = data.user?.id ?? null;
  } catch { /* invitado */ }

  const { error } = await db.rpc("place_order", {
    p_order_id: input.orderId,
    p_customer_id: customerId,
    p_items: input.items,
    p_subtotal: input.subtotal,
    p_discount: input.discount,
    p_shipping: input.shipping,
    p_total: input.total,
    p_coupon: input.couponCode ?? null,
    p_payment: input.paymentMethod,
    p_shipping_method: input.shippingMethod,
    p_contact: input.contact,
  });

  if (error) {
    const key = Object.keys(ERR_MAP).find((k) => error.message.includes(k));
    return { ok: false, error: key ? ERR_MAP[key] : "No pudimos procesar tu pedido. Intenta nuevamente." };
  }
  return { ok: true, id: input.orderId };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapOrder(o: any) {
  return {
    id: o.id,
    createdAt: o.created_at,
    status: o.status,
    subtotal: o.subtotal, discount: o.discount, shipping: o.shipping, total: o.total,
    paymentLabel: o.payment_method, shippingLabel: o.shipping_method, couponCode: o.coupon_code,
    trackingCarrier: o.tracking_carrier, trackingNumber: o.tracking_number,
    info: {
      firstName: o.first_name, lastName: o.last_name, email: o.email, phone: o.phone,
      whatsapp: o.whatsapp, address: o.address, addressComplement: o.address_complement,
      neighborhood: o.neighborhood, city: o.city, department: o.department,
    },
    lines: (o.order_items ?? []).map((l: any) => ({
      key: l.id, name: l.name, color: l.color, size: l.size,
      unitPrice: l.unit_price, quantity: l.quantity,
    })),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

const ORDER_SELECT = "*, order_items(id, name, color, size, unit_price, quantity)";

/** Todos los pedidos (admin). */
export async function getAdminOrders() {
  const db = getSupabaseAdmin();
  const { data, error } = await db.from("orders").select(ORDER_SELECT).order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []).map(mapOrder);
}

/** Pedidos del cliente autenticado. */
export async function getMyOrders() {
  const auth = await supabaseServerAuth();
  const { data: { user } } = await auth.auth.getUser();
  if (!user) return [];
  const { data } = await auth.from("orders").select(ORDER_SELECT).eq("customer_id", user.id).order("created_at", { ascending: false });
  return (data ?? []).map(mapOrder);
}

/** Cambiar estado de un pedido (admin) + historial + auditoría. */
export async function setOrderStatusAction(orderId: string, status: string, note?: string) {
  const db = getSupabaseAdmin();
  let actor: string | null = null;
  let actorName = "admin";
  try {
    const auth = await supabaseServerAuth();
    const { data } = await auth.auth.getUser();
    actor = data.user?.id ?? null;
    actorName = data.user?.email ?? "admin";
  } catch { /* */ }

  const { data: prev } = await db.from("orders").select("status").eq("id", orderId).maybeSingle();
  const patch: Record<string, unknown> = { status };
  if (status === "pagado") patch.paid_at = new Date().toISOString();
  await db.from("orders").update(patch).eq("id", orderId);
  await db.from("order_status_history").insert({ order_id: orderId, status, note: note ?? null, created_by: actor });
  await db.from("audit_logs").insert({
    actor_id: actor, actor_name: actorName, action: "cambio_estado_pedido",
    entity: "order", entity_id: orderId, before: prev ?? {}, after: { status },
  });
  return { ok: true };
}

/** Actualizar guía de envío (admin). */
export async function setTrackingAction(orderId: string, carrier: string, number: string) {
  const db = getSupabaseAdmin();
  await db.from("orders").update({ tracking_carrier: carrier, tracking_number: number }).eq("id", orderId);
  return { ok: true };
}
