import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import { canViewOrder, fulfillOrder, getOrderWithDetails } from "@/lib/orders";
import { stripeEnabled } from "@/lib/stripe";
import { money, orderNumber } from "@/lib/format";

export const metadata = { title: "Pago de prueba", robots: { index: false } };

/**
 * Pasarela simulada: solo existe cuando no hay STRIPE_SECRET_KEY configurada
 * (desarrollo local). En producción con Stripe esta ruta devuelve 404.
 */
export default async function SimulatedPayment({ params }: PageProps<"/checkout/simulado/[id]">) {
  if (stripeEnabled()) notFound();
  const { id } = await params;
  const order = await getOrderWithDetails(id);
  if (!order || !(await canViewOrder(order))) notFound();
  if (order.status !== "pending") redirect(`/pedido/${order.id}`);

  async function pay() {
    "use server";
    const o = await getOrderWithDetails(id);
    if (!o || !(await canViewOrder(o))) notFound();
    await fulfillOrder(o.id, "pi_simulado");
    redirect(`/pedido/${o.id}`);
  }

  return (
    <div className="container-x grid min-h-[70vh] place-items-center py-20">
      <div className="w-full max-w-md rounded-[32px] bg-white p-8 shadow-xl">
        <p className="eyebrow text-humo">Pasarela de prueba · entorno local</p>
        <h1 className="font-display mt-4 text-5xl">Pedido {orderNumber(order.number)}</h1>
        <p className="mt-2 text-humo">Stripe no está configurado, así que simulamos el pago para probar el flujo completo.</p>
        <div className="mt-8 flex items-center gap-3 rounded-2xl border border-linea p-4 font-mono">
          <CreditCard className="size-5" /> 4242 4242 4242 4242
        </div>
        <form action={pay}>
          <button className="btn btn-brasa mt-6 w-full py-4 text-base">
            <Lock className="size-4" /> Pagar {money(order.totalCents)}
          </button>
        </form>
      </div>
    </div>
  );
}
