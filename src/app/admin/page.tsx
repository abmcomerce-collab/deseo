import Link from "next/link";
import { and, desc, eq, gte, lt, lte, notInArray, sql } from "drizzle-orm";
import { AlertTriangle, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { db, schema } from "@/db";
import { Card, PageHeader } from "@/components/admin/ui";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatusPill } from "@/components/status-pill";
import { fmtDateTime, money, orderNumber } from "@/lib/format";

export const metadata = { title: "Resumen" };
export const dynamic = "force-dynamic";

const DAY = 86400000;
const valid = notInArray(schema.orders.status, ["pending", "cancelled"]);

async function kpis(from: Date, to: Date) {
  const [row] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${schema.orders.totalCents}), 0)::int`,
      orders: sql<number>`count(*)::int`,
    })
    .from(schema.orders)
    .where(and(valid, gte(schema.orders.createdAt, from), lt(schema.orders.createdAt, to)));
  return { ...row, aov: row.orders ? Math.round(row.revenue / row.orders) : 0 };
}

export default async function AdminHome() {
  const now = new Date();
  const from = new Date(now.getTime() - 30 * DAY);
  const prevFrom = new Date(now.getTime() - 60 * DAY);

  const [cur, prev, toPrepare, daily, top, lowStock, recent, leads] = await Promise.all([
    kpis(from, now),
    kpis(prevFrom, from),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.orders).where(eq(schema.orders.status, "paid")),
    db
      .select({
        day: sql<string>`to_char((${schema.orders.createdAt} at time zone 'Europe/Madrid')::date, 'YYYY-MM-DD')`,
        cents: sql<number>`sum(${schema.orders.totalCents})::int`,
        orders: sql<number>`count(*)::int`,
      })
      .from(schema.orders)
      .where(and(valid, gte(schema.orders.createdAt, from)))
      .groupBy(sql`1`),
    db
      .select({
        name: schema.orderItems.productName,
        slug: schema.orderItems.productSlug,
        units: sql<number>`sum(${schema.orderItems.quantity})::int`,
        cents: sql<number>`sum(${schema.orderItems.quantity} * ${schema.orderItems.unitPriceCents})::int`,
      })
      .from(schema.orderItems)
      .innerJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(and(valid, gte(schema.orders.createdAt, from)))
      .groupBy(schema.orderItems.productName, schema.orderItems.productSlug)
      .orderBy(desc(sql`4`))
      .limit(6),
    db
      .select({ id: schema.products.id, product: schema.products.name, variant: schema.variants.name, stock: schema.variants.stock })
      .from(schema.variants)
      .innerJoin(schema.products, eq(schema.variants.productId, schema.products.id))
      .where(and(lte(schema.variants.stock, 10), eq(schema.products.isActive, true)))
      .orderBy(schema.variants.stock)
      .limit(6),
    db.query.orders.findMany({ where: valid, orderBy: [desc(schema.orders.createdAt)], limit: 7 }),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.leads).where(eq(schema.leads.status, "new")),
  ]);

  // Serie completa de 30 días (los días sin ventas cuentan como 0).
  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now.getTime() - (29 - i) * DAY);
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d);
    const hit = daily.find((x) => x.day === day);
    return { day, cents: hit?.cents ?? 0, orders: hit?.orders ?? 0 };
  });

  const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : null);
  const stats = [
    { label: "Ingresos · 30 días", value: money(cur.revenue), d: delta(cur.revenue, prev.revenue) },
    { label: "Pedidos · 30 días", value: String(cur.orders), d: delta(cur.orders, prev.orders) },
    { label: "Ticket medio", value: money(cur.aov), d: delta(cur.aov, prev.aov) },
    { label: "Por preparar", value: String(toPrepare[0].n), d: null, href: "/admin/pedidos?estado=paid" },
  ];
  const topMax = Math.max(1, ...top.map((t) => t.cents));

  return (
    <div className="space-y-6">
      <PageHeader title="Resumen" subtitle="Cómo va DESEO en los últimos 30 días." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const inner = (
            <Card className="h-full">
              <p className="text-sm text-humo">{s.label}</p>
              <p className="font-display mt-3 text-5xl">{s.value}</p>
              {s.d !== null ? (
                <p className={`mt-2 flex items-center gap-1 text-xs ${s.d >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                  {s.d >= 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
                  {s.d >= 0 ? "+" : ""}
                  {s.d}% vs. 30 días anteriores
                </p>
              ) : (
                <p className="mt-2 text-xs text-humo">{s.href ? "Pedidos pagados pendientes de preparar →" : " "}</p>
              )}
            </Card>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block transition hover:-translate-y-0.5">
              {inner}
            </Link>
          ) : (
            <div key={s.label}>{inner}</div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">Ingresos diarios</h2>
            <span className="text-xs text-humo">IVA incl.</span>
          </div>
          <div className="mt-4">
            <RevenueChart data={series} />
          </div>
        </Card>
        <Card>
          <h2 className="font-medium">Más vendidos</h2>
          <ul className="mt-5 space-y-4">
            {top.map((t) => (
              <li key={t.slug}>
                <div className="flex justify-between text-sm">
                  <span>{t.name}</span>
                  <span className="tabular-nums text-humo">{money(t.cents)}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-arena/60">
                  <div className="h-2 rounded-full bg-noche" style={{ width: `${(t.cents / topMax) * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-humo">{t.units} cajas</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="flex items-baseline justify-between">
            <h2 className="font-medium">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="text-sm text-humo hover:text-noche">
              Ver todos →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-linea">
            {recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/pedidos/${o.id}`} className="flex items-center gap-4 py-3 text-sm hover:bg-arena/20">
                  <span className="w-20 font-mono text-xs">{orderNumber(o.number)}</span>
                  <span className="min-w-0 flex-1 truncate">{o.name}</span>
                  <span className="hidden text-humo sm:block">{fmtDateTime(o.createdAt)}</span>
                  <StatusPill status={o.status} />
                  <span className="w-20 text-right tabular-nums">{money(o.totalCents)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <div className="space-y-4">
          <Card>
            <h2 className="flex items-center gap-2 font-medium">
              <AlertTriangle className="size-4 text-brasa" /> Stock bajo
            </h2>
            {lowStock.length ? (
              <ul className="mt-4 space-y-2.5 text-sm">
                {lowStock.map((v) => (
                  <li key={`${v.product}-${v.variant}`} className="flex justify-between">
                    <Link href={`/admin/productos/${v.id}`} className="hover:underline">
                      {v.product} · {v.variant}
                    </Link>
                    <span className={`tabular-nums ${v.stock === 0 ? "text-red-700" : "text-amber-700"}`}>
                      {v.stock === 0 ? "Agotado" : `${v.stock} uds`}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-humo">Todo el congelador está bien surtido.</p>
            )}
          </Card>
          <Link href="/admin/eventos" className="block">
            <Card className="bg-lima transition hover:-translate-y-0.5">
              <p className="text-sm text-noche/70">Solicitudes de eventos sin responder</p>
              <p className="font-display mt-2 text-5xl">{leads[0].n}</p>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
