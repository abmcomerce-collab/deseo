import { useId } from "react";
import type { PoloArt } from "@/db/schema";

type Props = {
  art: PoloArt;
  className?: string;
  bite?: boolean;
  title?: string;
  /** Mostrar el palo con el grabado. */
  stick?: boolean;
};

const BODY = "M40 86a60 60 0 0 1 120 0v214c0 11-9 20-20 20H60c-11 0-20-9-20-20Z";

/**
 * Ilustración vectorial del polo. Todo el “fotografiado” de producto de la tienda
 * sale de aquí: color, textura y mordisco se generan a partir de la receta `art`.
 */
export function Polo({ art, className, bite = true, stick = true, title }: Props) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (s: string) => `${s}-${raw}`;

  return (
    <svg
      viewBox="0 0 200 420"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={id("body")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={art.top} />
          <stop offset="0.55" stopColor={art.base} />
          <stop offset="1" stopColor={art.base} />
        </linearGradient>
        <linearGradient id={id("shade")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
          <stop offset="0.28" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.22" />
        </linearGradient>
        <linearGradient id={id("wood")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E9CB9A" />
          <stop offset="0.5" stopColor="#F3DDB6" />
          <stop offset="1" stopColor="#D2AE74" />
        </linearGradient>
        <mask id={id("bite")}>
          <rect width="200" height="420" fill="#fff" />
          {bite && (
            <g fill="#000">
              <circle cx="166" cy="54" r="24" />
              <circle cx="146" cy="30" r="15" />
              <circle cx="176" cy="86" r="14" />
            </g>
          )}
        </mask>
        <clipPath id={id("clip")}>
          <path d={BODY} />
        </clipPath>
      </defs>

      {stick && (
        <g>
          <rect x="84" y="290" width="32" height="118" rx="16" fill={`url(#${id("wood")})`} />
          <path d="M92 330v60M100 326v70M108 334v52" stroke="#B98F55" strokeOpacity=".35" strokeWidth="1" />
          <text
            x="100"
            y="372"
            transform="rotate(-90 100 372)"
            textAnchor="middle"
            fontFamily="var(--font-mono), monospace"
            fontSize="9"
            letterSpacing="2.5"
            fill="#8A6331"
            fillOpacity=".75"
          >
            DESEO
          </text>
        </g>
      )}

      <g mask={`url(#${id("bite")})`}>
        <path d={BODY} fill={`url(#${id("body")})`} />
        <g clipPath={`url(#${id("clip")})`}>
          <Pattern art={art} />
          <rect x="0" y="0" width="200" height="420" fill={`url(#${id("shade")})`} />
          {/* brillo */}
          <rect x="54" y="70" width="12" height="190" rx="6" fill="#fff" opacity=".35" />
          <rect x="54" y="272" width="12" height="18" rx="6" fill="#fff" opacity=".25" />
          {/* escarcha del mordisco */}
          {bite && (
            <g fill="#fff" opacity=".5">
              <circle cx="140" cy="54" r="2.2" />
              <circle cx="150" cy="70" r="1.6" />
              <circle cx="158" cy="92" r="1.8" />
            </g>
          )}
        </g>
      </g>

      {/* gota */}
      <path d="M52 318c0 10 3 22 8 22s8-12 8-22Z" fill={art.base} />
      <circle cx="60" cy="342" r="6" fill={art.base} />
      <circle cx="58" cy="340" r="1.8" fill="#fff" opacity=".5" />
    </svg>
  );
}

function Pattern({ art }: { art: PoloArt }) {
  switch (art.pattern) {
    case "layers":
      return (
        <g>
          <path d="M0 170c30-16 55 14 100 0s70-18 100 0v250H0Z" fill={art.base} />
          <path d="M0 176c30-16 55 14 100 0s70-18 100 0v14c-30-16-55 14-100 0S30 176 0 190Z" fill={art.accent} opacity=".85" />
          <path d="M0 0h200v150c-40-20-60 10-100 4S40 130 0 150Z" fill={art.top} opacity=".7" />
        </g>
      );
    case "leaves":
      return (
        <g fill={art.accent}>
          {[
            [70, 120, 30],
            [128, 168, -40],
            [84, 224, 60],
            [140, 262, 15],
            [110, 104, -20],
          ].map(([x, y, r], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${r})`} opacity=".78">
              <path d="M0-14C9-8 9 8 0 14-9 8-9-8 0-14Z" />
              <path d="M0-12V12" stroke={art.base} strokeWidth="1.2" opacity=".6" />
            </g>
          ))}
          <g fill="#fff" opacity=".55">
            <circle cx="120" cy="210" r="2" />
            <circle cx="72" cy="170" r="1.6" />
            <circle cx="104" cy="286" r="1.8" />
            <circle cx="140" cy="130" r="1.4" />
          </g>
        </g>
      );
    case "speckle":
      return (
        <g fill={art.accent} opacity=".7">
          {Array.from({ length: 34 }, (_, i) => {
            const x = 48 + ((i * 37) % 108);
            const y = 60 + ((i * 53) % 250);
            return <ellipse key={i} cx={x} cy={y} rx="1.6" ry="2.6" transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />;
          })}
        </g>
      );
    case "swirl":
      return (
        <g fill="none" stroke={art.accent} strokeLinecap="round">
          <path d="M20 120c40-30 80 30 120 0s50-20 60-10" strokeWidth="14" opacity=".55" />
          <path d="M0 210c40-26 70 26 110 4s60-24 90-6" strokeWidth="9" opacity=".4" />
          <path d="M10 280c40-20 70 20 120 0" strokeWidth="6" opacity=".35" />
        </g>
      );
    case "zest":
      return (
        <g>
          <g fill="none" stroke={art.accent} strokeWidth="4" strokeLinecap="round" opacity=".8">
            <path d="M66 110q10-8 20 0" />
            <path d="M120 150q12 6 18-4" />
            <path d="M78 220q8 10 20 4" />
            <path d="M126 270q10-10 20-2" />
          </g>
          <g fill={art.accent} opacity=".5">
            <circle cx="118" cy="104" r="3" />
            <circle cx="70" cy="176" r="2.4" />
            <circle cx="140" cy="206" r="2.8" />
            <circle cx="92" cy="292" r="2.2" />
          </g>
        </g>
      );
    case "bubbles":
      return (
        <g fill="none" stroke="#fff" opacity=".7">
          {[
            [70, 110, 6],
            [118, 140, 4],
            [90, 190, 8],
            [140, 230, 5],
            [68, 262, 4],
            [120, 296, 6],
            [104, 80, 3],
          ].map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} strokeWidth="1.6" />
          ))}
          <path d="M120 100q14 10 4 26" stroke={art.accent} strokeWidth="5" strokeLinecap="round" opacity=".6" />
          <path d="M72 230q-10 12 2 24" stroke={art.accent} strokeWidth="4" strokeLinecap="round" opacity=".5" />
        </g>
      );
    case "plain":
    default:
      return (
        <g>
          <path d="M0 0h200v70c-30 10-70-6-100 4S30 80 0 70Z" fill={art.accent} opacity=".85" />
          <g stroke={art.top} strokeWidth="1.2" opacity=".6" fill="none">
            <path d="M60 30l14 18 10-8M120 20l-8 22 18 10M150 40l-12 10" />
          </g>
        </g>
      );
  }
}

/** Abanico de polos para packs. */
export function PoloFan({ arts, className }: { arts: PoloArt[]; className?: string }) {
  const n = Math.min(arts.length, 5);
  const list = arts.slice(0, n);
  const spread = n > 1 ? 46 / (n - 1) : 0;
  return (
    <div className={className} aria-hidden>
      <div className="relative h-full w-full">
      {list.map((art, i) => {
        const angle = n > 1 ? -23 + spread * i : 0;
        return (
          <div
            key={i}
            className="absolute inset-0 flex items-end justify-center"
            style={{ transform: `rotate(${angle}deg)`, transformOrigin: "50% 92%", zIndex: i === Math.floor(n / 2) ? 10 : i }}
          >
            <Polo art={art} className="h-full w-auto drop-shadow-[0_18px_22px_rgba(20,11,16,0.18)]" bite={i === Math.floor(n / 2)} />
          </div>
        );
      })}
      </div>
    </div>
  );
}
