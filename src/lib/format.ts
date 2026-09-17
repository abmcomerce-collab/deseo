const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

export function money(cents: number) {
  return eur.format(cents / 100);
}

export function abv(value: string | number) {
  return `${Number(value).toLocaleString("es-ES", { minimumFractionDigits: 1 })}% vol.`;
}

export function orderNumber(n: number) {
  return `DS-${String(1000 + n)}`;
}

const dateFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "long", timeZone: "Europe/Madrid" });
const dateTimeFmt = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Madrid",
});
const weekdayFmt = new Intl.DateTimeFormat("es-ES", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export const fmtDate = (d: Date) => dateFmt.format(d);
export const fmtDateTime = (d: Date) => dateTimeFmt.format(d);
/** Formatea una fecha ISO (YYYY-MM-DD) sin desplazamientos de zona horaria. */
export const fmtIsoDay = (iso: string) => {
  const s = weekdayFmt.format(new Date(`${iso}T12:00:00Z`));
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente de pago",
  paid: "Pagado",
  preparing: "En preparación",
  shipped: "En reparto",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/** Luminancia relativa aproximada para decidir texto claro/oscuro. */
export function isDark(hex: string) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.45;
}
