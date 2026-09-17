"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Search } from "lucide-react";
import type { ShopProduct } from "@/lib/dto";
import { ProductArt } from "@/components/art/product-art";
import { abv, money } from "@/lib/format";

let cache: ShopProduct[] | null = null;

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [products, setProducts] = useState<ShopProduct[]>(cache ?? []);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 30);
    if (!cache)
      fetch("/api/productos")
        .then((r) => r.json())
        .then((data: ShopProduct[]) => {
          cache = data;
          setProducts(data);
        })
        .catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  const results = useMemo(() => {
    const term = normalize(q.trim());
    if (!term) return products;
    return products.filter((p) =>
      normalize([p.name, p.tagline, p.spirit, ...p.notes].join(" ")).includes(term),
    );
  }, [q, products]);

  const go = (slug: string) => {
    onClose();
    router.push(`/producto/${slug}`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center bg-noche/40 p-3 pt-[10vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar productos"
            className="w-full max-w-xl overflow-hidden rounded-3xl bg-papel shadow-2xl"
            initial={{ y: -20, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -10, scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 border-b border-linea px-5">
              <Search className="size-5 text-humo" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  }
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(a - 1, 0));
                  }
                  if (e.key === "Enter" && results[active]) go(results[active].slug);
                }}
                placeholder="Mojito, tequila, cremoso, para regalar…"
                className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-humo/60"
                aria-controls="search-results"
              />
              <kbd className="rounded-md bg-arena/70 px-1.5 py-0.5 font-mono text-[10px]">ESC</kbd>
            </div>
            <ul id="search-results" role="listbox" className="max-h-[55vh] overflow-y-auto p-2">
              {results.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <Link
                    href={`/producto/${p.slug}`}
                    onClick={onClose}
                    onMouseEnter={() => setActive(i)}
                    className={`flex items-center gap-4 rounded-2xl p-2 pr-4 transition ${i === active ? "bg-arena/60" : ""}`}
                  >
                    <span className="grid h-16 w-14 shrink-0 place-items-center rounded-xl" style={{ background: p.art.bg }}>
                      <ProductArt arts={p.arts} kind={p.kind} className="h-12 w-10" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="font-display block text-2xl">{p.name}</span>
                      <span className="block truncate text-sm text-humo">{p.tagline}</span>
                    </span>
                    <span className="hidden text-right sm:block">
                      <span className="block text-sm font-medium">{money(Math.min(...p.variants.map((v) => v.priceCents)))}</span>
                      <span className="eyebrow text-humo">{abv(p.abv)}</span>
                    </span>
                    <ArrowRight className={`size-4 transition ${i === active ? "opacity-100" : "opacity-0"}`} />
                  </Link>
                </li>
              ))}
              {products.length > 0 && results.length === 0 && (
                <li className="px-4 py-10 text-center text-humo">
                  Nada con “{q}”. Prueba con un destilado: ron, tequila, cava…
                </li>
              )}
              {products.length === 0 && <li className="px-4 py-10 text-center text-humo">Cargando la carta…</li>}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
