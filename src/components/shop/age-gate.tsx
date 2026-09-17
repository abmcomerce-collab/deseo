"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Logo } from "@/components/logo";

const KEY = "deseo-age";

const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
};

function readVerified() {
  // Los bots de buscadores no ven el aviso para no bloquear la indexación.
  if (/bot|crawler|spider|lighthouse|headless/i.test(navigator.userAgent)) return true;
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function AgeGate() {
  const verified = useSyncExternalStore(subscribe, readVerified, () => true);
  const [accepted, setAccepted] = useState(false);
  const [denied, setDenied] = useState(false);
  const show = !verified && !accepted;

  useEffect(() => {
    document.body.style.overflow = show ? "hidden" : "";
  }, [show]);

  const accept = () => {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setAccepted(true);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[80] grid place-items-center overflow-hidden bg-noche p-6 text-crema"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="age-title"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-[12vw] left-1/2 -translate-x-1/2 whitespace-nowrap font-display text-[34vw] italic leading-none text-crema/[0.04] before:content-['deseo']"
          />
          <motion.div
            className="relative max-w-lg text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <Logo className="text-5xl" />
            {!denied ? (
              <>
                <h2 id="age-title" className="font-display mt-10 text-5xl sm:text-6xl">
                  ¿Tienes 18 años <em>o más?</em>
                </h2>
                <p className="mx-auto mt-5 max-w-sm text-crema/65">
                  Nuestros polos llevan alcohol de verdad. Para entrar necesitamos que confirmes que eres mayor de edad.
                </p>
                <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                  <button type="button" onClick={accept} className="btn btn-brasa min-w-44 py-4" autoFocus>
                    Sí, tengo 18 o más
                  </button>
                  <button
                    type="button"
                    onClick={() => setDenied(true)}
                    className="btn min-w-44 border border-crema/25 py-4 hover:border-crema"
                  >
                    No
                  </button>
                </div>
                <p className="eyebrow mt-10 text-crema/60">Al entrar aceptas nuestra política de consumo responsable</p>
              </>
            ) : (
              <>
                <h2 id="age-title" className="font-display mt-10 text-5xl">
                  Vuelve dentro de unos años.
                </h2>
                <p className="mx-auto mt-5 max-w-sm text-crema/65">
                  La venta de bebidas alcohólicas a menores de 18 años está prohibida. Te guardamos un polo (sin alcohol) en la memoria.
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
