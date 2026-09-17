import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DESEO — Polos con alcohol",
    short_name: "DESEO",
    description: "Cócteles que se comen. Polos con alcohol hechos en Barcelona.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f1",
    theme_color: "#140b10",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
