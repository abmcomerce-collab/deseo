import { sql } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import bcrypt from "bcryptjs";
import * as schema from "./schema";
import { catalog, seedCoupons } from "./catalog";

type DB = PostgresJsDatabase<typeof schema>;

const DEMO_NAMES = [
  "Laia Puig", "Marc Ferrer", "Júlia Soler", "Pol Vidal", "Carla Roca", "Nil Serra",
  "Martina Font", "Arnau Camps", "Paula Martí", "Jan Casals", "Ona Riera", "Àlex Pons",
  "Lucía García", "Hugo Martín", "Sofía López", "Daniel Ruiz",
];
const DEMO_CP = ["08001", "08008", "08012", "08021", "08036", "08005", "08902", "08922", "17210", "08172"];
const SLOTS = ["12:00–15:00", "17:00–20:00", "20:00–23:00"];

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function seed(db: DB, opts: { adminEmail: string; adminPassword?: string; demoOrders?: boolean }) {
  if (opts.adminPassword) {
    await db
      .insert(schema.users)
      .values({
        email: opts.adminEmail.toLowerCase(),
        name: "Equipo DESEO",
        passwordHash: await bcrypt.hash(opts.adminPassword, 10),
        role: "admin",
      })
      .onConflictDoNothing();
  }

  const existing = await db.select({ n: sql<number>`count(*)::int` }).from(schema.products);
  if (existing[0].n > 0) {
    console.log("↷ Catálogo ya existente, no se vuelve a sembrar.");
    return;
  }

  console.log("→ Sembrando catálogo…");
  const variantIndex: { id: string; price: number; slug: string; name: string; vname: string }[] = [];
  for (const [i, p] of catalog.entries()) {
    const [row] = await db
      .insert(schema.products)
      .values({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        description: p.description,
        kind: p.kind,
        spirit: p.spirit,
        abv: p.abv,
        notes: p.notes,
        ingredients: p.ingredients,
        allergens: p.allergens,
        pairing: p.pairing,
        art: p.art,
        packFlavors: p.packFlavors ?? null,
        badge: p.badge ?? null,
        featured: p.featured ?? false,
        sortOrder: i,
      })
      .returning({ id: schema.products.id });
    for (const [j, v] of p.variants.entries()) {
      const [vr] = await db
        .insert(schema.variants)
        .values({
          productId: row.id,
          name: v.name,
          units: v.units,
          priceCents: Math.round(v.price * 100),
          compareAtCents: v.compareAt ? Math.round(v.compareAt * 100) : null,
          stock: v.stock,
          sku: `DS-${p.slug.slice(0, 3).toUpperCase()}-${v.units}`,
          sortOrder: j,
        })
        .returning({ id: schema.variants.id });
      variantIndex.push({ id: vr.id, price: Math.round(v.price * 100), slug: p.slug, name: p.name, vname: v.name });
    }
  }

  await db.insert(schema.coupons).values(seedCoupons).onConflictDoNothing();

  if (opts.demoOrders !== false) {
    console.log("→ Generando pedidos de demostración para el panel…");
    const rand = mulberry32(2026);
    const now = Date.now();
    const statuses: schema.OrderStatus[] = ["delivered", "delivered", "delivered", "shipped", "preparing", "paid"];
    for (let k = 0; k < 64; k++) {
      const daysAgo = Math.floor(Math.pow(rand(), 1.3) * 30);
      const created = new Date(now - daysAgo * 86400000 - Math.floor(rand() * 36000000));
      const lines = 1 + Math.floor(rand() * 3);
      const items = Array.from({ length: lines }, () => {
        const v = variantIndex[Math.floor(rand() * variantIndex.length)];
        return { v, qty: 1 + (rand() > 0.8 ? 1 : 0) };
      });
      const subtotal = items.reduce((s, it) => s + it.v.price * it.qty, 0);
      const shipping = subtotal >= 4500 ? 0 : 490;
      const status = daysAgo > 3 ? "delivered" : statuses[Math.floor(rand() * statuses.length)];
      const name = DEMO_NAMES[Math.floor(rand() * DEMO_NAMES.length)];
      const cp = DEMO_CP[Math.floor(rand() * DEMO_CP.length)];
      const [order] = await db
        .insert(schema.orders)
        .values({
          email: `${name.split(" ")[0].toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${k}@example.com`,
          name,
          phone: "600000000",
          address: "Dirección de demostración",
          city: cp.startsWith("17") ? "Girona" : "Barcelona",
          postalCode: cp,
          zone: cp.startsWith("17") ? "costa-brava" : cp.startsWith("080") ? "bcn" : "metropolitana",
          deliveryDate: new Date(created.getTime() + 86400000).toISOString().slice(0, 10),
          deliverySlot: SLOTS[Math.floor(rand() * SLOTS.length)],
          subtotalCents: subtotal,
          shippingCents: shipping,
          discountCents: 0,
          totalCents: subtotal + shipping,
          status,
          ageConfirmed: true,
          createdAt: created,
          paidAt: created,
        })
        .returning({ id: schema.orders.id });
      await db.insert(schema.orderItems).values(
        items.map((it) => ({
          orderId: order.id,
          variantId: it.v.id,
          productSlug: it.v.slug,
          productName: it.v.name,
          variantName: it.v.vname,
          unitPriceCents: it.v.price,
          quantity: it.qty,
        })),
      );
      await db.insert(schema.orderEvents).values({ orderId: order.id, status: "paid", createdAt: created });
      if (status !== "paid")
        await db.insert(schema.orderEvents).values({ orderId: order.id, status, createdAt: new Date(created.getTime() + 3600000) });
    }
  }
  console.log("✓ Seed completado");
}
