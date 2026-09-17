import { desc, notInArray, sql } from "drizzle-orm";
import { db, schema } from "@/db";
import { Card, PageHeader, Table } from "@/components/admin/ui";
import { fmtDate, money } from "@/lib/format";

export const metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  const [customers, users, subs] = await Promise.all([
    db
      .select({
        email: schema.orders.email,
        name: sql<string>`(array_agg(${schema.orders.name} order by ${schema.orders.createdAt} desc))[1]`,
        orders: sql<number>`count(*)::int`,
        spent: sql<number>`sum(${schema.orders.totalCents})::int`,
        last: sql<Date>`max(${schema.orders.createdAt})`,
        zone: sql<string>`(array_agg(${schema.orders.postalCode} order by ${schema.orders.createdAt} desc))[1]`,
      })
      .from(schema.orders)
      .where(notInArray(schema.orders.status, ["pending", "cancelled"]))
      .groupBy(schema.orders.email)
      .orderBy(desc(sql`4`))
      .limit(200),
    db.select({ email: schema.users.email }).from(schema.users),
    db.select({ n: sql<number>`count(*)::int`, waitlist: sql<number>`count(*) filter (where ${schema.subscribers.source} = 'waitlist')::int` }).from(schema.subscribers),
  ]);
  const registered = new Set(users.map((u) => u.email));
  const repeat = customers.filter((c) => c.orders > 1).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Clientes" subtitle="Quién compra, cuánto y con qué frecuencia." />
      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { k: "Clientes con compra", v: customers.length },
          { k: "Repiten", v: `${customers.length ? Math.round((repeat / customers.length) * 100) : 0}%` },
          { k: "Suscritos newsletter", v: subs[0].n - subs[0].waitlist },
          { k: "Lista de espera (fuera de zona)", v: subs[0].waitlist },
        ].map((s) => (
          <Card key={s.k}>
            <p className="text-sm text-humo">{s.k}</p>
            <p className="font-display mt-2 text-5xl">{s.v}</p>
          </Card>
        ))}
      </div>
      <Table>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Pedidos</th>
            <th>Total gastado</th>
            <th>Ticket medio</th>
            <th>Último pedido</th>
            <th>CP</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.email}>
              <td>
                <p>
                  {c.name}
                  {registered.has(c.email) && <span className="ml-2 rounded-full bg-lima px-2 py-0.5 text-[10px]">Cuenta</span>}
                </p>
                <p className="text-xs text-humo">{c.email}</p>
              </td>
              <td className="tabular-nums">{c.orders}</td>
              <td className="tabular-nums">{money(c.spent)}</td>
              <td className="tabular-nums">{money(Math.round(c.spent / c.orders))}</td>
              <td>{fmtDate(new Date(c.last))}</td>
              <td className="font-mono text-xs">{c.zone}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
