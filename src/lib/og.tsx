import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { PoloArt } from "@/db/schema";

export const OG_SIZE = { width: 1200, height: 630 };

/** Versión simplificada del polo como SVG plano, apta para el renderizador de imágenes OG. */
export function poloSvg(art: PoloArt) {
  const body = "M40 86a60 60 0 0 1 120 0v214c0 11-9 20-20 20H60c-11 0-20-9-20-20Z";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 420">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${art.top}"/><stop offset=".55" stop-color="${art.base}"/><stop offset="1" stop-color="${art.base}"/></linearGradient>
    <linearGradient id="s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".3" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
    <mask id="m"><rect width="200" height="420" fill="#fff"/><circle cx="166" cy="54" r="24"/><circle cx="146" cy="30" r="15"/><circle cx="176" cy="86" r="14"/></mask>
  </defs>
  <rect x="84" y="290" width="32" height="118" rx="16" fill="#EBD2A6"/>
  <g mask="url(#m)"><path d="${body}" fill="url(#g)"/><path d="${body}" fill="url(#s)"/><rect x="54" y="70" width="12" height="190" rx="6" fill="#fff" opacity=".35"/></g>
  <path d="M52 318c0 10 3 22 8 22s8-12 8-22Z" fill="${art.base}"/><circle cx="60" cy="342" r="6" fill="${art.base}"/>
</svg>`;
}

const svgData = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;

async function fonts() {
  const dir = join(process.cwd(), "assets/fonts");
  const [normal, italic] = await Promise.all([
    readFile(join(dir, "instrument-serif-latin-400-normal.woff")),
    readFile(join(dir, "instrument-serif-latin-400-italic.woff")),
  ]);
  return [
    { name: "Instrument Serif", data: normal, style: "normal" as const, weight: 400 as const },
    { name: "Instrument Serif", data: italic, style: "italic" as const, weight: 400 as const },
  ];
}

export async function ogImage({ title, subtitle, arts, bg, ink }: { title: string; subtitle: string; arts: PoloArt[]; bg: string; ink: string }) {
  const list = arts.slice(0, 3);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: bg, color: ink, fontFamily: "Instrument Serif", position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", width: 720 }}>
          <div style={{ display: "flex", alignItems: "flex-end", fontSize: 64, fontStyle: "italic" }}>
            deseo
            <div style={{ width: 12, height: 12, borderRadius: 12, background: "#ff5a36", marginLeft: 4, marginBottom: 16 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 104, lineHeight: 0.92, letterSpacing: -2 }}>{title}</div>
            <div style={{ fontSize: 40, marginTop: 24, opacity: 0.75 }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 40, top: 30, bottom: 0, width: 440, justifyContent: "center", alignItems: "flex-end" }}>
          {list.map((art, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={svgData(poloSvg(art))}
              width={list.length > 1 ? 210 : 290}
              height={list.length > 1 ? 441 : 609}
              style={{
                marginLeft: i ? -110 : 0,
                transform: list.length > 1 ? `rotate(${(i - 1) * 16}deg)` : "rotate(-8deg)",
              }}
              alt=""
            />
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
