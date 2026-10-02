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

## Conseiller IA (Mistral)

- Clé dans `.env.local` (jamais commitée) : `MISTRAL_API_KEY=...` et `MISTRAL_MODEL=open-mistral-nemo` (voir `.env.example`).
- Route serveur : `app/api/conseiller/route.ts` (flux texte, repli automatique entre modèles si le quota est atteint).
- Prompt : `lib/advisor/prompt.ts`, généré à partir du catalogue (`lib/data/products.ts`) : ajouter un produit le rend connu de l'agent.
- L'agent répond uniquement sur le choix d'un CBD Sève, pose une question à la fois avec des réponses rapides `[[choix: …]]`
  et affiche des fiches produits avec `[[slug]]`. Aucune allégation de santé.
- Accès : bouton flottant « Conseiller IA », page « Trouver mon CBD » (mode par défaut), bloc d'aide des résultats, accueil.

## Diaporama d'accueil

Déposer les images dans `public/hero/` et les ajouter dans `lib/data/hero.ts`.
