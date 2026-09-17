"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { createLead } from "@/app/actions/leads";
import { cn } from "@/lib/format";

const TYPES = [
  { v: "boda", l: "Boda" },
  { v: "empresa", l: "Empresa" },
  { v: "chiringuito", l: "Hostelería" },
  { v: "fiesta", l: "Fiesta" },
  { v: "otro", l: "Otro" },
];

const dark = "w-full rounded-2xl border border-crema/15 bg-crema/5 px-4 py-3.5 text-crema outline-none transition placeholder:text-crema/35 focus:border-crema/60";

export function LeadForm() {
  const [state, action, pending] = useActionState(createLead, null);

  if (state?.ok) {
    return (
      <div className="rounded-[32px] border border-crema/15 p-10" role="status">
        <span className="grid size-12 place-items-center rounded-full bg-brasa">
          <Check className="size-6" />
        </span>
        <p className="font-display mt-6 text-5xl">{state.message}</p>
      </div>
    );
  }

  const err = (k: string) => state?.errors?.[k] && <p className="mt-1.5 text-sm text-brasa">{state.errors[k]}</p>;

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2" noValidate>
      <fieldset className="sm:col-span-2">
        <legend className="mb-3 text-sm text-crema/70">Tipo de evento</legend>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t, i) => (
            <label key={t.v} className="cursor-pointer">
              <input type="radio" name="eventType" value={t.v} defaultChecked={i === 0} className="peer sr-only" />
              <span className={cn("block rounded-full border border-crema/20 px-4 py-2 text-sm transition peer-checked:border-brasa peer-checked:bg-brasa peer-focus-visible:ring-2 peer-focus-visible:ring-crema")}>
                {t.l}
              </span>
            </label>
          ))}
        </div>
        {err("eventType")}
      </fieldset>
      <div>
        <label htmlFor="l-name" className="mb-2 block text-sm text-crema/70">
          Nombre
        </label>
        <input id="l-name" name="name" autoComplete="name" className={dark} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="l-company" className="mb-2 block text-sm text-crema/70">
          Empresa o local <span className="text-crema/40">(opcional)</span>
        </label>
        <input id="l-company" name="company" autoComplete="organization" className={dark} />
      </div>
      <div>
        <label htmlFor="l-email" className="mb-2 block text-sm text-crema/70">
          Email
        </label>
        <input id="l-email" name="email" type="email" autoComplete="email" className={dark} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="l-phone" className="mb-2 block text-sm text-crema/70">
          Teléfono <span className="text-crema/40">(opcional)</span>
        </label>
        <input id="l-phone" name="phone" type="tel" autoComplete="tel" className={dark} />
      </div>
      <div>
        <label htmlFor="l-date" className="mb-2 block text-sm text-crema/70">
          Fecha aproximada
        </label>
        <input id="l-date" name="eventDate" type="date" className={cn(dark, "[color-scheme:dark]")} />
      </div>
      <div>
        <label htmlFor="l-guests" className="mb-2 block text-sm text-crema/70">
          Invitados
        </label>
        <input id="l-guests" name="guests" inputMode="numeric" placeholder="120" className={dark} />
        {err("guests")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="l-message" className="mb-2 block text-sm text-crema/70">
          Cuéntanos más
        </label>
        <textarea id="l-message" name="message" rows={4} placeholder="Lugar, horario, sabores que te apetecen…" className={cn(dark, "resize-none")} />
      </div>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        {state && !state.ok ? <p className="text-sm text-brasa">{state.message}</p> : <span />}
        <button className="btn btn-brasa py-4 text-base hover:bg-crema hover:text-noche" disabled={pending}>
          {pending ? "Enviando…" : "Enviar solicitud"} <ArrowRight className="size-4" />
        </button>
      </div>
    </form>
  );
}
