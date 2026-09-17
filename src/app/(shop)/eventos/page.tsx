import type { Metadata } from "next";
import { getProducts } from "@/lib/queries";
import { PoloFan } from "@/components/art/polo";
import { LeadForm } from "@/components/shop/lead-form";
import { Marquee } from "@/components/shop/marquee";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Eventos, bodas y hostelería",
  description:
    "Polos con alcohol para bodas, eventos de empresa, chiringuitos y restaurantes en Barcelona y Costa Brava. Congeladores expositores y precios por volumen.",
  alternates: { canonical: "/eventos" },
};

export const revalidate = 3600;

const PLANS = [
  {
    name: "Fiesta",
    who: "Cumpleaños y fiestas privadas",
    from: "desde 50 polos",
    items: ["Mezcla de hasta 4 sabores", "Neveras isotérmicas incluidas", "Entrega con franja horaria"],
  },
  {
    name: "Boda",
    who: "Bodas y celebraciones",
    from: "desde 120 polos",
    items: ["Carrito de polos con personal", "Sabores y envoltorio personalizados", "Prueba de sabores previa"],
    highlight: true,
  },
  {
    name: "Hostelería",
    who: "Chiringuitos, restaurantes y hoteles",
    from: "pedido recurrente",
    items: ["Congelador expositor en préstamo", "Precio profesional por volumen", "Reposición semanal en temporada"],
  },
];

export default async function EventsPage() {
  const products = await getProducts();
  const arts = products.filter((p) => p.kind === "polo").map((p) => p.art);

  return (
    <>
      <section className="relative overflow-hidden bg-lima">
        <div className="container-x grid items-center gap-10 pb-20 pt-12 sm:pt-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-noche/60">Eventos · Bodas · Hostelería</p>
            <h1 className="font-display mt-6 text-7xl sm:text-9xl">
              El postre del que <em>habla todo el mundo.</em>
            </h1>
            <p className="mt-6 max-w-md text-lg text-noche/70">
              Llevamos DESEO a bodas, eventos de empresa y a las mejores terrazas de la costa. Tú pones la fiesta; nosotros, el frío.
            </p>
            <a href="#presupuesto" className="btn btn-primary mt-9 py-4 text-base">
              Pedir presupuesto
            </a>
          </div>
          <div className="relative h-[420px] lg:h-[560px]">
            <PoloFan arts={[arts[1], arts[0], arts[2], arts[4], arts[3]].filter(Boolean)} className="absolute inset-0" />
          </div>
        </div>
      </section>
      <div className="bg-noche py-4 text-crema">
        <Marquee
          className="font-display text-3xl italic"
          items={["Bodas en el Empordà", "Afterworks en el 22@", "Chiringuitos de la Barceloneta", "Fiestas de Sant Joan", "Cenas de empresa"]}
        />
      </div>

      <section className="container-x py-24 sm:py-32" aria-labelledby="planes">
        <h2 id="planes" className="font-display max-w-3xl text-6xl sm:text-7xl">
          Tres formas de <em>traernos a tu evento.</em>
        </h2>
        <div className="mt-14 grid gap-4 lg:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.08}>
              <article className={`h-full rounded-[32px] p-8 ${p.highlight ? "bg-brasa text-noche" : "border border-linea bg-white/70"}`}>
                <p className={`eyebrow ${p.highlight ? "text-noche/70" : "text-humo"}`}>{p.who}</p>
                <h3 className="font-display mt-4 text-6xl">{p.name}</h3>
                <p className={`mt-1 ${p.highlight ? "text-noche/75" : "text-humo"}`}>{p.from}</p>
                <ul className="mt-8 space-y-3">
                  {p.items.map((it) => (
                    <li key={it} className={`border-t pt-3 ${p.highlight ? "border-noche/20" : "border-linea"}`}>
                      {it}
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="presupuesto" className="scroll-mt-24 bg-noche py-24 text-crema sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-crema/50">Presupuesto en 24 h</p>
            <h2 className="font-display mt-6 text-6xl sm:text-7xl">
              Cuéntanos <em className="text-brasa">tu plan.</em>
            </h2>
            <p className="mt-6 max-w-sm text-crema/65">
              Cuanta más información nos des, más afinada será la propuesta. Te respondemos en menos de 24 horas laborables.
            </p>
          </div>
          <div className="lg:col-span-7">
            <LeadForm />
          </div>
        </div>
      </section>
    </>
  );
}
