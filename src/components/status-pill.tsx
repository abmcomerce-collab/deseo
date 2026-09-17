import { cn, STATUS_LABEL } from "@/lib/format";

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    pending: "bg-arena text-noche",
    paid: "bg-sky-100 text-sky-900",
    preparing: "bg-amber-100 text-amber-900",
    shipped: "bg-violet-100 text-violet-900",
    delivered: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-red-100 text-red-900",
  };
  return <span className={cn("rounded-full px-2.5 py-1 text-xs font-medium", tone[status])}>{STATUS_LABEL[status]}</span>;
}
