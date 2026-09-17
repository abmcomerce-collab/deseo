import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { db, schema } from "@/db";
import { getSession } from "./auth";

const ORDERS_COOKIE = "deseo_orders";

/** Marca un pedido como pagado de forma idempotente y descuenta stock. */
export async function fulfillOrder(orderId: string, paymentIntentId?: string | null) {
  return db.transaction(async (tx) => {
    const [order] = await tx
      .update(schema.orders)
      .set({ status: "paid", paidAt: new Date(), stripePaymentIntentId: paymentIntentId ?? null })
      .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending")))
      .returning();
    if (!order) return false; // ya procesado

    const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderId));
    for (const item of items) {
      if (!item.variantId) continue;
      await tx
        .update(schema.variants)
        .set({ stock: sql`greatest(${schema.variants.stock} - ${item.quantity}, 0)` })
        .where(eq(schema.variants.id, item.variantId));
    }
    if (order.couponCode) {
      await tx
        .update(schema.coupons)
        .set({ uses: sql`${schema.coupons.uses} + 1` })
        .where(eq(schema.coupons.code, order.couponCode));
    }
    await tx.insert(schema.orderEvents).values({ orderId, status: "paid", note: "Pago confirmado" });
    return true;
  });
}

export async function cancelPendingOrder(orderId: string, note = "Sesión de pago caducada") {
  const [order] = await db
    .update(schema.orders)
    .set({ status: "cancelled" })
    .where(and(eq(schema.orders.id, orderId), eq(schema.orders.status, "pending")))
    .returning({ id: schema.orders.id });
  if (order) await db.insert(schema.orderEvents).values({ orderId, status: "cancelled", note });
}

export async function rememberOrder(orderId: string) {
  const store = await cookies();
  const prev = (store.get(ORDERS_COOKIE)?.value ?? "").split(",").filter(Boolean);
  const next = [orderId, ...prev.filter((id) => id !== orderId)].slice(0, 10);
  store.set(ORDERS_COOKIE, next.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 60,
  });
}

/** Un pedido lo puede ver quien lo hizo en este navegador, su titular o un admin. */
export async function canViewOrder(order: { id: string; userId: string | null }) {
  const session = await getSession();
  if (session?.role === "admin") return true;
  if (session && order.userId === session.userId) return true;
  const store = await cookies();
  return (store.get(ORDERS_COOKIE)?.value ?? "").split(",").includes(order.id);
}

export async function getOrderWithDetails(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return undefined;
  return db.query.orders.findFirst({
    where: eq(schema.orders.id, id),
    with: {
      items: true,
      events: { orderBy: (e, { asc }) => [asc(e.createdAt)] },
    },
  });
}
