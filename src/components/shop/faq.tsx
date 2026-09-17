import { Plus } from "lucide-react";

export const FAQS = [
  {
    q: "¿Cuánto alcohol llevan los polos?",
    a: "Entre un 4 y un 5% vol., más o menos lo mismo que una cerveza. Es el máximo que permite congelar bien un polo sin que pierda textura. Cada ficha indica la graduación exacta.",
  },
  {
    q: "¿Cómo llegan congelados?",
    a: "Repartimos con nuestra propia flota en cajas isotérmicas con hielo seco, que mantienen los polos por debajo de −18 °C durante 6 horas. Eliges día y franja horaria y los recibes en mano.",
  },
  {
    q: "¿Qué pasa si no estoy en casa?",
    a: "Te llamamos 15 minutos antes. Si no hay nadie, volvemos a intentarlo en la siguiente franja disponible sin coste. No dejamos pedidos con alcohol a vecinos ni en conserjería.",
  },
  {
    q: "¿Tengo que demostrar que soy mayor de edad?",
    a: "Sí. Confirmas tu edad en la web y el repartidor puede pedirte el DNI en la entrega. Si no se puede verificar, el pedido vuelve con nosotros y te devolvemos el importe menos el envío.",
  },
  {
    q: "¿Cuánto duran en el congelador?",
    a: "Hasta 6 meses a −18 °C en su envoltorio. Para disfrutarlos en su punto, sácalos 2 minutos antes de comerlos.",
  },
  {
    q: "¿Hacéis pedidos para eventos o restaurantes?",
    a: "Sí: bodas, eventos de empresa, chiringuitos y restaurantes. Tenemos congeladores expositores en préstamo y precios por volumen. Escríbenos desde la página de eventos.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-linea border-y border-linea">
      {FAQS.map((f) => (
        <details key={f.q} className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-left [&::-webkit-details-marker]:hidden">
            <span className="font-display text-3xl sm:text-4xl">{f.q}</span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-linea transition duration-500 group-open:rotate-45 group-open:bg-noche group-open:text-crema">
              <Plus className="size-4" />
            </span>
          </summary>
          <p className="max-w-2xl pb-7 text-lg leading-relaxed text-humo">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
