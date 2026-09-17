import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import type { ProductWithVariants } from "@/db/schema";

const withVariants = { variants: { orderBy: [asc(schema.variants.sortOrder)] } };

export async function getProducts(opts: { includeInactive?: boolean } = {}): Promise<ProductWithVariants[]> {
  return db.query.products.findMany({
    where: opts.includeInactive ? undefined : eq(schema.products.isActive, true),
    orderBy: [asc(schema.products.sortOrder)],
    with: withVariants,
  });
}

export async function getProductBySlug(slug: string): Promise<ProductWithVariants | undefined> {
  return db.query.products.findFirst({
    where: and(eq(schema.products.slug, slug), eq(schema.products.isActive, true)),
    with: withVariants,
  });
}

export async function getProductsBySlugs(slugs: string[]) {
  if (!slugs.length) return [];
  return db.query.products.findMany({
    where: inArray(schema.products.slug, slugs),
    with: withVariants,
  });
}

export function lowestPrice(p: ProductWithVariants) {
  return Math.min(...p.variants.map((v) => v.priceCents));
}

export function unitPrice(p: ProductWithVariants) {
  return Math.min(...p.variants.map((v) => Math.round(v.priceCents / v.units)));
}
