import Link from "next/link";
import { ArrowRight, FlaskConical, Package, ShieldCheck } from "lucide-react";
import { AdvisorBanner, HomeHero } from "@/components/home/HomeHero";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import { getProduct } from "@/lib/data/products";

const STEPS = [
  { n: "1", title: "Répondez à 3 questions", text: "Votre expérience, votre moment, votre budget. 1 minute." },
  { n: "2", title: "Comparez en toute clarté", text: "Dosage, prix au gramme ou au milligramme et analyse labo de chaque lot." },
  { n: "3", title: "Recevez sous 48 h", text: "Colis neutre, sans mention du contenu à l'extérieur." },
];

const PROMISES = [
  {
    icon: FlaskConical,
    title: "Analyse labo sur chaque lot",
    text: "Le rapport du laboratoire indépendant est téléchargeable depuis chaque fiche produit.",
  },
  {
    icon: ShieldCheck,
    title: "THC < 0,3 %",
    text: "Conforme à la réglementation française, vérifié lot par lot.",
  },
  {
    icon: Package,
    title: "Livraison discrète",
    text: "Point relais offert, domicile offert dès 50 €. Emballage sans marque visible.",
  },
];

const FAVORITES = ["purple-punch", "bonhomme-de-neige", "huile-cbd-10-spearmint"];

export default function HomePage() {
  return (
    <>
      <HomeHero />

      <section aria-labelledby="comment" className="border-y border-line bg-surface">
        <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-8 md:py-16">
          <Reveal>
            <h2 id="comment" className="text-subtitle">
              Comment ça marche
            </h2>
          </Reveal>
          <Stagger as="ol" className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s) => (
              <StaggerItem
                as="li"
                key={s.n}
                className="flex gap-4 rounded-lg border border-line bg-page p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-e2"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent font-display text-[19px] font-semibold">
                  {s.n}
                </span>
                <div>
                  <h3 className="font-sans text-[16px] font-bold">{s.title}</h3>
                  <p className="mt-1 text-[15px] text-muted">{s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section aria-labelledby="coups-de-coeur" className="mx-auto max-w-[1280px] px-4 py-12 md:px-8 md:py-16">
        <Reveal className="flex items-end justify-between gap-4">
          <h2 id="coups-de-coeur" className="text-subtitle">
            Nos coups de cœur
          </h2>
          <Link
            href="/boutique"
            className="group inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
          >
            Tous nos produits
            <ArrowRight aria-hidden className="size-5 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </Reveal>
        <Stagger as="ul" className="mt-6 grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))] md:gap-6">
          {FAVORITES.map((slug) => (
            <StaggerItem as="li" key={slug}>
              <ProductCard product={getProduct(slug)!} />
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section aria-label="Conseiller IA" className="mx-auto max-w-[1280px] px-4 md:px-8">
        <Reveal>
          <AdvisorBanner />
        </Reveal>
      </section>

      <section aria-labelledby="promesses" className="mx-auto max-w-[1280px] px-4 py-12 md:px-8 md:py-16">
        <Reveal>
          <h2 id="promesses" className="text-subtitle">
            Nos engagements
          </h2>
        </Reveal>
        <Stagger as="ul" className="mt-6 grid gap-4 md:grid-cols-3">
          {PROMISES.map(({ icon: Icon, title, text }) => (
            <StaggerItem
              as="li"
              key={title}
              className="group rounded-lg border border-line bg-surface p-6 shadow-e1 transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-action hover:shadow-e2"
            >
              <span className="grid size-11 place-items-center rounded-full bg-accent transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-6deg]">
                <Icon aria-hidden className="size-6 text-ink" strokeWidth={2} />
              </span>
              <h3 className="mt-3 text-[19px]">{title}</h3>
              <p className="mt-1 text-[15px] text-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </section>
    </>
  );
}
