import type { Budget, Level, Moment } from "./data/products";
import { readStorage, writeStorage } from "./storage";

export type QuizAnswers = { level?: Level; moment?: Moment; budget?: Budget };

export const QUIZ_KEY = "seve-quiz";

export const QUIZ_STEPS = [
  {
    key: "level",
    question: "Avez-vous déjà pris du CBD ?",
    helper: "Pour vous proposer un dosage adapté.",
    options: [
      { value: "jamais", label: "Jamais", hint: "Je découvre", recap: "débutant" },
      { value: "quelques-fois", label: "Quelques fois", hint: "J'ai déjà testé", recap: "occasionnel" },
      { value: "regulierement", label: "Régulièrement", hint: "Fait partie de ma routine", recap: "habitué" },
    ],
  },
  {
    key: "moment",
    question: "Pour quel moment de votre journée ?",
    helper: "Le format change selon le moment.",
    options: [
      { value: "soir", label: "Détente le soir", hint: "Après une longue journée", recap: "détente le soir" },
      { value: "journee", label: "Pause dans la journée", hint: "Au bureau, en déplacement", recap: "pause dans la journée" },
      { value: "sport", label: "Après le sport", hint: "Un moment au calme après l'effort", recap: "après le sport" },
    ],
  },
  {
    key: "budget",
    question: "Quel budget pour commencer ?",
    helper: "Nous mettons en avant les produits dans votre budget.",
    options: [
      { value: "20", label: "20 €", hint: "Pour essayer", recap: "20 € max" },
      { value: "40", label: "40 €", hint: "Le plus choisi", recap: "40 € max" },
      { value: "60", label: "60 € et plus", hint: "Pour une routine", recap: "60 € et plus" },
    ],
  },
] as const;

export const DEFAULT_ANSWERS: Required<QuizAnswers> = { level: "jamais", moment: "soir", budget: "40" };

export function readAnswers(): QuizAnswers {
  return readStorage<QuizAnswers>(QUIZ_KEY, {});
}

export function saveAnswers(a: QuizAnswers) {
  writeStorage(QUIZ_KEY, a);
}

export function recapOf(a: QuizAnswers) {
  const full = { ...DEFAULT_ANSWERS, ...a };
  return QUIZ_STEPS.map((step) => {
    const v = full[step.key as keyof QuizAnswers];
    return step.options.find((o) => o.value === v)?.recap ?? "";
  }).join(" · ");
}
