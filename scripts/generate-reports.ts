/**
 * Génère un rapport d'analyse PDF par lot dans public/analyses/<lot>.pdf
 * Données : lib/data/products.ts + lib/data/origins.ts (lieux et laboratoire FICTIFS).
 * Lancer : npm run reports
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFDocument, rgb, StandardFonts, degrees, type PDFFont, type PDFPage } from "pdf-lib";
import { CATEGORY_LABELS, products } from "../lib/data/products";
import { LAB_NAME, ORIGINS } from "../lib/data/origins";

const hex = (h: string) => {
  const n = parseInt(h.slice(1), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
};
// Mêmes valeurs que les primitives du design system
const C = {
  olive: hex("#2F4A3A"),
  accent: hex("#ECF1EA"),
  sable: hex("#FAF7F2"),
  confiance: hex("#F3ECE0"),
  ink: hex("#1C1B19"),
  muted: hex("#66615A"),
  line: hex("#E3DDD2"),
  success: hex("#296640"),
  white: rgb(1, 1, 1),
};

const W = 595;
const H = 842;
const M = 48;

/** Remplace les caractères absents de l'encodage WinAnsi des polices standard */
const safe = (s: string) =>
  s
    .replace(/[  ]/g, " ")
    .replace(/[‐-‒‑]/g, "-")
    .replace(/’/g, "'")
    .replace(/Δ/g, "Delta ");

function wrap(text: string, font: PDFFont, size: number, max: number) {
  const words = safe(text).split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (font.widthOfTextAtSize(test, size) > max && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Sceau « Sève Qualité Contrôlée » dessiné en vectoriel (label interne fictif) */
function drawSeal(page: PDFPage, cx: number, cy: number, r: number, bold: PDFFont, serif: PDFFont) {
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2;
    page.drawCircle({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, size: r * 0.06, color: C.olive });
  }
  page.drawCircle({ x: cx, y: cy, size: r, color: C.olive });
  page.drawCircle({ x: cx, y: cy, size: r * 0.91, color: C.accent });
  page.drawCircle({ x: cx, y: cy, size: r * 0.875, borderColor: C.olive, borderWidth: 0.8 });
  page.drawCircle({ x: cx, y: cy, size: r * 0.57, borderColor: C.olive, borderWidth: 0.8 });

  // Texte circulaire, lettre par lettre
  const label = "SEVE · QUALITE CONTROLEE · LOT ANALYSE · ";
  const size = r * 0.15;
  const rr = r * 0.7;
  const step = 360 / label.length;
  [...label].forEach((ch, i) => {
    const angDeg = 90 - i * step;
    const a = (angDeg * Math.PI) / 180;
    const cw = bold.widthOfTextAtSize(ch, size);
    page.drawText(ch, {
      x: cx + Math.cos(a) * rr - (Math.cos(a - Math.PI / 2) * cw) / 2,
      y: cy + Math.sin(a) * rr - (Math.sin(a - Math.PI / 2) * cw) / 2,
      size,
      font: bold,
      color: C.olive,
      rotate: degrees(angDeg - 90),
    });
  });

  // Coche
  const s = r * 0.22;
  page.drawLine({ start: { x: cx - s, y: cy + s * 0.15 }, end: { x: cx - s * 0.25, y: cy - s * 0.6 }, thickness: r * 0.08, color: C.olive });
  page.drawLine({ start: { x: cx - s * 0.25, y: cy - s * 0.6 }, end: { x: cx + s * 1.05, y: cy + s * 0.8 }, thickness: r * 0.08, color: C.olive });
  const name = "Seve";
  page.drawText(name, {
    x: cx - serif.widthOfTextAtSize(name, r * 0.2) / 2,
    y: cy - r * 0.45,
    size: r * 0.2,
    font: serif,
    color: C.olive,
  });
}

async function build() {
  const outDir = join(process.cwd(), "public", "analyses");
  mkdirSync(outDir, { recursive: true });

  for (const p of products) {
    const o = ORIGINS[p.slug];
    if (!o) continue;

    const pdf = await PDFDocument.create();
    pdf.setTitle(`Rapport d'analyse - ${p.name} - Lot ${p.lot}`);
    pdf.setAuthor("Sève (document de démonstration)");
    pdf.setSubject("Rapport d'analyse fictif, prototype pédagogique");
    const page = pdf.addPage([W, H]);
    const reg = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const serif = await pdf.embedFont(StandardFonts.TimesRomanItalic);
    const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);

    const text = (t: string, x: number, y: number, size: number, font = reg, color = C.ink) =>
      page.drawText(safe(t), { x, y, size, font, color });

    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.sable });

    // En-tête
    page.drawRectangle({ x: 0, y: H - 104, width: W, height: 104, color: C.olive });
    text("Sève", M, H - 62, 34, serif, C.white);
    text("CBD premium · 100 % transparent", M, H - 82, 9.5, reg, C.accent);
    const t1 = "RAPPORT D'ANALYSE";
    text(t1, W - M - bold.widthOfTextAtSize(t1, 10), H - 50, 10, bold, C.accent);
    const t2 = `Lot ${p.lot}`;
    text(t2, W - M - bold.widthOfTextAtSize(t2, 22), H - 76, 22, bold, C.white);

    // Bandeau démonstration
    page.drawRectangle({ x: 0, y: H - 126, width: W, height: 22, color: C.confiance });
    text(
      "Document de démonstration · produits réels, lieux de culture, laboratoire et résultats FICTIFS (prototype pédagogique)",
      M,
      H - 119,
      7.8,
      reg,
      C.muted
    );

    // Produit + sceau
    let y = H - 168;
    text(p.name, M, y, 22, serifBold);
    y -= 18;
    text(`${CATEGORY_LABELS[p.category].singular} · ${p.meta}`, M, y, 10, reg, C.muted);
    y -= 15;
    text(`Date d'analyse : ${o.analyse}  ·  Laboratoire : ${LAB_NAME}`, M, y, 9, reg, C.muted);
    drawSeal(page, W - M - 46, H - 186, 46, bold, serif);

    // Traçabilité
    y -= 34;
    const section = (title: string) => {
      text(title.toUpperCase(), M, y, 9, bold, C.olive);
      y -= 8;
      page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.8, color: C.line });
      y -= 16;
    };
    section("Traçabilité du lot");
    const rows: [string, string][] = [
      ["Lieu de culture", o.culture],
      ["Mode de culture", o.mode],
      ["Récolte", o.recolte],
      ["Lieu de fabrication", o.fabrication],
      ["Conditionnement", o.conditionnement],
    ];
    for (const [k, v] of rows) {
      text(k, M, y, 9.5, bold, C.muted);
      const lines = wrap(v, reg, 10, W - M * 2 - 140);
      lines.forEach((l, i) => text(l, M + 140, y - i * 13, 10));
      y -= Math.max(1, lines.length) * 13 + 7;
    }

    // Résultats
    y -= 14;
    section("Résultats d'analyse");
    const cols = [M, M + 190, M + 330, M + 430];
    const head = ["Paramètre", "Résultat", "Limite", "Conformité"];
    page.drawRectangle({ x: M, y: y - 6, width: W - M * 2, height: 20, color: C.accent });
    head.forEach((h, i) => text(h, cols[i] + 6, y, 9, bold, C.olive));
    y -= 24;
    const results: [string, string, string, string][] = [
      ["CBD total", o.cbd, "-", "Mesuré"],
      ["THC (Delta-9)", o.thc, "< 0,3 %", "Conforme"],
      ["CBG", o.cbg, "-", "Mesuré"],
      ["Pesticides (500 molécules)", "Non détectés", "LMR UE", "Conforme"],
      ["Métaux lourds (Pb, Cd, Hg, As)", "Sous les seuils", "Règl. UE", "Conforme"],
      ["Solvants résiduels", "Non détectés", "-", "Conforme"],
      ["Microbiologie", "Conforme", "Ph. Eur.", "Conforme"],
    ];
    results.forEach(([a, b, c, d], i) => {
      if (i % 2 === 1) page.drawRectangle({ x: M, y: y - 7, width: W - M * 2, height: 21, color: C.white });
      text(a, cols[0] + 6, y, 9.5);
      const lines = wrap(b, reg, 9.5, 132);
      lines.forEach((l, j) => text(l, cols[1] + 6, y - j * 11, 9.5));
      text(c, cols[2] + 6, y, 9.5, reg, C.muted);
      text(d, cols[3] + 6, y, 9.5, bold, d === "Conforme" ? C.success : C.ink);
      y -= Math.max(21, lines.length * 11 + 10);
    });

    // Conclusion
    y -= 16;
    page.drawRectangle({ x: M, y: y - 34, width: W - M * 2, height: 48, color: C.accent, borderColor: C.olive, borderWidth: 0.8 });
    text("Conclusion", M + 14, y - 2, 10.5, bold, C.olive);
    text(
      p.category === "gummies"
        ? "Article de collection importé. Contrôle documentaire et étiquetage vérifiés par Sève."
        : "Lot conforme : THC inférieur à 0,3 %, absence de pesticides et de solvants, métaux lourds sous les seuils.",
      M + 14,
      y - 20,
      9.5
    );

    // Signature + pied de page
    text("Visa qualité : C. Martin, responsable qualité Sève (fictif)", M, 92, 9, reg, C.muted);
    text(`Analyse : ${LAB_NAME} (fictif)`, M, 78, 9, reg, C.muted);
    page.drawLine({ start: { x: M, y: 58 }, end: { x: W - M, y: 58 }, thickness: 0.8, color: C.line });
    text(
      "Sève · Ce document illustre la transparence visée par la boutique. Il ne constitue pas un certificat d'analyse réel.",
      M,
      42,
      7.8,
      reg,
      C.muted
    );

    const bytes = await pdf.save();
    writeFileSync(join(outDir, `${p.lot}.pdf`), bytes);
    console.log(`✓ ${p.lot}.pdf  (${p.name})`);
  }
}

build().catch((e) => {
  console.error(e);
  process.exit(1);
});
