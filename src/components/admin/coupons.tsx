"use client";

import { useActionState, useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import { createCoupon, toggleCoupon } from "@/app/actions/admin";
import { cn } from "@/lib/format";

export function CouponToggle({ code, active }: { code: string; active: boolean }) {
  const [on, setOn] = useOptimistic(active);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={`${on ? "Desactivar" : "Activar"} ${code}`}
      onClick={() =>
        start(async () => {
          setOn(!on);
          await toggleCoupon(code, !on);
        })
      }
      className={cn("relative h-6 w-11 rounded-full transition", on ? "bg-emerald-600" : "bg-noche/20")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", on ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function CouponForm() {
  const [state, action, pending] = useActionState(createCoupon, null);
  const [type, setType] = useState("percent");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  const err = (k: string) => state?.errors?.[k] && <p className="mt-1 text-xs text-red-700">{state.errors[k]}</p>;

  return (
    <form ref={ref} action={action} className="h-fit space-y-4 rounded-3xl bg-white p-6">
      <h2 className="font-medium">Nuevo cupón</h2>
      <div>
        <label className="label" htmlFor="c-code">
          Código
        </label>
        <input id="c-code" name="code" className="field font-mono uppercase" placeholder="VERANO15" />
        {err("code")}
      </div>
      <div>
        <label className="label" htmlFor="c-type">
          Tipo
        </label>
        <select id="c-type" name="type" value={type} onChange={(e) => setType(e.target.value)} className="field">
          <option value="percent">Porcentaje</option>
          <option value="fixed">Importe fijo (€)</option>
          <option value="free_shipping">Envío gratis</option>
        </select>
      </div>
      {type !== "free_shipping" && (
        <div>
          <label className="label" htmlFor="c-value">
            {type === "percent" ? "Porcentaje" : "Importe (€)"}
          </label>
          <input id="c-value" name="value" inputMode="decimal" className="field" placeholder={type === "percent" ? "15" : "5"} />
          {err("value")}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="c-min">
            Pedido mínimo €
          </label>
          <input id="c-min" name="minSubtotal" inputMode="decimal" className="field" placeholder="0" />
        </div>
        <div>
          <label className="label" htmlFor="c-max">
            Usos máximos
          </label>
          <input id="c-max" name="maxUses" inputMode="numeric" className="field" placeholder="∞" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="c-exp">
          Caduca
        </label>
        <input id="c-exp" name="expiresAt" type="date" className="field" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Creando…" : "Crear cupón"}
      </button>
      {state?.message && <p className={cn("text-center text-sm", state.ok ? "text-emerald-700" : "text-red-700")}>{state.message}</p>}
    </form>
  );
}
