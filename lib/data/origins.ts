/**
 * Traçabilité par lot — LIEUX ET ACTEURS FICTIFS (prototype pédagogique).
 * Utilisée par la fiche produit et par le générateur de rapports PDF (scripts/generate-reports.ts).
 */
export type LotOrigin = {
  /** Où la plante a poussé */
  culture: string;
  mode: string;
  recolte: string;
  /** Où le produit a été transformé / fabriqué */
  fabrication: string;
  conditionnement: string;
  analyse: string;
  /** Résultats affichés dans le rapport */
  cbd: string;
  thc: string;
  cbg: string;
};

const LABO = "14 mars 2026";

export const ORIGINS: Record<string, LotOrigin> = {
  "huile-cbd-10-spearmint": {
    culture: "Ferme des Trois Collines, Lectoure (Gers)",
    mode: "Plein champ, agriculture raisonnée",
    recolte: "Septembre 2025",
    fabrication: "Atelier d'extraction CO2 des Collines, Valence (Drôme)",
    conditionnement: "Cookies (flacon et étui), contrôle Sève à Lyon (Rhône)",
    analyse: LABO,
    cbd: "10,1 % (3 030 mg / 30 ml)",
    thc: "0,08 %",
    cbg: "0,3 %",
  },
  "bonhomme-de-neige": {
    culture: "Serres du Val de Loire, Saumur (Maine-et-Loire)",
    mode: "Culture indoor, éclairage LED",
    recolte: "Janvier 2026",
    fabrication: "Séchage et manucure à la main, Saumur",
    conditionnement: "Atelier Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "10,59 %",
    thc: "0,21 %",
    cbg: "0,6 %",
  },
  "purple-punch": {
    culture: "Domaine des Lavandes Hautes, Sault (Vaucluse)",
    mode: "Culture indoor, éclairage LED",
    recolte: "Décembre 2025",
    fabrication: "Séchage lent en chambre ventilée, Sault",
    conditionnement: "Atelier Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "13,82 %",
    thc: "0,24 %",
    cbg: "0,8 %",
  },
  "sweet-soy": {
    culture: "Serres de la Vallée du Lot, Cahors (Lot)",
    mode: "Culture indoor, substrat organique",
    recolte: "Janvier 2026",
    fabrication: "Séchage et affinage, Cahors",
    conditionnement: "Atelier Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "10,65 %",
    thc: "0,19 %",
    cbg: "0,5 %",
  },
  "static-mango": {
    culture: "Ferme du Pic Saint-Loup, Saint-Martin-de-Londres (Hérault)",
    mode: "Plein champ",
    recolte: "Octobre 2025",
    fabrication: "Laboratoire d'extraction Garrigues, Montpellier (Hérault)",
    conditionnement: "Atelier Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "79,94 %",
    thc: "0,22 %",
    cbg: "2,1 %",
  },
  "dry-sift": {
    culture: "Ferme des Grands Pins, Mimizan (Landes)",
    mode: "Plein champ",
    recolte: "Septembre 2025",
    fabrication: "Tamisage à sec, Atelier des Pins, Bordeaux (Gironde)",
    conditionnement: "Atelier Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "14,66 %",
    thc: "0,18 %",
    cbg: "0,9 %",
  },
  "ice-o-lator": {
    culture: "Ferme du Vercors, Villard-de-Lans (Isère)",
    mode: "Plein champ, altitude 1 000 m",
    recolte: "Septembre 2025",
    fabrication: "Extraction à l'eau glacée, Atelier Alpin, Grenoble (Isère)",
    conditionnement: "Atelier Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "29,43 %",
    thc: "0,23 %",
    cbg: "1,4 %",
  },
  "gummies-huckleberry-gelato": {
    culture: "Chanvre importé, origine déclarée Oregon (États-Unis)",
    mode: "Non communiqué par le fabricant",
    recolte: "2025",
    fabrication: "Cookies, Californie (États-Unis)",
    conditionnement: "Import et contrôle Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "Non dosé (article de collection)",
    thc: "< 0,3 % en masse (10 mg Delta-9 THC par gomme déclarés)",
    cbg: "Non dosé",
  },
  "gummies-london-pound-cake": {
    culture: "Chanvre importé, origine déclarée Oregon (États-Unis)",
    mode: "Non communiqué par le fabricant",
    recolte: "2025",
    fabrication: "Cookies, Californie (États-Unis)",
    conditionnement: "Import et contrôle Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "Non dosé (article de collection)",
    thc: "< 0,3 % en masse (10 mg Delta-9 THC par gomme déclarés)",
    cbg: "Non dosé",
  },
  "gummies-tahitian-lime": {
    culture: "Chanvre importé, origine déclarée Oregon (États-Unis)",
    mode: "Non communiqué par le fabricant",
    recolte: "2025",
    fabrication: "Cookies, Californie (États-Unis)",
    conditionnement: "Import et contrôle Sève, Lyon (Rhône)",
    analyse: LABO,
    cbd: "Non dosé (article de collection)",
    thc: "< 0,3 % en masse (10 mg Delta-9 THC par gomme déclarés)",
    cbg: "Non dosé",
  },
};

export const LAB_NAME = "Laboratoire Rhône Analyses Végétales, Villeurbanne";

export function getOrigin(slug: string): LotOrigin | undefined {
  return ORIGINS[slug];
}
