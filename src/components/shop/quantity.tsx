"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/format";

export function Quantity({
  value,
  onChange,
  max,
  size = "md",
  label = "Cantidad",
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  size?: "sm" | "md";
  label?: string;
}) {
  const s = size === "sm" ? "h-9 text-sm" : "h-12";
  const b = size === "sm" ? "w-8" : "w-11";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-linea bg-white", s)} role="group" aria-label={label}>
      <button
        type="button"
        className={cn("grid h-full place-items-center rounded-l-full transition hover:bg-arena/60 disabled:opacity-30", b)}
        onClick={() => onChange(value - 1)}
        disabled={value <= (size === "sm" ? 0 : 1)}
        aria-label="Quitar uno"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-7 text-center font-mono tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn("grid h-full place-items-center rounded-r-full transition hover:bg-arena/60 disabled:opacity-30", b)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Añadir uno"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
