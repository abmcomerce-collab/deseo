import type { PoloArt } from "./schema";

type SeedVariant = { name: string; units: number; price: number; compareAt?: number; stock: number };
export type SeedProduct = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  kind: "polo" | "pack";
  spirit: string;
  abv: string;
  notes: string[];
  ingredients: string;
  allergens: string[];
  pairing?: string;
  art: PoloArt;
  packFlavors?: string[];
  badge?: string;
  featured?: boolean;
  variants: SeedVariant[];
};

const boxes = (p4: number, p8: number, p12: number, stock = 60): SeedVariant[] => [
  { name: "Caja de 4", units: 4, price: p4, stock },
  { name: "Caja de 8", units: 8, price: p8, compareAt: +(p4 * 2).toFixed(2), stock: Math.round(stock / 2) },
  { name: "Caja de 12", units: 12, price: p12, compareAt: +(p4 * 3).toFixed(2), stock: Math.round(stock / 3) },
];

export const catalog: SeedProduct[] = [
  {
    slug: "mojito-de-nit",
    name: "Mojito de Nit",
    tagline: "Ron blanco, lima y hierbabuena recién cortada.",
    description:
      "El cóctel que abre todas las noches de verano, convertido en polo. Ron blanco caribeño, zumo de lima exprimido a mano y hierbabuena infusionada en frío durante 12 horas. Fresco, ácido y peligrosamente fácil.",
    kind: "polo",
    spirit: "Ron",
    abv: "4.8",
    notes: ["Cítrico", "Herbal", "Refrescante"],
    ingredients:
      "Agua, zumo de lima (22%), azúcar de caña, ron blanco (9%), hierbabuena, dextrosa, estabilizante (goma garrofín).",
    allergens: [],
    pairing: "Después de una paella en la Barceloneta o como cierre de un tardeo en terraza.",
    art: { base: "#6FD08C", top: "#D4F27A", accent: "#1F6B45", ink: "#0B3323", bg: "#CFEFD6", pattern: "leaves" },
    badge: "Más vendido",
    featured: true,
    variants: boxes(17.9, 32.9, 45.9, 72),
  },
  {
    slug: "pina-colada-barceloneta",
    name: "Piña Colada",
    tagline: "Piña asada, leche de coco y ron dorado.",
    description:
      "Asamos la piña a la brasa antes de mezclarla con leche de coco y ron dorado añejo. El resultado es cremoso, tropical y con un punto tostado que no esperas. Vacaciones en formato de 90 ml.",
    kind: "polo",
    spirit: "Ron",
    abv: "4.5",
    notes: ["Tropical", "Cremoso", "Tostado"],
    ingredients:
      "Leche de coco (30%), piña asada (25%), azúcar, ron dorado (8%), agua, dextrosa, zumo de lima, estabilizante (goma guar).",
    allergens: ["Puede contener trazas de frutos de cáscara"],
    pairing: "Tumbona, sombrilla y la tarde entera por delante.",
    art: { base: "#FFD66B", top: "#FFF1C2", accent: "#E39A1E", ink: "#0E3B36", bg: "#BFE6DE", pattern: "zest" },
    featured: true,
    variants: boxes(17.9, 32.9, 45.9, 60),
  },
  {
    slug: "tequila-sunrise",
    name: "Tequila Sunrise",
    tagline: "Tequila blanco, naranja sanguina y granadina.",
    description:
      "Dos capas congeladas por separado para que el amanecer se vea antes de probarlo. Arriba, naranja sanguina con tequila blanco 100% agave; abajo, granadina casera de granada natural.",
    kind: "polo",
    spirit: "Tequila",
    abv: "5.0",
    notes: ["Afrutado", "Intenso", "Dulce"],
    ingredients:
      "Zumo de naranja sanguina (35%), agua, azúcar, tequila blanco 100% agave (10%), granadina natural (8%), dextrosa, estabilizante (goma garrofín).",
    allergens: [],
    pairing: "Para brindar cuando el sol ya se está yendo.",
    art: { base: "#E8233F", top: "#FF9A3D", accent: "#FFC857", ink: "#4D0A14", bg: "#FFD3B8", pattern: "layers" },
    badge: "Favorito",
    featured: true,
    variants: boxes(18.9, 34.9, 48.9, 60),
  },
  {
    slug: "vermut-de-barri",
    name: "Vermut de Barri",
    tagline: "Vermut rojo de Reus, piel de naranja y sal de oliva.",
    description:
      "Nuestro homenaje al domingo por la mañana. Vermut rojo artesano de Reus, piel de naranja confitada y un toque de sal de aceituna arbequina que lo cambia todo. Amargo, especiado y muy de aquí.",
    kind: "polo",
    spirit: "Vermut",
    abv: "5.0",
    notes: ["Especiado", "Amargo", "Salino"],
    ingredients:
      "Vermut rojo (28%), agua, azúcar, zumo de naranja, piel de naranja confitada, sal de aceituna arbequina, dextrosa, estabilizante (goma garrofín).",
    allergens: ["Sulfitos"],
    pairing: "Con unas patatas, unas olivas y la sobremesa de domingo.",
    art: { base: "#8E1E2E", top: "#C8442B", accent: "#F2A65A", ink: "#4A0F18", bg: "#F3C7B5", pattern: "zest" },
    badge: "Nuevo",
    featured: true,
    variants: boxes(18.9, 34.9, 48.9, 48),
  },
  {
    slug: "cava-maduixa",
    name: "Cava & Maduixa",
    tagline: "Cava brut nature, fresa del Maresme y pimienta rosa.",
    description:
      "Fresas del Maresme maceradas con cava brut nature del Penedès y un toque de pimienta rosa. Ligero, delicado y con burbuja en el recuerdo. El polo de las celebraciones.",
    kind: "polo",
    spirit: "Cava",
    abv: "4.0",
    notes: ["Floral", "Afrutado", "Ligero"],
    ingredients:
      "Fresa (35%), cava brut nature (20%), agua, azúcar, dextrosa, zumo de limón, pimienta rosa, estabilizante (goma garrofín).",
    allergens: ["Sulfitos"],
    pairing: "Bodas, cumpleaños y cualquier excusa para brindar.",
    art: { base: "#FF7E9D", top: "#FFC2D1", accent: "#B8123E", ink: "#5A0A22", bg: "#FFE0E7", pattern: "speckle" },
    variants: boxes(18.9, 34.9, 48.9, 54),
  },
  {
    slug: "gin-tonic-mediterrani",
    name: "Gin Tonic Mediterrani",
    tagline: "Ginebra, tónica, romero y limón de Sóller.",
    description:
      "La ginebra más mediterránea que hemos encontrado, con tónica premium, romero fresco y piel de limón de Sóller. Seco, aromático y con esa amargura elegante que pide otro.",
    kind: "polo",
    spirit: "Ginebra",
    abv: "4.5",
    notes: ["Seco", "Aromático", "Cítrico"],
    ingredients:
      "Agua tónica (40%), agua, azúcar, ginebra (9%), zumo de limón, romero, dextrosa, estabilizante (goma garrofín).",
    allergens: [],
    pairing: "Con la brisa de Cadaqués o un calor de agosto en el Eixample.",
    art: { base: "#A9DCEB", top: "#E8F7FB", accent: "#3F8C6B", ink: "#2A2450", bg: "#E1DDF3", pattern: "bubbles" },
    variants: boxes(17.9, 32.9, 45.9, 54),
  },
  {
    slug: "espresso-martini",
    name: "Espresso Martini",
    tagline: "Vodka, espresso de especialidad y vainilla.",
    description:
      "Café de especialidad tostado en Gràcia, extraído en frío y mezclado con vodka y vainilla de Madagascar. Para cuando la noche necesita un segundo aire.",
    kind: "polo",
    spirit: "Vodka",
    abv: "5.0",
    notes: ["Tostado", "Cremoso", "Intenso"],
    ingredients:
      "Café espresso (30%), leche, azúcar, vodka (9%), nata, vainilla, dextrosa, estabilizante (goma guar). Contiene cafeína.",
    allergens: ["Leche"],
    pairing: "El postre de una cena larga. Con cuidado: lleva cafeína.",
    art: { base: "#5A3526", top: "#B98A62", accent: "#F1DDC3", ink: "#3A2218", bg: "#E6D2BD", pattern: "swirl" },
    variants: boxes(18.9, 34.9, 48.9, 48),
  },
  {
    slug: "crema-catalana",
    name: "Crema Catalana",
    tagline: "Licor de vainilla, piel de limón, canela y azúcar tostado.",
    description:
      "Edición de otoño e invierno. Crema infusionada con piel de limón y canela en rama, licor de vainilla y una capa crujiente de azúcar tostado. Sabe a sobremesa de abuela, pero para adultos.",
    kind: "polo",
    spirit: "Licor",
    abv: "4.0",
    notes: ["Dulce", "Especiado", "Cremoso"],
    ingredients:
      "Leche, nata, azúcar, yema de huevo, licor de vainilla (10%), piel de limón, canela, dextrosa, estabilizante (goma garrofín).",
    allergens: ["Leche", "Huevo"],
    pairing: "Sant Josep, Navidad o cualquier día que pida un capricho.",
    art: { base: "#F4C66E", top: "#FFEBC0", accent: "#9C5418", ink: "#F8E4BE", bg: "#3A2418", pattern: "plain" },
    badge: "Edición limitada",
    variants: boxes(19.9, 36.9, 51.9, 36),
  },
  {
    slug: "caja-degustacion",
    name: "Caja Degustación",
    tagline: "Los 8 sabores en una caja. La mejor forma de empezar.",
    description:
      "Un polo de cada sabor en nuestra caja isotérmica. Ideal para descubrir tu favorito, para regalar o para una cena con amigos en la que nadie se pone de acuerdo.",
    kind: "pack",
    spirit: "Variado",
    abv: "4.6",
    notes: ["Para compartir", "Para regalar"],
    ingredients: "Incluye un polo de cada sabor. Consulta los ingredientes en la ficha de cada sabor.",
    allergens: ["Leche", "Huevo", "Sulfitos", "Puede contener trazas de frutos de cáscara"],
    pairing: "Cenas con amigos, regalos y primeras veces.",
    art: { base: "#FF5A36", top: "#FFB36B", accent: "#140B10", ink: "#140B10", bg: "#FFD9C7", pattern: "plain" },
    packFlavors: [
      "mojito-de-nit",
      "tequila-sunrise",
      "cava-maduixa",
      "vermut-de-barri",
      "pina-colada-barceloneta",
      "espresso-martini",
      "gin-tonic-mediterrani",
      "crema-catalana",
    ],
    badge: "Regalo perfecto",
    featured: true,
    variants: [{ name: "8 polos", units: 8, price: 34.9, compareAt: 39.2, stock: 40 }],
  },
  {
    slug: "nevera-fiesta",
    name: "Nevera Fiesta",
    tagline: "24 polos surtidos y nevera isotérmica reutilizable.",
    description:
      "Para cumpleaños, terrazas y fiestas en casa. 24 polos de nuestros sabores más pedidos (mojito, sunrise, piña colada y cava) en una nevera isotérmica con placas de frío que los mantiene perfectos hasta 6 horas.",
    kind: "pack",
    spirit: "Variado",
    abv: "4.6",
    notes: ["Para fiestas", "24 unidades"],
    ingredients: "Incluye 6 polos de Mojito de Nit, Tequila Sunrise, Piña Colada y Cava & Maduixa.",
    allergens: ["Sulfitos", "Puede contener trazas de frutos de cáscara"],
    pairing: "Cumpleaños, verbenas de Sant Joan y fiestas de azotea.",
    art: { base: "#140B10", top: "#3B1224", accent: "#FF5A36", ink: "#F4EDE4", bg: "#2A1720", pattern: "plain" },
    packFlavors: ["mojito-de-nit", "tequila-sunrise", "pina-colada-barceloneta", "cava-maduixa"],
    variants: [{ name: "24 polos + nevera", units: 24, price: 89, compareAt: 107.4, stock: 15 }],
  },
];

export const seedCoupons = [
  { code: "BIENVENIDA10", type: "percent" as const, value: 10, minSubtotalCents: 0 },
  { code: "TARDEO5", type: "fixed" as const, value: 500, minSubtotalCents: 3000 },
  { code: "ENVIOGRATIS", type: "free_shipping" as const, value: 0, minSubtotalCents: 2500 },
];
