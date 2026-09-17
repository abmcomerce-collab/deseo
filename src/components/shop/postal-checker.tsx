"use client";

import { useActionState, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Snowflake } from "lucide-react";
import { deliveryDates, zoneForPostalCode } from "@/lib/delivery";
import { fmtIsoDay, money } from "@/lib/format";
import { subscribe } from "@/app/actions/leads";

export function PostalChecker({ dark = false }: { dark?: boolean }) {
  const [cp, setCp] = useState("");
  const complete = /^\d{5}$/.test(cp);
  const zone = useMemo(() => (complete ? zoneForPostalCode(cp) : null), [cp, complete]);
  const next = useMemo(() => (zone ? deliveryDates(zone, 1)[0] : null), [zone]);
  const [state, action, pending] = useActionState(subscribe, null);

  const muted = dark ? "text-crema/60" : "text-humo";

  return (
    <div>
      <label htmlFor="cp" className={`eyebrow ${muted}`}>
        ¿Llegamos a tu casa?
      </label>
      <div
        className={`mt-3 flex items-center gap-3 rounded-full border px-5 transition focus-within:border-brasa ${
          dark ? "border-crema/20 bg-crema/5" : "border-linea bg-white"
        }`}
      >
        <MapPin className="size-5 shrink-0 text-brasa" />
        <input
          id="cp"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={cp}
          onChange={(e) => setCp(e.target.value.replace(/\D/g, ""))}
          placeholder="Código postal, p. ej. 08005"
          className="h-14 w-full bg-transparent font-mono text-lg tracking-wider outline-none placeholder:font-sans placeholder:text-base placeholder:tracking-normal placeholder:opacity-50"
        />
      </div>
      <div className="min-h-28" aria-live="polite">
        <AnimatePresence mode="wait">
          {complete && zone && next && (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex gap-3"
            >
              <Snowflake className="mt-1 size-5 shrink-0 text-brasa" />
              <div>
                <p className="font-medium">
                  Sí, repartimos en {zone.name}. Próxima entrega: {fmtIsoDay(next).toLowerCase()}.
                </p>
                <p className={`mt-1 text-sm ${muted}`}>
                  Envío {money(zone.shippingCents)} · gratis desde {money(zone.freeFromCents)} · franjas {zone.slots.join(", ")}
                </p>
              </div>
            </motion.div>
          )}
          {complete && !zone && (
            <motion.div key="no" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4">
              {state?.ok ? (
                <p className="font-medium">{state.message}</p>
              ) : (
                <>
                  <p className="font-medium">Todavía no llegamos a {cp}. ¿Te avisamos cuando lo hagamos?</p>
                  <form action={action} className="mt-3 flex gap-2">
                    <input type="hidden" name="postalCode" value={cp} />
                    <input type="hidden" name="source" value="waitlist" />
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="tu@email.com"
                      aria-label="Email para avisarte"
                      className={`h-11 min-w-0 flex-1 rounded-full border px-4 outline-none ${
                        dark ? "border-crema/20 bg-transparent" : "border-linea bg-white"
                      }`}
                    />
                    <button className="btn btn-brasa py-2.5" disabled={pending}>
                      Avisadme
                    </button>
                  </form>
                  {state && !state.ok && <p className={`mt-2 text-sm ${dark ? "text-brasa" : "text-tinta"}`}>{state.message}</p>}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
