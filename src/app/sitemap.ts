import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/queries";
import { siteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/tienda`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...products.map((p) => ({
      url: `${base}/producto/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    { url: `${base}/eventos`, lastModified: now, priority: 0.6 },
    { url: `${base}/entregas`, lastModified: now, priority: 0.5 },
    ...["condiciones", "privacidad", "cookies", "aviso-legal", "consumo-responsable"].map((s) => ({
      url: `${base}/legal/${s}`,
      priority: 0.2,
    })),
  ];
}
