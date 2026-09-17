import { desc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageHeader } from "@/components/admin/ui";
import { LeadStatusSelect } from "@/components/admin/lead-status";
import { fmtDateTime } from "@/lib/format";

export const metadata = { title: "Eventos B2B" };
export const dynamic = "force-dynamic";

const TYPE: Record<string, string> = {
  boda: "Boda",
  empresa: "Evento de empresa",
  chiringuito: "Chiringuito / restaurante",
  fiesta: "Fiesta privada",
  otro: "Otro",
};

export default async function LeadsPage() {
  const leads = await db.select().from(schema.leads).orderBy(desc(schema.leads.createdAt));
  return (
    <div className="space-y-6">
      <PageHeader title="Eventos B2B" subtitle="Solicitudes de presupuesto desde la página de eventos." />
      {leads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-noche/15 p-16 text-center text-humo">
          Aún no hay solicitudes. Llegarán desde <span className="font-mono">/eventos</span>.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {leads.map((l) => (
            <article key={l.id} className="rounded-3xl bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-humo">{fmtDateTime(l.createdAt)}</p>
                  <h2 className="font-display mt-1 text-3xl">{l.company || l.name}</h2>
                  <p className="text-sm text-humo">
                    {TYPE[l.eventType] ?? l.eventType}
                    {l.guests ? ` · ${l.guests} personas` : ""}
                    {l.eventDate ? ` · ${l.eventDate}` : ""}
                  </p>
                </div>
                <LeadStatusSelect id={l.id} status={l.status} />
              </div>
              {l.message && <p className="mt-4 rounded-2xl bg-arena/40 p-4 text-sm">{l.message}</p>}
              <p className="mt-4 text-sm">
                {l.name} ·{" "}
                <a className="underline" href={`mailto:${l.email}`}>
                  {l.email}
                </a>
                {l.phone && (
                  <>
                    {" · "}
                    <a className="underline" href={`tel:${l.phone}`}>
                      {l.phone}
                    </a>
                  </>
                )}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
