import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/queries";
import { toShopProduct } from "@/lib/dto";
import { ProductCard } from "@/components/shop/product-card";
import { Suspense } from "react";
import { cn } from "@/lib/format";
import { SortSelect } from "@/components/shop/sort-select";

export const metadata: Metadata = {
  title: "Tienda — Todos los sabores",
  description: "Polos con alcohol en cajas de 4, 8 y 12, packs degustación y neveras para fiestas. Entrega congelada en Barcelona.",
  alternates: { canonical: "/tienda" },
};

const SORTS = [
  { id: "destacados", label: "Destacados" },
  { id: "precio-asc", label: "Precio: menor a mayor" },
  { id: "precio-desc", label: "Precio: mayor a menor" },
  { id: "graduacion", label: "Más intensos" },
] as const;

type Search = { tipo?: string; base?: string; orden?: string };

function href(current: Search, patch: Partial<Search>) {
  const next = { ...current, ...patch };
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(next)) if (v) qs.set(k, v);
  const s = qs.toString();
  return s ? `/tienda?${s}` : "/tienda";
}

export default async function ShopPage({ searchParams }: PageProps<"/tienda">) {
  const sp = (await searchParams) as Search;
  const all = await getProducts();
  const products = all.map((p) => toShopProduct(p, all));

  const spirits = [...new Set(products.filter((p) => p.kind === "polo").map((p) => p.spirit))];
  const tipo = sp.tipo === "polo" || sp.tipo === "pack" ? sp.tipo : undefined;
  const base = spirits.find((s) => s.toLowerCase() === sp.base?.toLowerCase());
  const orden = SORTS.find((s) => s.id === sp.orden)?.id ?? "destacados";

  let list = products.filter((p) => (!tipo || p.kind === tipo) && (!base || p.spirit === base));
  const min = (p: (typeof list)[number]) => Math.min(...p.variants.map((v) => v.priceCents));
  if (orden === "precio-asc") list = [...list].sort((a, b) => min(a) - min(b));
  if (orden === "precio-desc") list = [...list].sort((a, b) => min(b) - min(a));
  if (orden === "graduacion") list = [...list].sort((a, b) => Number(b.abv) - Number(a.abv));

  const current: Search = { tipo, base: base?.toLowerCase(), orden: orden === "destacados" ? undefined : orden };
  const chip = (active: boolean) =>
    cn(
      "shrink-0 rounded-full border px-4 py-2 text-sm transition",
      active ? "border-noche bg-noche text-crema" : "border-linea bg-white/60 hover:border-noche",
    );

  const title = tipo === "pack" ? "Packs y regalos" : base ? `Polos con ${base.toLowerCase()}` : "Todos los sabores";

  return (
    <div className="container-x pb-28 pt-10 sm:pt-16">
      <nav aria-label="Migas de pan" className="eyebrow text-humo">
        <Link href="/" className="hover:text-noche">
          Inicio
        </Link>{" "}
        / <span className="text-noche">Tienda</span>
      </nav>
      <div className="mt-6 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <h1 className="font-display text-7xl sm:text-9xl">{title}</h1>
        <p className="max-w-xs text-humo">
          {list.length} {list.length === 1 ? "producto" : "productos"}. Cajas de 4, 8 y 12 polos: cuantos más, mejor precio por unidad.
        </p>
      </div>

      <div className="sticky top-16 z-30 -mx-4 mt-10 border-y border-linea bg-papel/90 px-4 py-3 backdrop-blur-xl md:top-[4.5rem] md:mx-0 md:rounded-full md:border md:px-3">
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-3">
        <div className="flex min-w-0 basis-full items-center gap-2 overflow-x-auto [scrollbar-width:none] sm:flex-1 sm:basis-auto">
          <Link href={href(current, { tipo: undefined, base: undefined })} className={chip(!tipo && !base)} scroll={false}>
            Todo
          </Link>
          <Link href={href(current, { tipo: "polo", base: undefined })} className={chip(tipo === "polo" && !base)} scroll={false}>
            Polos
          </Link>
          <Link href={href(current, { tipo: "pack", base: undefined })} className={chip(tipo === "pack")} scroll={false}>
            Packs
          </Link>
          <span className="mx-2 h-6 w-px shrink-0 bg-linea" aria-hidden />
          {spirits.map((s) => (
            <Link
              key={s}
              href={href(current, { base: base === s ? undefined : s.toLowerCase(), tipo: undefined })}
              className={chip(base === s)}
              scroll={false}
            >
              {s}
            </Link>
          ))}
        </div>
        <Suspense>
          <SortSelect options={SORTS} value={orden} />
        </Suspense>
        </div>
      </div>

      {list.length ? (
        <div className="mt-12 grid grid-cols-1 gap-x-5 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 4} headingLevel={2} />
          ))}
        </div>
      ) : (
        <div className="mt-24 text-center">
          <p className="font-display text-5xl">Nada por aquí.</p>
          <Link href="/tienda" className="btn btn-primary mt-8">
            Ver todo
          </Link>
        </div>
      )}
    </div>
  );
}
