import { SignJWT, jwtVerify } from "jose";
import { databaseUrl } from "@/db/url";

export type SessionPayload = {
  userId: string;
  name: string;
  email: string;
  role: "customer" | "admin";
};

export const SESSION_COOKIE = "deseo_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 días

let cachedKey: Uint8Array | null = null;

/**
 * Clave HMAC de las sesiones. Usa AUTH_SECRET si existe; si no, la deriva de
 * DATABASE_URL (también secreta) para no depender de una variable extra.
 */
async function key() {
  if (cachedKey) return cachedKey;
  const secret = process.env.AUTH_SECRET;
  if (secret && secret.length >= 32) {
    cachedKey = new TextEncoder().encode(secret);
  } else {
    const base = databaseUrl();
    if (!base) throw new Error("Define AUTH_SECRET (mín. 32 caracteres) o DATABASE_URL");
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`deseo-session:${base}`));
    cachedKey = new Uint8Array(digest);
  }
  return cachedKey;
}

export async function encrypt(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(await key());
}

export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, await key(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
