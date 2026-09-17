import Link from "next/link";
import { Logo } from "@/components/logo";
import { Newsletter } from "./newsletter";

const COLS = [
  {
    title: "Tienda",
    links: [
      { href: "/tienda", label: "Todos los sabores" },
      { href: "/tienda?tipo=pack", label: "Packs y regalos" },
      { href: "/producto/caja-degustacion", label: "Caja Degustación" },
      { href: "/eventos", label: "Eventos y hostelería" },
    ],
  },
  {
    title: "Ayuda",
    links: [
      { href: "/entregas", label: "Zonas y entregas" },
      { href: "/#preguntas", label: "Preguntas frecuentes" },
      { href: "/cuenta", label: "Mi cuenta" },
      { href: "/legal/consumo-responsable", label: "Consumo responsable" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/condiciones", label: "Condiciones de venta" },
      { href: "/legal/privacidad", label: "Privacidad" },
      { href: "/legal/cookies", label: "Cookies" },
      { href: "/legal/aviso-legal", label: "Aviso legal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-noche text-crema">
      <div className="container-x grid gap-14 pb-10 pt-20 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="eyebrow text-crema/50">Newsletter</p>
          <h2 className="font-display mt-4 text-5xl sm:text-6xl">
            Primero en probar <em>lo nuevo.</em>
          </h2>
          <div className="mt-8 max-w-md">
            <Newsletter />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-6 lg:col-start-7">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow text-crema/50">{c.title}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="link-underline text-crema/85 hover:text-crema">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="container-x">
        <Logo className="block text-[31vw] leading-[0.8] text-crema lg:text-[26vw]" />
      </div>

      <div className="border-t border-crema/10">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-crema/55 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} DESEO Barcelona. Hecho en el Poblenou con frío y paciencia.</p>
          <p className="font-medium text-crema/75">
            Prohibida la venta a menores de 18 años. Bebe con moderación, es tu responsabilidad.
          </p>
        </div>
      </div>
    </footer>
  );
}
