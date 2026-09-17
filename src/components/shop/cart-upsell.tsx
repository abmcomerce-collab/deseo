"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ShopProduct } from "@/lib/dto";
import { money } from "@/lib/format";
import { ProductArt } from "@/components/art/product-art";
import { QuickAdd } from "./add-to-cart";

let cache: Promise<ShopProduct[]> | null = null;
const load = () => (cache ??= fetch("/api/productos").then((r) => (r.ok ? r.json() : [])).catch(() => []));

/** Sugerencias para subir el ticket medio: sabores que aún no están en la cesta. */
export function CartUpsell({ exclude, onNavigate }: { exclude: string[]; onNavigate: () => void }) {
  const [products, setProducts] = useState<ShopProduct[]>([]);
  useEffect(() => {
    load().then(setProducts);
  }, []);
  const picks = products.filter((p) => !exclude.includes(p.slug) && p.variants.some((v) => v.stock > 0)).slice(0, 3);
  if (!picks.length) return null;

  return (
    <div className="px-6 pb-4">
      <p className="eyebrow text-humo">Combina bien con</p>
      <ul className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {picks.map((p) => (
          <li key={p.id} className="flex w-56 shrink-0 items-center gap-3 rounded-2xl border border-linea bg-white p-2 pr-3">
            <Link href={`/producto/${p.slug}`} onClick={onNavigate} className="grid h-14 w-12 shrink-0 place-items-center rounded-xl" style={{ background: p.art.bg }}>
              <ProductArt arts={p.arts} kind={p.kind} className="h-11 w-9" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.name}</p>
              <p className="text-xs text-humo">{money(p.variants[0].priceCents)}</p>
            </div>
            <QuickAdd product={p} className="size-9" />
          </li>
        ))}
      </ul>
    </div>
  );
}
