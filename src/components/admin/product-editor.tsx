"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { saveProduct, type ProductInput } from "@/app/actions/admin";
import type { PoloArt } from "@/db/schema";
import { Polo } from "@/components/art/polo";
import { cn, money } from "@/lib/format";

type VariantDraft = { id?: string; name: string; units: string; price: string; compareAt: string; stock: string };
export type ProductDraft = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  kind: "polo" | "pack";
  spirit: string;
  abv: string;
  notes: string;
  ingredients: string;
  allergens: string;
  pairing: string;
  badge: string;
  featured: boolean;
  isActive: boolean;
  art: PoloArt;
  variants: VariantDraft[];
};

const PATTERNS: { id: PoloArt["pattern"]; label: string }[] = [
  { id: "plain", label: "Liso / costra" },
  { id: "layers", label: "Capas" },
  { id: "leaves", label: "Hojas" },
  { id: "speckle", label: "Semillas" },
  { id: "swirl", label: "Remolino" },
  { id: "zest", label: "Ralladura" },
  { id: "bubbles", label: "Burbujas" },
];

const COLORS: { key: keyof Omit<PoloArt, "pattern">; label: string }[] = [
  { key: "base", label: "Cuerpo" },
  { key: "top", label: "Degradado" },
  { key: "accent", label: "Detalles" },
  { key: "bg", label: "Fondo" },
  { key: "ink", label: "Texto" },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export function ProductEditor({ productId, initial, justCreated }: { productId: string | null; initial: ProductDraft; justCreated?: boolean }) {
  const [d, setD] = useState(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(productId));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(justCreated ? { ok: true, text: "Producto creado." } : null);
  const [pending, start] = useTransition();

  const set = <K extends keyof ProductDraft>(k: K, v: ProductDraft[K]) => setD((x) => ({ ...x, [k]: v }));
  const setVariant = (i: number, patch: Partial<VariantDraft>) =>
    setD((x) => ({ ...x, variants: x.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)) }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const payload: ProductInput = {
      ...d,
      abv: d.abv,
      variants: d.variants.map((v) => ({
        id: v.id,
        name: v.name,
        units: v.units,
        price: v.price.replace(",", "."),
        compareAt: v.compareAt ? v.compareAt.replace(",", ".") : undefined,
        stock: v.stock,
      })),
    } as unknown as ProductInput;
    start(async () => {
      const res = await saveProduct(productId, payload);
      if (!res) return;
      setErrors(res.errors ?? {});
      setMessage({ ok: Boolean(res.ok), text: res.message ?? "" });
    });
  };

  const input = (k: keyof ProductDraft, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className={props.className}>
      <label className="label" htmlFor={`p-${k}`}>
        {label}
      </label>
      <input
        id={`p-${k}`}
        value={String(d[k] ?? "")}
        onChange={(e) => set(k, e.target.value as never)}
        aria-invalid={errors[k] ? true : undefined}
        {...props}
        className="field"
      />
      {errors[k] && <p className="mt-1 text-xs text-red-700">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_380px]" noValidate>
      <div className="space-y-6">
        <section className="rounded-3xl bg-white p-6">
          <h2 className="font-medium">Información</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="p-name">
                Nombre
              </label>
              <input
                id="p-name"
                value={d.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setD((x) => ({ ...x, name, slug: slugTouched ? x.slug : slugify(name) }));
                }}
                className="field"
                aria-invalid={errors.name ? true : undefined}
              />
              {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
            </div>
            <div>
              <label className="label" htmlFor="p-slug">
                URL
              </label>
              <div className="flex items-center rounded-[14px] border border-linea bg-white pl-3 focus-within:border-noche">
                <span className="text-sm text-humo">/producto/</span>
                <input
                  id="p-slug"
                  value={d.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", slugify(e.target.value));
                  }}
                  className="w-full bg-transparent py-3 pr-3 text-sm outline-none"
                />
              </div>
              {errors.slug && <p className="mt-1 text-xs text-red-700">{errors.slug}</p>}
            </div>
            {input("tagline", "Frase corta", { className: "sm:col-span-2" })}
            <div className="sm:col-span-2">
              <label className="label" htmlFor="p-description">
                Descripción
              </label>
              <textarea
                id="p-description"
                rows={4}
                value={d.description}
                onChange={(e) => set("description", e.target.value)}
                className="field"
                aria-invalid={errors.description ? true : undefined}
              />
              {errors.description && <p className="mt-1 text-xs text-red-700">{errors.description}</p>}
            </div>
            <div>
              <label className="label" htmlFor="p-kind">
                Tipo
              </label>
              <select id="p-kind" value={d.kind} onChange={(e) => set("kind", e.target.value as "polo" | "pack")} className="field">
                <option value="polo">Polo</option>
                <option value="pack">Pack</option>
              </select>
            </div>
            {input("spirit", "Destilado")}
            {input("abv", "Graduación (% vol.)", { inputMode: "decimal" })}
            {input("badge", "Etiqueta (opcional)", { placeholder: "Nuevo, Edición limitada…" })}
            {input("notes", "Notas de sabor (separadas por comas)", { className: "sm:col-span-2" })}
            {input("ingredients", "Ingredientes", { className: "sm:col-span-2" })}
            {input("allergens", "Alérgenos (separados por comas)")}
            {input("pairing", "Momento perfecto (opcional)")}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Variantes, precio y stock</h2>
            <button
              type="button"
              onClick={() => set("variants", [...d.variants, { name: "", units: "4", price: "", compareAt: "", stock: "0" }])}
              className="btn btn-ghost border-linea px-3 py-2 text-sm"
            >
              <Plus className="size-4" /> Añadir
            </button>
          </div>
          {errors.variants && <p className="mt-2 text-sm text-red-700">{errors.variants}</p>}
          <div className="mt-4 space-y-3">
            <div className="hidden grid-cols-[1.4fr_0.6fr_0.8fr_0.8fr_0.7fr_40px] gap-3 px-1 text-xs text-humo sm:grid">
              <span>Nombre</span>
              <span>Uds.</span>
              <span>Precio €</span>
              <span>Antes €</span>
              <span>Stock</span>
              <span />
            </div>
            {d.variants.map((v, i) => {
              const price = Number(v.price.replace(",", "."));
              const units = Number(v.units);
              return (
                <div key={v.id ?? i} className="grid grid-cols-2 gap-3 rounded-2xl bg-arena/30 p-3 sm:grid-cols-[1.4fr_0.6fr_0.8fr_0.8fr_0.7fr_40px] sm:bg-transparent sm:p-0">
                  <input aria-label="Nombre de la variante" value={v.name} onChange={(e) => setVariant(i, { name: e.target.value })} className="field col-span-2 py-2.5 sm:col-span-1" placeholder="Caja de 4" />
                  <input aria-label="Unidades" value={v.units} onChange={(e) => setVariant(i, { units: e.target.value })} className="field py-2.5" inputMode="numeric" />
                  <div>
                    <input aria-label="Precio" value={v.price} onChange={(e) => setVariant(i, { price: e.target.value })} className="field py-2.5" inputMode="decimal" />
                    {price > 0 && units > 0 && <p className="mt-1 text-[11px] text-humo">{money(Math.round((price * 100) / units))}/ud</p>}
                  </div>
                  <input aria-label="Precio anterior" value={v.compareAt} onChange={(e) => setVariant(i, { compareAt: e.target.value })} className="field py-2.5" inputMode="decimal" placeholder="—" />
                  <input aria-label="Stock" value={v.stock} onChange={(e) => setVariant(i, { stock: e.target.value })} className="field py-2.5" inputMode="numeric" />
                  <button
                    type="button"
                    disabled={d.variants.length === 1}
                    onClick={() => set("variants", d.variants.filter((_, j) => j !== i))}
                    className="grid size-10 place-items-center rounded-full text-humo hover:bg-arena/60 hover:text-noche disabled:opacity-30"
                    aria-label="Eliminar variante"
                  >
                    <Trash2 className="size-4" />
                  </button>
                  {Object.entries(errors)
                    .filter(([k]) => k.startsWith(`variants.${i}.`))
                    .slice(0, 1)
                    .map(([k, m]) => (
                      <p key={k} className="col-span-full text-xs text-red-700">
                        {m}
                      </p>
                    ))}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-10 xl:h-fit">
        <section className="overflow-hidden rounded-3xl bg-white">
          <div className="relative grid h-72 place-items-center transition-colors" style={{ background: d.art.bg }}>
            <Polo art={d.art} className="h-60 drop-shadow-[0_20px_20px_rgba(20,11,16,0.2)]" />
            <span className="font-display absolute bottom-3 left-4 text-2xl" style={{ color: d.art.ink }}>
              {d.name || "Nuevo sabor"}
            </span>
          </div>
          <div className="space-y-4 p-5">
            <p className="text-sm font-medium">Ilustración del producto</p>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <label key={c.key} className="flex flex-col items-center gap-1.5 text-[11px] text-humo">
                  <input
                    type="color"
                    value={d.art[c.key]}
                    onChange={(e) => set("art", { ...d.art, [c.key]: e.target.value.toUpperCase() })}
                    className="size-10 cursor-pointer rounded-full border border-linea bg-transparent [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch-wrapper]:p-0"
                  />
                  {c.label}
                </label>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set("art", { ...d.art, pattern: p.id })}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition",
                    d.art.pattern === p.id ? "border-noche bg-noche text-crema" : "border-linea hover:border-noche/40",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-3 rounded-3xl bg-white p-5">
          <label className="flex items-center justify-between text-sm">
            Publicado en la tienda
            <input type="checkbox" checked={d.isActive} onChange={(e) => set("isActive", e.target.checked)} className="size-4 accent-[#140b10]" />
          </label>
          <label className="flex items-center justify-between text-sm">
            Destacado en la portada
            <input type="checkbox" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} className="size-4 accent-[#140b10]" />
          </label>
          <button className="btn btn-brasa w-full py-3.5" disabled={pending}>
            {pending ? "Guardando…" : productId ? "Guardar cambios" : "Crear producto"}
          </button>
          {message && (
            <p role="status" className={cn("text-center text-sm", message.ok ? "text-emerald-700" : "text-red-700")}>
              {message.text}
            </p>
          )}
          {productId && d.isActive && (
            <Link href={`/producto/${initial.slug}`} target="_blank" className="flex items-center justify-center gap-1.5 text-sm text-humo hover:text-noche">
              Ver en la tienda <ExternalLink className="size-3.5" />
            </Link>
          )}
        </section>
      </aside>
    </form>
  );
}
