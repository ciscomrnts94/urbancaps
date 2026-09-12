"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Check, ChevronLeft, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { useHydrated } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { supabaseBrowser } from "@/lib/supabase/browser";
import type { Address } from "@/lib/auth/types";
import { useOrders, generateOrderId } from "@/lib/orders-store";
import { createOrder } from "@/app/orders-actions";
import { Loader2, AlertCircle } from "lucide-react";
import { formatCOP } from "@/lib/format";
import { DEPARTMENTS, citiesFor } from "@/lib/colombia";
import { SHIPPING_METHODS, shippingCost } from "@/lib/pricing";
import { ACTIVE_PAYMENTS } from "@/lib/payments";
import { whatsappLink, orderWhatsappMessage } from "@/lib/whatsapp";
import type { CheckoutInfo } from "@/lib/types";

const EMPTY: CheckoutInfo = {
  firstName: "", lastName: "", idNumber: "", phone: "", whatsapp: "", email: "",
  address: "", addressComplement: "", neighborhood: "", city: "", department: "", postalCode: "", notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const { lines, clear } = useCart();
  const subtotal = useCart((s) => s.subtotal());
  const discount = useCart((s) => s.discount());
  const coupon = useCart((s) => s.coupon);
  const addOrder = useOrders((s) => s.addOrder);

  const { user, profile } = useAuth();
  const [info, setInfo] = useState<CheckoutInfo>(EMPTY);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [prefilled, setPrefilled] = useState(false);
  const [shippingId, setShippingId] = useState(SHIPPING_METHODS[0].id);
  const [paymentId, setPaymentId] = useState(ACTIVE_PAYMENTS[0].id);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");

  const shippingMethod = SHIPPING_METHODS.find((m) => m.id === shippingId)!;
  const paymentMethod = ACTIVE_PAYMENTS.find((m) => m.id === paymentId)!;

  const freeShipCoupon = coupon?.type === "free_shipping";
  const shipping = freeShipCoupon ? 0 : shippingCost(shippingMethod, subtotal, info.city);
  const total = subtotal - discount + shipping;

  const set = (k: keyof CheckoutInfo, v: string) => setInfo((p) => ({ ...p, [k]: v }));

  // Prellenar con los datos del usuario y sus direcciones guardadas
  useEffect(() => {
    if (!user) return;
    let cancel = false;
    (async () => {
      const supabase = supabaseBrowser();
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user.id).order("is_default", { ascending: false });
      if (cancel) return;
      const list = (data as Address[]) ?? [];
      setAddresses(list);
      if (!prefilled) {
        const def = list.find((a) => a.is_default) ?? list[0];
        setInfo((p) => ({
          ...p,
          firstName: p.firstName || def?.first_name || profile?.first_name || "",
          lastName: p.lastName || def?.last_name || profile?.last_name || "",
          email: p.email || user.email || profile?.email || "",
          phone: p.phone || def?.phone || profile?.phone || "",
          whatsapp: p.whatsapp || profile?.whatsapp || "",
          address: p.address || def?.address || "",
          addressComplement: p.addressComplement || def?.address_complement || "",
          neighborhood: p.neighborhood || def?.neighborhood || "",
          department: p.department || def?.department || profile?.department || "",
          city: p.city || def?.city || profile?.city || "",
          postalCode: p.postalCode || def?.postal_code || "",
        }));
        setPrefilled(true);
      }
    })();
    return () => { cancel = true; };
  }, [user, profile, prefilled]);

  function applyAddress(a: Address) {
    setInfo((p) => ({
      ...p,
      firstName: a.first_name || p.firstName,
      lastName: a.last_name || p.lastName,
      phone: a.phone || p.phone,
      address: a.address,
      addressComplement: a.address_complement || "",
      neighborhood: a.neighborhood || "",
      department: a.department || "",
      city: a.city || "",
      postalCode: a.postal_code || "",
    }));
  }

  const required: (keyof CheckoutInfo)[] = ["firstName", "lastName", "phone", "email", "address", "city", "department"];

  function validate() {
    const e: Record<string, boolean> = {};
    for (const f of required) if (!info[f]?.trim()) e[f] = true;
    if (info.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(info.email)) e.email = true;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function placeOrder() {
    setOrderError("");
    if (!validate()) {
      document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const id = generateOrderId();
    setPlacing(true);

    // Crear pedido en Supabase (valida y descuenta stock de forma atómica)
    const res = await createOrder({
      orderId: id,
      items: lines.map((l) => ({
        variant_id: l.variantId, product_id: l.productId, name: l.name,
        color: l.color, size: l.size, unit_price: l.unitPrice, quantity: l.quantity,
      })),
      subtotal, discount, shipping, total,
      couponCode: coupon?.code ?? null,
      paymentMethod: paymentMethod.label, shippingMethod: shippingMethod.label,
      contact: info,
    });

    if (!res.ok) {
      setPlacing(false);
      setOrderError(res.error ?? "No pudimos procesar tu pedido.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Guardar también en el historial local para la confirmación inmediata
    addOrder({
      id, createdAt: new Date().toISOString(), lines, info,
      subtotal, discount, shipping, total,
      shippingLabel: shippingMethod.label, paymentLabel: paymentMethod.label,
      couponCode: coupon?.code, status: "pendiente" as const,
    });

    // Mensaje de WhatsApp con el pedido (flujo de coordinación con la tienda)
    if (paymentId === "whatsapp" || paymentId === "contraentrega") {
      const msg = orderWhatsappMessage({
        orderId: id, lines, subtotal, discount, shipping, total, info,
        shippingLabel: shippingMethod.label, paymentLabel: paymentMethod.label,
      });
      window.open(whatsappLink(msg), "_blank");
    }
    clear();
    router.push(`/pedido-confirmado?id=${id}`);
  }

  const canOrder = useMemo(() => hydrated && lines.length > 0, [hydrated, lines]);

  if (hydrated && lines.length === 0) {
    return (
      <div className="container-x py-6 min-h-[60vh] flex flex-col items-center justify-center text-center gap-3">
        <h1 className="font-display text-2xl font-600">No hay nada para pagar</h1>
        <p className="text-sm text-muted">Tu carrito está vacío.</p>
        <Link href="/categorias" className="btn-gold px-6 py-3 text-sm mt-2">Ir a la tienda</Link>
      </div>
    );
  }

  const field = (
    name: keyof CheckoutInfo,
    label: string,
    opts: { type?: string; required?: boolean; placeholder?: string; full?: boolean } = {},
  ) => (
    <div className={opts.full ? "sm:col-span-2" : ""} data-error={!!errors[name]}>
      <label className="block text-xs font-medium text-ink-soft mb-1.5">
        {label} {opts.required && <span className="text-gold-strong">*</span>}
      </label>
      <input
        type={opts.type ?? "text"}
        value={info[name] ?? ""}
        onChange={(e) => set(name, e.target.value)}
        placeholder={opts.placeholder}
        className={`w-full border rounded-lg px-3 h-11 text-sm outline-none focus:border-gold ${errors[name] ? "border-danger" : "border-line-strong"}`}
      />
    </div>
  );

  return (
    <div className="container-x py-6">
      <Link href="/carrito" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ChevronLeft size={16} /> Volver al carrito
      </Link>
      <h1 className="font-display text-3xl font-700 mb-6">Finalizar compra</h1>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Formulario */}
        <div className="space-y-8">
          {/* Invitado: sugerir login */}
          {hydrated && !user && (
            <div className="card p-4 bg-gold-tint/40 flex items-center justify-between gap-3 flex-wrap">
              <p className="text-sm">¿Ya tienes cuenta? <span className="text-muted">Inicia sesión para autocompletar tus datos.</span></p>
              <Link href={`/login?redirect=/checkout`} className="btn-dark px-4 h-9 text-sm inline-flex items-center">Iniciar sesión</Link>
            </div>
          )}

          {/* Direcciones guardadas */}
          {user && addresses.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2 flex items-center gap-2"><MapPin size={15} className="text-gold-strong" /> Usar una dirección guardada</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {addresses.map((a) => (
                  <button key={a.id} onClick={() => applyAddress(a)} className="shrink-0 text-left border border-line-strong rounded-xl px-3 py-2 hover:border-gold min-w-[180px]">
                    <p className="text-xs font-semibold">{a.label}{a.is_default ? " · Principal" : ""}</p>
                    <p className="text-[11px] text-muted truncate">{a.address}</p>
                    <p className="text-[11px] text-muted">{a.city}, {a.department}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Datos de contacto */}
          <section>
            <h2 className="font-display text-lg font-600 mb-4">1. Datos de contacto</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {field("firstName", "Nombre", { required: true })}
              {field("lastName", "Apellido", { required: true })}
              {field("idNumber", "Cédula (opcional)", { placeholder: "Para la factura" })}
              {field("phone", "Teléfono", { required: true, type: "tel", placeholder: "300 123 4567" })}
              {field("whatsapp", "WhatsApp", { type: "tel", placeholder: "Si es diferente" })}
              {field("email", "Correo electrónico", { required: true, type: "email", full: true })}
            </div>
          </section>

          {/* Dirección */}
          <section>
            <h2 className="font-display text-lg font-600 mb-4">2. Dirección de envío</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {field("address", "Dirección", { required: true, full: true, placeholder: "Calle 123 # 45-67" })}
              {field("addressComplement", "Complemento", { placeholder: "Apto, torre, interior…", full: true })}
              {field("neighborhood", "Barrio", {})}
              <div data-error={!!errors.department}>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Departamento <span className="text-gold-strong">*</span></label>
                <select
                  value={info.department}
                  onChange={(e) => { set("department", e.target.value); set("city", ""); }}
                  className={`w-full border rounded-lg px-3 h-11 text-sm bg-bg outline-none focus:border-gold ${errors.department ? "border-danger" : "border-line-strong"}`}
                >
                  <option value="">Selecciona…</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div data-error={!!errors.city}>
                <label className="block text-xs font-medium text-ink-soft mb-1.5">Ciudad / Municipio <span className="text-gold-strong">*</span></label>
                <select
                  value={info.city}
                  onChange={(e) => set("city", e.target.value)}
                  disabled={!info.department}
                  className={`w-full border rounded-lg px-3 h-11 text-sm bg-bg outline-none focus:border-gold disabled:opacity-50 ${errors.city ? "border-danger" : "border-line-strong"}`}
                >
                  <option value="">{info.department ? "Selecciona…" : "Elige departamento primero"}</option>
                  {citiesFor(info.department).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {field("postalCode", "Código postal (opcional)", {})}
              {field("notes", "Notas del pedido (opcional)", { full: true, placeholder: "Indicaciones para la entrega" })}
            </div>
          </section>

          {/* Envío */}
          <section>
            <h2 className="font-display text-lg font-600 mb-4">3. Método de envío</h2>
            <div className="space-y-2.5">
              {SHIPPING_METHODS.map((m) => {
                const cost = freeShipCoupon ? 0 : shippingCost(m, subtotal, info.city);
                return (
                  <label key={m.id} className={`flex items-center gap-3 border rounded-[var(--radius)] px-4 py-3 cursor-pointer ${shippingId === m.id ? "border-gold-strong bg-gold-tint/40" : "border-line-strong"}`}>
                    <input type="radio" name="shipping" checked={shippingId === m.id} onChange={() => setShippingId(m.id)} className="accent-[var(--gold-strong)]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.label}</p>
                      {m.description && <p className="text-xs text-muted">{m.description}</p>}
                    </div>
                    <span className="text-sm font-semibold">{cost === 0 ? "GRATIS" : formatCOP(cost)}</span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Pago */}
          <section>
            <h2 className="font-display text-lg font-600 mb-4">4. Método de pago</h2>
            <div className="space-y-2.5">
              {ACTIVE_PAYMENTS.map((m) => (
                <label key={m.id} className={`flex items-center gap-3 border rounded-[var(--radius)] px-4 py-3 cursor-pointer ${paymentId === m.id ? "border-gold-strong bg-gold-tint/40" : "border-line-strong"}`}>
                  <input type="radio" name="payment" checked={paymentId === m.id} onChange={() => setPaymentId(m.id)} className="accent-[var(--gold-strong)]" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{m.label}</p>
                    <p className="text-xs text-muted">{m.description}</p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-[11px] text-muted-soft mt-3">
              Los pagos en línea se procesan con proveedores certificados. La tienda nunca almacena datos de tu tarjeta.
            </p>
          </section>
        </div>

        {/* Resumen */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="card p-5">
            <h2 className="font-display text-lg font-600 mb-4">Tu pedido</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {hydrated && lines.map((l) => (
                <div key={l.key} className="flex gap-3">
                  <div className="relative w-14 h-16 rounded-lg overflow-hidden bg-bg-soft shrink-0">
                    {l.image && <Image src={l.image} alt={l.name} fill sizes="56px" className="object-cover" />}
                    <span className="absolute -top-1.5 -right-1.5 bg-ink text-white text-[10px] font-bold w-5 h-5 grid place-items-center rounded-full">{l.quantity}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-2">{l.name}</p>
                    <p className="text-[11px] text-muted">{[l.color, l.size].filter(Boolean).join(" · ")}</p>
                  </div>
                  <span className="text-xs font-semibold">{formatCOP(l.unitPrice * l.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-line mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatCOP(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-success"><span>Descuento {coupon ? `(${coupon.code})` : ""}</span><span>-{formatCOP(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Envío</span><span>{shipping === 0 ? "GRATIS" : formatCOP(shipping)}</span></div>
              <div className="flex justify-between text-lg font-700 pt-2 border-t border-line mt-2"><span>Total</span><span>{formatCOP(total)}</span></div>
            </div>

            {orderError && (
              <div className="mt-4 rounded-lg border border-danger/30 bg-danger/5 text-danger text-xs px-3 py-2.5 flex gap-2">
                <AlertCircle size={15} className="shrink-0" /> {orderError}
              </div>
            )}
            <button onClick={placeOrder} disabled={!canOrder || placing} className="btn-gold w-full py-3.5 text-sm mt-5 inline-flex items-center justify-center gap-2 disabled:opacity-70">
              {placing ? (<><Loader2 size={17} className="animate-spin" /> Procesando…</>) : (<><Check size={17} /> Confirmar pedido</>)}
            </button>
            <p className="text-[11px] text-muted-soft text-center mt-3">
              Al confirmar aceptas nuestros términos y política de privacidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
