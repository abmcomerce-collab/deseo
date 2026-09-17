# DESEO — Polos con alcohol · ecommerce

Tienda online completa para **DESEO**, marca de polos con alcohol hechos en Barcelona. Construida a medida con Next.js 16, Postgres y Stripe.

> Tienda en **modo demostración**: los pagos usan Stripe en modo prueba (tarjeta `4242 4242 4242 4242`, cualquier fecha futura y CVC).

## Qué incluye

**Tienda**
- Home editorial con carrusel de sabores interactivo (parallax 3D al ratón), marquesinas y secciones con aparición por scroll (CSS scroll-driven, sin JS).
- Identidad visual propia: ilustración vectorial generativa de cada polo a partir de una “receta” de color y textura guardada en BD.
- Catálogo con filtros por tipo y destilado y ordenación; fichas con variantes (cajas 4/8/12) y ahorro por unidad, stock en tiempo real, cuenta atrás de entrega y barra fija de compra en móvil.
- Buscador instantáneo (⌘K) con navegación por teclado.
- Cesta lateral persistente con barra de envío gratis, sugerencias para subir ticket y resincronización de precios/stock con el servidor.
- Verificación de mayoría de edad (+18) al entrar y en el checkout.

**Compra**
- Checkout en 3 pasos con validación en servidor (Zod), detección de zona por código postal, selección de día y franja de entrega en frío (Barcelona mismo día, área metropolitana 24 h, Costa Brava fines de semana).
- Cupones (porcentaje, importe fijo, envío gratis) con mínimos, caducidad y usos máximos.
- Precios **siempre recalculados en servidor**. Stripe Checkout con descuento, gastos de envío y metadatos del pedido.
- Confirmación idempotente por webhook **y** al volver de Stripe; descuento de stock transaccional.
- Página de pedido con seguimiento de estado.

**Cuentas y administración**
- Registro/login con contraseñas bcrypt y sesión JWT firmada en cookie httpOnly; protección optimista en `proxy.ts` + comprobación en servidor.
- Área de cliente: historial de pedidos, datos personales.
- Panel `/admin`: KPIs con comparación de periodos, gráfico de ingresos diarios, más vendidos, alertas de stock bajo; gestión de pedidos (filtros, búsqueda, cambio de estado con historial y reposición de stock al cancelar); editor de productos con **previsualización en vivo de la ilustración**; stock editable en línea; cupones; clientes (recurrencia, lista de espera); solicitudes B2B de eventos.

**Calidad**
- SEO: metadatos por página, Open Graph generadas dinámicamente, JSON-LD (Organization, FAQPage, Product), sitemap y robots.
- Accesibilidad: foco visible, navegación por teclado, `prefers-reduced-motion`, contrastes AA, formularios etiquetados.
- Lighthouse (móvil, build de producción): Rendimiento 90 · Accesibilidad 100 · Buenas prácticas 100 · SEO 100.

## Stack

Next.js 16 (App Router, Server Actions, Turbopack) · React 19 · TypeScript · Tailwind CSS 4 · Drizzle ORM + Postgres · Stripe · Zod · Zustand · Motion.

## Desarrollo local

```bash
cp .env.example .env         # rellena DATABASE_URL y AUTH_SECRET
npm install
npm run db:setup             # migraciones + catálogo + pedidos de demostración
npm run dev
```

Sin `STRIPE_SECRET_KEY` el checkout usa una pasarela simulada para probar el flujo completo.

Acceso al panel: `admin@deseo.bcn` con la contraseña de `ADMIN_PASSWORD` (en local, si no se define, `Deseo2026!`; en producción es obligatoria).

## Variables de entorno

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión Postgres (Neon, Supabase…) |
| `AUTH_SECRET` | Secreto (mín. 32 caracteres) para firmar sesiones. Opcional: si falta se deriva de `DATABASE_URL` |
| `STRIPE_SECRET_KEY` | Clave secreta de Stripe **de prueba** (`sk_test_…`) |
| `STRIPE_WEBHOOK_SECRET` | Secreto del endpoint `/api/stripe/webhook` (opcional pero recomendado) |
| `ADMIN_EMAIL` | Email del administrador. La primera cuenta registrada en la web con ese email (si aún no hay admin) recibe el rol |
| `ADMIN_PASSWORD` | Opcional: crea directamente el admin con esa contraseña durante el build |
| `NEXT_PUBLIC_SITE_URL` | URL pública (opcional en Vercel) |

## Despliegue en Vercel

1. Importa el repositorio en Vercel.
2. En **Storage** añade una base de datos Postgres (Neon); crea `DATABASE_URL` automáticamente.
3. Añade `STRIPE_SECRET_KEY` (o la integración de Stripe del Marketplace) y `ADMIN_EMAIL`; regístrate en `/cuenta/registro` con ese email para obtener acceso a `/admin`.
4. Despliega. El build aplica migraciones y siembra el catálogo si la base de datos está vacía.
5. En Stripe → Desarrolladores → Webhooks, crea un endpoint a `https://TU-DOMINIO/api/stripe/webhook` con los eventos `checkout.session.completed`, `checkout.session.expired` y `checkout.session.async_payment_*`, y guarda su secreto en `STRIPE_WEBHOOK_SECRET`.

## Estructura

```
src/
  app/(shop)/      tienda pública: home, tienda, producto, checkout, pedido, cuenta, eventos, entregas, legal
  app/admin/       panel de administración
  app/actions/     server actions (checkout, auth, admin, leads)
  app/api/         productos (búsqueda) y webhook de Stripe
  components/      UI (art/ = ilustraciones generativas de producto)
  db/              esquema Drizzle, catálogo y seed
  lib/             precios, zonas de entrega, pedidos, sesión, Stripe
drizzle/           migraciones SQL
```
