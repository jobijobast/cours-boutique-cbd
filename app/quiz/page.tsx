"use client";

import { ListChecks, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AdvisorQuiz } from "@/components/quiz/AdvisorQuiz";
import { ClassicQuiz } from "@/components/quiz/ClassicQuiz";
import { cn } from "@/lib/cn";

const MODES = [
  { id: "ia", label: "Conseiller IA", long: "Avec le conseiller IA", icon: Sparkles },
  { id: "rapide", label: "Quiz rapide", long: "Quiz rapide · 3 questions", icon: ListChecks },
] as const;

function QuizContent() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get("mode") === "rapide" ? "rapide" : "ia";

  return (
    <div className="mx-auto max-w-[760px] px-4 pb-12 pt-6 md:px-8 md:pt-10">
      <h1 className="text-title">Trouver mon CBD</h1>
      <p className="mt-2 text-muted">
        Laissez-vous guider par notre conseiller selon votre humeur et vos goûts, ou répondez au quiz rapide.
      </p>

      <div role="tablist" aria-label="Façon de trouver mon CBD" className="mt-6 grid grid-cols-2 gap-1 rounded-pill border-2 border-line bg-surface p-1">
        {MODES.map(({ id, label, long, icon: Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={active}
              aria-controls={`panel-${id}`}
              id={`tab-${id}`}
              onClick={() => router.replace(id === "ia" ? "/quiz" : "/quiz?mode=rapide", { scroll: false })}
              className={cn(
                "relative inline-flex min-h-11 items-center justify-center gap-2 rounded-pill px-3 text-[14px] font-semibold transition-colors md:text-[15px]",
                active ? "text-on-action" : "text-ink hover:bg-action-tint"
              )}
            >
              {active && (
                <motion.span
                  layoutId="quiz-mode"
                  className="absolute inset-0 rounded-pill bg-action"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <Icon aria-hidden className="relative size-4" strokeWidth={2} />
              <span className="relative sm:hidden">{label}</span>
              <span className="relative hidden sm:inline">{long}</span>
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${mode}`} aria-labelledby={`tab-${mode}`} className="mt-8">
        {mode === "ia" ? <AdvisorQuiz /> : <ClassicQuiz />}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense>
      <QuizContent />
    </Suspense>
  );
}
