import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db, schema } from "@/db";
import { PageHeader } from "@/components/admin/ui";
import { ProductEditor, type ProductDraft } from "@/components/admin/product-editor";

export const dynamic = "force-dynamic";

const EMPTY: ProductDraft = {
  name: "",
  slug: "",
  tagline: "",
  description: "",
  kind: "polo",
  spirit: "",
  abv: "4.5",
  notes: "",
  ingredients: "",
  allergens: "",
  pairing: "",
  badge: "Nuevo",
  featured: false,
  isActive: false,
  art: { base: "#FF7E9D", top: "#FFC2D1", accent: "#B8123E", ink: "#5A0A22", bg: "#FFE0E7", pattern: "speckle" },
  variants: [
    { name: "Caja de 4", units: "4", price: "18.90", compareAt: "", stock: "40" },
    { name: "Caja de 8", units: "8", price: "34.90", compareAt: "37.80", stock: "20" },
    { name: "Caja de 12", units: "12", price: "48.90", compareAt: "56.70", stock: "12" },
  ],
};

export async function generateMetadata({ params }: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  return { title: id === "nuevo" ? "Nuevo producto" : "Editar producto" };
}

export default async function EditProduct({ params, searchParams }: PageProps<"/admin/productos/[id]">) {
  const { id } = await params;
  const { creado } = await searchParams;
  const isNew = id === "nuevo";

  let draft = EMPTY;
  if (!isNew) {
    if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
    const p = await db.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: { variants: { orderBy: [asc(schema.variants.sortOrder)] } },
    });
    if (!p) notFound();
    draft = {
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      kind: p.kind,
      spirit: p.spirit,
      abv: p.abv,
      notes: p.notes.join(", "),
      ingredients: p.ingredients,
      allergens: p.allergens.join(", "),
      pairing: p.pairing ?? "",
      badge: p.badge ?? "",
      featured: p.featured,
      isActive: p.isActive,
      art: p.art,
      variants: p.variants.map((v) => ({
        id: v.id,
        name: v.name,
        units: String(v.units),
        price: (v.priceCents / 100).toFixed(2),
        compareAt: v.compareAtCents ? (v.compareAtCents / 100).toFixed(2) : "",
        stock: String(v.stock),
      })),
    };
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/productos" className="inline-flex items-center gap-2 text-sm text-humo hover:text-noche">
        <ArrowLeft className="size-4" /> Productos
      </Link>
      <PageHeader
        title={isNew ? "Nuevo producto" : draft.name}
        subtitle={isNew ? "Diseña el polo, ponle precio y publícalo." : "Los cambios se publican al instante en la tienda."}
      />
      <ProductEditor key={id} productId={isNew ? null : id} initial={draft} justCreated={creado === "1"} />
    </div>
  );
}
