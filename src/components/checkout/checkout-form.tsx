"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowLeft, Check, Lock, MapPin, Snowflake, Tag, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/stores/cart";
import { createCheckout, quoteCart } from "@/app/actions/checkout";
import { checkCoupon } from "@/app/actions/cart";
import { deliveryDates, zoneForPostalCode } from "@/lib/delivery";
import { cn, money } from "@/lib/format";
import { ProductArt } from "@/components/art/product-art";
import { useHydrated } from "@/components/shop/header";

type Quote = Awaited<ReturnType<typeof quoteCart>>;

const dayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "short", timeZone: "UTC" });
const numFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

export function CheckoutForm({
  defaults,
  cancelled,
}: {
  defaults: { email?: string; name?: string; phone?: string | null };
  cancelled?: boolean;
}) {
  const hydrated = useHydrated();
  const { items, couponCode, setCoupon, syncPrices } = useCart();
  const [form, setForm] = useState({
    email: defaults.email ?? "",
    name: defaults.name ?? "",
    phone: defaults.phone ?? "",
    address: "",
    city: "Barcelona",
    postalCode: "",
    deliveryDate: "",
    deliverySlot: "",
    notes: "",
  });
  const [ageConfirmed, setAge] = useState(false);
  const [termsAccepted, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(cancelled ? "Has cancelado el pago. Tu cesta sigue aquí." : null);
  const [issues, setIssues] = useState<string[]>([]);
  const [quote, setQuote] = useState<Quote>(null);
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [couponPending, startCoupon] = useTransition();

  const zone = useMemo(() => (/^\d{5}$/.test(form.postalCode) ? zoneForPostalCode(form.postalCode) : null), [form.postalCode]);
  const dates = useMemo(() => (zone ? deliveryDates(zone, 6) : []), [zone]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: "" }));
  };

  // Al cambiar de zona, preseleccionamos la primera fecha y franja (ajuste durante el render).
  const [prevZone, setPrevZone] = useState<string | null>(null);
  if ((zone?.id ?? null) !== prevZone) {
    setPrevZone(zone?.id ?? null);
    setForm((f) => ({
      ...f,
      deliveryDate: zone && dates.includes(f.deliveryDate) ? f.deliveryDate : (dates[0] ?? ""),
      deliverySlot: zone && zone.slots.includes(f.deliverySlot) ? f.deliverySlot : (zone?.slots.at(-1) ?? ""),
      city: zone?.id === "bcn" ? "Barcelona" : f.city,
    }));
  }

  // Presupuesto calculado siempre en servidor.
  const itemsKey = items.map((i) => `${i.variantId}:${i.quantity}`).join("|");
  useEffect(() => {
    if (!hydrated || !items.length) return;
    let cancel = false;
    const t = setTimeout(() => {
      quoteCart({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        couponCode,
        postalCode: zone ? form.postalCode : undefined,
      }).then((q) => {
        if (cancel || !q) return;
        setQuote(q);
        setIssues(q.issues);
        if (q.issues.length) {
          syncPrices(q.lines.map((l) => ({ variantId: l.variantId, priceCents: l.unitPriceCents, maxStock: l.stock })));
        }
        if (couponCode && q.coupon && !q.coupon.ok) {
          setCoupon(null);
          setCouponError(q.coupon.error);
        }
      });
    }, 150);
    return () => {
      cancel = true;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, itemsKey, couponCode, zone?.id, form.postalCode]);

  const subtotal = quote?.subtotalCents ?? cartSubtotal(items);
  const discount = quote?.discountCents ?? 0;
  const shipping = zone ? (quote?.shippingCents ?? zone.shippingCents) : null;
  const total = subtotal - discount + (shipping ?? 0);

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    startCoupon(async () => {
      const res = await checkCoupon(code, cartSubtotal(items));
      if (res.ok) {
        setCoupon(res.code);
        setCouponError(null);
        setCouponInput("");
      } else {
        setCouponError(res.error);
      }
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const res = await createCheckout({
        ...form,
        couponCode,
        ageConfirmed: ageConfirmed as true,
        termsAccepted: termsAccepted as true,
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      });
      if (res.ok) {
        window.location.assign(res.url);
        return;
      }
      setErrors(res.errors ?? {});
      setIssues(res.issues ?? []);
      setMessage(res.message);
      const first = Object.keys(res.errors ?? {})[0];
      if (first) document.getElementById(`f-${first}`)?.focus();
    });
  };

  if (hydrated && items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="font-display text-6xl">Tu cesta está vacía.</p>
        <p className="mt-4 text-humo">Añade algún sabor antes de pasar por caja.</p>
        <Link href="/tienda" className="btn btn-primary mt-8">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const field = (k: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label htmlFor={`f-${k}`} className="label">
        {label}
      </label>
      <input
        id={`f-${k}`}
        name={k}
        value={form[k]}
        onChange={set(k)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `e-${k}` : undefined}
        {...props}
        className="field"
      />
      {errors[k] && (
        <p id={`e-${k}`} className="mt-1.5 text-sm text-red-700">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="space-y-12 lg:col-span-7">
        <AnimatePresence>
          {(message || issues.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              role="alert"
              className="flex gap-3 rounded-2xl border border-brasa/30 bg-brasa/10 p-4 text-sm"
            >
              <AlertCircle className="size-5 shrink-0 text-brasa" />
              <div>
                {message && <p className="font-medium">{message}</p>}
                {issues.map((i) => (
                  <p key={i}>{i}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <section aria-labelledby="s-contacto">
          <StepTitle n={1} id="s-contacto">
            Contacto
          </StepTitle>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {field("email", "Email", { type: "email", autoComplete: "email", className: "sm:col-span-2", placeholder: "tu@email.com" })}
            {field("name", "Nombre y apellidos", { autoComplete: "name" })}
            {field("phone", "Teléfono", { type: "tel", autoComplete: "tel", placeholder: "600 000 000", inputMode: "tel" })}
          </div>
        </section>

        <section aria-labelledby="s-entrega">
          <StepTitle n={2} id="s-entrega">
            Entrega en frío
          </StepTitle>
          <div className="mt-6 grid gap-4 sm:grid-cols-6">
            {field("address", "Dirección", { autoComplete: "street-address", className: "sm:col-span-6", placeholder: "Calle, número, piso y puerta" })}
            <div className="sm:col-span-2">
              <label htmlFor="f-postalCode" className="label">
                Código postal
              </label>
              <div className="relative">
                <input
                  id="f-postalCode"
                  value={form.postalCode}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, postalCode: e.target.value.replace(/\D/g, "").slice(0, 5) }));
                    setErrors((er) => ({ ...er, postalCode: "" }));
                  }}
                  inputMode="numeric"
                  autoComplete="postal-code"
                  placeholder="08005"
                  aria-invalid={errors.postalCode || (form.postalCode.length === 5 && !zone) ? true : undefined}
                  className="field pr-10 font-mono tracking-wider"
                />
                {zone && <Check className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-emerald-600" />}
              </div>
            </div>
            {field("city", "Ciudad", { autoComplete: "address-level2", className: "sm:col-span-4" })}
            <div className="sm:col-span-6" aria-live="polite">
              {form.postalCode.length === 5 && !zone && (
                <p className="flex items-center gap-2 text-sm text-red-700">
                  <MapPin className="size-4" /> Todavía no repartimos en {form.postalCode}. Llegamos a Barcelona, área metropolitana y Costa
                  Brava.
                </p>
              )}
              {errors.postalCode && zone === null && form.postalCode.length < 5 && (
                <p className="text-sm text-red-700">{errors.postalCode}</p>
              )}
              {zone && (
                <p className="flex items-center gap-2 text-sm text-humo">
                  <Snowflake className="size-4 text-brasa" /> {zone.name} · {zone.eta} · envío {money(zone.shippingCents)}, gratis desde{" "}
                  {money(zone.freeFromCents)}
                </p>
              )}
            </div>
          </div>

          <AnimatePresence initial={false}>
            {zone && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <fieldset className="mt-8">
                  <legend className="label">Día de entrega</legend>
                  <div className="mt-1 grid grid-cols-3 gap-2 sm:grid-cols-6" id="f-deliveryDate" tabIndex={-1}>
                    {dates.map((d) => {
                      const date = new Date(`${d}T12:00:00Z`);
                      const active = form.deliveryDate === d;
                      return (
                        <label
                          key={d}
                          className={cn(
                            "flex cursor-pointer flex-col items-center rounded-2xl border py-3 transition",
                            active ? "border-noche bg-noche text-crema" : "border-linea bg-white hover:border-noche/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="deliveryDate"
                            value={d}
                            checked={active}
                            onChange={() => setForm((f) => ({ ...f, deliveryDate: d }))}
                            className="sr-only"
                          />
                          <span className="eyebrow">{dayFmt.format(date).replace(".", "")}</span>
                          <span className="font-display mt-1 text-2xl">{numFmt.format(date).replace(".", "")}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <fieldset className="mt-5">
                  <legend className="label">Franja horaria</legend>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {zone.slots.map((s) => {
                      const active = form.deliverySlot === s;
                      return (
                        <label
                          key={s}
                          className={cn(
                            "cursor-pointer rounded-full border px-4 py-2.5 font-mono text-sm transition",
                            active ? "border-noche bg-noche text-crema" : "border-linea bg-white hover:border-noche/50",
                          )}
                        >
                          <input
                            type="radio"
                            name="deliverySlot"
                            value={s}
                            checked={active}
                            onChange={() => setForm((f) => ({ ...f, deliverySlot: s }))}
                            className="sr-only"
                          />
                          {s}
                        </label>
                      );
                    })}
                  </div>
                  {errors.deliveryDate && <p className="mt-2 text-sm text-red-700">{errors.deliveryDate}</p>}
                </fieldset>
                <div className="mt-5">
                  <label htmlFor="f-notes" className="label">
                    Notas para el repartidor <span className="font-normal text-humo">(opcional)</span>
                  </label>
                  <textarea
                    id="f-notes"
                    value={form.notes}
                    onChange={set("notes")}
                    rows={2}
                    maxLength={400}
                    placeholder="Timbre, portería, indicaciones…"
                    className="field resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section aria-labelledby="s-confirmar">
          <StepTitle n={3} id="s-confirmar">
            Confirmación
          </StepTitle>
          <div className="mt-6 space-y-3">
            <Checkbox
              id="f-ageConfirmed"
              checked={ageConfirmed}
              onChange={(v) => {
                setAge(v);
                setErrors((er) => ({ ...er, ageConfirmed: "" }));
              }}
              error={errors.ageConfirmed}
            >
              Confirmo que tengo <strong>18 años o más</strong> y que mostraré mi DNI si el repartidor me lo pide.
            </Checkbox>
            <Checkbox
              id="f-termsAccepted"
              checked={termsAccepted}
              onChange={(v) => {
                setTerms(v);
                setErrors((er) => ({ ...er, termsAccepted: "" }));
              }}
              error={errors.termsAccepted}
            >
              Acepto las{" "}
              <Link href="/legal/condiciones" target="_blank" className="underline">
                condiciones de venta
              </Link>{" "}
              y la{" "}
              <Link href="/legal/privacidad" target="_blank" className="underline">
                política de privacidad
              </Link>
              .
            </Checkbox>
          </div>
        </section>

        <Link href="/tienda" className="hidden items-center gap-2 text-sm text-humo hover:text-noche lg:inline-flex">
          <ArrowLeft className="size-4" /> Seguir comprando
        </Link>
      </div>

      {/* Resumen */}
      <aside className="lg:col-span-5">
        <div className="rounded-[32px] bg-white p-6 shadow-[0_1px_0_var(--color-linea),0_30px_60px_-30px_rgba(20,11,16,0.15)] sm:p-8 lg:sticky lg:top-24">
          <h2 className="font-display text-4xl">Tu pedido</h2>
          <ul className="mt-6 space-y-4">
            {hydrated &&
              items.map((i) => (
                <li key={i.variantId} className="flex items-center gap-4">
                  <span className="relative grid h-16 w-14 shrink-0 place-items-center rounded-xl" style={{ background: i.arts[0]?.bg }}>
                    <ProductArt arts={i.arts} kind={i.kind} className="h-12 w-10" />
                    <span className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-noche font-mono text-[11px] text-crema">
                      {i.quantity}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{i.productName}</span>
                    <span className="block text-sm text-humo">{i.variantName}</span>
                  </span>
                  <span className="tabular-nums">{money(i.priceCents * i.quantity)}</span>
                </li>
              ))}
          </ul>

          <div className="mt-6 border-t border-linea pt-6">
            {couponCode ? (
              <div className="flex items-center justify-between rounded-2xl bg-lima/50 px-4 py-3 text-sm">
                <span className="flex items-center gap-2">
                  <Tag className="size-4" />
                  <span className="font-mono font-medium">{couponCode}</span>
                  {quote?.coupon?.ok && <span className="text-noche/70">· {quote.coupon.label}</span>}
                </span>
                <button type="button" onClick={() => setCoupon(null)} aria-label="Quitar código" className="grid size-7 place-items-center rounded-full hover:bg-white/60">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <div>
                <label htmlFor="coupon" className="sr-only">
                  Código de descuento
                </label>
                <div className="flex gap-2">
                  <input
                    id="coupon"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        applyCoupon();
                      }
                    }}
                    placeholder="Código de descuento"
                    className="field font-mono uppercase placeholder:font-sans placeholder:normal-case"
                  />
                  <button type="button" onClick={applyCoupon} disabled={couponPending || !couponInput} className="btn btn-ghost shrink-0 border-linea px-5">
                    {couponPending ? "…" : "Aplicar"}
                  </button>
                </div>
                {couponError && <p className="mt-2 text-sm text-red-700">{couponError}</p>}
              </div>
            )}
          </div>

          <dl className="mt-6 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-humo">Subtotal</dt>
              <dd className="tabular-nums">{money(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700">
                <dt>Descuento</dt>
                <dd className="tabular-nums">−{money(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-humo">Envío en frío</dt>
              <dd className="tabular-nums">{shipping === null ? "Introduce tu CP" : shipping === 0 ? "Gratis" : money(shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-linea pt-4">
              <dt className="font-medium">Total</dt>
              <dd className="font-display text-5xl tabular-nums">{money(total)}</dd>
            </div>
            <p className="text-right text-xs text-humo">IVA incluido</p>
          </dl>

          <button type="submit" disabled={pending || !hydrated} className="btn btn-brasa mt-6 w-full py-5 text-base">
            <Lock className="size-4" />
            {pending ? "Preparando el pago…" : `Pagar ${money(total)}`}
          </button>
          <p className="mt-4 text-center text-xs text-humo">
            Pago seguro con Stripe. Tienda en modo demostración: usa la tarjeta <span className="font-mono">4242 4242 4242 4242</span>.
          </p>
        </div>
      </aside>
    </form>
  );
}

function StepTitle({ n, id, children }: { n: number; id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-4">
      <span className="grid size-9 place-items-center rounded-full bg-noche font-mono text-sm text-crema">{n}</span>
      <span className="font-display text-4xl">{children}</span>
    </h2>
  );
}

function Checkbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className={cn(
          "flex cursor-pointer gap-3 rounded-2xl border bg-white p-4 text-sm transition",
          error ? "border-red-400" : checked ? "border-noche" : "border-linea hover:border-noche/40",
        )}
      >
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" aria-invalid={error ? true : undefined} />
        <span
          className={cn(
            "grid size-5 shrink-0 place-items-center rounded-md border transition peer-focus-visible:ring-2 peer-focus-visible:ring-brasa",
            checked ? "border-noche bg-noche text-crema" : "border-noche/30",
          )}
          aria-hidden
        >
          {checked && <Check className="size-3.5" />}
        </span>
        <span>{children}</span>
      </label>
      {error && <p className="mt-1.5 text-sm text-red-700">{error}</p>}
    </div>
  );
}
