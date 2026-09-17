"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { requireAdmin } from "@/lib/auth";

export type AdminState = { ok?: boolean; message?: string; errors?: Record<string, string> } | null;

const collect = (issues: z.core.$ZodIssue[]) => {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[i.path.join(".")] ??= i.message;
  return errors;
};

const refreshShop = () => {
  revalidatePath("/", "layout");
};

/* ───────────── Pedidos ───────────── */

const NEXT_STATUS = ["paid", "preparing", "shipped", "delivered", "cancelled"] as const;

export async function updateOrderStatus(orderId: string, status: (typeof NEXT_STATUS)[number], note?: string) {
  await requireAdmin();
  const s = z.enum(NEXT_STATUS).parse(status);
  const id = z.string().uuid().parse(orderId);
  const order = await db.query.orders.findFirst({ where: eq(schema.orders.id, id), columns: { status: true } });
  if (!order || order.status === "pending") return { ok: false, message: "Solo se pueden gestionar pedidos pagados." };
  if (order.status === s) return { ok: true };
  if (order.status === "cancelled") return { ok: false, message: "Un pedido cancelado no se puede reabrir." };
  await db.transaction(async (tx) => {
    await tx.update(schema.orders).set({ status: s }).where(eq(schema.orders.id, id));
    await tx.insert(schema.orderEvents).values({ orderId: id, status: s, note: note?.slice(0, 200) || null });
    // Si se cancela antes de salir a reparto, devolvemos las unidades al stock.
    if (s === "cancelled" && (order.status === "paid" || order.status === "preparing")) {
      const items = await tx.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
      for (const item of items) {
        if (!item.variantId) continue;
        await tx
          .update(schema.variants)
          .set({ stock: sql`${schema.variants.stock} + ${item.quantity}` })
          .where(eq(schema.variants.id, item.variantId));
      }
    }
  });
  if (s === "cancelled") refreshShop();
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/* ───────────── Productos ───────────── */

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color hexadecimal (#RRGGBB).");

const productSchema = z.object({
  name: z.string().trim().min(2, "Nombre obligatorio."),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Solo minúsculas, números y guiones."),
  tagline: z.string().trim().min(5, "Añade una frase corta.").max(120),
  description: z.string().trim().min(20, "Describe el producto (mín. 20 caracteres)."),
  kind: z.enum(["polo", "pack"]),
  spirit: z.string().trim().min(2, "Indica el destilado."),
  abv: z.coerce.number().min(0).max(15, "Máximo 15% vol."),
  notes: z.string().trim().default(""),
  ingredients: z.string().trim().min(3, "Indica los ingredientes."),
  allergens: z.string().trim().default(""),
  pairing: z.string().trim().max(200).optional(),
  badge: z.string().trim().max(30).optional(),
  featured: z.boolean(),
  isActive: z.boolean(),
  art: z.object({
    base: hex,
    top: hex,
    accent: hex,
    ink: hex,
    bg: hex,
    pattern: z.enum(["plain", "layers", "speckle", "leaves", "swirl", "zest", "bubbles"]),
  }),
  variants: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        name: z.string().trim().min(1, "Nombre de la variante."),
        units: z.coerce.number().int().min(1),
        price: z.coerce.number().positive("Precio mayor que 0."),
        compareAt: z.coerce.number().nonnegative().optional(),
        stock: z.coerce.number().int().min(0),
      }),
    )
    .min(1, "Añade al menos una variante."),
});

export type ProductInput = z.input<typeof productSchema>;

const splitList = (s: string) =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

export async function saveProduct(productId: string | null, input: ProductInput): Promise<AdminState> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return { message: "Revisa los campos marcados.", errors: collect(parsed.error.issues) };
  const d = parsed.data;

  const clash = await db.query.products.findFirst({ where: eq(schema.products.slug, d.slug), columns: { id: true } });
  if (clash && clash.id !== productId) return { message: "Ya existe un producto con esa URL.", errors: { slug: "URL en uso." } };

  const values = {
    name: d.name,
    slug: d.slug,
    tagline: d.tagline,
    description: d.description,
    kind: d.kind,
    spirit: d.spirit,
    abv: d.abv.toFixed(1),
    notes: splitList(d.notes),
    ingredients: d.ingredients,
    allergens: splitList(d.allergens),
    pairing: d.pairing || null,
    badge: d.badge || null,
    featured: d.featured,
    isActive: d.isActive,
    art: d.art,
  };

  const id = await db.transaction(async (tx) => {
    let pid = productId;
    if (pid) {
      await tx.update(schema.products).set(values).where(eq(schema.products.id, pid));
    } else {
      const [max] = await tx.select({ n: sql<number>`coalesce(max(${schema.products.sortOrder}), 0)::int` }).from(schema.products);
      const [row] = await tx
        .insert(schema.products)
        .values({ ...values, sortOrder: max.n + 1 })
        .returning({ id: schema.products.id });
      pid = row.id;
    }

    const existing = await tx.select({ id: schema.variants.id }).from(schema.variants).where(eq(schema.variants.productId, pid));
    const keep = new Set(d.variants.map((v) => v.id).filter(Boolean));
    for (const v of existing) {
      if (!keep.has(v.id)) await tx.delete(schema.variants).where(eq(schema.variants.id, v.id));
    }
    for (const [i, v] of d.variants.entries()) {
      const row = {
        productId: pid,
        name: v.name,
        units: v.units,
        priceCents: Math.round(v.price * 100),
        compareAtCents: v.compareAt ? Math.round(v.compareAt * 100) : null,
        stock: v.stock,
        sortOrder: i,
      };
      if (v.id && existing.some((e) => e.id === v.id)) {
        await tx.update(schema.variants).set(row).where(eq(schema.variants.id, v.id));
      } else {
        await tx.insert(schema.variants).values({ ...row, sku: `DS-${d.slug.slice(0, 3).toUpperCase()}-${v.units}-${crypto.randomUUID().slice(0, 4)}` });
      }
    }
    return pid;
  });

  refreshShop();
  if (!productId) redirect(`/admin/productos/${id}?creado=1`);
  return { ok: true, message: "Producto guardado." };
}

export async function toggleProduct(productId: string, isActive: boolean) {
  await requireAdmin();
  await db.update(schema.products).set({ isActive }).where(eq(schema.products.id, z.string().uuid().parse(productId)));
  refreshShop();
}

export async function updateStock(variantId: string, stock: number) {
  await requireAdmin();
  await db
    .update(schema.variants)
    .set({ stock: z.number().int().min(0).max(100000).parse(stock) })
    .where(eq(schema.variants.id, z.string().uuid().parse(variantId)));
  refreshShop();
}

/* ───────────── Cupones ───────────── */

const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9]{3,20}$/, "3–20 letras o números, sin espacios."),
  type: z.enum(["percent", "fixed", "free_shipping"]),
  value: z.coerce.number().min(0),
  minSubtotal: z.coerce.number().min(0).default(0),
  maxUses: z.coerce.number().int().min(1).optional(),
  expiresAt: z.string().optional(),
});

export async function createCoupon(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await requireAdmin();
  const raw = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, v === "" ? undefined : v]));
  const parsed = couponSchema.safeParse(raw);
  if (!parsed.success) return { message: "Revisa los campos.", errors: collect(parsed.error.issues) };
  const c = parsed.data;
  if (c.type === "percent" && (c.value <= 0 || c.value > 90)) return { errors: { value: "Porcentaje entre 1 y 90." } };
  if (c.type === "fixed" && c.value <= 0) return { errors: { value: "Importe mayor que 0." } };

  const exists = await db.query.coupons.findFirst({ where: eq(schema.coupons.code, c.code) });
  if (exists) return { errors: { code: "Ese código ya existe." } };

  await db.insert(schema.coupons).values({
    code: c.code,
    type: c.type,
    value: c.type === "fixed" ? Math.round(c.value * 100) : c.type === "percent" ? Math.round(c.value) : 0,
    minSubtotalCents: Math.round(c.minSubtotal * 100),
    maxUses: c.maxUses ?? null,
    expiresAt: c.expiresAt ? new Date(`${c.expiresAt}T23:59:59+02:00`) : null,
  });
  revalidatePath("/admin/cupones");
  return { ok: true, message: `Código ${c.code} creado.` };
}

export async function toggleCoupon(code: string, active: boolean) {
  await requireAdmin();
  await db.update(schema.coupons).set({ active }).where(eq(schema.coupons.code, code));
  revalidatePath("/admin/cupones");
}

/* ───────────── Eventos (leads) ───────────── */

export async function updateLeadStatus(id: string, status: "new" | "contacted" | "won" | "lost") {
  await requireAdmin();
  await db
    .update(schema.leads)
    .set({ status: z.enum(["new", "contacted", "won", "lost"]).parse(status) })
    .where(eq(schema.leads.id, z.string().uuid().parse(id)));
  revalidatePath("/admin/eventos");
}
