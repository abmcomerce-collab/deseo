import { NextResponse } from "next/server";
import { getProducts } from "@/lib/queries";
import { toShopProduct } from "@/lib/dto";

export async function GET() {
  const products = await getProducts();
  return NextResponse.json(
    products.map((p) => toShopProduct(p, products)),
    { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } },
  );
}
