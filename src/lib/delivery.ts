/**
 * Zonas de reparto en frío. Todo el cálculo de fechas se hace en hora de Madrid.
 * Este módulo es puro (sin dependencias de servidor) para usarlo en cliente y servidor.
 */

export type ZoneId = "bcn" | "metropolitana" | "costa-brava";

export type Zone = {
  id: ZoneId;
  name: string;
  shippingCents: number;
  freeFromCents: number;
  /** Días de la semana con reparto (0 = domingo). */
  days: number[];
  /** Hora límite (Madrid) para entrega en el mismo día; null = no hay mismo día. */
  sameDayCutoff: number | null;
  slots: string[];
  eta: string;
};

export const ZONES: Record<ZoneId, Zone> = {
  bcn: {
    id: "bcn",
    name: "Barcelona ciudad",
    shippingCents: 490,
    freeFromCents: 4500,
    days: [1, 2, 3, 4, 5, 6],
    sameDayCutoff: 13,
    slots: ["12:00–15:00", "17:00–20:00", "20:00–23:00"],
    eta: "Hoy mismo si pides antes de las 13:00",
  },
  metropolitana: {
    id: "metropolitana",
    name: "Área metropolitana",
    shippingCents: 690,
    freeFromCents: 4500,
    days: [1, 2, 3, 4, 5, 6],
    sameDayCutoff: null,
    slots: ["17:00–20:00", "20:00–23:00"],
    eta: "Al día siguiente",
  },
  "costa-brava": {
    id: "costa-brava",
    name: "Costa Brava",
    shippingCents: 990,
    freeFromCents: 7000,
    days: [5, 6],
    sameDayCutoff: null,
    slots: ["12:00–15:00", "17:00–20:00"],
    eta: "Viernes y sábados",
  },
};

const METRO_PREFIXES = ["0880", "0881", "0882", "0883", "0884", "0885", "0886", "089", "0817", "0819"];

export function zoneForPostalCode(raw: string): Zone | null {
  const cp = raw.replace(/\s/g, "");
  if (!/^\d{5}$/.test(cp)) return null;
  const n = Number(cp);
  if (n >= 8001 && n <= 8042) return ZONES.bcn;
  if (METRO_PREFIXES.some((p) => cp.startsWith(p))) return ZONES.metropolitana;
  // Costa Brava: Blanes → Portbou (17200–17499 aprox.)
  if (n >= 17200 && n <= 17499) return ZONES["costa-brava"];
  return null;
}

function madridNow(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return { iso: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) % 24 };
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Devuelve las próximas fechas de entrega disponibles (ISO YYYY-MM-DD). */
export function deliveryDates(zone: Zone, count = 6, now = new Date()): string[] {
  const { iso, hour } = madridNow(now);
  const out: string[] = [];
  const startOffset = zone.sameDayCutoff !== null && hour < zone.sameDayCutoff ? 0 : 1;
  for (let i = startOffset; out.length < count && i < 30; i++) {
    const day = addDays(iso, i);
    const dow = new Date(`${day}T12:00:00Z`).getUTCDay();
    if (zone.days.includes(dow)) out.push(day);
  }
  return out;
}

export function isValidDelivery(zone: Zone, date: string, slot: string, now = new Date()) {
  return deliveryDates(zone, 12, now).includes(date) && zone.slots.includes(slot);
}

export function shippingFor(zone: Zone, subtotalAfterDiscountCents: number, freeShipping = false) {
  if (freeShipping || subtotalAfterDiscountCents >= zone.freeFromCents) return 0;
  return zone.shippingCents;
}

export const FREE_SHIPPING_FROM = ZONES.bcn.freeFromCents;
