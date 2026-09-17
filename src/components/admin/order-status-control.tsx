"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin";
import type { OrderStatus } from "@/db/schema";
import { cn, STATUS_LABEL } from "@/lib/format";

const FLOW: Exclude<OrderStatus, "pending">[] = ["paid", "preparing", "shipped", "delivered"];

export function OrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [pending, start] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (status === "pending") {
    return <p className="text-sm text-humo">Este pedido no se ha pagado todavía, no se puede gestionar.</p>;
  }

  const current = FLOW.indexOf(status as (typeof FLOW)[number]);
  const next = current >= 0 && current < FLOW.length - 1 ? FLOW[current + 1] : null;

  const go = (s: Exclude<OrderStatus, "pending">) =>
    start(async () => {
      const res = await updateOrderStatus(orderId, s, note);
      if (!res.ok) setError(res.message ?? "No se pudo actualizar.");
      else setNote("");
    });

  return (
    <div>
      <ol className="space-y-2">
        {FLOW.map((s, i) => {
          const done = status !== "cancelled" && i <= current;
          return (
            <li key={s}>
              <button
                type="button"
                disabled={pending || status === s}
                onClick={() => go(s)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition disabled:cursor-default",
                  status === s ? "border-noche bg-noche text-crema" : done ? "border-linea bg-arena/40" : "border-linea hover:border-noche/40",
                )}
              >
                <span className={cn("grid size-5 place-items-center rounded-full border", done ? "border-brasa bg-brasa text-white" : "border-noche/20")}>
                  {done && <Check className="size-3" />}
                </span>
                {STATUS_LABEL[s]}
              </button>
            </li>
          );
        })}
      </ol>
      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Nota interna (opcional)"
        className="field mt-4 text-sm"
        maxLength={200}
      />
      <div className="mt-3 space-y-2">
        {next && status !== "cancelled" && (
          <button type="button" className="btn btn-brasa w-full py-3 text-sm" disabled={pending} onClick={() => go(next)}>
            Pasar a “{STATUS_LABEL[next]}”
          </button>
        )}
        {status !== "cancelled" && status !== "delivered" && (
          <button type="button" className="w-full py-2 text-sm text-humo hover:text-red-700" disabled={pending} onClick={() => go("cancelled")}>
            Cancelar pedido
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
