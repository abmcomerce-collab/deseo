"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Clock, ShieldCheck, Snowflake } from "lucide-react";
import type { ShopProduct } from "@/lib/dto";
import { cn, fmtIsoDay, money } from "@/lib/format";
import { deliveryDates, ZONES } from "@/lib/delivery";
import { Quantity } from "./quantity";
import { useAddToCart } from "./add-to-cart";

function useEta() {
  const [eta, setEta] = useState<string | null>(null);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const [first] = deliveryDates(ZONES.bcn, 1, now);
      const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false }).format(now));
      const minute = Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Madrid", minute: "2-digit" }).format(now));
      const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(now);
      if (first === today) {
        const left = (13 - hour) * 60 - minute;
        const h = Math.floor(left / 60);
        const m = left % 60;
        setEta(`Pide en ${h ? `${h} h ` : ""}${m} min y recíbelo hoy en Barcelona`);
      } else {
        setEta(`Recíbelo el ${fmtIsoDay(first).toLowerCase()} en Barcelona`);
      }
    };
    update();
    const t = setInterval(update, 30000);
    return () => clearInterval(t);
  }, []);
  return eta;
}

export function ProductBuy({ product }: { product: ShopProduct }) {
  const firstAvailable = product.variants.findIndex((v) => v.stock > 0);
  const [selected, setSelected] = useState(Math.max(0, firstAvailable === -1 ? 0 : Math.min(firstAvailable + (product.variants.length > 1 ? 1 : 0), product.variants.length - 1)));
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addToCart = useAddToCart();
  const eta = useEta();
  const variant = product.variants[selected];
  const base = product.variants[0];
  const baseUnit = base.priceCents / base.units;
  const soldOut = variant.stock <= 0;

  const add = () => {
    if (soldOut) return;
    addToCart(product, variant, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div>
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="eyebrow text-humo">Elige tu caja</legend>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {product.variants.map((v, i) => {
              const unit = v.priceCents / v.units;
              const save = Math.round((1 - unit / baseUnit) * 100);
              const active = i === selected;
              return (
                <label
                  key={v.id}
                  className={cn(
                    "relative flex cursor-pointer flex-col rounded-2xl border p-3.5 transition sm:p-4",
                    active ? "border-noche bg-noche text-crema" : "border-linea bg-white hover:border-noche/50",
                    v.stock <= 0 && "cursor-not-allowed opacity-45",
                  )}
                >
                  <input
                    type="radio"
                    name="variant"
                    value={v.id}
                    checked={active}
                    disabled={v.stock <= 0}
                    onChange={() => {
                      setSelected(i);
                      setQty(1);
                    }}
                    className="sr-only"
                  />
                  {save > 0 && (
                    <span className="absolute -top-2.5 right-3 rounded-full bg-brasa px-2 py-0.5 font-mono text-[10px] text-noche">
                      −{save}%
                    </span>
                  )}
                  <span className="text-sm font-medium">{v.name}</span>
                  <span className="font-display mt-2 text-3xl leading-none">{money(v.priceCents)}</span>
                  <span className={cn("mt-1 text-xs", active ? "text-crema/60" : "text-humo")}>{money(Math.round(unit))}/ud</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className="mt-4 h-5 text-sm" aria-live="polite">
        {soldOut ? (
          <span className="text-tinta">Agotado temporalmente</span>
        ) : variant.stock <= 10 ? (
          <span className="text-tinta">Solo quedan {variant.stock} en el congelador</span>
        ) : (
          <span className="flex items-center gap-2 text-humo">
            <span className="size-2 rounded-full bg-emerald-500" /> En stock, listo para salir
          </span>
        )}
      </p>

      <div className="mt-4 flex gap-3">
        <Quantity value={qty} onChange={(n) => setQty(Math.max(1, n))} max={Math.max(1, variant.stock)} />
        <button type="button" onClick={add} disabled={soldOut} className="btn btn-brasa relative flex-1 overflow-hidden py-4 text-base">
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span key="ok" className="flex items-center gap-2" initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: -24 }}>
                <Check className="size-5" /> Añadido a la cesta
              </motion.span>
            ) : (
              <motion.span key="add" className="flex items-center gap-2" initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: -24 }}>
                Añadir · {money(variant.priceCents * qty)}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      <ul className="mt-6 space-y-2.5 text-sm">
        <li className="flex min-h-5 items-center gap-2.5">
          <Clock className="size-4 text-brasa" />
          {eta ?? "Entrega en Barcelona hoy o mañana"}
        </li>
        <li className="flex items-center gap-2.5">
          <Snowflake className="size-4 text-brasa" /> Envío en caja isotérmica a −18 °C · gratis desde 45 €
        </li>
        <li className="flex items-center gap-2.5">
          <ShieldCheck className="size-4 text-brasa" /> Pago seguro con Stripe · entrega solo a mayores de 18
        </li>
      </ul>

      {/* barra fija en móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-linea bg-papel/95 p-3 backdrop-blur-xl sm:hidden">
        <button type="button" onClick={add} disabled={soldOut} className="btn btn-brasa w-full py-4">
          {added ? "Añadido ✓" : `Añadir ${variant.name.toLowerCase()} · ${money(variant.priceCents * qty)}`}
        </button>
      </div>
    </div>
  );
}
