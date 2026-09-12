/**
 * Configuración global de la tienda.
 * En producción, estos valores vienen de la tabla `store_settings` en Supabase
 * y son editables desde el panel "Personalizar tienda". Aquí quedan los
 * valores por defecto usados por el storefront.
 */
export const STORE = {
  name: "UrbanCaps",
  tagline: "Moda urbana y accesorios premium. Envíos a toda Colombia.",
  currency: "COP",
  locale: "es-CO",

  // Contacto
  whatsapp: "573001234567", // formato internacional sin '+', editable en admin
  email: "hola@urbancaps.co",
  phone: "+57 300 123 4567",
  city: "Bogotá, Colombia",

  // Redes
  social: {
    instagram: "https://instagram.com/urbancaps",
    facebook: "https://facebook.com/urbancaps",
    tiktok: "https://tiktok.com/@urbancaps",
  },

  // Envío
  shipping: {
    freeShippingThreshold: 200000, // COP — envío gratis desde este valor
    flatRate: 15000, // tarifa base por defecto
  },
} as const;

export type StoreConfig = typeof STORE;
