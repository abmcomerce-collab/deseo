"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Snowflake, Trash2, X } from "lucide-react";
import { cartCount, cartSubtotal, useCart } from "@/stores/cart";
import { refreshCart } from "@/app/actions/cart";
import { money } from "@/lib/format";
import { ProductArt } from "@/components/art/product-art";
import { Quantity } from "./quantity";
import { FreeShippingBar } from "./free-shipping-bar";
import { CartUpsell } from "./cart-upsell";

export function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove, syncPrices } = useCart();
  const subtotal = cartSubtotal(items);
  const count = cartCount(items);

  useEffect(() => {
    if (!isOpen) return;
    const ids = useCart.getState().items.map((i) => i.variantId);
    if (ids.length) refreshCart(ids).then(syncPrices).catch(() => {});
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, close, syncPrices]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[65]">
          <motion.div
            className="absolute inset-0 bg-noche/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label="Tu cesta"
            className="absolute inset-y-0 right-0 flex w-full max-w-[460px] flex-col bg-papel shadow-2xl sm:inset-y-2 sm:right-2 sm:rounded-[28px]"
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-5">
              <h2 className="font-display text-4xl">
                Tu cesta <sup className="font-mono text-sm not-italic text-humo">{count}</sup>
              </h2>
              <button type="button" onClick={close} className="grid size-10 place-items-center rounded-full hover:bg-arena/60" aria-label="Cerrar cesta">
                <X className="size-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="font-display text-5xl">Aquí hace frío.</p>
                <p className="mt-3 max-w-xs text-humo">Tu cesta está vacía. Empieza por el sabor que más te apetezca esta noche.</p>
                <Link href="/tienda" onClick={close} className="btn btn-primary mt-8">
                  Ver la carta <ArrowRight className="size-4" />
                </Link>
              </div>
            ) : (
              <>
                <div className="mx-6 rounded-2xl bg-arena/50 p-4">
                  <FreeShippingBar subtotalCents={subtotal} />
                </div>
                <ul className="mt-2 flex-1 divide-y divide-linea overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.variantId}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex gap-4 py-4">
                          <Link
                            href={`/producto/${item.productSlug}`}
                            onClick={close}
                            className="grid h-24 w-20 shrink-0 place-items-center rounded-2xl"
                            style={{ background: item.arts[0]?.bg }}
                          >
                            <ProductArt arts={item.arts} kind={item.kind} className="h-20 w-16" />
                          </Link>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <Link href={`/producto/${item.productSlug}`} onClick={close} className="font-display text-2xl leading-none">
                                  {item.productName}
                                </Link>
                                <p className="mt-1 text-sm text-humo">
                                  {item.variantName} · {money(Math.round(item.priceCents / item.units))}/ud
                                </p>
                              </div>
                              <p className="font-medium tabular-nums">{money(item.priceCents * item.quantity)}</p>
                            </div>
                            <div className="mt-auto flex items-center justify-between pt-2">
                              <Quantity
                                size="sm"
                                value={item.quantity}
                                max={item.maxStock}
                                onChange={(n) => setQuantity(item.variantId, n)}
                              />
                              <button
                                type="button"
                                onClick={() => remove(item.variantId)}
                                className="grid size-9 place-items-center rounded-full text-humo transition hover:bg-arena/60 hover:text-noche"
                                aria-label={`Quitar ${item.productName}`}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <CartUpsell exclude={items.map((i) => i.productSlug)} onNavigate={close} />
                <div className="border-t border-linea px-6 pb-6 pt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-humo">Subtotal</span>
                    <span className="font-display text-4xl tabular-nums">{money(subtotal)}</span>
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-humo">
                    <Snowflake className="size-3.5" /> Envío y franja de entrega en el siguiente paso.
                  </p>
                  <Link href="/checkout" onClick={close} className="btn btn-brasa mt-4 w-full py-4 text-base">
                    Finalizar pedido <ArrowRight className="size-4" />
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
