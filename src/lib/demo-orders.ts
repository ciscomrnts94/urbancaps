import type { Order } from "./orders-store";
import { PRODUCTS } from "./mock-data";

/** Genera pedidos de ejemplo para poblar el panel (demostración). */
export function buildDemoOrders(): Order[] {
  const samples = [
    { name: "Laura", last: "Gómez", city: "Bogotá", dep: "Bogotá D.C.", status: "pagado" as const, pIdx: [0, 2] },
    { name: "Andrés", last: "Ramírez", city: "Medellín", dep: "Antioquia", status: "enviado" as const, pIdx: [4] },
    { name: "Valentina", last: "Torres", city: "Cali", dep: "Valle del Cauca", status: "preparando" as const, pIdx: [8, 3] },
    { name: "Sebastián", last: "Rojas", city: "Barranquilla", dep: "Atlántico", status: "entregado" as const, pIdx: [10] },
    { name: "Camila", last: "Díaz", city: "Bucaramanga", dep: "Santander", status: "pendiente" as const, pIdx: [1, 12] },
  ];
  const now = Date.now();
  return samples.map((s, i) => {
    const lines = s.pIdx.map((idx) => {
      const p = PRODUCTS[idx];
      const v = p.variants.find((x) => x.stock > 0) ?? p.variants[0];
      return {
        key: `${p.id}::${v.id}`, productId: p.id, variantId: v.id, slug: p.slug,
        name: p.name, image: p.images[0]?.url, color: v.color, colorHex: v.colorHex,
        size: v.size, unitPrice: p.price, quantity: 1, maxStock: v.stock,
      };
    });
    const subtotal = lines.reduce((a, l) => a + l.unitPrice * l.quantity, 0);
    const shipping = subtotal >= 200000 ? 0 : 15000;
    return {
      id: `UC-DEMO-${1000 + i}`,
      createdAt: new Date(now - i * 86400000 * 1.5).toISOString(),
      lines,
      info: {
        firstName: s.name, lastName: s.last, phone: "300 000 0000", email: `${s.name.toLowerCase()}@correo.com`,
        address: "Calle 123 # 45-67", city: s.city, department: s.dep,
      },
      subtotal, discount: 0, shipping, total: subtotal + shipping,
      shippingLabel: "Envío estándar nacional", paymentLabel: "Pago contra entrega",
      status: s.status,
    };
  });
}
