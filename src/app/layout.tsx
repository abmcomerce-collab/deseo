import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import "./globals.css";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "DESEO — Polos con alcohol hechos en Barcelona",
    template: "%s · DESEO",
  },
  description:
    "Cócteles que se comen. Polos artesanos con alcohol real, hechos en Barcelona y entregados congelados a domicilio. Solo para mayores de 18 años.",
  keywords: ["helado con alcohol", "polos con alcohol", "Barcelona", "mojito", "tequila sunrise", "cócteles helados"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "DESEO",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#140b10",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body className="grain min-h-dvh">{children}</body>
    </html>
  );
}
