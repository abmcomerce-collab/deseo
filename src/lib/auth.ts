import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, encrypt, SESSION_COOKIE, SESSION_MAX_AGE, type SessionPayload } from "./session";

export async function createSession(payload: SessionPayload) {
  const token = await encrypt(payload);
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function destroySession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export const getSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return decrypt(token);
});

export async function requireUser(next = "/cuenta") {
  const session = await getSession();
  if (!session) redirect(`/cuenta/acceso?next=${encodeURIComponent(next)}`);
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/cuenta/acceso?next=/admin");
  if (session.role !== "admin") redirect("/cuenta");
  return session;
}
