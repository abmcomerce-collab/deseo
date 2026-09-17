import Link from "next/link";
import { ArrowRight, ArrowUpRight, Clock, Snowflake, Truck } from "lucide-react";
import { getProducts } from "@/lib/queries";
import { toShopProduct } from "@/lib/dto";
import { Hero } from "@/components/home/hero";
import { ProductCard } from "@/components/shop/product-card";
import { Marquee } from "@/components/shop/marquee";
import { PostalChecker } from "@/components/shop/postal-checker";
import { Faq, FAQS } from "@/components/shop/faq";
import { Reveal } from "@/components/reveal";
import { Polo, PoloFan } from "@/components/art/polo";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  const products = await getProducts();
  const shop = products.map((p) => toShopProduct(p, products));
  const polos = shop.filter((p) => p.kind === "polo");
  const heroFlavors = polos.slice(0, 6);
  const degustacion = shop.find((p) => p.slug === "caja-degustacion");
  const limited = polos.find((p) => p.badge === "Edición limitada");

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "DESEO",
            url: siteUrl(),
            logo: `${siteUrl()}/icon.svg`,
            address: { "@type": "PostalAddress", addressLocality: "Barcelona", addressCountry: "ES" },
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />

      <Hero flavors={heroFlavors} />

      <div className="-rotate-1 scale-105 bg-brasa py-4 text-noche">
        <Marquee
          className="font-display text-4xl italic sm:text-5xl"
          items={["Hecho en Barcelona", "Alcohol de verdad", "Fruta de temporada", "Entrega a −18 °C", "Solo +18"]}
          separator="✳"
        />
      </div>

      {/* LA CARTA */}
      <section className="container-x pb-10 pt-28 sm:pt-36" aria-labelledby="carta">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <p className="eyebrow text-humo">La carta · {polos.length} sabores</p>
            <h2 id="carta" className="font-display mt-4 text-6xl sm:text-8xl">
              Elige tu <em>vicio.</em>
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="max-w-sm">
            <p className="text-lg text-humo">
              Cada polo es un cóctel clásico reinterpretado con destilados reales, fruta fresca y cero atajos.
            </p>
            <Link href="/tienda" className="link-underline mt-4 inline-flex items-center gap-2 font-medium">
              Ver toda la tienda <ArrowRight className="size-4" />
            </Link>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {polos.map((p, i) => (
            <Reveal key={p.id} delay={(i % 4) * 0.07}>
              <ProductCard product={p} priority={i < 4} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* MANIFIESTO */}
      <section className="container-x py-28 sm:py-36" aria-labelledby="manifiesto">
        <div className="grid gap-16 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <p className="eyebrow text-humo">Por qué DESEO</p>
            <h2 id="manifiesto" className="font-display mt-6 text-5xl sm:text-7xl lg:text-[5.6rem]">
              No es un helado <em>con un chorrito.</em> Es tu cóctel favorito, en otro estado.
            </h2>
          </Reveal>
          <div className="space-y-10 lg:col-span-4 lg:col-start-9 lg:pt-24">
            {[
              {
                n: "01",
                t: "Destilados de verdad",
                d: "Ron, tequila 100% agave, vermut de Reus o cava del Penedès. Nada de aromas que imitan al alcohol.",
              },
              {
                n: "02",
                t: "Fruta y producto local",
                d: "Fresas del Maresme, limones de Sóller y café tostado en Gràcia. Cambiamos recetas según temporada.",
              },
              {
                n: "03",
                t: "Congelado a −24 °C",
                d: "Congelación rápida en pequeños lotes para que el cristal de hielo sea mínimo y la textura, sedosa.",
              },
            ].map((f, i) => (
              <Reveal key={f.n} delay={i * 0.08}>
                <div className="flex gap-6 border-t border-linea pt-6">
                  <span className="font-mono text-sm text-tinta">{f.n}</span>
                  <div>
                    <h3 className="font-display text-3xl">{f.t}</h3>
                    <p className="mt-2 text-humo">{f.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ENTREGAS */}
      <section className="relative overflow-hidden bg-noche text-crema" aria-labelledby="entregas">
        <div className="container-x grid gap-16 py-24 sm:py-32 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow text-crema/50">Entregas en frío</p>
            <h2 id="entregas" className="font-display mt-6 text-6xl sm:text-8xl">
              Del congelador <em className="text-brasa">a tu mesa.</em>
            </h2>
            <p className="mt-6 max-w-md text-lg text-crema/70">
              Reparto propio en Barcelona y área metropolitana, con franja horaria. Y los fines de semana, en la Costa Brava.
            </p>
            <div className="mt-10 max-w-md">
              <PostalChecker dark />
            </div>
          </Reveal>
          <div className="grid content-center gap-4">
            {[
              { icon: Clock, t: "Pide antes de las 13:00", d: "y recíbelo hoy mismo en Barcelona ciudad, en la franja que prefieras." },
              { icon: Snowflake, t: "Caja isotérmica con hielo seco", d: "Tus polos viajan por debajo de −18 °C durante todo el trayecto." },
              { icon: Truck, t: "Entrega en mano, con DNI", d: "Solo entregamos a mayores de edad. Te llamamos 15 minutos antes." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 0.1}>
                <div className="flex gap-5 rounded-3xl border border-crema/10 bg-crema/[0.03] p-6 transition hover:border-crema/25">
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brasa text-noche">
                    <s.icon className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-3xl">{s.t}</h3>
                    <p className="mt-1 text-crema/60">{s.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
            <Link href="/entregas" className="link-underline mt-2 inline-flex w-fit items-center gap-2 text-crema/80">
              Ver zonas y horarios <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CAJA DEGUSTACIÓN */}
      {degustacion && (
        <section className="container-x py-24 sm:py-32" aria-labelledby="degustacion">
          <Reveal>
            <div className="relative grid overflow-hidden rounded-[40px] bg-brasa text-noche lg:grid-cols-2">
              <div className="relative z-10 p-8 sm:p-14 lg:p-20">
                <p className="eyebrow text-noche/70">¿No sabes cuál elegir?</p>
                <h2 id="degustacion" className="font-display mt-6 text-6xl sm:text-8xl">
                  Pruébalos <em>todos.</em>
                </h2>
                <p className="mt-6 max-w-md text-lg text-noche/80">
                  La Caja Degustación trae un polo de cada sabor. La forma más rica de encontrar tu favorito, o de quedar como un rey en
                  la próxima cena.
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-5">
                  <Link href="/producto/caja-degustacion" className="btn bg-noche py-4 text-base text-crema hover:bg-white hover:text-noche">
                    Quiero la caja <ArrowRight className="size-4" />
                  </Link>
                  <p className="font-display text-4xl">34,90 €</p>
                  <p className="text-sm text-noche/70 line-through">39,20 €</p>
                </div>
              </div>
              <div className="relative h-[380px] lg:h-auto">
                <PoloFan arts={degustacion.arts.slice(0, 5)} className="absolute inset-x-0 -bottom-10 top-10 lg:top-16" />
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* EDICIÓN LIMITADA + EVENTOS */}
      <section className="container-x grid gap-5 pb-24 sm:pb-32 lg:grid-cols-5">
        {limited && (
          <Reveal className="lg:col-span-3">
            <Link
              href={`/producto/${limited.slug}`}
              className="group relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-[40px] p-8 sm:p-12"
              style={{ background: limited.art.bg, color: limited.art.ink }}
            >
              <div className="relative z-10 max-w-sm">
                <p className="eyebrow opacity-70">Edición limitada · Otoño–Invierno</p>
                <h2 className="font-display mt-5 text-6xl sm:text-7xl">{limited.name}</h2>
                <p className="mt-4 opacity-75">{limited.tagline}</p>
              </div>
              <span className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-current px-5 py-3 text-sm transition group-hover:bg-crema group-hover:text-noche">
                Descubrir <ArrowUpRight className="size-4" />
              </span>
              <Polo
                art={limited.art}
                className="absolute -bottom-10 right-[-6%] h-[115%] rotate-[18deg] transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-[8deg] sm:right-[4%]"
              />
            </Link>
          </Reveal>
        )}
        <Reveal delay={0.1} className="lg:col-span-2">
          <Link
            href="/eventos"
            className="group flex min-h-[520px] flex-col justify-between rounded-[40px] bg-lima p-8 sm:p-12"
          >
            <div>
              <p className="eyebrow text-noche/60">Bodas · Empresas · Chiringuitos</p>
              <h2 className="font-display mt-5 text-6xl">
                ¿Montas <em>una fiesta?</em>
              </h2>
              <p className="mt-4 text-noche/70">
                Congeladores expositores, carrito de polos y precios por volumen desde 50 unidades. Te preparamos una propuesta en 24 h.
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-noche px-5 py-3 text-sm text-crema transition group-hover:bg-brasa group-hover:text-noche">
              Pedir presupuesto <ArrowUpRight className="size-4" />
            </span>
          </Link>
        </Reveal>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="container-x scroll-mt-24 pb-28 sm:pb-36" aria-labelledby="faq">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <p className="eyebrow text-humo">Preguntas frecuentes</p>
            <h2 id="faq" className="font-display mt-6 text-6xl sm:text-7xl">
              Lo que <em>todo el mundo</em> pregunta.
            </h2>
            <p className="mt-6 text-humo">
              ¿Algo más? Escríbenos a{" "}
              <a href="mailto:hola@deseo.bcn" className="link-underline text-noche">
                hola@deseo.bcn
              </a>
            </p>
          </Reveal>
          <div className="lg:col-span-8">
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}
