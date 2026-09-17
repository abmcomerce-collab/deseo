import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { databaseUrl } from "./url";

const url = databaseUrl();
if (!url) throw new Error("DATABASE_URL no está definida");

const globalForDb = globalThis as unknown as { pg?: ReturnType<typeof postgres> };

const client =
  globalForDb.pg ??
  postgres(url, {
    max: process.env.NODE_ENV === "production" ? 5 : 10,
    prepare: false, // compatible con poolers (Neon / Supabase)
    idle_timeout: 20,
  });

if (process.env.NODE_ENV !== "production") globalForDb.pg = client;

export const db = drizzle(client, { schema });
export { schema };
