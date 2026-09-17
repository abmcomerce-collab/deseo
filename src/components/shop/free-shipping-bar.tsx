"use client";

import { motion } from "motion/react";
import { FREE_SHIPPING_FROM } from "@/lib/delivery";
import { money } from "@/lib/format";

export function FreeShippingBar({ subtotalCents, dark = false }: { subtotalCents: number; dark?: boolean }) {
  const pct = Math.min(100, (subtotalCents / FREE_SHIPPING_FROM) * 100);
  const left = FREE_SHIPPING_FROM - subtotalCents;
  return (
    <div>
      <p className="text-sm">
        {left > 0 ? (
          <>
            Te faltan <strong className="font-semibold">{money(left)}</strong> para el envío gratis en Barcelona.
          </>
        ) : (
          <>
            <strong className="font-semibold">Envío gratis</strong> desbloqueado. Buen gusto.
          </>
        )}
      </p>
      <div className={`mt-2.5 h-1.5 overflow-hidden rounded-full ${dark ? "bg-crema/15" : "bg-arena"}`}>
        <motion.div
          className="h-full rounded-full bg-brasa"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
