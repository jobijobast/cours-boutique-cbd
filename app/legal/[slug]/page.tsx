import type { Metadata } from "next";
import { notFound } from "next/navigation";

const PAGES: Record<string, { title: string; body: string[] }> = {
  "mentions-legales": {
    title: "Mentions légales",
    body: [
      "Sève est un prototype de boutique en ligne réalisé dans un cadre pédagogique. Aucune vente réelle n'est effectuée.",
      "Éditeur : projet étudiant Eugenia. Hébergement : environnement de démonstration.",
    ],
  },
  cgv: {
    title: "Conditions générales de vente",
    body: [
      "La vente de produits au CBD est réservée aux personnes majeures. Chaque produit contient moins de 0,3 % de THC, conformément à la réglementation française.",
      "Les produits Sève ne sont pas des médicaments et ne revendiquent aucune propriété thérapeutique.",
      "Vous disposez d'un délai de rétractation de 14 jours pour tout produit non ouvert.",
    ],
  },
  confidentialite: {
    title: "Politique de confidentialité",
    body: [
      "Nous collectons uniquement les données nécessaires à votre commande : nom, adresse de livraison et e-mail de suivi.",
      "Dans ce prototype, aucune donnée n'est transmise : tout reste dans votre navigateur.",
    ],
  },
  cookies: {
    title: "Cookies",
    body: [
      "Les cookies nécessaires (panier, vérification d'âge) sont toujours actifs.",
      "Les cookies de mesure d'audience ne sont déposés qu'avec votre accord. Refuser a exactement le même effet sur votre navigation qu'accepter.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: PAGES[slug]?.title ?? "Page introuvable" };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <div className="mx-auto max-w-[760px] px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <h1 className="text-title">{page.title}</h1>
      <div className="mt-6 flex flex-col gap-4 text-body">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
