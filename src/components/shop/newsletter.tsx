"use client";

import { useActionState, useState } from "react";
import { ArrowRight, Check, Copy } from "lucide-react";
import { subscribe } from "@/app/actions/leads";

export function Newsletter() {
  const [state, action, pending] = useActionState(subscribe, null);
  const [copied, setCopied] = useState(false);

  if (state?.ok) {
    return (
      <div className="rounded-3xl border border-crema/15 p-6" aria-live="polite">
        <p className="text-crema/70">Tu código de bienvenida:</p>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard?.writeText(state.message);
            setCopied(true);
          }}
          className="mt-3 flex w-full items-center justify-between rounded-2xl bg-brasa px-5 py-4 font-mono text-xl tracking-widest text-noche"
        >
          {state.message}
          {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
        </button>
        <p className="mt-3 text-sm text-crema/60">10% de descuento en tu primer pedido. Úsalo en el checkout.</p>
      </div>
    );
  }

  return (
    <form action={action} className="w-full" noValidate>
      <label htmlFor="nl-email" className="sr-only">
        Email
      </label>
      <div className="flex rounded-full border border-crema/25 bg-crema/5 p-1.5 transition focus-within:border-crema">
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="tu@email.com"
          className="min-w-0 flex-1 bg-transparent px-4 text-crema outline-none placeholder:text-crema/40"
        />
        <button type="submit" disabled={pending} className="btn btn-brasa py-3">
          {pending ? "Enviando…" : "Quiero el 10%"} <ArrowRight className="size-4" />
        </button>
      </div>
      {state && !state.ok && (
        <p className="mt-2 pl-4 text-sm text-brasa" role="alert">
          {state.message}
        </p>
      )}
      <p className="mt-3 pl-4 text-xs text-crema/60">Sin spam. Solo lanzamientos, ediciones limitadas y alguna sorpresa.</p>
    </form>
  );
}
