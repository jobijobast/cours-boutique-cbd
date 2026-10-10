# Sève — prototype e-commerce CBD

Preview front-end cliquable du Happy Path (desktop 1440 et mobile 390), construit d'après le fichier Figma du TP
(A5 états, A6 écran clé, A7 parcours, A8 mobile, TP01 → TP20). Données fictives, aucun paiement réel.

## Lancer

```bash
npm install
npm run dev
```

Puis ouvrir http://localhost:3000.

## Happy Path

1. `/` — porte 18+ (mémorisée), bandeau cookies (Refuser aussi visible qu'Accepter)
2. `/quiz` — 3 questions (expérience, moment, budget) avec progression
3. `/resultats` — écran clé : récapitulatif, filtres, tri, grille, aide au choix
4. `/produit/[slug]` — visuel, badge THC, rapport labo PDF, quantité, ajout
5. `/panier` — toast d'ajout, quantité max 4, livraison offerte dès 50 €, « Vider le panier » avec confirmation
6. `/paiement` — Coordonnées → Livraison → Paiement (carte de test •••• 4242)
7. `/confirmation` — « Commande validée ! »

## États de démonstration

| URL | État |
| --- | --- |
| `/resultats?state=loading` | Chargement (cartes squelettes) |
| `/resultats?state=empty` | Aucun résultat (3 filtres, retirer « Menthe ») |
| `/resultats?state=error` | Connexion interrompue + recharger |
| `/resultats?state=edge` | Rupture pendant l'ajout de Purple Punch, alternative Bonhomme de Neige |

`/design-system` présente tous les tokens, composants et variantes.

## Structure

- `app/globals.css` — tokens (primitives → rôles), mode clair/sombre, typo responsive
- `components/ui` — Button, Field, Checkbox/Radio/Toggle, FilterChip, Modal, Toast, QtyStepper
- `components/shop` — ProductCard, Catalog, SortMenu, ShopProvider (ajout, rupture, panneau mobile)
- `components/layout` — Header, TrustBanner, TabBar, Footer, AgeGate, CookieBanner
- `lib/data/products.ts` — données fictives ; `lib/cart.tsx` — panier (contexte + localStorage)

## Conseillers IA (Gemini, secours Mistral)

- Clés dans `.env.local` (jamais commitée), voir `.env.example` :
  `GEMINI_API_KEY` + `GEMINI_MODEL=gemini-2.5-flash` (principal), `MISTRAL_API_KEY` (secours facultatif).
- Route serveur : `app/api/conseiller/route.ts` (API compatible OpenAI, flux texte, repli automatique si quota atteint).
- Deux agents :
  - **Conseil produit** (`lib/advisor/prompt.ts` + fiches de dégustation `lib/advisor/knowledge.ts`) sur « Trouver mon CBD ».
    Une fois la recommandation faite, le produit est ajouté au panier (annulable) et la page panier s'ouvre.
  - **Service après-vente** (`lib/advisor/sav.ts`) : bouton flottant « Service client ».
- Les deux refusent le hors-sujet, n'émettent aucune allégation de santé et renvoient vers un professionnel pour toute question médicale.

## Diaporama d'accueil

Déposer les images dans `public/hero/` et les ajouter dans `lib/data/hero.ts`.
