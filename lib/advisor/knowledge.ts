import "server-only";
import { CATEGORY_LABELS, catalog, formatPrice, type Product } from "@/lib/data/products";
import { getOrigin } from "@/lib/data/origins";

/**
 * Fiches de dégustation détaillées pour le conseiller IA.
 * Uniquement des descriptions sensorielles, d'ambiance et de profil :
 * aucune promesse d'effet sur le corps ou l'esprit.
 */
type Tasting = {
  aspect: string;
  nez: string;
  bouche: string;
  finale: string;
  /** Notes de 0 à 5 */
  sucre: number;
  fruite: number;
  fraicheur: number;
  terreux: number;
  intensite: number;
  texture: string;
  genetique?: string;
  ambiances: string[];
  pourQui: string;
  aEviterSi: string;
  alternative: string;
};

const TASTING: Record<string, Tasting> = {
  "huile-cbd-10-spearmint": {
    aspect: "Huile dorée et limpide dans un flacon ambré avec pipette graduée.",
    nez: "Menthe verte (spearmint) franche, très propre, légère pointe végétale de chanvre.",
    bouche: "Fraîcheur mentholée immédiate, texture huileuse légère, peu d'amertume grâce à l'arôme menthe.",
    finale: "Fraîche et nette, la menthe masque le goût du chanvre.",
    sucre: 1,
    fruite: 0,
    fraicheur: 5,
    terreux: 1,
    intensite: 2,
    texture: "Huile fluide, dosage à la goutte",
    ambiances: ["matin calme", "pause au bureau", "fin de journée", "après le sport"],
    pourQui: "Débutants, personnes qui n'aiment pas le goût du chanvre, celles qui veulent un format discret et précis. Grand format 30 ml : le plus économique au milligramme (0,017 €/mg).",
    aEviterSi: "On cherche une saveur fruitée ou gourmande, ou un petit budget immédiat (49,90 €).",
    alternative: "bonhomme-de-neige pour la fraîcheur en version fleur à petit prix",
  },
  "bonhomme-de-neige": {
    aspect: "Fleur compacte vert clair, très givrée (trichomes blancs abondants), pistils orangés.",
    nez: "Menthe fraîche et eucalyptus, zeste de citron, fond sucré de bonbon à la menthe.",
    bouche: "Frais et mentholé, légèrement sucré, petite pointe épicée et zestée en fin de bouche.",
    finale: "Fraîche et légère, pas d'amertume marquée.",
    sucre: 3,
    fruite: 2,
    fraicheur: 5,
    terreux: 1,
    intensite: 3,
    texture: "Fleur dense mais souple, bien manucurée",
    genetique: "Amnesia Hypro × White Widow",
    ambiances: ["pause dans la journée", "après-midi ensoleillé", "envie de fraîcheur", "moment léger entre amis"],
    pourQui: "Premier choix idéal de fleur : taux modéré (10,59 %), profil frais facile à apprécier, petit prix (12,50 €/g).",
    aEviterSi: "On veut du très fruité rouge ou un profil gourmand et sucré intense.",
    alternative: "huile-cbd-10-spearmint pour la même fraîcheur en format huile",
  },
  "purple-punch": {
    aspect: "Fleur aux reflets violets profonds, pistils orange cuivré, bien givrée.",
    nez: "Framboise et fruits rouges mûrs, mandarine, touche florale de violette, fond légèrement diesel.",
    bouche: "Fruitée et sucrée comme un bonbon aux fruits rouges, puis une pointe épicée.",
    finale: "Ronde, fruitée, légèrement épicée et diesel.",
    sucre: 4,
    fruite: 5,
    fraicheur: 2,
    terreux: 2,
    intensite: 4,
    texture: "Fleur aérée et collante, très aromatique",
    ambiances: ["soirée cocooning", "plaid et série", "moment douceur", "envie de fruits rouges"],
    pourQui: "Amateurs de saveurs fruitées et sucrées. Taux de CBD le plus élevé des fleurs (13,82 %). Convient à un débutant qui adore le fruité, très appréciée (4,9/5).",
    aEviterSi: "On n'aime pas les arômes sucrés ou on cherche de la fraîcheur mentholée.",
    alternative: "sweet-soy pour une gourmandise plus originale, bonhomme-de-neige pour la fraîcheur",
  },
  "sweet-soy": {
    aspect: "Fleur vert sombre aux reflets bleutés, pistils orange abondants, très résineuse.",
    nez: "Notes umami et toastées, sauce soja sucrée, caramel brûlé, touche gazeuse (gassy).",
    bouche: "Gourmande et salée-sucrée, toastée, avec un côté épicé et terreux en fond.",
    finale: "Longue, toastée, légèrement gazeuse.",
    sucre: 3,
    fruite: 1,
    fraicheur: 1,
    terreux: 4,
    intensite: 5,
    texture: "Fleur dense et résineuse",
    genetique: "GMO × Gelato",
    ambiances: ["soirée dégustation", "curiosité gustative", "amateurs de saveurs originales"],
    pourQui: "Connaisseurs et palais curieux qui aiment les profils gourmands, salés-sucrés et atypiques. Le moins cher des fleurs (12,00 €/g).",
    aEviterSi: "On débute ou on aime les saveurs fruitées et fraîches.",
    alternative: "purple-punch pour une gourmandise plus fruitée",
  },
  "static-mango": {
    aspect: "Extrait doré à beige, texture sablée et cireuse, très concentré.",
    nez: "Mangue bien mûre, fruits exotiques, note fraîche d'agrumes.",
    bouche: "Tropicale et intense, mangue juteuse, légère sucrosité, fraîcheur en fin de bouche.",
    finale: "Très longue, exotique et fruitée.",
    sucre: 3,
    fruite: 5,
    fraicheur: 3,
    terreux: 1,
    intensite: 5,
    texture: "Extrait sec et sableux (static sift), se travaille facilement",
    ambiances: ["soirée entre connaisseurs", "envie d'exotisme", "moment dégustation"],
    pourQui: "Habitués uniquement : extrait très concentré (79,94 % CBD). Excellent rapport taux/prix (12,00 €/g).",
    aEviterSi: "On débute (trop concentré) : proposer plutôt l'huile ou Bonhomme de Neige.",
    alternative: "dry-sift pour découvrir la résine à taux modéré, purple-punch pour le fruité en fleur",
  },
  "dry-sift": {
    aspect: "Résine beige clair, poudre pressée fine et légèrement granuleuse.",
    nez: "Floral et herbacé, foin coupé, touche miellée.",
    bouche: "Douce, florale et authentique, peu sucrée, légèrement poivrée.",
    finale: "Courte et douce, végétale.",
    sucre: 2,
    fruite: 1,
    fraicheur: 2,
    terreux: 3,
    intensite: 2,
    texture: "Fine, légèrement granuleuse, se façonne facilement",
    ambiances: ["après-midi tranquille", "après le sport", "découverte de la résine", "pause nature"],
    pourQui: "Personnes qui veulent découvrir la résine avec un taux modéré (14,66 %) et un profil doux et naturel. Format 2 g (20 €, soit 10 €/g, la résine la moins chère au gramme).",
    aEviterSi: "On cherche une saveur fruitée marquée ou un extrait puissant.",
    alternative: "static-mango pour les habitués qui veulent du fruité intense",
  },
  "ice-o-lator": {
    aspect: "Résine brun doré brillante, souple et crémeuse.",
    nez: "Végétal, floral, sous-bois et terre humide.",
    bouche: "Crémeuse et terreuse, notes boisées et florales.",
    finale: "Ronde et terreuse.",
    sucre: 1,
    fruite: 1,
    fraicheur: 1,
    terreux: 5,
    intensite: 4,
    texture: "Souple et crémeuse",
    ambiances: ["soirée calme", "amateurs de profils terreux"],
    pourQui: "Habitués qui aiment les profils terreux et traditionnels (29,43 % CBD).",
    aEviterSi: "Toujours : ce produit est ÉPUISÉ, ne jamais le recommander.",
    alternative: "dry-sift ou static-mango",
  },
};

const scale = (n: number) => `${n}/5`;

export function productSheet(p: Product) {
  const t = TASTING[p.slug];
  const o = getOrigin(p.slug);
  const out = p.stock === "out";
  const lines = [
    `## [[${p.slug}]] ${p.name}${out ? " — ÉPUISÉ, NE JAMAIS LE RECOMMANDER" : ""}`,
    `- Format : ${CATEGORY_LABELS[p.category].singular} — ${p.meta}`,
    `- Prix : ${formatPrice(p.price)}${p.unitPrice ? ` (${p.unitPrice})` : ""} — Stock : ${p.stockLabel} — Note clients ${p.rating.toLocaleString("fr-FR")}/5 (${p.reviews} avis)`,
  ];
  if (t) {
    lines.push(
      `- Aspect : ${t.aspect}`,
      `- Nez : ${t.nez}`,
      `- Bouche : ${t.bouche}`,
      `- Finale : ${t.finale}`,
      `- Profil : sucré ${scale(t.sucre)} · fruité ${scale(t.fruite)} · fraîcheur ${scale(t.fraicheur)} · terreux ${scale(t.terreux)} · intensité aromatique ${scale(t.intensite)}`,
      `- Texture : ${t.texture}`,
      ...(t.genetique ? [`- Génétique : ${t.genetique}`] : []),
      `- Ambiances idéales : ${t.ambiances.join(", ")}`,
      `- Pour qui : ${t.pourQui}`,
      `- À éviter si : ${t.aEviterSi}`,
      `- Alternative : ${t.alternative}`
    );
  }
  if (o && p.category !== "gummies") {
    lines.push(
      `- Origine du lot ${p.lot} : cultivé à ${o.culture} (${o.mode}), récolte ${o.recolte}, transformé à ${o.fabrication}. Analyse labo : CBD ${o.cbd}, THC ${o.thc}.`
    );
  }
  if (p.category === "gummies") {
    lines.push(
      `- Article de collection Cookies (10 mg de Delta-9 THC par gomme, « ne pas consommer ») : ne jamais le proposer pour une humeur, un goût à déguster ou un moment.`
    );
  }
  return lines.join("\n");
}

/** Classements calculés à partir des notes, pour comparer vite */
export function rankings() {
  const rated = catalog.filter((p) => TASTING[p.slug] && p.stock !== "out");
  const top = (key: keyof Pick<Tasting, "sucre" | "fruite" | "fraicheur" | "terreux" | "intensite">, label: string, asc = false) => {
    const list = [...rated]
      .sort((a, b) => (asc ? TASTING[a.slug][key] - TASTING[b.slug][key] : TASTING[b.slug][key] - TASTING[a.slug][key]))
      .slice(0, 3)
      .map((p) => `${p.name} (${TASTING[p.slug][key]}/5)`);
    return `- ${label} : ${list.join(", ")}`;
  };
  const cheapest = [...rated].sort((a, b) => a.price - b.price).slice(0, 3).map((p) => `${p.name} (${formatPrice(p.price)})`);
  return [
    "# Classements rapides (produits disponibles)",
    top("sucre", "Les plus sucrés"),
    top("fruite", "Les plus fruités"),
    top("fraicheur", "Les plus frais et mentholés"),
    top("terreux", "Les plus terreux et boisés"),
    top("intensite", "Les plus intenses en arômes"),
    top("intensite", "Les plus doux et légers", true),
    `- Les moins chers : ${cheapest.join(", ")}`,
    "- Pour débuter : Huile CBD 10 % Spearmint, Bonhomme de Neige, Dry Sift (et Purple Punch si la personne adore le fruité)",
    "- Pour habitués : Static Mango, Sweet Soy",
  ].join("\n");
}
