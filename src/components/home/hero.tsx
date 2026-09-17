"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ShopProduct } from "@/lib/dto";
import { Polo } from "@/components/art/polo";
import { abv, money } from "@/lib/format";
import { useAddToCart } from "@/components/shop/add-to-cart";

const INTERVAL = 6000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero({ flavors }: { flavors: ShopProduct[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = flavors[index];
  const addToCart = useAddToCart();
  const ref = useRef<HTMLElement>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 80, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 80, damping: 18 });
  const tx = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 60, damping: 20 });

  const next = useCallback(() => setIndex((i) => (i + 1) % flavors.length), [flavors.length]);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(next, INTERVAL);
    return () => clearTimeout(t);
  }, [index, paused, next]);

  const first = current.variants[0];

  return (
    <section
      ref={ref}
      aria-label="Sabores destacados"
      className="relative -mt-16 overflow-hidden transition-colors duration-[1200ms] md:-mt-[4.5rem]"
      style={{ backgroundColor: current.art.bg }}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width - 0.5);
        my.set((e.clientY - r.top) / r.height - 0.5);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {/* palabra gigante de fondo */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={current.slug}
            className="font-display whitespace-nowrap text-[42vw] italic leading-none lg:text-[30vw]"
            style={{ color: current.art.base, opacity: 0.16 }}
            initial={{ y: "30%", opacity: 0 }}
            animate={{ y: "0%", opacity: 0.16 }}
            exit={{ y: "-30%", opacity: 0 }}
            transition={{ duration: 1.1, ease: EASE }}
          >
            {current.name.split(" ")[0]}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="container-x relative grid grid-cols-1 items-center gap-2 pb-24 pt-24 lg:min-h-[max(760px,100svh)] lg:grid-cols-12 lg:gap-6 lg:pb-32">
        <div className="relative z-10 lg:col-span-6 xl:col-span-6">
          <p className="eyebrow animate-fade-up text-noche/70">Barcelona · Polos con alcohol · +18</p>
          <h1 className="font-display mt-6 text-[clamp(4rem,11vw,10.5rem)]">
            Cócteles
            <br />
            que se <em className="text-tinta">comen.</em>
          </h1>
          <p className="mt-7 max-w-md animate-fade-up text-lg leading-relaxed text-noche/75 [animation-delay:160ms]">
            Polos artesanos con alcohol de verdad, hechos en Barcelona. Te los llevamos congelados a casa, hoy mismo.
          </p>
          <div className="mt-9 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:240ms]">
            <Link href="/tienda" className="btn btn-primary py-4 pl-7 pr-6 text-base">
              Ver la carta <ArrowRight className="size-4" />
            </Link>
            <Link href="/producto/caja-degustacion" className="btn btn-ghost border-noche/25 py-4 text-base">
              Caja degustación · 34,90 €
            </Link>
          </div>
        </div>

        <div className="relative flex h-[440px] items-center justify-center sm:h-[52vh] lg:col-span-6 lg:h-[76vh]" style={{ perspective: 1200 }}>
          {/* insignia giratoria */}
          <div className="absolute right-[4%] top-[6%] z-20 size-28 sm:size-36 lg:right-[8%]" aria-hidden>
            <svg viewBox="0 0 120 120" className="size-full animate-spin-slow">
              <defs>
                <path id="circle" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0" />
              </defs>
              <text className="fill-noche font-mono text-[9.4px] uppercase tracking-[0.22em]">
                <textPath href="#circle">{`${current.spirit} · ${abv(current.abv)} · hecho en bcn · `}</textPath>
              </text>
            </svg>
            <span className="absolute inset-0 grid place-items-center font-display text-3xl italic">+18</span>
          </div>

          <motion.div className="relative h-full w-full" style={{ rotateX: rx, rotateY: ry, x: tx, transformStyle: "preserve-3d" }}>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={current.slug}
                className="absolute inset-0 flex items-center justify-center"
                initial={{ y: 140, rotate: 18, opacity: 0, scale: 0.85 }}
                animate={{ y: 0, rotate: 0, opacity: 1, scale: 1 }}
                exit={{ y: -160, rotate: -22, opacity: 0, scale: 0.9 }}
                transition={{ duration: 1.1, ease: EASE }}
              >
                <div className="h-[92%] animate-float">
                  <Polo
                    art={current.art}
                    className="h-full w-auto drop-shadow-[0_50px_40px_rgba(20,11,16,0.28)]"
                    title={`Polo ${current.name}`}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* tarjeta flotante de compra */}
          <AnimatePresence mode="wait">
            <motion.div
              key={current.slug}
              className="absolute bottom-0 left-0 z-20 hidden w-72 rounded-3xl bg-papel/80 p-4 shadow-[0_20px_60px_-20px_rgba(20,11,16,0.35)] backdrop-blur-xl sm:block lg:bottom-[8%] lg:left-[-4%]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-display text-3xl leading-none">{current.name}</p>
                  <p className="mt-1.5 text-xs text-humo">{current.tagline}</p>
                </div>
                <Link
                  href={`/producto/${current.slug}`}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-linea transition hover:bg-noche hover:text-crema"
                  aria-label={`Ver ${current.name}`}
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm">
                  <span className="font-semibold">{money(first.priceCents)}</span>
                  <span className="text-humo"> · {first.name.toLowerCase()}</span>
                </p>
                <button
                  type="button"
                  className="btn btn-primary px-4 py-2.5 text-sm"
                  disabled={first.stock <= 0}
                  onClick={() => addToCart(current, first)}
                >
                  Añadir
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* selector de sabores */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="container-x pb-6">
          <div
            className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
            role="tablist"
            aria-label="Elegir sabor"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {flavors.map((f, i) => {
              const active = i === index;
              return (
                <button
                  key={f.slug}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setIndex(i)}
                  className={`relative flex shrink-0 items-center gap-2.5 overflow-hidden rounded-full border py-2 pl-2 pr-4 text-sm transition ${
                    active ? "border-noche bg-noche text-crema" : "border-noche/15 bg-papel/50 backdrop-blur hover:border-noche/40"
                  }`}
                >
                  <span className="size-6 rounded-full ring-2 ring-white/60" style={{ background: `linear-gradient(160deg, ${f.art.top}, ${f.art.base})` }} />
                  {f.name}
                  {active && !paused && (
                    <motion.span
                      key={`p-${index}`}
                      className="absolute bottom-0 left-0 h-0.5 bg-brasa"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
