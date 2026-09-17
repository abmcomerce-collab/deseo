import "server-only";
import Stripe from "stripe";
export { siteUrl } from "./site";

let client: Stripe | null = null;

export function stripeEnabled() {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY no configurada");
  if (key.startsWith("sk_live_") && process.env.ALLOW_LIVE_PAYMENTS !== "true") {
    throw new Error("Esta tienda está en modo demostración: usa una clave sk_test_.");
  }
  client ??= new Stripe(key);
  return client;
}

