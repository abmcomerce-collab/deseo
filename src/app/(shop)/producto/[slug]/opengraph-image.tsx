import { getProductBySlug, getProducts } from "@/lib/queries";
import { OG_SIZE, ogImage } from "@/lib/og";
import { abv } from "@/lib/format";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Polo con alcohol DESEO";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return ogImage({ title: "DESEO", subtitle: "Polos con alcohol", arts: [], bg: "#FFD3B8", ink: "#140b10" });
  let arts = [product.art];
  if (product.kind === "pack" && product.packFlavors?.length) {
    const all = await getProducts();
    arts = product.packFlavors.slice(0, 3).map((s) => all.find((p) => p.slug === s)?.art ?? product.art);
  }
  return ogImage({
    title: product.name,
    subtitle: `${product.spirit} · ${abv(product.abv)}`,
    arts,
    bg: product.art.bg,
    ink: product.art.ink,
  });
}
