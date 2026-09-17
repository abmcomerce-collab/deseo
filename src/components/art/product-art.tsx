import type { PoloArt } from "@/db/schema";
import { Polo, PoloFan } from "./polo";

/** Polo individual o abanico, según el tipo de producto. */
export function ProductArt({
  arts,
  kind,
  className,
  title,
}: {
  arts: PoloArt[];
  kind: "polo" | "pack";
  className?: string;
  title?: string;
}) {
  if (kind === "pack" && arts.length > 1) {
    const pick = arts.length > 5 ? [arts[0], arts[2], arts[1], arts[3], arts[4]] : arts;
    return (
      <div className={className} role="img" aria-label={title}>
        <PoloFan arts={pick} className="h-full w-full" />
      </div>
    );
  }
  return <Polo art={arts[0]} className={className} title={title} />;
}
