import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHeader, Table } from "@/components/admin/ui";
import { CouponForm, CouponToggle } from "@/components/admin/coupons";
import { fmtDate, money } from "@/lib/format";

export const metadata = { title: "Cupones" };
export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  const coupons = await db.select().from(schema.coupons).orderBy(desc(schema.coupons.createdAt));
  const describe = (c: (typeof coupons)[number]) =>
    c.type === "percent" ? `${c.value}% de descuento` : c.type === "fixed" ? `${money(c.value)} de descuento` : "Envío gratis";

  return (
    <div className="space-y-6">
      <PageHeader title="Cupones" subtitle="Códigos de descuento que los clientes aplican en el checkout." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Descuento</th>
              <th>Condiciones</th>
              <th>Usos</th>
              <th>Activo</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = c.expiresAt && c.expiresAt < new Date();
              return (
                <tr key={c.code}>
                  <td className="font-mono font-medium">{c.code}</td>
                  <td>{describe(c)}</td>
                  <td className="text-humo">
                    {c.minSubtotalCents ? `Mínimo ${money(c.minSubtotalCents)}` : "Sin mínimo"}
                    {c.expiresAt && <span className={`block text-xs ${expired ? "text-red-700" : ""}`}>{expired ? "Caducó" : "Hasta"} el {fmtDate(c.expiresAt)}</span>}
                  </td>
                  <td className="tabular-nums">
                    {c.uses}
                    {c.maxUses ? ` / ${c.maxUses}` : ""}
                  </td>
                  <td>
                    <CouponToggle code={c.code} active={c.active} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
        <CouponForm />
      </div>
    </div>
  );
}
