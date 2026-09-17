import Link from "next/link";
import { Plus } from "lucide-react";
import { getProducts } from "@/lib/queries";
import { PageHeader, Table } from "@/components/admin/ui";
import { ProductArt } from "@/components/art/product-art";
import { toShopProduct } from "@/lib/dto";
import { abv, cn, money } from "@/lib/format";
import { ActiveToggle, StockInput } from "@/components/admin/product-inline";

export const metadata = { title: "Productos" };
export const dynamic = "force-dynamic";

export default async function ProductsAdmin() {
  const all = await getProducts({ includeInactive: true });
  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        subtitle={`${all.length} productos · ${all.filter((p) => p.isActive).length} publicados`}
        actions={
          <Link href="/admin/productos/nuevo" className="btn btn-primary">
            <Plus className="size-4" /> Nuevo producto
          </Link>
        }
      />
      <Table>
        <thead>
          <tr>
            <th>Producto</th>
            <th>Variantes · precio · stock</th>
            <th>Publicado</th>
          </tr>
        </thead>
        <tbody>
          {all.map((p) => {
            const shop = toShopProduct(p, all);
            return (
              <tr key={p.id} className={cn(!p.isActive && "opacity-60")}>
                <td>
                  <Link href={`/admin/productos/${p.id}`} className="flex items-center gap-4">
                    <span className="grid h-16 w-14 shrink-0 place-items-center rounded-xl" style={{ background: p.art.bg }}>
                      <ProductArt arts={shop.arts} kind={p.kind} className="h-12 w-10" />
                    </span>
                    <span>
                      <span className="block font-medium hover:underline">{p.name}</span>
                      <span className="block text-xs text-humo">
                        {p.kind === "pack" ? "Pack" : "Polo"} · {p.spirit} · {abv(p.abv)}
                        {p.badge ? ` · ${p.badge}` : ""}
                      </span>
                    </span>
                  </Link>
                </td>
                <td>
                  <ul className="space-y-1.5">
                    {p.variants.map((v) => (
                      <li key={v.id} className="flex items-center gap-3">
                        <span className="w-32 text-humo">{v.name}</span>
                        <span className="w-20 tabular-nums">{money(v.priceCents)}</span>
                        <StockInput variantId={v.id} stock={v.stock} />
                      </li>
                    ))}
                  </ul>
                </td>
                <td>
                  <ActiveToggle productId={p.id} active={p.isActive} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
}
