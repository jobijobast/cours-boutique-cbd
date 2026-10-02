"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { HeroSlideshow } from "./HeroSlideshow";
import { useAdvisor } from "@/components/advisor/AdvisorProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: EASE },
});

export function HomeHero() {
  const advisor = useAdvisor();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const parallax = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  return (
    <section ref={ref} className="relative lg:h-[min(680px,calc(100dvh-120px))] lg:min-h-[560px]">
      {/* Image : en haut sur mobile, plein cadre derrière le texte sur ordinateur */}
      <motion.div style={{ y: parallax }} className="relative aspect-[16/10] sm:aspect-[16/8] lg:absolute lg:inset-0 lg:aspect-auto">
        <HeroSlideshow className="absolute inset-0" />
      </motion.div>

      <div className="relative mx-auto flex h-full max-w-[1280px] items-center px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="-mt-10 flex w-full flex-col gap-5 rounded-lg bg-page p-6 shadow-e2 sm:-mt-16 md:p-8 lg:mt-0 lg:max-w-[540px] lg:bg-page/90 lg:shadow-e3"
        >
          <motion.p {...fadeUp(0.25)} className="text-caption font-semibold uppercase tracking-[0.08em] text-muted">
            CBD premium · 100 % transparent
          </motion.p>
          <h1 className="text-[32px] leading-[1.08] md:text-[48px]">
            {["Le CBD qui vous", "correspond, sans", "zone d'ombre."].map((line, i) => (
              <span key={line} className="block overflow-hidden pb-1">
                <motion.span
                  className="block"
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: EASE }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p {...fadeUp(0.6)} className="text-body text-muted md:text-[17px]">
            Trois questions pour trouver le produit adapté à votre routine, ou laissez notre conseiller IA vous guider
            selon votre humeur. Chaque lot est analysé, chaque prix est affiché au gramme ou au milligramme.
          </motion.p>
          <motion.div {...fadeUp(0.7)} className="mt-1 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/quiz" size="lg" icon={ArrowRight} iconPosition="end" className="w-full sm:w-auto">
              Trouver mon CBD en 1 min
            </ButtonLink>
            <button
              type="button"
              onClick={() => advisor.open()}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill border-2 border-action bg-surface px-6 font-semibold text-ink transition-colors duration-200 hover:bg-action-tint active:scale-[0.98] sm:w-auto"
            >
              <Sparkles aria-hidden className="size-5" strokeWidth={2} />
              Conseiller IA
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function AdvisorBanner() {
  const advisor = useAdvisor();
  const prompts = ["Envie de fraîcheur cet après-midi", "Soirée cocooning, j'aime les fruits rouges", "Je débute, budget 15 €"];
  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-surface p-6 shadow-e1 md:p-10">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-accent"
        animate={{ scale: [1, 1.12, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="relative flex flex-col gap-4 md:max-w-2xl">
        <span className="inline-flex w-fit items-center gap-2 rounded-pill bg-accent px-3 py-1 text-caption font-semibold">
          <Sparkles aria-hidden className="size-4" strokeWidth={2} />
          Nouveau · Conseiller IA
        </span>
        <h2 className="text-title">Dites-nous votre humeur, on vous trouve le bon produit.</h2>
        <p className="text-muted">
          Saveurs fruitées ou fraîches, moment calme ou pause dans la journée : le conseiller Sève connaît chaque produit
          et ses analyses. Il vous répond en quelques secondes, sans jargon et sans avis médical.
        </p>
        <div className="flex flex-wrap gap-2">
          {prompts.map((p) => (
            <motion.button
              key={p}
              type="button"
              onClick={() => advisor.open(p)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="min-h-11 rounded-pill border-2 border-line bg-page px-4 text-[15px] font-medium text-ink transition-colors hover:border-action hover:bg-action-tint"
            >
              « {p} »
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
