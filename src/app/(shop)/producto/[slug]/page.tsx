import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Plus } from "lucide-react";
import { getProductBySlug, getProducts } from "@/lib/queries";
import { toShopProduct } from "@/lib/dto";
import { abv, cn, isDark, money } from "@/lib/format";
import { ProductArt } from "@/components/art/product-art";
import { Polo } from "@/components/art/polo";
import { ProductBuy } from "@/components/shop/product-buy";
import { ProductCard } from "@/components/shop/product-card";
import { JsonLd } from "@/components/json-ld";
import { Reveal } from "@/components/reveal";
import { siteUrl } from "@/lib/site";

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Producto no encontrado" };
  return {
    title: `${p.name} — Polo con ${p.spirit.toLowerCase()} ${abv(p.abv)}`,
    description: `${p.tagline} ${p.description.slice(0, 110)}…`,
    alternates: { canonical: `/producto/${p.slug}` },
    openGraph: { title: `${p.name} · DESEO`, description: p.tagline },
  };
}

export default async function ProductPage({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const [raw, all] = await Promise.all([getProductBySlug(slug), getProducts()]);
  if (!raw) notFound();

  const product = toShopProduct(raw, all);
  const dark = isDark(raw.art.bg);
  const related = all
    .filter((p) => p.id !== raw.id)
    .sort((a, b) => (a.kind === raw.kind ? -1 : 1) - (b.kind === raw.kind ? -1 : 1) || a.sortOrder - b.sortOrder)
    .slice(0, 4)
    .map((p) => toShopProduct(p, all));
  const packFlavors = raw.packFlavors?.map((s) => all.find((p) => p.slug === s)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  const details = [
    { title: "Ingredientes", body: raw.ingredients },
    {
      title: "Alérgenos",
      body: raw.allergens.length ? raw.allergens.join(" · ") : "Sin alérgenos de declaración obligatoria.",
    },
    {
      title: "Conservación",
      body: "Mantener congelado a −18 °C. Consumir preferentemente antes de 6 meses. Sácalo del congelador 2 minutos antes de comerlo. No volver a congelar una vez descongelado.",
    },
    {
      title: "Entrega",
      body: "Reparto propio en caja isotérmica con hielo seco. Barcelona: mismo día si pides antes de las 13:00. Área metropolitana: al día siguiente. Costa Brava: viernes y sábados. El repartidor puede pedir tu DNI.",
    },
  ];

  const prices = raw.variants.map((v) => v.priceCents / 100);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: raw.name,
          description: raw.description,
          sku: raw.variants[0]?.sku,
          brand: { "@type": "Brand", name: "DESEO" },
          url: `${siteUrl()}/producto/${raw.slug}`,
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "EUR",
            lowPrice: Math.min(...prices),
            highPrice: Math.max(...prices),
            offerCount: raw.variants.length,
            availability: raw.variants.some((v) => v.stock > 0) ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
        }}
      />

      <div className="container-x pt-6 sm:pt-10">
        <nav aria-label="Migas de pan" className="eyebrow text-humo">
          <Link href="/" className="hover:text-noche">
            Inicio
          </Link>{" "}
          /{" "}
          <Link href="/tienda" className="hover:text-noche">
            Tienda
          </Link>{" "}
          / <span className="text-noche">{raw.name}</span>
        </nav>

        <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-14">
          {/* Visual */}
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-[40px] sm:aspect-[5/5] lg:aspect-[5/6]"
                style={{ background: raw.art.bg }}
              >
                <span
                  className="font-display pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 select-none whitespace-nowrap text-center text-[28vw] italic leading-none lg:text-[17vw]"
                  style={{ color: raw.art.base, opacity: dark ? 0.25 : 0.2 }}
                  aria-hidden
                >
                  {raw.name.split(" ")[0]}
                </span>
                <div className="absolute inset-0 flex items-center justify-center p-12 sm:p-20">
                  <div className="h-full w-full animate-float">
                    <ProductArt
                      arts={product.arts}
                      kind={raw.kind}
                      title={`Ilustración de ${raw.name}`}
                      className="h-full w-full drop-shadow-[0_50px_40px_rgba(20,11,16,0.25)]"
                    />
                  </div>
                </div>
                <div className={cn("absolute inset-x-6 bottom-6 flex items-end justify-between", dark ? "text-crema" : "text-noche")}>
                  <span className="eyebrow">{raw.kind === "pack" ? `${raw.variants[0]?.units} polos` : "90 ml · 1 polo"}</span>
                  <span className="eyebrow">{abv(raw.abv)}</span>
                </div>
              </div>

              {/* etiqueta */}
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  { k: "Destilado", v: raw.spirit },
                  { k: "Graduación", v: abv(raw.abv) },
                  { k: raw.kind === "pack" ? "Unidades" : "Formato", v: raw.kind === "pack" ? `${raw.variants[0]?.units}` : "90 ml" },
                ].map((x) => (
                  <div key={x.k} className="rounded-3xl border border-linea bg-white/60 p-4 sm:p-5">
                    <p className="eyebrow text-humo">{x.k}</p>
                    <p className="font-display mt-2 text-2xl sm:text-3xl">{x.v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="pb-10 lg:col-span-5 lg:pt-6">
            {raw.badge && (
              <span className="eyebrow inline-block rounded-full bg-noche px-3 py-1.5 text-[0.62rem] text-crema">{raw.badge}</span>
            )}
            <h1 className="font-display mt-5 text-6xl sm:text-8xl">{raw.name}</h1>
            <p className="mt-4 text-xl text-humo">{raw.tagline}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {raw.notes.map((n) => (
                <span key={n} className="rounded-full border border-linea px-3 py-1 text-sm">
                  {n}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm text-humo">
              Desde <span className="font-medium text-noche">{money(Math.min(...raw.variants.map((v) => v.priceCents)))}</span> · IVA incluido
            </p>

            <div className="mt-8 border-t border-linea pt-8">
              <ProductBuy product={product} />
            </div>

            <p className="mt-10 text-lg leading-relaxed">{raw.description}</p>

            {packFlavors?.length ? (
              <div className="mt-8">
                <p className="eyebrow text-humo">Qué incluye</p>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {packFlavors.map((f) => (
                    <li key={f.slug}>
                      <Link
                        href={`/producto/${f.slug}`}
                        className="flex items-center gap-3 rounded-2xl border border-linea bg-white/60 p-2 pr-3 transition hover:border-noche"
                      >
                        <span className="grid h-12 w-10 place-items-center rounded-xl" style={{ background: f.art.bg }}>
                          <Polo art={f.art} className="h-10" />
                        </span>
                        <span className="text-sm leading-tight">{f.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-10 divide-y divide-linea border-y border-linea">
              {details.map((d, i) => (
                <details key={d.title} className="group" open={i === 0}>
                  <summary className="flex cursor-pointer list-none items-center justify-between py-5 font-medium [&::-webkit-details-marker]:hidden">
                    {d.title}
                    <Plus className="size-4 transition duration-300 group-open:rotate-45" />
                  </summary>
                  <p className="pb-5 leading-relaxed text-humo">{d.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>

      {raw.pairing && (
        <section className="mt-16 py-24 sm:py-32" style={{ background: raw.art.bg, color: raw.art.ink }}>
          <Reveal className="container-x text-center">
            <p className="eyebrow opacity-70">El momento perfecto</p>
            <blockquote className="font-display mx-auto mt-6 max-w-5xl text-5xl sm:text-7xl lg:text-8xl">
              “{raw.pairing}”
            </blockquote>
          </Reveal>
        </section>
      )}

      <section className="container-x pb-32 pt-24 sm:py-32" aria-labelledby="relacionados">
        <div className="flex items-end justify-between gap-6">
          <h2 id="relacionados" className="font-display text-5xl sm:text-7xl">
            Combina <em>bien con…</em>
          </h2>
          <Link href="/tienda" className="link-underline hidden shrink-0 sm:inline">
            Ver todos
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
