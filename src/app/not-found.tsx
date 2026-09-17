import Link from "next/link";
import { Polo } from "@/components/art/polo";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-[#FFD3B8] px-6 text-center">
      <Link href="/" className="absolute left-1/2 top-8 -translate-x-1/2 text-4xl" aria-label="Volver al inicio">
        <Logo />
      </Link>
      <div className="relative z-10">
        <p className="font-display text-[34vw] italic leading-none text-[#E8233F]/20 sm:text-[22rem]" aria-hidden>
          404
        </p>
        <h1 className="font-display -mt-[12vw] text-6xl sm:-mt-40 sm:text-8xl">
          Esta página <em>se ha derretido.</em>
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-noche/70">Lo que buscabas ya no está en el congelador. Pero tenemos otros sabores.</p>
        <Link href="/tienda" className="btn btn-primary mt-8">
          Ver la carta
        </Link>
      </div>
      <Polo
        art={{ base: "#E8233F", top: "#FF9A3D", accent: "#FFC857", ink: "#4D0A14", bg: "#FFD3B8", pattern: "layers" }}
        className="absolute -bottom-24 -right-10 h-[60vh] rotate-[28deg] opacity-90"
      />
    </div>
  );
}
