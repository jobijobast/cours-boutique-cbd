export type Category = "huile" | "gummies" | "fleur" | "resine" | "coffret";

export type StockStatus = "in" | "low" | "out";

export type Product = {
  slug: string;
  name: string;
  category: Category;
  /** Libellé affiché en Fraunces italique sur le visuel (sans photo) */
  format: string;
  /** Photo produit sur fond blanc, dans /public/produits */
  image?: string;
  meta: string;
  lot: string;
  price: number;
  /** Prix unitaire déjà formaté (€/mg ou €/g) — null si non pertinent */
  unitPrice: string | null;
  rating: number;
  reviews: number;
  stock: StockStatus;
  stockLabel: string;
  description: string;
  composition: string;
  packaging: string;
  /** Moments de journée pour lesquels le produit est recommandé */
  moments: Moment[];
  levels: Level[];
  /** Produit non listé dans le catalogue */
  hidden?: boolean;
};

export type Level = "jamais" | "quelques-fois" | "regulierement";
export type Moment = "soir" | "journee" | "sport";
export type Budget = "20" | "40" | "60";

export const CATEGORY_LABELS: Record<Category, { singular: string; plural: string }> = {
  huile: { singular: "Huile", plural: "Huiles" },
  gummies: { singular: "Gummies", plural: "Gummies" },
  fleur: { singular: "Fleur", plural: "Fleurs" },
  resine: { singular: "Résine", plural: "Résines" },
  coffret: { singular: "Coffret", plural: "Coffrets" },
};

const FLEUR_PACK = "Pochon noir Sève hermétique et opaque de 1 g, refermable.";
const RESINE_PACK = "Pochon noir Sève hermétique et opaque de 1 g, refermable.";

export const products: Product[] = [
  {
    slug: "huile-cbd-10-spearmint",
    name: "Huile CBD 10 % Spearmint",
    category: "huile",
    format: "Huile",
    image: "/produits/huile-cbd-10-spearmint.webp",
    meta: "30 ml · 3 000 mg CBD · Cookies · Lot H-3010",
    lot: "H-3010",
    price: 49.9,
    unitPrice: "0,017 €/mg",
    rating: 4.8,
    reviews: 142,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Une huile de CBD à 10 % au goût frais de menthe verte, en grand format de 30 ml. Quelques gouttes sous la langue, au moment de la journée qui vous convient.",
    composition: "Extrait de chanvre riche en CBD (10 %), huile végétale, arôme naturel menthe verte.",
    packaging: "Flacon ambré 30 ml avec pipette compte-gouttes, étui carton.",
    moments: ["soir", "journee", "sport"],
    levels: ["jamais", "quelques-fois"],
  },
  {
    slug: "bonhomme-de-neige",
    name: "Bonhomme de Neige",
    category: "fleur",
    format: "Fleur",
    image: "/produits/bonhomme-de-neige.webp",
    meta: "1 g · 10,59 % CBD · Indoor · Lot F-1059",
    lot: "F-1059",
    price: 12.5,
    unitPrice: "12,50 €/g",
    rating: 4.7,
    reviews: 186,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Issue d'un croisement Amnesia Hypro × White Widow, une fleur indoor au profil frais : notes mentholées et sucrées, une pointe épicée et zestée. Destinée à l'infusion.",
    composition: "Sommités fleuries de chanvre, culture indoor. Croisement Amnesia Hypro × White Widow.",
    packaging: FLEUR_PACK,
    moments: ["journee", "sport"],
    levels: ["jamais", "quelques-fois"],
  },
  {
    slug: "purple-punch",
    name: "Purple Punch",
    category: "fleur",
    format: "Fleur",
    image: "/produits/purple-punch.webp",
    meta: "1 g · 13,82 % CBD · Indoor · Lot F-1382",
    lot: "F-1382",
    price: 12.5,
    unitPrice: "12,50 €/g",
    rating: 4.9,
    reviews: 231,
    stock: "low",
    stockLabel: "Plus que 3 en stock",
    description:
      "Une fleur indoor aux reflets violets et au caractère affirmé : framboise et mandarine, relevées d'une touche épicée et diesel. Destinée à l'infusion.",
    composition: "Sommités fleuries de chanvre, culture indoor.",
    packaging: FLEUR_PACK,
    moments: ["soir"],
    levels: ["quelques-fois", "regulierement"],
  },
  {
    slug: "sweet-soy",
    name: "Sweet Soy",
    category: "fleur",
    format: "Fleur",
    image: "/produits/sweet-soy.webp",
    meta: "1 g · 10,65 % CBD · Indoor · Lot F-1065",
    lot: "F-1065",
    price: 12,
    unitPrice: "12,00 €/g",
    rating: 4.6,
    reviews: 94,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Issue d'un croisement GMO × Gelato, une fleur indoor au profil complexe : notes umami, sucrées et toastées, avec une touche gazeuse. Destinée à l'infusion.",
    composition: "Sommités fleuries de chanvre, culture indoor. Croisement GMO × Gelato.",
    packaging: FLEUR_PACK,
    moments: ["soir"],
    levels: ["quelques-fois", "regulierement"],
  },
  {
    slug: "gummies-huckleberry-gelato",
    name: "Gummies Huckleberry Gelato",
    category: "gummies",
    format: "Gummies",
    image: "/produits/huckleberry-gelato.webp",
    meta: "10 gommes · 10 mg Delta-9 THC/gomme · Cookies · Lot G-1001",
    lot: "G-1001",
    price: 24.9,
    unitPrice: "2,49 €/gomme",
    rating: 4.6,
    reviews: 88,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Un profil fruité et gourmand : baies sauvages légèrement acidulées et notes crémeuses façon gelato. Chaque gomme contient 10 mg de Delta-9 THC, soit 100 mg par boîte de 10. Taux de THC inférieur à 0,3 %. Produit destiné exclusivement à la collection, ne pas consommer.",
    composition: "10 gommes aromatisées myrtille sauvage, 10 mg de Delta-9 THC par gomme (100 mg par boîte).",
    packaging: "Sachet refermable Cookies de 10 gommes.",
    moments: ["journee", "soir"],
    levels: ["regulierement"],
  },
  {
    slug: "gummies-london-pound-cake",
    name: "Gummies London Pound Cake",
    category: "gummies",
    format: "Gummies",
    image: "/produits/london-pound-cake.webp",
    meta: "10 gommes · 10 mg Delta-9 THC/gomme · Cookies · Lot G-1002",
    lot: "G-1002",
    price: 24.9,
    unitPrice: "2,49 €/gomme",
    rating: 4.5,
    reviews: 64,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Un profil gourmand et pâtissier : notes vanillées et douces, légèrement fruitées. Chaque gomme contient 10 mg de Delta-9 THC, soit 100 mg par boîte de 10. Taux de THC inférieur à 0,3 %. Produit destiné exclusivement à la collection, ne pas consommer.",
    composition: "10 gommes aromatisées gâteau vanillé, 10 mg de Delta-9 THC par gomme (100 mg par boîte).",
    packaging: "Sachet refermable Cookies de 10 gommes.",
    moments: ["soir"],
    levels: ["regulierement"],
  },
  {
    slug: "gummies-tahitian-lime",
    name: "Gummies Tahitian Lime",
    category: "gummies",
    format: "Gummies",
    image: "/produits/tahitian-lime.webp",
    meta: "10 gommes · 10 mg Delta-9 THC/gomme · Cookies · Lot G-1003",
    lot: "G-1003",
    price: 24.9,
    unitPrice: "2,49 €/gomme",
    rating: 4.7,
    reviews: 71,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Un profil frais et fruité, dominé par le citron vert acidulé avec une touche sucrée. Chaque gomme contient 10 mg de Delta-9 THC, soit 100 mg par boîte de 10. Taux de THC inférieur à 0,3 %. Produit destiné exclusivement à la collection, ne pas consommer.",
    composition: "10 gommes aromatisées citron vert, 10 mg de Delta-9 THC par gomme (100 mg par boîte).",
    packaging: "Sachet refermable Cookies de 10 gommes.",
    moments: ["journee", "sport"],
    levels: ["regulierement"],
  },
  {
    slug: "static-mango",
    name: "Static Mango",
    category: "resine",
    format: "Résine",
    image: "/produits/static-mango.webp",
    meta: "1 g · 79,94 % CBD · Lot R-7994",
    lot: "R-7994",
    price: 12,
    unitPrice: "12,00 €/g",
    rating: 4.8,
    reviews: 77,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Un extrait très concentré au profil tropical : mangue mûre, notes fruitées, fraîches et légèrement sucrées. Réservé aux connaisseurs.",
    composition: "Extrait de résine de chanvre, sans additif.",
    packaging: RESINE_PACK,
    moments: ["soir", "journee"],
    levels: ["regulierement"],
  },
  {
    slug: "dry-sift",
    name: "Dry Sift",
    category: "resine",
    format: "Résine",
    image: "/produits/dry-sift.webp",
    meta: "2 g · 14,66 % CBD · Lot R-1466",
    lot: "R-1466",
    price: 20,
    unitPrice: "10,00 €/g",
    rating: 4.5,
    reviews: 58,
    stock: "in",
    stockLabel: "En stock",
    description:
      "Obtenue par tamisage à sec des fleurs, une résine à la texture fine et légèrement granuleuse, au profil floral et authentique.",
    composition: "Trichomes de chanvre tamisés à sec, sans solvant.",
    packaging: "Pochon noir Sève hermétique et opaque de 2 g, refermable.",
    moments: ["journee", "sport"],
    levels: ["quelques-fois", "regulierement"],
  },
  {
    slug: "ice-o-lator",
    name: "Ice O Lator",
    category: "resine",
    format: "Résine",
    image: "/produits/ice-o-lator.webp",
    meta: "1 g · 29,43 % CBD · Lot R-2943",
    lot: "R-2943",
    price: 11,
    unitPrice: "11,00 €/g",
    rating: 4.7,
    reviews: 103,
    stock: "out",
    stockLabel: "Épuisé",
    description:
      "Obtenue par extraction à l'eau glacée, une résine souple et crémeuse aux notes végétales, florales et délicatement terreuses.",
    composition: "Trichomes de chanvre extraits à l'eau glacée, sans solvant.",
    packaging: RESINE_PACK,
    moments: ["soir"],
    levels: ["regulierement"],
  },
];

export const catalog = products.filter((p) => !p.hidden);

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

/**
 * Edge Case (?state=edge) : le produit passe en rupture pendant l'ajout,
 * et on propose une alternative équivalente.
 */
export const EDGE = {
  product: "purple-punch",
  replacement: "bonhomme-de-neige",
  reason: "fleur indoor, même prix, analyse labo disponible",
};

export const FREE_SHIPPING_THRESHOLD = 50;
export const MAX_QTY = 4;

const eur = new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" });
export const formatPrice = (n: number) => eur.format(n);
export const formatRating = (n: number) => n.toLocaleString("fr-FR", { minimumFractionDigits: 1 });

/** Classement selon les réponses du quiz ; les produits épuisés passent en dernier */
export function rankProducts(
  list: Product[],
  answers: { level?: Level; moment?: Moment; budget?: Budget }
) {
  const max = answers.budget === "20" ? 20 : answers.budget === "40" ? 40 : Infinity;
  const score = (p: Product) => {
    let s = 0;
    if (answers.level && p.levels.includes(answers.level)) s += 5;
    if (answers.moment && p.moments[0] === answers.moment) s += 4;
    else if (answers.moment && p.moments.includes(answers.moment)) s += 1;
    if (p.price <= max) s += 3;
    if (p.stock === "out") s -= 20;
    return s + p.rating / 10;
  };
  return [...list].sort((a, b) => score(b) - score(a));
}
