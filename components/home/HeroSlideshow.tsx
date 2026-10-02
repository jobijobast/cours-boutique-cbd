"use client";

import Image from "next/image";
import { Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { HERO_INTERVAL_MS, HERO_SLIDES } from "@/lib/data/hero";

/** Diaporama en fondu avec léger zoom lent ; pause possible (WCAG 2.2.2) */
export function HeroSlideshow({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const many = HERO_SLIDES.length > 1;

  useEffect(() => {
    if (!many || paused || reduce) return;
    const t = window.setInterval(() => setIndex((i) => (i + 1) % HERO_SLIDES.length), HERO_INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [many, paused, reduce]);

  const slide = HERO_SLIDES[index];

  return (
    <div className={cn("overflow-hidden bg-trust", className ?? "relative")}>
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: HERO_INTERVAL_MS / 1000 + 2, ease: "easeOut" }}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={index === 0}
              sizes="100vw"
              className="object-cover"
              style={{ objectPosition: slide.position ?? "center" }}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {many && (
        <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-pill bg-surface px-2 py-1 shadow-e2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Afficher l'image ${i + 1} sur ${HERO_SLIDES.length}`}
              aria-current={i === index}
              className="grid size-8 place-items-center"
            >
              <span
                className={cn(
                  "block h-2 rounded-pill transition-all duration-300",
                  i === index ? "w-6 bg-action" : "w-2 bg-line"
                )}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? "Relancer le diaporama" : "Mettre le diaporama en pause"}
            className="grid size-8 place-items-center rounded-full text-ink hover:bg-action-tint"
          >
            {paused ? <Play aria-hidden className="size-4" strokeWidth={2} /> : <Pause aria-hidden className="size-4" strokeWidth={2} />}
          </button>
        </div>
      )}
    </div>
  );
}
