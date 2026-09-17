import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-5xl sm:text-6xl">{title}</h1>
        {subtitle && <p className="mt-2 text-humo">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl bg-white p-5 shadow-[0_1px_0_rgba(20,11,16,0.06)] sm:p-6", className)}>{children}</div>;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-3xl bg-white shadow-[0_1px_0_rgba(20,11,16,0.06)]">
      <table className="w-full min-w-[720px] text-left text-sm [&_td]:px-5 [&_td]:py-3.5 [&_th]:px-5 [&_th]:py-3 [&_th]:font-medium [&_th]:text-humo [&_tbody_tr]:border-t [&_tbody_tr]:border-linea">
        {children}
      </table>
    </div>
  );
}
