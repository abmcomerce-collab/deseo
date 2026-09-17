import type { Metadata } from "next";
import { Clock, Package, ShieldCheck, Snowflake } from "lucide-react";
import { ZONES } from "@/lib/delivery";
import { money } from "@/lib/format";
import { PostalChecker } from "@/components/shop/postal-checker";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Zonas y entregas en frío",
  description: "Repartimos polos congelados en Barcelona (mismo día), área metropolitana (24 h) y Costa Brava (fines de semana).",
  alternates: { canonical: "/entregas" },
};

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DeliveryPage() {
  const zones = Object.values(ZONES);
  return (
    <>
      <section className="container-x grid gap-12 pb-20 pt-10 sm:pt-16 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-humo">Entregas</p>
          <h1 className="font-display mt-5 text-7xl sm:text-9xl">
            Frío de <em className="text-tinta">puerta a puerta.</em>
          </h1>
          <p className="mt-6 max-w-md text-lg text-humo">
            No usamos mensajería genérica. Nuestros repartidores llevan tu pedido en cajas isotérmicas con hielo seco, en la franja que elijas.
          </p>
          <div className="mt-10 max-w-md">
            <PostalChecker />
          </div>
        </div>
        <Reveal>
          <ZoneMap />
        </Reveal>
      </section>

      <section className="container-x pb-24" aria-labelledby="zonas">
        <h2 id="zonas" className="sr-only">
          Zonas de reparto
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {zones.map((z, i) => (
            <Reveal key={z.id} delay={i * 0.08}>
              <article className="h-full rounded-[32px] border border-linea bg-white/70 p-8">
                <p className="eyebrow text-humo">Zona {i + 1}</p>
                <h3 className="font-display mt-3 text-5xl">{z.name}</h3>
                <p className="mt-2 text-tinta">{z.eta}</p>
                <dl className="mt-8 space-y-3 text-sm">
                  <div className="flex justify-between border-b border-linea pb-3">
                    <dt className="text-humo">Envío</dt>
                    <dd>{money(z.shippingCents)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-linea pb-3">
                    <dt className="text-humo">Gratis desde</dt>
                    <dd>{money(z.freeFromCents)}</dd>
                  </div>
                  <div className="flex justify-between border-b border-linea pb-3">
                    <dt className="text-humo">Días</dt>
                    <dd>{z.days.map((d) => DAYS[d]).join(" · ")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-humo">Franjas</dt>
                    <dd className="text-right font-mono text-xs leading-6">
                      {z.slots.map((s) => (
                        <span key={s} className="block">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-noche py-24 text-crema">
        <div className="container-x grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Package, t: "Caja isotérmica", d: "Poliestireno reciclado y cartón. Devuélvela en tu siguiente pedido y te descontamos 1 €." },
            { icon: Snowflake, t: "Hielo seco", d: "Mantiene −18 °C durante 6 horas. Nunca lo toques sin guantes: déjalo evaporar al aire." },
            { icon: Clock, t: "Aviso previo", d: "Te llamamos 15 minutos antes. Si no estás, reprogramamos sin coste." },
            { icon: ShieldCheck, t: "Solo a mayores de 18", d: "Podemos pedir el DNI. No dejamos pedidos a terceros ni en conserjería." },
          ].map((f) => (
            <div key={f.t}>
              <f.icon className="size-6 text-brasa" />
              <h3 className="font-display mt-5 text-3xl">{f.t}</h3>
              <p className="mt-2 text-crema/65">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/** Mapa esquemático (no geográfico) de las tres zonas. */
function ZoneMap() {
  return (
    <figure className="relative overflow-hidden rounded-[40px] bg-[#d9ebe6] p-6">
      <svg viewBox="0 0 520 560" className="h-auto w-full" role="img" aria-labelledby="map-title">
        <title id="map-title">Mapa esquemático de las zonas de reparto: Costa Brava al norte, área metropolitana y Barcelona ciudad al sur.</title>
        {/* mar */}
        <path d="M520 0v560H250c40-40 70-70 110-120s40-90 80-140 40-90 50-150S520 60 520 0Z" fill="#b7dbe1" />
        <g fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round">
          <path d="M420 470q12-8 24 0t24 0" />
          <path d="M450 330q12-8 24 0t24 0" />
          <path d="M470 180q12-8 24 0t24 0" />
        </g>
        {/* costa brava */}
        <path d="M330 30c60-10 120 10 160 30-10 50-20 90-50 140-40 10-90 0-130-20-10-50 0-100 20-150Z" fill="#ffd3b8" stroke="#140b10" strokeOpacity=".2" />
        <text x="390" y="115" textAnchor="middle" className="fill-noche font-display text-[30px] italic">
          Costa Brava
        </text>
        <text x="390" y="140" textAnchor="middle" className="fill-noche/60 font-mono text-[11px] uppercase tracking-widest">
          vie · sáb
        </text>
        {/* metropolitana */}
        <path d="M90 300c50-60 150-90 240-70 40 10 70 40 60 80-10 60-50 110-110 150-70 30-160 20-200-30-30-40-20-90 10-130Z" fill="#fff3cc" stroke="#140b10" strokeOpacity=".2" />
        <text x="140" y="300" className="fill-noche/60 font-mono text-[11px] uppercase tracking-widest">
          área metropolitana · 24 h
        </text>
        {/* bcn */}
        <path d="M170 360c30-30 90-40 130-20s40 70 10 100-90 50-130 30-40-80-10-110Z" fill="#ff5a36" />
        <text x="235" y="410" textAnchor="middle" className="fill-white font-display text-[34px] italic">
          Barcelona
        </text>
        <text x="235" y="435" textAnchor="middle" className="fill-white/80 font-mono text-[11px] uppercase tracking-widest">
          mismo día
        </text>
        {/* ruta */}
        <path d="M290 360C330 300 340 240 360 200" fill="none" stroke="#140b10" strokeWidth="2" strokeDasharray="4 8" strokeLinecap="round" />
        <circle cx="235" cy="390" r="5" fill="#140b10" />
        <circle cx="390" cy="160" r="5" fill="#140b10" />
      </svg>
      <figcaption className="eyebrow absolute bottom-6 left-8 text-noche/50">Obrador · Poblenou, Barcelona</figcaption>
    </figure>
  );
}
