import { Truck, MapPin, Clock, RotateCcw } from "lucide-react";
import { CITY_RATES } from "@/lib/pricing";
import { formatCOP } from "@/lib/format";

export const metadata = { title: "Envíos y entregas" };

export default function EnviosPage() {
  return (
    <div className="container-x py-8 max-w-3xl">
      <p className="eyebrow mb-1">Información</p>
      <h1 className="font-display text-3xl md:text-4xl font-700 mb-6">Envíos y entregas</h1>

      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {[
          { icon: Truck, t: "Cobertura nacional", s: "Enviamos a toda Colombia con transportadoras aliadas." },
          { icon: Clock, t: "Tiempos de entrega", s: "3 a 5 días hábiles (1 a 2 en envío express)." },
          { icon: MapPin, t: "Envío gratis", s: "En compras superiores a $200.000 COP." },
          { icon: RotateCcw, t: "Cambios y devoluciones", s: "Hasta 15 días después de recibir tu pedido." },
        ].map((b) => (
          <div key={b.t} className="card p-5 flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gold-tint grid place-items-center text-gold-strong shrink-0">
              <b.icon size={18} />
            </div>
            <div>
              <p className="font-medium text-sm">{b.t}</p>
              <p className="text-xs text-muted mt-0.5">{b.s}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-600 mb-3">Tarifas por ciudad (referencia)</h2>
      <div className="card overflow-hidden">
        {Object.entries(CITY_RATES).map(([city, rate], i) => (
          <div key={city} className={`flex justify-between px-5 py-3 text-sm ${i > 0 ? "border-t border-line" : ""}`}>
            <span>{city}</span>
            <span className="font-medium">{formatCOP(rate)}</span>
          </div>
        ))}
        <div className="flex justify-between px-5 py-3 text-sm border-t border-line bg-gold-tint/40">
          <span>Otras ciudades</span>
          <span className="font-medium">Desde {formatCOP(15000)}</span>
        </div>
      </div>
      <p className="text-xs text-muted mt-4">
        Las tarifas y coberturas son configurables por el administrador de la tienda y pueden variar según destino.
      </p>
    </div>
  );
}
