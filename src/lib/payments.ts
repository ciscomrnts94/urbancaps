/**
 * Métodos de pago disponibles. La arquitectura está lista para integrar
 * proveedores certificados (Wompi, Mercado Pago, PayU) mediante sus SDK/API
 * oficiales — NUNCA se almacenan datos sensibles de tarjetas en la tienda.
 * El administrador podrá activar/desactivar cada método desde el panel.
 */
export interface PaymentMethod {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  /** true = redirige a un proveedor externo (se integrará después). */
  external?: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "contraentrega",
    label: "Pago contra entrega",
    description: "Paga en efectivo al recibir tu pedido (ciudades principales).",
    enabled: true,
  },
  {
    id: "whatsapp",
    label: "Coordinar por WhatsApp",
    description: "Envía tu pedido y coordina el pago con la tienda.",
    enabled: true,
  },
  {
    id: "wompi",
    label: "Tarjeta, PSE o Nequi (Wompi)",
    description: "Pago en línea seguro con Wompi. (Próximamente)",
    enabled: false,
    external: true,
  },
  {
    id: "mercadopago",
    label: "Mercado Pago",
    description: "Tarjetas y saldo Mercado Pago. (Próximamente)",
    enabled: false,
    external: true,
  },
];

export const ACTIVE_PAYMENTS = PAYMENT_METHODS.filter((m) => m.enabled);
