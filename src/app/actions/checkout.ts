"use server";

import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { isValidDelivery, zoneForPostalCode } from "@/lib/delivery";
import { priceCart } from "@/lib/pricing";
import { getStripe, siteUrl, stripeEnabled } from "@/lib/stripe";
import { rememberOrder } from "@/lib/orders";

const checkoutSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  name: z.string().trim().min(3, "Escribe tu nombre y apellidos."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^(\+34)?[6-9]\d{8}$/, "Introduce un teléfono español válido.")),
  address: z.string().trim().min(5, "Indica calle, número y piso."),
  city: z.string().trim().min(2, "Indica la ciudad."),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Código postal de 5 cifras."),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Elige un día de entrega."),
  deliverySlot: z.string().min(1, "Elige una franja horaria."),
  notes: z.string().trim().max(400).optional(),
  couponCode: z.string().trim().max(40).optional().nullable(),
  ageConfirmed: z.literal(true, { message: "Debes confirmar que eres mayor de 18 años." }),
  termsAccepted: z.literal(true, { message: "Debes aceptar las condiciones de venta." }),
  items: z
    .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(50) }))
    .min(1, "Tu cesta está vacía.")
    .max(30),
});

export type CheckoutInput = z.input<typeof checkoutSchema>;
export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; message: string; errors?: Record<string, string>; issues?: string[] };

export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Revisa los campos marcados.", errors };
  }
  const data = parsed.data;

  const zone = zoneForPostalCode(data.postalCode);
  if (!zone) {
    return { ok: false, message: "Todavía no repartimos en ese código postal.", errors: { postalCode: "Fuera de zona de reparto." } };
  }
  if (!isValidDelivery(zone, data.deliveryDate, data.deliverySlot)) {
    return {
      ok: false,
      message: "Esa franja ya no está disponible. Elige otra.",
      errors: { deliveryDate: "Elige una fecha y franja disponibles." },
    };
  }

  const priced = await priceCart(data.items, { couponCode: data.couponCode, zone });
  if (!priced.lines.length) return { ok: false, message: "Los productos de tu cesta ya no están disponibles.", issues: priced.issues };
  if (priced.issues.length) {
    return { ok: false, message: "Hemos actualizado tu cesta: revisa los cambios antes de pagar.", issues: priced.issues };
  }
  if (data.couponCode && priced.coupon && !priced.coupon.ok) {
    return { ok: false, message: priced.coupon.error, errors: { couponCode: priced.coupon.error } };
  }

  const session = await getSession();
  const couponCode = priced.coupon?.ok ? priced.coupon.code : null;

  const order = await db.transaction(async (tx) => {
    const [o] = await tx
      .insert(schema.orders)
      .values({
        userId: session?.userId ?? null,
        email: data.email,
        name: data.name,
        phone: data.phone,
        address: data.address,
        city: data.city,
        postalCode: data.postalCode,
        zone: zone.id,
        deliveryDate: data.deliveryDate,
        deliverySlot: data.deliverySlot,
        notes: data.notes || null,
        subtotalCents: priced.subtotalCents,
        discountCents: priced.discountCents,
        shippingCents: priced.shippingCents,
        totalCents: priced.totalCents,
        couponCode,
        ageConfirmed: true,
      })
      .returning();
    await tx.insert(schema.orderItems).values(
      priced.lines.map((l) => ({
        orderId: o.id,
        variantId: l.variantId,
        productSlug: l.productSlug,
        productName: l.productName,
        variantName: l.variantName,
        unitPriceCents: l.unitPriceCents,
        quantity: l.quantity,
      })),
    );
    await tx.insert(schema.orderEvents).values({ orderId: o.id, status: "pending", note: "Pedido creado" });
    return o;
  });

  await rememberOrder(order.id);

  if (!stripeEnabled()) {
    // Modo local sin claves: pasarela simulada para poder probar el flujo completo.
    return { ok: true, url: `/checkout/simulado/${order.id}` };
  }

  try {
    const stripe = getStripe();
    const base = siteUrl();
    const discounts = [];
    if (priced.discountCents > 0 && couponCode) {
      const coupon = await stripe.coupons.create({
        amount_off: priced.discountCents,
        currency: "eur",
        duration: "once",
        max_redemptions: 1,
        name: couponCode,
      });
      discounts.push({ coupon: coupon.id });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: "es",
      customer_email: data.email,
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      payment_intent_data: { metadata: { orderId: order.id } },
      line_items: priced.lines.map((l) => ({
        quantity: l.quantity,
        price_data: {
          currency: "eur",
          unit_amount: l.unitPriceCents,
          product_data: { name: `${l.productName} · ${l.variantName}`, metadata: { variantId: l.variantId } },
        },
      })),
      discounts: discounts.length ? discounts : undefined,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            display_name: `Entrega en frío · ${zone.name} · ${data.deliverySlot}`,
            fixed_amount: { amount: priced.shippingCents, currency: "eur" },
          },
        },
      ],
      custom_text: {
        submit: { message: "Solo entregamos a mayores de 18 años. El repartidor puede pedirte el DNI." },
      },
      expires_at: Math.floor(Date.now() / 1000) + 60 * 45,
      success_url: `${base}/pedido/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/checkout?cancelado=1`,
    });

    await db
      .update(schema.orders)
      .set({ stripeSessionId: checkout.id })
      .where(eq(schema.orders.id, order.id));

    return { ok: true, url: checkout.url! };
  } catch (err) {
    console.error("[checkout] Stripe error", err);
    return { ok: false, message: "No hemos podido conectar con la pasarela de pago. Inténtalo de nuevo en unos segundos." };
  }
}

export async function quoteCart(input: {
  items: { variantId: string; quantity: number }[];
  couponCode?: string | null;
  postalCode?: string;
}) {
  const items = z
    .array(z.object({ variantId: z.string().uuid(), quantity: z.number().int().min(1).max(50) }))
    .max(30)
    .safeParse(input.items);
  if (!items.success) return null;
  const zone = input.postalCode ? zoneForPostalCode(input.postalCode) : null;
  const priced = await priceCart(items.data, { couponCode: input.couponCode, zone });
  return {
    subtotalCents: priced.subtotalCents,
    discountCents: priced.discountCents,
    shippingCents: priced.shippingCents,
    totalCents: priced.totalCents,
    coupon: priced.coupon,
    issues: priced.issues,
    zone: zone ? { id: zone.id, name: zone.name } : null,
    lines: priced.lines.map((l) => ({ variantId: l.variantId, quantity: l.quantity, unitPriceCents: l.unitPriceCents, stock: l.stock })),
  };
}
