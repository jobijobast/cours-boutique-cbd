"use client";

import Link from "next/link";
import { ArrowRight, RotateCcw, ShoppingBag, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChatComposer, ChatMessages, useAdvisorChat } from "@/components/advisor/chat";
import { useShop } from "@/components/shop/ShopProvider";
import { getProduct, type Product } from "@/lib/data/products";

/** Délai pendant lequel la personne voit la recommandation et peut annuler l'ajout */
const AUTO_ADD_MS = 2500;

/** Premier produit recommandé dans une réponse : disponible et hors articles de collection */
function firstRecommended(content: string): Product | undefined {
  for (const m of content.matchAll(/\[\[([a-z0-9-]+)\]\]/g)) {
    const p = getProduct(m[1]);
    if (p && p.stock !== "out" && p.category !== "gummies") return p;
  }
  return undefined;
}

/** Première question posée sans appel réseau ; la réponse est envoyée avec son contexte */
const FIRST_QUESTION = "Quelle est votre humeur du moment ?";
const FIRST_CHOICES = ["Envie de me détendre", "Besoin d'une pause", "Envie de fraîcheur", "Curieux de découvrir"];

export function AdvisorQuiz() {
  const reduce = useReducedMotion();
  const chat = useAdvisorChat("seve-quiz-advisor");
  const endRef = useRef<HTMLDivElement>(null);
  const started = chat.messages.length > 0;
  const hasReco = chat.messages.some((m) => m.role === "assistant" && /\[\[[a-z0-9-]+\]\]/.test(m.content));

  useEffect(() => {
    if (!started) return;
    // Garde le dernier message visible au-dessus de la zone de saisie collante
    endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  }, [chat.messages, started, reduce]);

  // Question arrivant d'un autre écran (?q=…) : envoyée une seule fois, puis retirée de l'URL
  const params = useSearchParams();
  const router = useRouter();
  const incoming = params.get("q");
  const { hydrated, send } = chat;
  const sentRef = useRef<string | null>(null);
  useEffect(() => {
    if (!hydrated || !incoming || sentRef.current === incoming) return;
    sentRef.current = incoming;
    router.replace("/quiz", { scroll: false });
    void send(incoming);
  }, [hydrated, incoming, router, send]);

  // Recommandation terminée → ajout automatique au panier (annulable), puis page panier
  const { addToCart } = useShop();
  const [pending, setPending] = useState<Product | null>(null);
  const seenRef = useRef<Set<number> | null>(null);
  const { messages, busy } = chat;
  useEffect(() => {
    if (!hydrated) return;
    // Les messages déjà présents au chargement (conversation reprise) ne déclenchent rien
    if (!seenRef.current) {
      seenRef.current = new Set(messages.map((m) => m.id));
      return;
    }
    if (busy) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant" || last.error || seenRef.current.has(last.id)) return;
    seenRef.current.add(last.id);
    const product = firstRecommended(last.content);
    if (product) setPending(product);
  }, [hydrated, busy, messages]);

  useEffect(() => {
    if (!pending) return;
    const t = window.setTimeout(() => {
      addToCart(pending.slug, { recommended: true });
      setPending(null);
    }, AUTO_ADD_MS);
    return () => window.clearTimeout(t);
  }, [pending, addToCart]);

  const pickFirst = (choice: string) => chat.send(`${FIRST_QUESTION} ${choice}`, choice);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-caption font-medium text-muted">
          <span className="relative grid size-8 place-items-center rounded-full bg-action text-on-action">
            <Sparkles aria-hidden className="size-4" strokeWidth={2} />
            <span aria-hidden className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-page bg-success" />
          </span>
          Conseiller Sève · 3 questions, environ 1 min
        </p>
        {started && (
          <button
            type="button"
            onClick={chat.reset}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-[14px] font-semibold text-ink transition-colors hover:bg-action-tint"
          >
            <RotateCcw aria-hidden className="size-4" strokeWidth={2} />
            Recommencer
          </button>
        )}
      </div>

      <div role="log" aria-live="polite" aria-busy={chat.busy} className="flex flex-col gap-3">
        <ChatMessages
          chat={chat}
          large
          intro={
            <>
              <p>
                Bonjour, je suis le conseiller Sève. En trois questions simples, je trouve le produit qui correspond à vos
                goûts et à votre humeur. Vous pouvez aussi m&apos;écrire librement.
              </p>
              <p className="mt-2 font-semibold">{FIRST_QUESTION}</p>
            </>
          }
          suggestions={FIRST_CHOICES}
          onSuggestion={pickFirst}
        />
      </div>

      <AnimatePresence>
        {pending && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="overflow-hidden rounded-lg border-2 border-action bg-surface shadow-e2"
          >
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent">
                <ShoppingBag aria-hidden className="size-5" strokeWidth={2} />
              </span>
              <p className="flex-1 text-[15px]">
                <span className="font-semibold">{pending.name}</span> est ajouté à votre panier, puis nous vous y
                emmenons.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    addToCart(pending.slug, { recommended: true });
                    setPending(null);
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-action px-4 text-[14px] font-semibold text-ink transition-colors hover:bg-action-tint"
                >
                  Y aller maintenant
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-pill px-3 text-[14px] font-semibold text-muted transition-colors hover:bg-action-tint hover:text-ink"
                >
                  <X aria-hidden className="size-4" strokeWidth={2} />
                  Annuler
                </button>
              </div>
            </div>
            {/* Barre de temps : montre quand l'ajout aura lieu */}
            <motion.div
              aria-hidden
              className="h-1 origin-left bg-action"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_ADD_MS / 1000, ease: "linear" }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {hasReco && !chat.busy && !pending && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-[15px] text-muted">Envie de comparer avec tout le catalogue ?</p>
          <Link
            href="/boutique"
            className="group inline-flex min-h-11 items-center gap-1.5 font-semibold text-ink underline-offset-4 hover:underline"
          >
            Voir tous nos produits
            <ArrowRight aria-hidden className="size-5 transition-transform group-hover:translate-x-1" strokeWidth={2} />
          </Link>
        </motion.div>
      )}

      <div ref={endRef} aria-hidden className="h-px" />

      <div className="sticky bottom-[72px] z-10 rounded-lg border border-line bg-surface p-3 shadow-e2 lg:bottom-4">
        <ChatComposer chat={chat} id="quiz-advisor-input" placeholder="Répondez ou décrivez votre envie…" />
      </div>
    </div>
  );
}
