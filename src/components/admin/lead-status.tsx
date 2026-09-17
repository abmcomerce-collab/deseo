"use client";

import { useTransition } from "react";
import { updateLeadStatus } from "@/app/actions/admin";

const OPTIONS = [
  { v: "new", l: "Nuevo" },
  { v: "contacted", l: "Contactado" },
  { v: "won", l: "Ganado" },
  { v: "lost", l: "Perdido" },
] as const;

export function LeadStatusSelect({ id, status }: { id: string; status: (typeof OPTIONS)[number]["v"] }) {
  const [pending, start] = useTransition();
  return (
    <select
      aria-label="Estado de la solicitud"
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => updateLeadStatus(id, e.target.value as (typeof OPTIONS)[number]["v"]))}
      className="rounded-full border border-linea bg-white px-3 py-1.5 text-sm"
    >
      {OPTIONS.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  );
}
