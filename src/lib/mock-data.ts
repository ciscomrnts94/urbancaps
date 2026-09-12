import type { Category, Product, Variant } from "./types";

/** Imagen placeholder confiable (reemplazable desde el admin). */
function img(seed: string) {
  return `https://picsum.photos/seed/${seed}/900/1100`;
}

const COLOR = {
  negro: { name: "Negro", hex: "#141414" },
  blanco: { name: "Blanco", hex: "#f6f6f2" },
  gris: { name: "Gris", hex: "#8a8a8f" },
  rojo: { name: "Rojo", hex: "#b3202b" },
  azul: { name: "Azul", hex: "#243b6b" },
  verde: { name: "Verde", hex: "#2f5d43" },
  beige: { name: "Beige", hex: "#d8c7a6" },
  cafe: { name: "Café", hex: "#5b4632" },
  dorado: { name: "Dorado", hex: "#c6a15b" },
};

/** Genera variantes a partir de colores y tallas con stock definido. */
function buildVariants(
  productId: string,
  colors: { name: string; hex: string }[],
  sizes: string[],
  stockFn: (color: string, size: string, i: number) => number,
): Variant[] {
  const variants: Variant[] = [];
  let i = 0;
  for (const c of colors) {
    for (const s of sizes) {
      variants.push({
        id: `${productId}-${c.name}-${s}`.toLowerCase().replace(/\s+/g, "-"),
        color: c.name,
        colorHex: c.hex,
        size: s,
        sku: `${productId.toUpperCase()}-${c.name.slice(0, 2).toUpperCase()}-${s}`,
        stock: stockFn(c.name, s, i),
      });
      i++;
    }
  }
  return variants;
}

export const CATEGORIES: Category[] = [
  { id: "c1", name: "Gorras", slug: "gorras", image: img("cat-gorras"), subcategories: ["Snapback", "Trucker", "Clásica"] },
  { id: "c2", name: "Camisetas", slug: "camisetas", image: img("cat-camisetas"), subcategories: ["Básica", "Oversize", "Estampada"] },
  { id: "c3", name: "Camisas", slug: "camisas", image: img("cat-camisas"), subcategories: ["Casual", "Formal"] },
  { id: "c4", name: "Pantalones", slug: "pantalones", image: img("cat-pantalones"), subcategories: ["Jean", "Jogger", "Cargo"] },
  { id: "c5", name: "Chaquetas", slug: "chaquetas", image: img("cat-chaquetas"), subcategories: ["Bomber", "Impermeable"] },
  { id: "c6", name: "Zapatos", slug: "zapatos", image: img("cat-zapatos"), subcategories: ["Tenis", "Casual"] },
  { id: "c7", name: "Accesorios", slug: "accesorios", image: img("cat-accesorios"), subcategories: ["Bolsos", "Relojes", "Joyería"] },
];

function p(data: Partial<Product> & Pick<Product, "id" | "slug" | "name" | "categorySlug" | "price" | "colors" | "sizes">): Product {
  const colors = data.colors;
  const sizes = data.sizes;
  const variants =
    data.variants ??
    buildVariants(data.id, colors, sizes, (_c, s, i) => {
      // Distribución de stock realista, con algunos agotados/bajos
      if (s === "XXL") return i % 3 === 0 ? 0 : 3;
      if (s === "XL") return 4;
      return (i % 5) + 6;
    });
  return {
    sku: data.id.toUpperCase(),
    subcategory: undefined,
    compareAtPrice: null,
    cost: null,
    videoUrl: null,
    featured: false,
    isNew: false,
    active: true,
    lowStockThreshold: 5,
    rating: 4.6,
    reviewCount: 24,
    description:
      data.description ??
      "Prenda premium confeccionada con materiales de alta calidad. Diseño moderno, cómodo y versátil para el día a día.",
    images: data.images ?? [
      { id: `${data.id}-1`, url: img(`${data.slug}-1`), alt: data.name },
      { id: `${data.id}-2`, url: img(`${data.slug}-2`), alt: data.name },
      { id: `${data.id}-3`, url: img(`${data.slug}-3`), alt: data.name },
      { id: `${data.id}-4`, url: img(`${data.slug}-4`), alt: data.name },
    ],
    variants,
    createdAt: new Date().toISOString(),
    ...data,
  } as Product;
}

const SIZES_ROPA = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZES_CAP = ["Única"];
const SIZES_ZAPATO = ["37", "38", "39", "40", "41", "42", "43"];

export const PRODUCTS: Product[] = [
  p({
    id: "gorra-classic-gold",
    slug: "gorra-classic-gold",
    name: "Gorra Classic Gold Edition",
    categorySlug: "gorras",
    subcategory: "Snapback",
    price: 89900,
    compareAtPrice: 119900,
    featured: true,
    isNew: true,
    colors: [COLOR.negro, COLOR.blanco, COLOR.beige, COLOR.dorado],
    sizes: SIZES_CAP,
    description:
      "Gorra snapback con bordado dorado premium. Ajuste único regulable, visera estructurada y tela de alta durabilidad. El accesorio definitivo para elevar cualquier look urbano.",
  }),
  p({
    id: "gorra-trucker-urban",
    slug: "gorra-trucker-urban",
    name: "Gorra Trucker Urban",
    categorySlug: "gorras",
    subcategory: "Trucker",
    price: 69900,
    featured: true,
    colors: [COLOR.negro, COLOR.gris, COLOR.rojo, COLOR.azul],
    sizes: SIZES_CAP,
  }),
  p({
    id: "camiseta-oversize-premium",
    slug: "camiseta-oversize-premium",
    name: "Camiseta Oversize Premium",
    categorySlug: "camisetas",
    subcategory: "Oversize",
    price: 79900,
    compareAtPrice: 99900,
    featured: true,
    isNew: true,
    colors: [COLOR.negro, COLOR.blanco, COLOR.beige, COLOR.verde],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "camiseta-basica-algodon",
    slug: "camiseta-basica-algodon",
    name: "Camiseta Básica Algodón Pima",
    categorySlug: "camisetas",
    subcategory: "Básica",
    price: 49900,
    colors: [COLOR.blanco, COLOR.negro, COLOR.gris, COLOR.azul],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "camisa-lino-casual",
    slug: "camisa-lino-casual",
    name: "Camisa de Lino Casual",
    categorySlug: "camisas",
    subcategory: "Casual",
    price: 129900,
    compareAtPrice: 159900,
    featured: true,
    colors: [COLOR.blanco, COLOR.beige, COLOR.azul],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "camisa-oxford-formal",
    slug: "camisa-oxford-formal",
    name: "Camisa Oxford Formal",
    categorySlug: "camisas",
    subcategory: "Formal",
    price: 139900,
    colors: [COLOR.blanco, COLOR.azul, COLOR.gris],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "jean-slim-dark",
    slug: "jean-slim-dark",
    name: "Jean Slim Fit Dark",
    categorySlug: "pantalones",
    subcategory: "Jean",
    price: 149900,
    compareAtPrice: 189900,
    isNew: true,
    colors: [COLOR.azul, COLOR.negro],
    sizes: ["28", "30", "32", "34", "36"],
  }),
  p({
    id: "jogger-tech",
    slug: "jogger-tech",
    name: "Jogger Tech Fleece",
    categorySlug: "pantalones",
    subcategory: "Jogger",
    price: 119900,
    featured: true,
    colors: [COLOR.negro, COLOR.gris, COLOR.verde],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "chaqueta-bomber",
    slug: "chaqueta-bomber",
    name: "Chaqueta Bomber Satinada",
    categorySlug: "chaquetas",
    subcategory: "Bomber",
    price: 219900,
    compareAtPrice: 279900,
    featured: true,
    isNew: true,
    colors: [COLOR.negro, COLOR.verde, COLOR.dorado],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "chaqueta-impermeable",
    slug: "chaqueta-impermeable",
    name: "Chaqueta Impermeable Urbana",
    categorySlug: "chaquetas",
    subcategory: "Impermeable",
    price: 249900,
    colors: [COLOR.negro, COLOR.azul],
    sizes: SIZES_ROPA,
  }),
  p({
    id: "tenis-runner-gold",
    slug: "tenis-runner-gold",
    name: "Tenis Runner Gold",
    categorySlug: "zapatos",
    subcategory: "Tenis",
    price: 289900,
    compareAtPrice: 349900,
    featured: true,
    isNew: true,
    colors: [COLOR.blanco, COLOR.negro, COLOR.beige],
    sizes: SIZES_ZAPATO,
  }),
  p({
    id: "zapato-casual-cuero",
    slug: "zapato-casual-cuero",
    name: "Zapato Casual en Cuero",
    categorySlug: "zapatos",
    subcategory: "Casual",
    price: 259900,
    colors: [COLOR.cafe, COLOR.negro],
    sizes: SIZES_ZAPATO,
  }),
  p({
    id: "bolso-crossbody",
    slug: "bolso-crossbody",
    name: "Bolso Crossbody Minimal",
    categorySlug: "accesorios",
    subcategory: "Bolsos",
    price: 99900,
    compareAtPrice: 129900,
    isNew: true,
    colors: [COLOR.negro, COLOR.beige, COLOR.cafe],
    sizes: SIZES_CAP,
  }),
  p({
    id: "reloj-minimal-gold",
    slug: "reloj-minimal-gold",
    name: "Reloj Minimal Gold",
    categorySlug: "accesorios",
    subcategory: "Relojes",
    price: 199900,
    compareAtPrice: 259900,
    featured: true,
    colors: [COLOR.dorado, COLOR.negro],
    sizes: SIZES_CAP,
  }),
];
