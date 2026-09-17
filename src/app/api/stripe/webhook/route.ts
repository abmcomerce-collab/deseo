import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { cancelPendingOrder, fulfillOrder } from "@/lib/orders";

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(await req.text(), signature, secret);
  } catch (err) {
    console.error("[webhook] firma inválida", err);
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId;

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      if (orderId && session.payment_status === "paid") {
        await fulfillOrder(orderId, typeof session.payment_intent === "string" ? session.payment_intent : null);
      }
      break;
    case "checkout.session.expired":
    case "checkout.session.async_payment_failed":
      if (orderId) await cancelPendingOrder(orderId, event.type === "checkout.session.expired" ? "Pago no completado" : "Pago rechazado");
      break;
  }

  return NextResponse.json({ received: true });
}
