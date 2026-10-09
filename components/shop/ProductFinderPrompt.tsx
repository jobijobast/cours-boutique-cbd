"use client";

import { ArrowLeft, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { AGE_EVENT, AGE_KEY } from "@/components/layout/AgeGate";
import { QUIZ_STEPS, saveAnswers, type QuizAnswers } from "@/lib/quiz";
import { readStorage } from "@/lib/storage";

const DISMISS_KEY = "seve-finder-dismissed";

/**
 * Petit pop-up à l'arrivée sur « Nos produits » : 3 questions en un clic
 * pour proposer les produits les plus adaptés. Se ferme très facilement
 * (croix, « Non merci », Échap, clic à côté) et ne revient pas pendant la session.
 */
export function ProductFinderPrompt() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = sessionStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* rien */
    }
    if (dismissed) return;

    let timer: number | undefined;
    const schedule = () => {
      // Jamais par-dessus la porte 18+ : on attend qu'elle soit validée
      if (readStorage<string | null>(AGE_KEY, null) !== "yes") return;
      // Pas de pop-up quand on arrive depuis la recherche
      if (new URLSearchParams(window.location.search).get("q")) return;
      timer = window.setTimeout(() => setOpen(true), 900);
    };
    schedule();
    window.addEventListener(AGE_EVENT, schedule);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(AGE_EVENT, schedule);
    };
  }, []);

  const close = () => {
    setOpen(false);
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* rien */
    }
  };

  const current = QUIZ_STEPS[step];
  const key = current.key as keyof QuizAnswers;

  const pick = (value: string) => {
    const next = { ...answers, [key]: value } as QuizAnswers;
    setAnswers(next);
    if (step < QUIZ_STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    saveAnswers(next);
    close();
    router.push("/resultats");
  };

  return (
    <Modal
      open={open}
      onClose={close}
      eyebrow={
        <span className="inline-flex items-center gap-2 rounded-pill bg-accent px-3 py-1 text-caption font-semibold">
          <Sparkles aria-hidden className="size-4" strokeWidth={2} />
          Un coup de pouce · {step + 1}/{QUIZ_STEPS.length}
        </span>
      }
      title={current.question}
    >
      <div className="flex flex-col gap-4">
        <div className="h-1.5 overflow-hidden rounded-pill bg-accent" aria-hidden>
          <motion.div
            className="h-full rounded-pill bg-action"
            initial={false}
            animate={{ width: `${((step + 1) / QUIZ_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

          <motion.div
            key={step}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-2"
          >
            {current.options.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => pick(o.value)}
                className="flex min-h-12 items-center justify-between gap-3 rounded-md border-2 border-line bg-surface px-4 py-2.5 text-left text-ink transition-colors hover:border-action hover:bg-action-tint active:scale-[0.99]"
              >
                <span className="flex flex-col">
                  <span className="font-semibold">{o.label}</span>
                  <span className="text-caption text-muted">{o.hint}</span>
                </span>
              </button>
            ))}
          </motion.div>

        <div className="flex items-center justify-between gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-ink"
            >
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2} />
              Retour
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={close}
            className="inline-flex min-h-11 items-center px-2 text-[14px] font-semibold text-muted underline underline-offset-4 hover:text-ink"
          >
            Non merci, je regarde seul·e
          </button>
        </div>
      </div>
    </Modal>
  );
}
