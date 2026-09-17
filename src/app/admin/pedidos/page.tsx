import Link from "next/link";
import { and, desc, eq, ilike, ne, or, sql, type SQL } from "drizzle-orm";
import { Search } from "lucide-react";
import { db, schema } from "@/db";
import { PageHeader, Table } from "@/components/admin/ui";
import { StatusPill } from "@/components/status-pill";
import { cn, fmtDateTime, fmtIsoDay, money, orderNumber, STATUS_LABEL } from "@/lib/format";
import type { OrderStatus } from "@/db/schema";

export const metadata = { title: "Pedidos" };
export const dynamic = "force-dynamic";

const TABS: (OrderStatus | "todos")[] = ["todos", "paid", "preparing", "shipped", "delivered", "cancelled", "pending"];
const PAGE = 25;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const sp = await searchParams;
  const estado = TABS.includes(sp.estado as OrderStatus) ? (sp.estado as OrderStatus | "todos") : "todos";
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 60) : "";
  const page = Math.max(1, Number(sp.p) || 1);

  const filters: SQL[] = [];
  if (estado !== "todos") filters.push(eq(schema.orders.status, estado));
  else filters.push(ne(schema.orders.status, "pending"));
  if (q) {
    const num = Number(q.replace(/\D/g, "")) - 1000;
    filters.push(
      or(
        ilike(schema.orders.name, `%${q}%`),
        ilike(schema.orders.email, `%${q}%`),
        ilike(schema.orders.postalCode, `${q}%`),
        ...(num > 0 ? [eq(schema.orders.number, num)] : []),
      )!,
    );
  }
  const where = and(...filters);

  const [rows, [{ total }], counts] = await Promise.all([
    db.query.orders.findMany({
      where,
      orderBy: [desc(schema.orders.createdAt)],
      limit: PAGE,
      offset: (page - 1) * PAGE,
      with: { items: { columns: { quantity: true } } },
    }),
    db.select({ total: sql<number>`count(*)::int` }).from(schema.orders).where(where),
    db
      .select({ status: schema.orders.status, n: sql<number>`count(*)::int` })
      .from(schema.orders)
      .groupBy(schema.orders.status),
  ]);
  const count = (s: string) =>
    s === "todos" ? counts.filter((c) => c.status !== "pending").reduce((a, c) => a + c.n, 0) : (counts.find((c) => c.status === s)?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / PAGE));
  const link = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { estado: estado === "todos" ? undefined : estado, q: q || undefined, p: undefined, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") p.set(k, String(v));
    return `/admin/pedidos${p.size ? `?${p}` : ""}`;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Pedidos" subtitle={`${total} pedidos${q ? ` que coinciden con “${q}”` : ""}`} />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-1 overflow-x-auto rounded-full bg-white p-1 [scrollbar-width:none]">
          {TABS.map((t) => (
            <Link
              key={t}
              href={link({ estado: t === "todos" ? undefined : t })}
              className={cn(
                "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition",
                estado === t ? "bg-noche text-crema" : "text-humo hover:text-noche",
              )}
            >
              {t === "todos" ? "Todos" : STATUS_LABEL[t]}
              <span className={cn("font-mono text-[11px]", estado === t ? "text-crema/60" : "text-humo/70")}>{count(t)}</span>
            </Link>
          ))}
        </div>
        <form className="relative lg:w-80">
          {estado !== "todos" && <input type="hidden" name="estado" value={estado} />}
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-humo" />
          <input name="q" defaultValue={q} placeholder="Nombre, email, CP o nº de pedido" className="field rounded-full pl-10" />
        </form>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Entrega</th>
            <th>Estado</th>
            <th className="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((o) => (
            <tr key={o.id} className="group relative hover:bg-arena/20">
              <td>
                <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-xs after:absolute after:inset-0">
                  {orderNumber(o.number)}
                </Link>
                <p className="text-xs text-humo">{fmtDateTime(o.createdAt)}</p>
              </td>
              <td>
                <p>{o.name}</p>
                <p className="text-xs text-humo">{o.email}</p>
              </td>
              <td>
                <p>{fmtIsoDay(o.deliveryDate)}</p>
                <p className="text-xs text-humo">
                  {o.deliverySlot} · CP {o.postalCode}
                </p>
              </td>
              <td>
                <StatusPill status={o.status} />
              </td>
              <td className="text-right">
                <p className="tabular-nums">{money(o.totalCents)}</p>
                <p className="text-xs text-humo">{o.items.reduce((s, i) => s + i.quantity, 0)} cajas</p>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="py-16 text-center text-humo">
                No hay pedidos con estos filtros.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      {pages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-humo">
            Página {page} de {pages}
          </span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={link({ p: page - 1 })} className="btn btn-ghost border-linea px-4 py-2">
                Anterior
              </Link>
            )}
            {page < pages && (
              <Link href={link({ p: page + 1 })} className="btn btn-ghost border-linea px-4 py-2">
                Siguiente
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
