import { catalog } from "@/db/catalog";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "DESEO — Cócteles que se comen. Polos con alcohol hechos en Barcelona.";

export default async function Image() {
  const arts = ["pina-colada-barceloneta", "tequila-sunrise", "mojito-de-nit"].map((s) => catalog.find((c) => c.slug === s)!.art);
  return ogImage({ title: "Cócteles que se comen.", subtitle: "Polos con alcohol hechos en Barcelona", arts, bg: "#FFD3B8", ink: "#140b10" });
}
