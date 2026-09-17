"use server";

import { inArray } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { validateCoupon } from "@/lib/pricing";

const ids = z.array(z.string().uuid()).max(50);

/** Devuelve precio y stock actuales de las variantes de la cesta. */
export async function refreshCart(variantIds: string[]) {
  const parsed = ids.safeParse(variantIds);
  if (!parsed.success || parsed.data.length === 0) return [];
  const rows = await db
    .select({ id: schema.variants.id, priceCents: schema.variants.priceCents, stock: schema.variants.stock })
    .from(schema.variants)
    .where(inArray(schema.variants.id, parsed.data));
  return parsed.data.map((id) => {
    const row = rows.find((r) => r.id === id);
    return { variantId: id, priceCents: row?.priceCents ?? 0, maxStock: row?.stock ?? 0 };
  });
}

export async function checkCoupon(code: string, subtotalCents: number) {
  const res = await validateCoupon(z.string().max(40).parse(code), Math.max(0, Math.floor(subtotalCents)));
  return res ?? { ok: false as const, error: "Introduce un código." };
}
