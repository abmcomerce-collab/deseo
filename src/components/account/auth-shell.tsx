import type { ReactNode } from "react";
import type { PoloArt } from "@/db/schema";
import { Polo } from "@/components/art/polo";

const ART: PoloArt = { base: "#E8233F", top: "#FF9A3D", accent: "#FFC857", ink: "#4D0A14", bg: "#FFD3B8", pattern: "layers" };

export function AuthShell({ title, subtitle, children }: { title: ReactNode; subtitle: string; children: ReactNode }) {
  return (
    <div className="container-x grid gap-10 pb-24 pt-10 lg:grid-cols-2 lg:gap-20 lg:pt-16">
      <div className="relative hidden min-h-[640px] overflow-hidden rounded-[40px] bg-noche p-12 text-crema lg:block">
        <p className="eyebrow text-crema/50">Club DESEO</p>
        <p className="font-display mt-6 max-w-sm text-6xl">
          Tus pedidos, <em className="text-brasa">tu sabor favorito</em> y acceso antes que nadie a las ediciones limitadas.
        </p>
        <Polo art={ART} className="absolute -bottom-16 -right-8 h-[70%] rotate-[16deg] animate-float" />
      </div>
      <div className="mx-auto w-full max-w-md lg:py-12">
        <h1 className="font-display text-6xl sm:text-7xl">{title}</h1>
        <p className="mt-4 text-humo">{subtitle}</p>
        <div className="mt-10">{children}</div>
      </div>
    </div>
  );
}
