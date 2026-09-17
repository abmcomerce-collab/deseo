import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Clock, MapPin } from "lucide-react";
import { canViewOrder, fulfillOrder, getOrderWithDetails } from "@/lib/orders";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { fmtIsoDay, money, orderNumber, STATUS_LABEL } from "@/lib/format";
import { ZONES, type ZoneId } from "@/lib/delivery";
import { ClearCart } from "@/components/shop/clear-cart";
import { OrderTimeline } from "@/components/order-timeline";
import { Polo } from "@/components/art/polo";
import { getProductsBySlugs } from "@/lib/queries";

export const metadata = { title: "Tu pedido", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: PageProps<"/pedido/[id]">) {
  const { id } = await params;
  const { session_id } = await searchParams;
  let order = await getOrderWithDetails(id);
  if (!order) notFound();

  // Vuelta desde Stripe: confirmamos el pago aunque el webhook aún no haya llegado.
  const fromStripe = typeof session_id === "string" && session_id === order.stripeSessionId;
  if (fromStripe && order.status === "pending" && stripeEnabled()) {
    const session = await getStripe().checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      await fulfillOrder(order.id, typeof session.payment_intent === "string" ? session.payment_intent : null);
      order = (await getOrderWithDetails(id))!;
    }
  }
  if (!fromStripe && !(await canViewOrder(order))) notFound();

  const products = await getProductsBySlugs([...new Set(order.items.map((i) => i.productSlug))]);
  const artFor = (slug: string) => products.find((p) => p.slug === slug)?.art;
  const firstName = order.name.split(" ")[0];
  const paid = order.status !== "pending" && order.status !== "cancelled";
  const zone = ZONES[order.zone as ZoneId];

  return (
    <div className="container-x pb-28 pt-10 sm:pt-16">
      {paid && <ClearCart />}
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="eyebrow text-humo">
            Pedido {orderNumber(order.number)} · {STATUS_LABEL[order.status]}
          </p>
          {paid ? (
            <h1 className="font-display mt-5 text-6xl sm:text-8xl">
              Gracias, {firstName}. <em className="text-tinta">Ya lo estamos congelando.</em>
            </h1>
          ) : order.status === "pending" ? (
            <h1 className="font-display mt-5 text-6xl sm:text-8xl">Estamos esperando la confirmación del pago…</h1>
          ) : (
            <h1 className="font-display mt-5 text-6xl sm:text-8xl">Este pedido está cancelado.</h1>
          )}
          <p className="mt-6 max-w-lg text-lg text-humo">
            {paid
              ? `Guardamos el pedido a nombre de ${order.email}. Te llamaremos 15 minutos antes de llegar.`
              : order.status === "pending"
                ? "Si acabas de pagar, recarga la página en unos segundos."
                : "No se ha realizado ningún cargo. Puedes volver a intentarlo cuando quieras."}
          </p>

          {paid && (
            <div className="mt-12">
              <OrderTimeline status={order.status} events={order.events} />
            </div>
          )}

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-linea bg-white/60 p-6">
              <Clock className="size-5 text-brasa" />
              <p className="eyebrow mt-4 text-humo">Entrega</p>
              <p className="font-display mt-2 text-3xl">{fmtIsoDay(order.deliveryDate)}</p>
              <p className="mt-1 text-humo">Franja {order.deliverySlot}</p>
            </div>
            <div className="rounded-3xl border border-linea bg-white/60 p-6">
              <MapPin className="size-5 text-brasa" />
              <p className="eyebrow mt-4 text-humo">Dirección</p>
              <p className="font-display mt-2 text-3xl">{order.address}</p>
              <p className="mt-1 text-humo">
                {order.postalCode} {order.city} · {zone?.name}
              </p>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/tienda" className="btn btn-primary">
              Seguir comprando <ArrowRight className="size-4" />
            </Link>
            <Link href="/cuenta/registro" className="btn btn-ghost border-linea">
              Crear cuenta para seguir tus pedidos
            </Link>
          </div>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[32px] bg-noche p-6 text-crema sm:p-8">
            <h2 className="font-display text-4xl">Resumen</h2>
            <ul className="mt-6 space-y-4">
              {order.items.map((i) => {
                const art = artFor(i.productSlug);
                return (
                  <li key={i.id} className="flex items-center gap-4">
                    <span className="grid h-16 w-14 shrink-0 place-items-center rounded-xl" style={{ background: art?.bg ?? "#333" }}>
                      {art && <Polo art={art} className="h-12" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium">{i.productName}</span>
                      <span className="block text-sm text-crema/60">
                        {i.quantity} × {i.variantName}
                      </span>
                    </span>
                    <span className="tabular-nums">{money(i.unitPriceCents * i.quantity)}</span>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-crema/10 pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-crema/60">Subtotal</dt>
                <dd>{money(order.subtotalCents)}</dd>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-crema/60">Descuento {order.couponCode}</dt>
                  <dd>−{money(order.discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-crema/60">Envío</dt>
                <dd>{order.shippingCents ? money(order.shippingCents) : "Gratis"}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-crema/10 pt-4">
                <dt>Total</dt>
                <dd className="font-display text-5xl">{money(order.totalCents)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
