import "server-only";
import { eq, inArray } from "drizzle-orm";
import { db, schema } from "@/db";
import { shippingFor, type Zone } from "./delivery";

export type CartLineInput = { variantId: string; quantity: number };

export type PricedLine = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  variantName: string;
  unitPriceCents: number;
  quantity: number;
  stock: number;
  lineTotalCents: number;
};

export type CouponResult =
  | { ok: true; code: string; type: "percent" | "fixed" | "free_shipping"; value: number; label: string }
  | { ok: false; error: string };

export async function validateCoupon(rawCode: string | undefined | null, subtotalCents: number): Promise<CouponResult | null> {
  const code = rawCode?.trim().toUpperCase();
  if (!code) return null;
  const coupon = await db.query.coupons.findFirst({ where: eq(schema.coupons.code, code) });
  if (!coupon || !coupon.active) return { ok: false, error: "Este código no existe o ya no está activo." };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false, error: "Este código ha caducado." };
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) return { ok: false, error: "Este código ya se ha agotado." };
  if (subtotalCents < coupon.minSubtotalCents)
    return {
      ok: false,
      error: `Este código requiere un pedido mínimo de ${(coupon.minSubtotalCents / 100).toLocaleString("es-ES")} €.`,
    };
  const label =
    coupon.type === "percent"
      ? `${coupon.value}% de descuento`
      : coupon.type === "fixed"
        ? `${(coupon.value / 100).toLocaleString("es-ES")} € de descuento`
        : "Envío gratis";
  return { ok: true, code: coupon.code, type: coupon.type, value: coupon.value, label };
}

/**
 * Recalcula el carrito entero con precios y stock de la base de datos.
 * Nunca confiamos en importes enviados por el cliente.
 */
export async function priceCart(lines: CartLineInput[], opts: { couponCode?: string | null; zone?: Zone | null } = {}) {
  const clean = lines
    .filter((l) => l.quantity > 0)
    .map((l) => ({ variantId: l.variantId, quantity: Math.min(Math.floor(l.quantity), 50) }));
  const ids = [...new Set(clean.map((l) => l.variantId))].filter((id) => /^[0-9a-f-]{36}$/i.test(id));

  const rows = ids.length
    ? await db
        .select({ variant: schema.variants, product: schema.products })
        .from(schema.variants)
        .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
        .where(inArray(schema.variants.id, ids))
    : [];

  const issues: string[] = [];
  const priced: PricedLine[] = [];
  for (const line of clean) {
    const row = rows.find((r) => r.variant.id === line.variantId);
    if (!row || !row.product.isActive) {
      issues.push("Uno de los productos ya no está disponible y lo hemos quitado.");
      continue;
    }
    let qty = line.quantity;
    if (row.variant.stock <= 0) {
      issues.push(`${row.product.name} (${row.variant.name}) está agotado.`);
      continue;
    }
    if (qty > row.variant.stock) {
      qty = row.variant.stock;
      issues.push(`Solo quedan ${row.variant.stock} de ${row.product.name} (${row.variant.name}).`);
    }
    priced.push({
      variantId: row.variant.id,
      productId: row.product.id,
      productSlug: row.product.slug,
      productName: row.product.name,
      variantName: row.variant.name,
      unitPriceCents: row.variant.priceCents,
      quantity: qty,
      stock: row.variant.stock,
      lineTotalCents: row.variant.priceCents * qty,
    });
  }

  const subtotalCents = priced.reduce((s, l) => s + l.lineTotalCents, 0);
  const coupon = await validateCoupon(opts.couponCode, subtotalCents);
  let discountCents = 0;
  if (coupon?.ok && coupon.type === "percent") discountCents = Math.round((subtotalCents * coupon.value) / 100);
  if (coupon?.ok && coupon.type === "fixed") discountCents = Math.min(coupon.value, subtotalCents);
  const freeShipping = coupon?.ok === true && coupon.type === "free_shipping";
  const shippingCents = opts.zone ? shippingFor(opts.zone, subtotalCents - discountCents, freeShipping) : 0;
  const totalCents = subtotalCents - discountCents + shippingCents;

  return { lines: priced, subtotalCents, discountCents, shippingCents, totalCents, coupon, issues };
}
