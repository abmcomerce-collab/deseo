import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db, schema } from "@/db";
import { getSession } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Finalizar pedido", robots: { index: false } };

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const sp = await searchParams;
  const session = await getSession();
  const user = session
    ? await db.query.users.findFirst({ where: eq(schema.users.id, session.userId), columns: { email: true, name: true, phone: true } })
    : undefined;

  return (
    <div className="container-x pb-28 pt-10 sm:pt-14">
      <p className="eyebrow text-humo">Cesta → Datos → Pago</p>
      <h1 className="font-display mt-4 text-6xl sm:text-8xl">
        Casi es <em>tuyo.</em>
      </h1>
      <div className="mt-12">
        <CheckoutForm defaults={user ?? {}} cancelled={sp.cancelado === "1"} />
      </div>
    </div>
  );
}
