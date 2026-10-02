import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Le guide" };

const ARTICLES = [
  {
    title: "Huile, gummies, fleur : quel format choisir ?",
    text: "L'huile permet de doser à la goutte près. Les gummies sont prêts à l'emploi et discrets. La fleur et la résine se destinent à l'infusion.",
  },
  {
    title: "Lire une analyse labo en 2 minutes",
    text: "Repérez le numéro de lot, le taux de CBD mesuré et la ligne THC : elle doit indiquer une valeur inférieure à 0,3 %.",
  },
  {
    title: "Comprendre le prix au milligramme",
    text: "Deux flacons au même prix peuvent contenir deux fois plus de CBD. Le prix au milligramme permet de comparer honnêtement.",
  },
  {
    title: "Commencer doucement",
    text: "Démarrez avec un faible dosage, toujours au même moment de la journée, et notez vos impressions pendant une semaine.",
  },
];

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-[880px] px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <h1 className="text-title">Le guide</h1>
      <p className="mt-2 text-muted">
        Des repères simples pour choisir en confiance. Nos contenus parlent de bien-être et ne remplacent pas
        l&apos;avis d&apos;un professionnel de santé.
      </p>
      <div className="mt-8 grid gap-4">
        {ARTICLES.map((a) => (
          <article key={a.title} className="rounded-lg border border-line bg-surface p-6 shadow-e1">
            <h2 className="text-subtitle">{a.title}</h2>
            <p className="mt-2 text-muted">{a.text}</p>
          </article>
        ))}
      </div>
      <div className="mt-8">
        <ButtonLink href="/quiz" icon={ArrowRight} iconPosition="end">
          Trouver mon CBD en 1 min
        </ButtonLink>
      </div>
    </div>
  );
}
