# UrbanCaps 🧢 — E-commerce premium para Colombia

Tienda online moderna, mobile-first y PWA, con precios en **pesos colombianos (COP)**.
Construida con **Next.js 16 + React 19 + Tailwind v4** y preparada para **Supabase**.

## 🚀 Cómo ejecutar

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## ✅ Lo que ya está construido (Storefront del cliente)

- **Home**: banner hero, categorías, destacados, nuevos, ofertas, banner promocional.
- **Página de producto premium**: galería con zoom, selección de **color y talla**,
  **stock por variante** (deshabilita combinaciones agotadas), cantidad, agregar al
  carrito, comprar ahora y **comprar por WhatsApp**. Productos relacionados.
- **Carrito**: drawer lateral + página completa, barra de envío gratis, **cupones**
  (`BIENVENIDO10`, `URBAN20`, `ENVIOGRATIS`).
- **Checkout colombiano**: nombre, cédula, teléfono, WhatsApp, dirección, barrio,
  **departamento + ciudad** (listas de Colombia), métodos de envío y de pago.
- **Favoritos**, **buscador**, **categorías**, **mi cuenta** (historial de pedidos local).
- **Envío**: gratis desde $200.000, tarifas por ciudad, recogida en tienda.
- **PWA**: instalable en Android/iPhone (manifest, icono, service worker).
- **Diseño**: blanco + dorado elegante, lujo minimalista, navegación inferior móvil.

## 🗂️ Estructura

```
src/
  app/                 Rutas (home, producto, categoria, carrito, checkout, cuenta…)
  components/
    layout/            Header, footer, navegación inferior
    product/           Tarjeta, galería, detalle, grid, rails
    cart/              Drawer y provider del carrito
  lib/
    store-config.ts    Datos de la tienda (nombre, WhatsApp, envío)
    types.ts           Modelo de dominio
    catalog.ts         Capa de datos (hoy ejemplo → luego Supabase)
    mock-data.ts       Catálogo de ejemplo (productos, variantes, stock)
    cart-store.ts       Carrito (Zustand + localStorage)
    favorites-store.ts / orders-store.ts
    colombia.ts        Departamentos y ciudades
    pricing.ts / payments.ts / whatsapp.ts / format.ts (COP)
    supabase/          Cliente de Supabase (scaffolding)
supabase/schema.sql    Esquema completo de la base de datos
```

## 🔌 Conectar Supabase (datos reales)

1. Crea un proyecto en https://supabase.com
2. En **SQL Editor**, ejecuta `supabase/schema.sql`.
3. Copia `.env.example` → `.env.local` y completa `NEXT_PUBLIC_SUPABASE_URL` y
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Se reemplazan las funciones de `src/lib/catalog.ts` por consultas a Supabase
   (la firma `async` ya está lista, no hay que tocar el storefront).

## 🛠️ Próximos pasos sugeridos

- **Panel de administración** (productos, variantes, pedidos, clientes, dashboard).
- Conexión real a Supabase + subida de imágenes.
- Integración de pagos (Wompi / Mercado Pago) con sus SDK oficiales.
- Autenticación de clientes.

> Precios en COP. Nunca se almacenan datos sensibles de tarjetas: los pagos usan
> proveedores certificados.
