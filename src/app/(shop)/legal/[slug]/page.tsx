import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Doc = { title: string; intro: string; sections: { h: string; p: string[] }[] };

const TITULAR = "DESEO Barcelona (proyecto de demostración)";

const DOCS: Record<string, Doc> = {
  "aviso-legal": {
    title: "Aviso legal",
    intro: "Información general en cumplimiento de la Ley 34/2002, de Servicios de la Sociedad de la Información (LSSI-CE).",
    sections: [
      {
        h: "Titular del sitio",
        p: [
          `Este sitio web es un proyecto de demostración de ${TITULAR}. Antes de operar comercialmente se completarán aquí la razón social, NIF, domicilio social y datos registrales del titular.`,
          "Contacto: hola@deseo.bcn.",
        ],
      },
      {
        h: "Propiedad intelectual",
        p: ["El diseño, las ilustraciones, los textos y el código de este sitio pertenecen a su titular. No se permite su reproducción sin autorización."],
      },
      {
        h: "Responsabilidad",
        p: ["El titular no se hace responsable del mal uso de los contenidos ni de los daños derivados de interrupciones técnicas ajenas a su control."],
      },
    ],
  },
  condiciones: {
    title: "Condiciones de venta",
    intro: "Estas condiciones regulan la compra de productos en la tienda online de DESEO.",
    sections: [
      {
        h: "1. Mayoría de edad",
        p: [
          "Nuestros productos contienen alcohol. Solo pueden comprarlos personas mayores de 18 años. Al realizar un pedido declaras serlo, y el repartidor podrá solicitar un documento de identidad en la entrega.",
          "Si no se puede verificar la edad, el pedido no se entregará y se reembolsará su importe descontando los gastos de envío.",
        ],
      },
      {
        h: "2. Precios y pago",
        p: [
          "Los precios incluyen IVA. Los gastos de envío dependen de la zona y se muestran antes de pagar.",
          "El pago se procesa de forma segura a través de Stripe. No almacenamos datos de tarjetas. Esta tienda funciona en modo de prueba: no se realizan cargos reales.",
        ],
      },
      {
        h: "3. Entrega",
        p: [
          "Entregamos en Barcelona ciudad, área metropolitana y Costa Brava en el día y franja elegidos. Los productos viajan congelados a −18 °C.",
          "Si no hay nadie en la dirección, intentaremos una segunda entrega sin coste en la siguiente franja disponible.",
        ],
      },
      {
        h: "4. Desistimiento y devoluciones",
        p: [
          "Por tratarse de productos perecederos y que requieren cadena de frío, no es aplicable el derecho de desistimiento (art. 103 del RDL 1/2007).",
          "Si recibes un producto dañado o descongelado, avísanos en las 24 horas siguientes con una foto y lo repondremos o reembolsaremos.",
        ],
      },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    intro: "Cómo tratamos tus datos personales conforme al Reglamento (UE) 2016/679 (RGPD) y la LOPDGDD.",
    sections: [
      {
        h: "Qué datos tratamos y para qué",
        p: [
          "Datos de contacto y entrega para gestionar tus pedidos (base legal: ejecución del contrato).",
          "Email para la newsletter y la lista de espera, solo si nos das tu consentimiento. Puedes darte de baja en cualquier momento.",
          "Datos de solicitudes de eventos para preparar presupuestos (base legal: medidas precontractuales).",
        ],
      },
      {
        h: "Con quién los compartimos",
        p: ["Con Stripe (pagos) y con nuestro proveedor de alojamiento. No vendemos ni cedemos tus datos a terceros con fines comerciales."],
      },
      {
        h: "Tus derechos",
        p: ["Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a hola@deseo.bcn. También puedes reclamar ante la AEPD."],
      },
    ],
  },
  cookies: {
    title: "Política de cookies",
    intro: "Esta web usa solo el almacenamiento estrictamente necesario para funcionar.",
    sections: [
      {
        h: "Qué usamos",
        p: [
          "Cookie de sesión (deseo_session) para mantenerte identificado si inicias sesión.",
          "Cookie técnica (deseo_orders) para que puedas volver a ver tus pedidos recientes desde este navegador.",
          "Almacenamiento local del navegador para recordar tu cesta y tu confirmación de mayoría de edad.",
        ],
      },
      { h: "Analítica y publicidad", p: ["No usamos cookies de analítica ni de publicidad de terceros, por eso no necesitamos un banner de consentimiento."] },
    ],
  },
  "consumo-responsable": {
    title: "Consumo responsable",
    intro: "Nos encanta el placer de un buen cóctel. Por eso nos tomamos en serio cómo se disfruta.",
    sections: [
      {
        h: "Nuestro compromiso",
        p: [
          "No vendemos a menores de 18 años, ni online ni en eventos. Verificamos la edad en la entrega.",
          "Indicamos claramente la graduación de cada polo (entre un 4 y un 5% vol.). Un polo contiene aproximadamente la misma cantidad de alcohol que media caña de cerveza.",
        ],
      },
      {
        h: "Consejos",
        p: [
          "No conduzcas después de consumir alcohol, aunque sea en formato helado.",
          "No se recomienda su consumo durante el embarazo ni si tomas medicación incompatible con el alcohol.",
          "Disfrútalo con calma: al estar frío, el alcohol se percibe menos.",
        ],
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const doc = DOCS[(await params).slug];
  return doc ? { title: doc.title, description: doc.intro } : {};
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();

  return (
    <div className="container-x grid gap-12 pb-28 pt-10 sm:pt-16 lg:grid-cols-12">
      <aside className="lg:col-span-3">
        <nav aria-label="Documentos legales" className="lg:sticky lg:top-28">
          <p className="eyebrow text-humo">Legal</p>
          <ul className="mt-4 space-y-2">
            {Object.entries(DOCS).map(([s, d]) => (
              <li key={s}>
                <Link href={`/legal/${s}`} className={s === slug ? "font-medium" : "text-humo hover:text-noche"} aria-current={s === slug ? "page" : undefined}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <article className="max-w-3xl lg:col-span-8">
        <h1 className="font-display text-6xl sm:text-8xl">{doc.title}</h1>
        <p className="mt-6 text-xl text-humo">{doc.intro}</p>
        {doc.sections.map((s) => (
          <section key={s.h} className="mt-12 border-t border-linea pt-8">
            <h2 className="font-display text-4xl">{s.h}</h2>
            {s.p.map((p) => (
              <p key={p} className="mt-4 text-lg leading-relaxed text-noche/80">
                {p}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
