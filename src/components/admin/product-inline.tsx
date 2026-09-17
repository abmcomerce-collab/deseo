"use client";

import { useOptimistic, useState, useTransition } from "react";
import { toggleProduct, updateStock } from "@/app/actions/admin";
import { cn } from "@/lib/format";

export function ActiveToggle({ productId, active }: { productId: string; active: boolean }) {
  const [optimistic, setOptimistic] = useOptimistic(active);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={optimistic ? "Despublicar" : "Publicar"}
      onClick={() =>
        start(async () => {
          setOptimistic(!optimistic);
          await toggleProduct(productId, !optimistic);
        })
      }
      className={cn("relative h-6 w-11 rounded-full transition", optimistic ? "bg-emerald-600" : "bg-noche/20")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", optimistic ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

export function StockInput({ variantId, stock }: { variantId: string; stock: number }) {
  const [value, setValue] = useState(String(stock));
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const n = Number(value);
  const dirty = value !== String(stock) && Number.isInteger(n) && n >= 0;

  const save = () => {
    if (!dirty) return;
    start(async () => {
      await updateStock(variantId, n);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <span className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => e.key === "Enter" && save()}
        aria-label="Stock"
        className={cn(
          "w-20 rounded-lg border px-2 py-1 text-right tabular-nums",
          n === 0 ? "border-red-300 bg-red-50" : n <= 10 ? "border-amber-300 bg-amber-50" : "border-linea",
        )}
      />
      <span className="w-14 text-xs text-humo">{pending ? "…" : saved ? "Guardado" : "uds"}</span>
    </span>
  );
}
