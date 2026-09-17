import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { getOrderWithDetails } from "@/lib/orders";
import { Card } from "@/components/admin/ui";
import { StatusPill } from "@/components/status-pill";
import { OrderStatusControl } from "@/components/admin/order-status-control";
import { fmtDateTime, fmtIsoDay, money, orderNumber, STATUS_LABEL } from "@/lib/format";
import { ZONES, type ZoneId } from "@/lib/delivery";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/admin/pedidos/[id]">) {
  const o = await getOrderWithDetails((await params).id);
  return { title: o ? `Pedido ${orderNumber(o.number)}` : "Pedido" };
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const order = await getOrderWithDetails(id);
  if (!order) notFound();
  const zone = ZONES[order.zone as ZoneId];

  return (
    <div className="space-y-6">
      <Link href="/admin/pedidos" className="inline-flex items-center gap-2 text-sm text-humo hover:text-noche">
        <ArrowLeft className="size-4" /> Pedidos
      </Link>
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-display text-5xl sm:text-6xl">Pedido {orderNumber(order.number)}</h1>
        <StatusPill status={order.status} />
      </div>
      <p className="-mt-4 text-humo">Creado el {fmtDateTime(order.createdAt)}</p>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <Card>
            <h2 className="font-medium">Productos</h2>
            <ul className="mt-4 divide-y divide-linea text-sm">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3">
                  <span className="grid size-8 place-items-center rounded-lg bg-arena/60 font-mono text-xs">{i.quantity}×</span>
                  <span className="flex-1">
                    <Link href={`/producto/${i.productSlug}`} className="hover:underline" target="_blank">
                      {i.productName}
                    </Link>
                    <span className="block text-xs text-humo">{i.variantName}</span>
                  </span>
                  <span className="text-humo">{money(i.unitPriceCents)}</span>
                  <span className="w-20 text-right tabular-nums">{money(i.unitPriceCents * i.quantity)}</span>
                </li>
              ))}
            </ul>
            <dl className="ml-auto mt-4 max-w-xs space-y-1.5 border-t border-linea pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-humo">Subtotal</dt>
                <dd>{money(order.subtotalCents)}</dd>
              </div>
              {order.discountCents > 0 && (
                <div className="flex justify-between">
                  <dt className="text-humo">Descuento ({order.couponCode})</dt>
                  <dd>−{money(order.discountCents)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-humo">Envío</dt>
                <dd>{order.shippingCents ? money(order.shippingCents) : "Gratis"}</dd>
              </div>
              <div className="flex justify-between text-base font-medium">
                <dt>Total</dt>
                <dd>{money(order.totalCents)}</dd>
              </div>
            </dl>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <h2 className="font-medium">Cliente</h2>
              <p className="mt-3">{order.name}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-humo">
                <Mail className="size-4" />
                <a href={`mailto:${order.email}`} className="hover:underline">
                  {order.email}
                </a>
              </p>
              <p className="mt-1 flex items-center gap-2 text-sm text-humo">
                <Phone className="size-4" />
                <a href={`tel:${order.phone}`} className="hover:underline">
                  {order.phone}
                </a>
              </p>
              <p className="mt-3 text-xs text-humo">{order.ageConfirmed ? "✓ Confirmó ser mayor de 18" : "Sin confirmación de edad"}</p>
            </Card>
            <Card>
              <h2 className="font-medium">Entrega</h2>
              <p className="mt-3">
                {fmtIsoDay(order.deliveryDate)} · {order.deliverySlot}
              </p>
              <p className="mt-2 flex items-start gap-2 text-sm text-humo">
                <MapPin className="mt-0.5 size-4 shrink-0" />
                <span>
                  {order.address}
                  <br />
                  {order.postalCode} {order.city} · {zone?.name}
                </span>
              </p>
              {order.notes && <p className="mt-3 rounded-xl bg-arena/50 p-3 text-sm">“{order.notes}”</p>}
            </Card>
          </div>

          <Card>
            <h2 className="font-medium">Historial</h2>
            <ol className="mt-4 space-y-3 border-l border-linea pl-5 text-sm">
              {order.events.map((e) => (
                <li key={e.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brasa ring-4 ring-white" />
                  <p>
                    {STATUS_LABEL[e.status]} <span className="text-humo">· {fmtDateTime(e.createdAt)}</span>
                  </p>
                  {e.note && <p className="text-humo">{e.note}</p>}
                </li>
              ))}
            </ol>
            {order.stripePaymentIntentId && (
              <p className="mt-4 font-mono text-xs text-humo">Stripe: {order.stripePaymentIntentId}</p>
            )}
          </Card>
        </div>

        <Card className="h-fit xl:sticky xl:top-10">
          <h2 className="font-medium">Estado del pedido</h2>
          <div className="mt-4">
            <OrderStatusControl orderId={order.id} status={order.status} />
          </div>
        </Card>
      </div>
    </div>
  );
}
