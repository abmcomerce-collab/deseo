import { Check } from "lucide-react";
import type { OrderStatus } from "@/db/schema";
import { cn, fmtDateTime } from "@/lib/format";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "paid", label: "Pagado" },
  { status: "preparing", label: "Preparando" },
  { status: "shipped", label: "En reparto" },
  { status: "delivered", label: "Entregado" },
];

export function OrderTimeline({
  status,
  events,
  dark = false,
}: {
  status: OrderStatus;
  events: { status: OrderStatus; createdAt: Date }[];
  dark?: boolean;
}) {
  if (status === "cancelled" || status === "pending") return null;
  const current = STEPS.findIndex((s) => s.status === status);
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Estado del pedido">
      {STEPS.map((s, i) => {
        const done = i <= current;
        const at = events.find((e) => e.status === s.status)?.createdAt;
        return (
          <li key={s.status} className="relative">
            <div className={cn("h-1.5 rounded-full", done ? "bg-brasa" : dark ? "bg-crema/15" : "bg-arena")} />
            <div className="mt-3 flex items-center gap-1.5 text-sm font-medium">
              {done && <Check className="size-3.5 text-brasa" />}
              <span className={done ? "" : "opacity-50"}>{s.label}</span>
            </div>
            {at && <p className={cn("mt-0.5 text-xs", dark ? "text-crema/50" : "text-humo")}>{fmtDateTime(at)}</p>}
          </li>
        );
      })}
    </ol>
  );
}
