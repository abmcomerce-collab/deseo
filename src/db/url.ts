/** URL de Postgres: acepta los nombres que crean Vercel/Neon según el prefijo elegido. */
export function databaseUrl() {
  return (
    process.env.DATABASE_URL ||
    process.env.DATABASE_POSTGRES_URL ||
    process.env.POSTGRES_URL ||
    process.env.STORAGE_URL ||
    undefined
  );
}
