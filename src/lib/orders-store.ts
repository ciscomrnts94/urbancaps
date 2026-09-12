"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, CheckoutInfo, OrderStatus } from "./types";

export const ORDER_STATUSES: OrderStatus[] = [
  "pendiente", "pago_pendiente", "pagado", "preparando",
  "listo_envio", "enviado", "entregado", "cancelado", "reembolsado",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pendiente: "Pendiente",
  pago_pendiente: "Pago pendiente",
  pagado: "Pagado",
  preparando: "Preparando pedido",
  listo_envio: "Listo para enviar",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
  reembolsado: "Reembolsado",
};

export interface Order {
  id: string;
  createdAt: string;
  lines: CartLine[];
  info: CheckoutInfo;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  shippingLabel: string;
  paymentLabel: string;
  couponCode?: string;
  status: OrderStatus;
}

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getOrder: (id: string) => Order | undefined;
  setStatus: (id: string, status: OrderStatus) => void;
}

/** Historial de pedidos del cliente (local). En producción vive en Supabase. */
export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((s) => ({ orders: [order, ...s.orders] })),
      getOrder: (id) => get().orders.find((o) => o.id === id),
      setStatus: (id, status) =>
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) })),
    }),
    { name: "urbancaps-orders" },
  ),
);

/** Genera un número de pedido legible: UC-YYMMDD-XXXX */
export function generateOrderId(): string {
  const d = new Date();
  const ymd = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `UC-${ymd}-${rand}`;
}
