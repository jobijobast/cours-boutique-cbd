"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { bestProductFor, QUIZ_STEPS, readAnswers, saveAnswers, type QuizAnswers } from "@/lib/quiz";
import { useShop } from "@/components/shop/ShopProvider";

export function ClassicQuiz() {
  const { addToCart } = useShop();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswers>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setAnswers(readAnswers());
  }, []);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const current = QUIZ_STEPS[step];
  const key = current.key as keyof QuizAnswers;
  const value = answers[key];
  const last = step === QUIZ_STEPS.length - 1;

  const choose = (v: string) => {
    const next = { ...answers, [key]: v } as QuizAnswers;
    setAnswers(next);
    saveAnswers(next);
  };

  const next = () => {
    if (!value) return;
    if (!last) return setStep((s) => s + 1);
    // Fin du questionnaire : le meilleur produit va directement au panier
    const best = bestProductFor(answers);
    if (best) addToCart(best.slug, { recommended: true });
    else router.push("/resultats");
  };

  return (
    <div>
      {/* Progression */}
      <div className="flex items-center justify-between text-caption font-medium text-muted">
        <span>
          Étape {step + 1} sur {QUIZ_STEPS.length}
        </span>
        <span>Environ 1 min</span>
      </div>
      <div
        role="progressbar"
        aria-label="Progression du quiz"
        aria-valuemin={1}
        aria-valuemax={QUIZ_STEPS.length}
        aria-valuenow={step + 1}
        className="mt-2 h-2 overflow-hidden rounded-pill bg-accent"
      >
        <motion.div
          className="h-full rounded-pill bg-action"
          initial={false}
          animate={{ width: `${((step + 1) / QUIZ_STEPS.length) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>

      <>
        <motion.form
          key={step}
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mt-8"
        >
          <fieldset>
            <legend className="contents">
              <h2 ref={headingRef} tabIndex={-1} className="text-subtitle focus:outline-none md:text-[28px]">
                {current.question}
              </h2>
            </legend>
            <p className="mt-2 text-muted">{current.helper}</p>

            <div className="mt-6 flex flex-col gap-3">
              {current.options.map((o, i) => {
                const checked = value === o.value;
                return (
                  <motion.label
                    key={o.value}
                    initial={reduce ? false : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.08 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                    whileTap={reduce ? undefined : { scale: 0.985 }}
                    className={cn(
                      "group relative flex min-h-16 cursor-pointer items-center gap-4 rounded-lg border-2 bg-surface px-5 py-4",
                      "transition-[border-color,background-color,box-shadow] duration-200 ease-out",
                      "has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
                      checked ? "border-action bg-action-tint shadow-e1" : "border-line hover:border-action"
                    )}
                  >
                    <input
                      type="radio"
                      name={current.key}
                      value={o.value}
                      checked={checked}
                      onChange={() => choose(o.value)}
                      className="sr-only"
                    />
                    <span className="flex flex-1 flex-col">
                      <span className="text-[17px] font-semibold">{o.label}</span>
                      <span className="text-caption text-muted">{o.hint}</span>
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200",
                        checked ? "border-action bg-action text-on-action" : "border-muted"
                      )}
                    >
                      <AnimatePresence>
                        {checked && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 600, damping: 20 }}
                          >
                            <Check className="size-4" strokeWidth={3} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </span>
                  </motion.label>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            {step > 0 ? (
              <Button variant="text" icon={ArrowLeft} onClick={() => setStep((s) => s - 1)}>
                Question précédente
              </Button>
            ) : (
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-5 font-semibold text-ink hover:bg-action-tint"
              >
                <ArrowLeft aria-hidden className="size-5" strokeWidth={2} />
                Retour à l&apos;accueil
              </Link>
            )}
            <Button
              type="submit"
              size="lg"
              icon={ArrowRight}
              iconPosition="end"
              disabled={!value}
              className="w-full sm:w-auto"
            >
              {last ? "Ajouter mon produit idéal au panier" : "Continuer"}
            </Button>
          </div>
          {last && value && (
            <p className="mt-3 text-center text-caption text-muted sm:text-right">
              Le produit le plus adapté à vos réponses sera ajouté à votre panier. Vous pourrez le modifier ou le retirer.
            </p>
          )}
          {!value && (
            <p className="mt-3 text-center text-caption text-muted sm:text-right">Choisissez une réponse pour continuer.</p>
          )}
        </motion.form>
      </>
    </div>
  );
}
