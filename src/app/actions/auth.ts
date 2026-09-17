"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, schema } from "@/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";

export type AuthState = { message?: string; errors?: Record<string, string>; ok?: boolean } | null;

const safeNext = (v: FormDataEntryValue | null, fallback: string) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : fallback;
};

const collect = (issues: z.core.$ZodIssue[]) => {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[String(i.path[0])] ??= i.message;
  return errors;
};

const registerSchema = z.object({
  name: z.string().trim().min(2, "Dinos cómo te llamas."),
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres.")
    .regex(/[A-Za-z]/, "Incluye al menos una letra.")
    .regex(/\d/, "Incluye al menos un número."),
  age: z.literal("on", { message: "Debes ser mayor de 18 años." }),
});

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Revisa los campos marcados.", errors: collect(parsed.error.issues) };
  const { name, email, password } = parsed.data;

  const exists = await db.query.users.findFirst({ where: eq(schema.users.email, email), columns: { id: true } });
  if (exists) return { message: "Ya existe una cuenta con ese email.", errors: { email: "Prueba a iniciar sesión." } };

  // Alta del primer administrador: la primera cuenta con ADMIN_EMAIL recibe el rol,
  // solo mientras no exista ningún admin (así no hay contraseñas en variables de entorno).
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  let role: "customer" | "admin" = "customer";
  if (adminEmail && email === adminEmail) {
    const existingAdmin = await db.query.users.findFirst({ where: eq(schema.users.role, "admin"), columns: { id: true } });
    if (!existingAdmin) role = "admin";
  }

  const [user] = await db
    .insert(schema.users)
    .values({ name, email, passwordHash: await bcrypt.hash(password, 10), role })
    .returning();
  await createSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
  redirect(safeNext(formData.get("next"), role === "admin" ? "/admin" : "/cuenta"));
}

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Introduce un email válido."),
  password: z.string().min(1, "Introduce tu contraseña."),
});

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Revisa los campos marcados.", errors: collect(parsed.error.issues) };
  const { email, password } = parsed.data;

  const user = await db.query.users.findFirst({ where: eq(schema.users.email, email) });
  // Comparamos siempre para no filtrar por tiempo si el email existe.
  const valid = await bcrypt.compare(password, user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !valid) return { message: "Email o contraseña incorrectos." };

  await createSession({ userId: user.id, name: user.name, email: user.email, role: user.role });
  redirect(safeNext(formData.get("next"), user.role === "admin" ? "/admin" : "/cuenta"));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

const profileSchema = z.object({
  name: z.string().trim().min(2, "Dinos cómo te llamas."),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s.-]/g, ""))
    .pipe(z.string().regex(/^((\+34)?[6-9]\d{8})?$/, "Teléfono no válido.")),
});

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await requireUser();
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { message: "Revisa los campos marcados.", errors: collect(parsed.error.issues) };
  await db
    .update(schema.users)
    .set({ name: parsed.data.name, phone: parsed.data.phone || null })
    .where(eq(schema.users.id, session.userId));
  await createSession({ ...session, name: parsed.data.name });
  return { ok: true, message: "Datos guardados." };
}
