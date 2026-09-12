"use client";

import { formatCOP, formatNumberCO } from "@/lib/format";

/** Gráfico de barras vertical. */
export function BarChart({ data, money = true }: { data: { label: string; value: number }[]; money?: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const AREA = 168; // px de alto para las barras
  return (
    <div className="flex items-end gap-2" style={{ height: AREA + 22 }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
          <div
            className="w-full rounded-t-md transition-all group-hover:opacity-80"
            style={{
              height: `${Math.max(4, (d.value / max) * AREA)}px`,
              background: "linear-gradient(to top, var(--gold-strong), var(--gold))",
            }}
            title={money ? formatCOP(d.value) : formatNumberCO(d.value)}
          />
          <span className="text-[10px] text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Gráfico de línea (tendencia). */
export function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const w = 520, h = 180, pad = 8;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((d.value - min) / range) * (h - pad * 2);
    return [x, y] as const;
  });
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${h - pad} L${pts[0][0]},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
      <defs>
        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--gold)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaFill)" />
      <path d={line} fill="none" stroke="var(--gold-strong)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#fff" stroke="var(--gold-strong)" strokeWidth="2" />
      ))}
    </svg>
  );
}

/** Lista de barras horizontales (rankings). */
export function HBarList({ data, unit = "u." }: { data: { name: string; value: number }[]; unit?: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.name}>
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium truncate pr-2">{d.name}</span>
            <span className="text-muted shrink-0">{formatNumberCO(d.value)} {unit}</span>
          </div>
          <div className="h-2 rounded-full bg-bg-soft overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(d.value / max) * 100}%`, background: "linear-gradient(to right, var(--gold), var(--gold-strong))" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
