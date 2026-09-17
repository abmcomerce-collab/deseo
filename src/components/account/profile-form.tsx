"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/auth";

export function ProfileForm({ name, email, phone }: { name: string; email: string; phone: string }) {
  const [state, action, pending] = useActionState(updateProfile, null);
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="p-email">
          Email
        </label>
        <input id="p-email" value={email} disabled className="field opacity-60" />
      </div>
      <div>
        <label className="label" htmlFor="p-name">
          Nombre
        </label>
        <input id="p-name" name="name" defaultValue={name} className="field" aria-invalid={state?.errors?.name ? true : undefined} />
        {state?.errors?.name && <p className="mt-1 text-sm text-red-700">{state.errors.name}</p>}
      </div>
      <div>
        <label className="label" htmlFor="p-phone">
          Teléfono
        </label>
        <input id="p-phone" name="phone" type="tel" defaultValue={phone} className="field" placeholder="600 000 000" />
        {state?.errors?.phone && <p className="mt-1 text-sm text-red-700">{state.errors.phone}</p>}
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
      {state?.ok && <p className="text-center text-sm text-emerald-700">{state.message}</p>}
    </form>
  );
}
