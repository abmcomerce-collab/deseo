import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { AgeGate } from "@/components/shop/age-gate";
import { Marquee } from "@/components/shop/marquee";

export default function ShopLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-noche focus:px-4 focus:py-2 focus:text-crema">
        Saltar al contenido
      </a>
      <div className="bg-noche py-2 text-crema">
        <Marquee
          className="eyebrow"
          items={[
            "Entrega congelada en Barcelona hoy mismo",
            "Envío gratis desde 45 €",
            "Alcohol real · hasta 5% vol.",
            "Código BIENVENIDA10 en tu primer pedido",
            "Solo para mayores de 18",
          ]}
        />
      </div>
      <Header />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer />
      <CartDrawer />
      <AgeGate />
    </div>
  );
}
