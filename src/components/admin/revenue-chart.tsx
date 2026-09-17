"use client";

import { useState } from "react";
import { money } from "@/lib/format";

type Point = { day: string; cents: number; orders: number };

const dayFmt = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", timeZone: "UTC" });

/** Ingresos diarios: una sola serie, barras finas, rejilla discreta y tooltip al pasar. */
export function RevenueChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 720;
  const H = 220;
  const pad = { l: 44, r: 8, t: 12, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.cents));
  const nice = Math.ceil(max / 100 / 50) * 50 * 100 || 5000;
  const ticks = [0, nice / 2, nice];
  const iw = W - pad.l - pad.r;
  const ih = H - pad.t - pad.b;
  const step = iw / data.length;
  const bw = Math.max(4, step - 2); // 2px de separación entre barras
  const y = (v: number) => pad.t + ih - (v / nice) * ih;
  const active = hover !== null ? data[hover] : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Ingresos diarios de los últimos 30 días">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(20 11 16 / 0.08)" />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="fill-humo text-[10px]">
              {Math.round(t / 100)}€
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.l + i * step + (step - bw) / 2;
          const h = Math.max(d.cents ? 3 : 0, ih - (y(d.cents) - pad.t));
          const top = pad.t + ih - h;
          const r = Math.min(4, bw / 2, h);
          return (
            <g key={d.day}>
              <path
                d={`M${x},${pad.t + ih} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${pad.t + ih} Z`}
                fill="#ff5a36"
                opacity={hover === null || hover === i ? 1 : 0.35}
              />
              <rect
                x={pad.l + i * step}
                y={pad.t}
                width={step}
                height={ih}
                fill="transparent"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              />
              {(i === data.length - 1 || (i % 7 === 0 && i < data.length - 4)) && (
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fill-humo text-[10px]">
                  {dayFmt.format(new Date(`${d.day}T12:00:00Z`))}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {active && hover !== null && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl bg-noche px-3 py-2 text-xs text-crema shadow-lg"
          style={{ left: `${((pad.l + hover * step + step / 2) / W) * 100}%` }}
        >
          <p className="text-crema/60">{dayFmt.format(new Date(`${active.day}T12:00:00Z`))}</p>
          <p className="mt-0.5 font-medium">{money(active.cents)}</p>
          <p className="text-crema/60">
            {active.orders} {active.orders === 1 ? "pedido" : "pedidos"}
          </p>
        </div>
      )}
      <details className="mt-2 text-xs text-humo">
        <summary className="cursor-pointer">Ver tabla de datos</summary>
        <table className="mt-2 w-full">
          <tbody>
            {data.map((d) => (
              <tr key={d.day}>
                <td>{d.day}</td>
                <td className="text-right">{money(d.cents)}</td>
                <td className="text-right">{d.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
