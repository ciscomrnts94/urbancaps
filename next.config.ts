import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Placeholders del catálogo de ejemplo (reemplazables desde el admin).
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Almacenamiento de Supabase (fotos reales subidas desde el panel).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
