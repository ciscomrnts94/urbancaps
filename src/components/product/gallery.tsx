"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage } from "@/lib/types";

export default function Gallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");

  const current = images[active] ?? images[0];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  return (
    <div className="md:flex md:gap-4">
      {/* Miniaturas (desktop vertical) */}
      <div className="hidden md:flex flex-col gap-3 order-1">
        {images.map((img, i) => (
          <button
            key={img.id}
            onClick={() => setActive(i)}
            className={`relative w-16 h-20 rounded-lg overflow-hidden bg-bg-soft ring-1 transition-all ${
              i === active ? "ring-gold-strong ring-2" : "ring-line hover:ring-gold"
            }`}
          >
            <Image src={img.url} alt={img.alt ?? name} fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Imagen principal */}
      <div className="order-2 flex-1">
        <div
          className="relative aspect-[4/5] rounded-[var(--radius)] overflow-hidden bg-bg-soft cursor-zoom-in"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={onMove}
        >
          {current && (
            <Image
              src={current.url}
              alt={current.alt ?? name}
              fill
              priority
              sizes="(max-width:768px) 100vw, 45vw"
              className="object-cover transition-transform duration-200"
              style={{ transform: zoom ? "scale(1.9)" : "scale(1)", transformOrigin: origin }}
            />
          )}
        </div>

        {/* Miniaturas (móvil horizontal) */}
        <div className="md:hidden flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={`relative w-14 h-16 shrink-0 rounded-lg overflow-hidden bg-bg-soft ring-1 ${
                i === active ? "ring-gold-strong ring-2" : "ring-line"
              }`}
            >
              <Image src={img.url} alt={img.alt ?? name} fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
