/**
 * Aplica migraciones y siembra datos iniciales si la base de datos está vacía.
 * Se ejecuta automáticamente antes de `next build` (también en Vercel).
 */
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "../src/db/schema";
import { seed } from "../src/db/seed";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("⚠ DATABASE_URL no definida: se omite la preparación de la base de datos.");
    return;
  }
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  const db = drizzle(client, { schema });
  console.log("→ Aplicando migraciones…");
  await migrate(db, { migrationsFolder: "./drizzle" });
  const isProd = Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
  const adminPassword = process.env.ADMIN_PASSWORD ?? (isProd ? undefined : "Deseo2026!");
  if (!adminPassword) console.warn("⚠ ADMIN_PASSWORD no definida: no se crea el usuario administrador.");
  await seed(db, {
    adminEmail: process.env.ADMIN_EMAIL ?? "admin@deseo.bcn",
    adminPassword,
    demoOrders: process.env.SEED_DEMO_ORDERS !== "false",
  });
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
