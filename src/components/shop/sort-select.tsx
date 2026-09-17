"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export function SortSelect({ options, value }: { options: readonly { id: string; label: string }[]; value: string }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="relative flex shrink-0 items-center gap-2 rounded-full border border-linea bg-white/60 py-2 pl-4 pr-9 text-sm">
      <span className="text-humo">Ordenar:</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params);
          if (e.target.value === "destacados") next.delete("orden");
          else next.set("orden", e.target.value);
          router.push(next.size ? `/tienda?${next}` : "/tienda", { scroll: false });
        }}
        className="appearance-none bg-transparent font-medium outline-none"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4" />
    </label>
  );
}
