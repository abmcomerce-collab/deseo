import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { ArrowUpRight, LayoutDashboard, LogOut } from "lucide-react";
import { db, schema } from "@/db";
import { requireUser } from "@/lib/auth";
import { logout } from "@/app/actions/auth";
import { fmtDate, fmtIsoDay, money, orderNumber } from "@/lib/format";
import { StatusPill } from "@/components/status-pill";
import { ProfileForm } from "@/components/account/profile-form";

export const metadata = { title: "Mi cuenta", robots: { index: false } };

export default async function AccountPage() {
  const session = await requireUser("/cuenta");
  const [user, orders] = await Promise.all([
    db.query.users.findFirst({ where: eq(schema.users.id, session.userId) }),
    db.query.orders.findMany({
      where: eq(schema.orders.userId, session.userId),
      orderBy: [desc(schema.orders.createdAt)],
      with: { items: true },
    }),
  ]);
  const visible = orders.filter((o) => o.status !== "pending");
  const spent = visible.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.totalCents, 0);

  return (
    <div className="container-x pb-28 pt-10 sm:pt-16">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="eyebrow text-humo">Mi cuenta</p>
          <h1 className="font-display mt-4 text-6xl sm:text-8xl">
            Hola, <em>{user?.name.split(" ")[0]}.</em>
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {session.role === "admin" && (
            <Link href="/admin" className="btn btn-brasa">
              <LayoutDashboard className="size-4" /> Panel de administración
            </Link>
          )}
          <form action={logout}>
            <button className="btn btn-ghost border-linea">
              <LogOut className="size-4" /> Cerrar sesión
            </button>
          </form>
        </div>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        {[
          { k: "Pedidos", v: String(visible.length) },
          { k: "Total gastado", v: money(spent) },
          { k: "Miembro desde", v: user ? fmtDate(user.createdAt) : "—" },
        ].map((s) => (
          <div key={s.k} className="rounded-3xl border border-linea bg-white/60 p-6">
            <p className="eyebrow text-humo">{s.k}</p>
            <p className="font-display mt-3 text-5xl">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 grid gap-12 lg:grid-cols-12">
        <section className="lg:col-span-8" aria-labelledby="mis-pedidos">
          <h2 id="mis-pedidos" className="font-display text-5xl">
            Mis pedidos
          </h2>
          {visible.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-linea p-10 text-center">
              <p className="font-display text-4xl">Todavía nada por aquí.</p>
              <p className="mt-2 text-humo">Tu primer pedido con BIENVENIDA10 tiene un 10% de descuento.</p>
              <Link href="/tienda" className="btn btn-primary mt-6">
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <ul className="mt-6 divide-y divide-linea border-y border-linea">
              {visible.map((o) => (
                <li key={o.id}>
                  <Link href={`/pedido/${o.id}`} className="group flex flex-wrap items-center gap-x-6 gap-y-2 py-5">
                    <span className="font-mono text-sm">{orderNumber(o.number)}</span>
                    <span className="min-w-0 flex-1 text-sm text-humo">
                      {o.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                      <span className="block">Entrega {fmtIsoDay(o.deliveryDate).toLowerCase()}</span>
                    </span>
                    <StatusPill status={o.status} />
                    <span className="w-24 text-right font-medium tabular-nums">{money(o.totalCents)}</span>
                    <ArrowUpRight className="size-4 text-humo transition group-hover:text-noche" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="lg:col-span-4" aria-labelledby="mis-datos">
          <h2 id="mis-datos" className="font-display text-5xl">
            Mis datos
          </h2>
          <div className="mt-6 rounded-3xl border border-linea bg-white/60 p-6">
            <ProfileForm name={user?.name ?? ""} email={user?.email ?? ""} phone={user?.phone ?? ""} />
          </div>
        </section>
      </div>
    </div>
  );
}
