import type { PoloArt, ProductWithVariants } from "@/db/schema";

export type ShopVariant = {
  id: string;
  name: string;
  units: number;
  priceCents: number;
  compareAtCents: number | null;
  stock: number;
};

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  kind: "polo" | "pack";
  spirit: string;
  abv: string;
  badge: string | null;
  notes: string[];
  art: PoloArt;
  arts: PoloArt[];
  variants: ShopVariant[];
};

/** Serializa un producto para el cliente, resolviendo las ilustraciones de los packs. */
export function toShopProduct(p: ProductWithVariants, all: Pick<ProductWithVariants, "slug" | "art">[] = []): ShopProduct {
  const arts =
    p.kind === "pack" && p.packFlavors?.length
      ? p.packFlavors.map((slug) => all.find((x) => x.slug === slug)?.art).filter((a): a is PoloArt => Boolean(a))
      : [p.art];
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    kind: p.kind,
    spirit: p.spirit,
    abv: p.abv,
    badge: p.badge,
    notes: p.notes,
    art: p.art,
    arts: arts.length ? arts : [p.art],
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      units: v.units,
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents,
      stock: v.stock,
    })),
  };
}
