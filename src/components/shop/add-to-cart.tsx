"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus } from "lucide-react";
import type { ShopProduct, ShopVariant } from "@/lib/dto";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/format";

export function useAddToCart() {
  const add = useCart((s) => s.add);
  return (product: ShopProduct, variant: ShopVariant, quantity = 1) =>
    add(
      {
        variantId: variant.id,
        productSlug: product.slug,
        productName: product.name,
        variantName: variant.name,
        units: variant.units,
        priceCents: variant.priceCents,
        arts: product.arts,
        kind: product.kind,
        maxStock: variant.stock,
      },
      quantity,
    );
}

/** Botón redondo de “añadir rápido” de las tarjetas. */
export function QuickAdd({ product, className }: { product: ShopProduct; className?: string }) {
  const addToCart = useAddToCart();
  const [done, setDone] = useState(false);
  const variant = product.variants.find((v) => v.stock > 0);

  return (
    <button
      type="button"
      disabled={!variant}
      onClick={(e) => {
        e.preventDefault();
        if (!variant) return;
        addToCart(product, variant);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      className={cn(
        "relative grid size-11 place-items-center overflow-hidden rounded-full bg-noche text-crema transition duration-300 hover:scale-110 hover:bg-brasa hover:text-noche disabled:opacity-40",
        className,
      )}
      aria-label={variant ? `Añadir ${product.name} (${variant.name}) a la cesta` : `${product.name} agotado`}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {done ? (
          <motion.span key="ok" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
            <Check className="size-5" />
          </motion.span>
        ) : (
          <motion.span key="add" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
            <Plus className="size-5" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
