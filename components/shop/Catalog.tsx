"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Info, RotateCw, Sparkles, WifiOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/FilterChip";
import { useAdvisor } from "@/components/advisor/AdvisorProvider";
import { CATEGORY_LABELS, catalog, EDGE, getProduct, rankProducts, type Category } from "@/lib/data/products";
import { parseDemoState, rememberEdge } from "@/lib/demo";
import { readAnswers, recapOf, type QuizAnswers } from "@/lib/quiz";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import { SortMenu, type SortValue } from "./SortMenu";

type Mode = "results" | "boutique";
type Status = "loading" | "ready" | "error";

const FILTERS: Category[] = ["huile", "gummies", "fleur", "resine"];
const DEMO_EMPTY_FILTERS = ["Huile", "30 %", "Menthe"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

function Breadcrumb({ items }: { items: { href?: string; label: string }[] }) {
  return (
    <nav aria-label="Fil d'Ariane">
      <ol className="flex flex-wrap items-center gap-1.5 text-caption text-muted">
        {items.map((it, i) => (
          <li key={it.label} className="flex items-center gap-1.5">
            {it.href ? (
              <Link href={it.href} className="underline-offset-4 hover:text-ink hover:underline">
                {it.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink">
                {it.label}
              </span>
            )}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
export { Breadcrumb };

export function Catalog({ mode }: { mode: Mode }) {
  const params = useSearchParams();
  const demo = parseDemoState(params.get("state"));
  const q = mode === "boutique" ? params.get("q")?.trim() ?? "" : "";

  const [answers, setAnswers] = useState<QuizAnswers>({});
  const [status, setStatus] = useState<Status>("loading");
  const [category, setCategory] = useState<Category | "all">("all");
  const [sort, setSort] = useState<SortValue>("reco");
  const [demoFilters, setDemoFilters] = useState<string[]>(demo === "empty" ? DEMO_EMPTY_FILTERS : []);
  const advisor = useAdvisor();

  // Chargement simulé + états de démo
  useEffect(() => {
    setAnswers(readAnswers());
    try {
      const saved = sessionStorage.getItem(`seve-filter-${mode}`);
      if (saved) setCategory(saved as Category | "all");
    } catch {
      /* rien */
    }
    rememberEdge(demo === "edge");
    setDemoFilters(demo === "empty" ? DEMO_EMPTY_FILTERS : []);
    if (demo === "loading") {
      setStatus("loading");
      return;
    }
    setStatus("loading");
    const t = window.setTimeout(() => setStatus(demo === "error" ? "error" : "ready"), 450);
    return () => window.clearTimeout(t);
  }, [demo, mode]);

  const pickCategory = (c: Category | "all") => {
    setCategory(c);
    try {
      sessionStorage.setItem(`seve-filter-${mode}`, c);
    } catch {
      /* rien */
    }
  };

  const reload = useCallback(() => {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 900);
  }, []);

  const base = useMemo(() => {
    const list = mode === "results" ? rankProducts(catalog, answers) : catalog;
    if (!q) return list;
    const nq = normalize(q);
    return list.filter((p) => normalize(`${p.name} ${p.format} ${p.meta}`).includes(nq));
  }, [mode, answers, q]);

  const visible = useMemo(() => {
    let list = category === "all" ? base : base.filter((p) => p.category === category);
    if (demoFilters.includes("Menthe")) list = [];
    if (sort === "asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "desc") list = [...list].sort((a, b) => b.price - a.price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [base, category, sort, demoFilters]);

  const bestSlug = mode === "results" && sort === "reco" ? base[0]?.slug : undefined;
  const counts = (c: Category) => base.filter((p) => p.category === c).length;

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-5 md:px-8 md:pt-8">
      <Breadcrumb
        items={
          mode === "results"
            ? [{ href: "/", label: "Accueil" }, { href: "/quiz", label: "Trouver mon CBD" }, { label: "Résultats" }]
            : [{ href: "/", label: "Accueil" }, { label: "Boutique" }]
        }
      />

      <header className="mt-4 flex flex-col gap-2">
        {mode === "results" ? (
          <>
            <h1 className="text-title">Vos {base.length} produits adaptés</h1>
            <p className="text-body text-muted">
              D&apos;après vos réponses : <span className="text-ink">{recapOf(answers)}</span>
              <span className="mx-1.5 hidden md:inline" aria-hidden>
                ·
              </span>
              <Link href="/quiz?mode=rapide" className="flex min-h-11 w-fit items-center font-semibold text-ink underline underline-offset-4 md:inline-flex md:min-h-0">
                Modifier mes réponses
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-title">{q ? `Résultats pour « ${q} »` : "Toute la boutique"}</h1>
            <p className="text-body text-muted">
              {base.length} produit{base.length > 1 ? "s" : ""}, chacun analysé par un laboratoire indépendant.
              {q && (
                <>
                  {" "}
                  <Link href="/boutique" className="font-semibold text-ink underline underline-offset-4">
                    Effacer la recherche
                  </Link>
                </>
              )}
            </p>
          </>
        )}
      </header>

      {demo === "edge" && (
        <p className="mt-4 flex items-start gap-2 rounded-md border border-line bg-surface px-4 py-3 text-[14px] text-muted">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-ink" strokeWidth={2} />
          Démo Edge Case : ajoutez {getProduct(EDGE.product)?.name} au panier pour simuler une rupture pendant l&apos;ajout.
        </p>
      )}

      {/* Filtres + tri */}
      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          role="group"
          aria-label="Filtrer par format"
          className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1 md:mx-0 md:flex-wrap md:px-0"
        >
          {demoFilters.length > 0 ? (
            demoFilters.map((f) => (
              <FilterChip
                key={f}
                label={f}
                removable
                onClick={() => setDemoFilters((list) => list.filter((x) => x !== f))}
              />
            ))
          ) : (
            <>
              <FilterChip label="Tous" count={base.length} active={category === "all"} onClick={() => pickCategory("all")} />
              {FILTERS.map((c) => (
                <FilterChip
                  key={c}
                  label={CATEGORY_LABELS[c].plural}
                  count={counts(c)}
                  active={category === c}
                  onClick={() => pickCategory(c)}
                />
              ))}
            </>
          )}
        </div>
        <div className="flex justify-end">
          <SortMenu value={sort} onChange={setSort} />
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {status === "ready" ? `${visible.length} produit${visible.length > 1 ? "s" : ""} affiché${visible.length > 1 ? "s" : ""}` : status === "loading" ? "Chargement des produits" : ""}
      </p>

      {/* Contenu */}
      <section aria-label="Produits" aria-busy={status === "loading"} className="mt-6">
        {status === "loading" && (
          <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))] md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div
            role="alert"
            className="mx-auto flex max-w-xl flex-col items-center gap-3 rounded-lg border-2 border-alert bg-surface px-6 py-8 text-center"
          >
            <span className="grid size-12 place-items-center rounded-full bg-alert-bg text-alert">
              <WifiOff aria-hidden className="size-6" strokeWidth={2} />
            </span>
            <h2 className="font-sans text-[18px] font-bold text-alert">Connexion interrompue</h2>
            <p className="text-muted">
              Les produits n&apos;ont pas pu s&apos;afficher. Votre panier et vos filtres sont intacts.
            </p>
            <Button icon={RotateCw} onClick={reload} className="mt-2">
              Recharger les produits
            </Button>
          </div>
        )}

        {status === "ready" && visible.length === 0 && (
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3 py-8 text-center">
            <span aria-hidden className="grid size-16 place-items-center rounded-full bg-accent font-display text-[28px] font-light italic">
              0
            </span>
            {demoFilters.length > 0 ? (
              <>
                <h2 className="font-sans text-[18px] font-bold">Aucun produit ne correspond</h2>
                <p className="text-muted">
                  Aucun produit ne correspond à vos {demoFilters.length} filtre{demoFilters.length > 1 ? "s" : ""} (
                  {demoFilters.join(" · ")}). Vos critères sont conservés : retirez un filtre ou refaites le quiz (1
                  min).
                </p>
                <Button
                  className="mt-2"
                  onClick={() => setDemoFilters((list) => list.filter((x) => x !== "Menthe"))}
                >
                  Retirer le filtre « Menthe »
                </Button>
              </>
            ) : (
              <>
                <h2 className="font-sans text-[18px] font-bold">Aucun produit dans cette sélection</h2>
                <p className="text-muted">
                  {q
                    ? `Rien ne correspond à « ${q} ». Essayez un autre mot, ou laissez-vous guider par le quiz (1 min).`
                    : "Ce format n'est pas disponible pour le moment. Affichez tous les produits ou refaites le quiz (1 min)."}
                </p>
                {q ? (
                  <ButtonLink href="/boutique" className="mt-2">
                    Voir tous les produits
                  </ButtonLink>
                ) : (
                  <Button className="mt-2" onClick={() => pickCategory("all")}>
                    Voir tous les produits
                  </Button>
                )}
              </>
            )}
            <Link href="/quiz" className="inline-flex min-h-11 items-center font-semibold text-ink underline underline-offset-4">
              ou refaire le quiz (1 min)
            </Link>
          </div>
        )}

        {status === "ready" && visible.length > 0 && (
          <motion.ul layout className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))] md:gap-6">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((p, i) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: Math.min(i, 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProductCard product={p} bestChoice={p.slug === bestSlug} headingLevel="h2" />
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </section>

      {/* Aide au choix */}
      <aside
        aria-label="Aide au choix"
        className="mt-8 flex flex-col gap-4 rounded-lg bg-accent p-5 md:flex-row md:items-center md:justify-between md:px-6"
      >
        <p className="text-body">
          <span className="font-semibold">Besoin d&apos;aide pour choisir ?</span> Notre conseiller IA vous répond en
          quelques secondes, selon vos goûts et votre humeur du moment.
        </p>
        <Button
          variant="secondary"
          icon={Sparkles}
          onClick={() =>
            advisor.open(
              mode === "results" ? `D'après mon quiz je suis : ${recapOf(answers)}. Que me conseillez-vous ?` : undefined
            )
          }
          className="shrink-0"
        >
          Demander au conseiller
        </Button>
      </aside>

    </div>
  );
}
