import Link from "next/link";
import type { ShopProduct } from "@/lib/dto";
import { ProductArt } from "@/components/art/product-art";
import { abv, cn, isDark, money } from "@/lib/format";
import { QuickAdd } from "./add-to-cart";

export function ProductCard({
  product,
  priority = false,
  className,
  headingLevel = 3,
}: {
  product: ShopProduct;
  priority?: boolean;
  className?: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const from = Math.min(...product.variants.map((v) => v.priceCents));
  const perUnit = Math.min(...product.variants.map((v) => Math.round(v.priceCents / v.units)));
  const soldOut = product.variants.every((v) => v.stock <= 0);
  const dark = isDark(product.art.bg);

  return (
    <article className={cn("group relative", className)} data-priority={priority || undefined}>
      <Link href={`/producto/${product.slug}`} className="block" tabIndex={-1} aria-hidden>
        <div
          className="relative aspect-[4/5] overflow-hidden rounded-[28px] transition-[border-radius] duration-500 group-hover:rounded-[40px]"
          style={{ background: product.art.bg }}
        >
          <div
            className="absolute inset-x-0 bottom-0 h-1/3 opacity-60"
            style={{ background: `radial-gradient(60% 60% at 50% 100%, ${product.art.base}55, transparent)` }}
          />
          <div className={cn("absolute left-4 top-4 flex flex-wrap gap-1.5", dark ? "text-crema" : "text-noche")}>
            {product.badge && (
              <span className="eyebrow rounded-full bg-papel/85 px-2.5 py-1.5 text-[0.62rem] text-noche backdrop-blur">
                {product.badge}
              </span>
            )}
            {soldOut && <span className="eyebrow rounded-full bg-noche px-2.5 py-1.5 text-[0.62rem] text-crema">Agotado</span>}
          </div>
          <span
            className={cn("eyebrow absolute right-4 top-5 text-[0.62rem]", dark ? "text-crema/70" : "")}
            style={dark ? undefined : { color: product.art.ink, opacity: 0.7 }}
          >
            {abv(product.abv)}
          </span>
          <div className="absolute inset-0 flex items-center justify-center p-10 pb-6 pt-14">
            <ProductArt
              arts={product.arts}
              kind={product.kind}
              className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(.34,1.56,.64,1)] group-hover:-translate-y-3 group-hover:-rotate-6 group-hover:scale-[1.04] drop-shadow-[0_24px_24px_rgba(20,11,16,0.18)]"
            />
          </div>
        </div>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3 px-1">
        <div className="min-w-0">
          <Heading className="font-display text-[1.9rem] leading-none">
            <Link href={`/producto/${product.slug}`}>{product.name}</Link>
          </Heading>
          <p className="mt-1.5 line-clamp-1 text-sm text-humo">{product.tagline}</p>
          <p className="mt-2 text-sm">
            <span className="font-medium">Desde {money(from)}</span>
            {product.kind === "polo" && <span className="text-humo"> · {money(perUnit)}/ud</span>}
          </p>
        </div>
        <QuickAdd product={product} className="mt-1 shrink-0" />
      </div>
    </article>
  );
}
