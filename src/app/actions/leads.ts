"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { zoneForPostalCode } from "@/lib/delivery";

export type FormState = { ok: boolean; message: string; errors?: Record<string, string> } | null;

const newsletterSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  postalCode: z.string().trim().optional(),
  source: z.enum(["newsletter", "waitlist"]).default("newsletter"),
});

export async function subscribe(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = newsletterSchema.safeParse({
    email: formData.get("email"),
    postalCode: formData.get("postalCode") || undefined,
    source: formData.get("source") || "newsletter",
  });
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  await db
    .insert(schema.subscribers)
    .values(parsed.data)
    .onConflictDoUpdate({ target: schema.subscribers.email, set: { postalCode: parsed.data.postalCode ?? null } });
  if (parsed.data.source === "waitlist") {
    return { ok: true, message: "Apuntado. Te escribiremos en cuanto repartamos en tu zona." };
  }
  return { ok: true, message: "BIENVENIDA10" };
}

const leadSchema = z.object({
  name: z.string().trim().min(2, "Dinos tu nombre."),
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(120).optional(),
  eventType: z.enum(["boda", "empresa", "chiringuito", "fiesta", "otro"], { message: "Elige un tipo de evento." }),
  eventDate: z.string().trim().max(20).optional(),
  guests: z.coerce.number().int().min(10, "Mínimo 10 invitados.").max(5000).optional(),
  message: z.string().trim().max(2000).optional(),
});

export async function createLead(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, v === "" ? undefined : v]));
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Revisa los campos marcados.", errors };
  }
  await db.insert(schema.leads).values(parsed.data);
  return { ok: true, message: "¡Recibido! Te enviamos una propuesta en menos de 24 horas laborables." };
}

export async function checkPostalCode(cp: string) {
  const zone = zoneForPostalCode(String(cp).slice(0, 5));
  return zone ? { id: zone.id, name: zone.name } : null;
}
