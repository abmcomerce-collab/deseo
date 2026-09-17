import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/format";

/**
 * Aparición al hacer scroll con CSS scroll-driven animations (sin JavaScript).
 * En navegadores sin soporte el contenido simplemente se muestra.
 */
export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const start = Math.round(delay * 60);
  return (
    <div className={cn("reveal", className)} style={{ "--reveal-start": `${start}%` } as CSSProperties}>
      {children}
    </div>
  );
}
