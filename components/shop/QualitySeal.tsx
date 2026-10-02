import { useId } from "react";
import { cn } from "@/lib/cn";

/**
 * Sceau maison « Sève Qualité Contrôlée » (label interne fictif, n'imite aucun organisme de certification).
 * Couleurs : tokens action/principale et fond/accent.
 */
export function QualitySeal({ size = 88, className, title = "Label Sève Qualité Contrôlée" }: {
  size?: number;
  className?: string;
  title?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={title}
      className={cn("shrink-0 text-action", className)}
    >
      <title>{title}</title>
      <defs>
        <path id={`ring-${id}`} d="M60,60 m-41,0 a41,41 0 1,1 82,0 a41,41 0 1,1 -82,0" />
      </defs>
      {/* Bord dentelé */}
      <g fill="currentColor">
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return <circle key={i} cx={60 + Math.cos(a) * 56} cy={60 + Math.sin(a) * 56} r={3.2} />;
        })}
      </g>
      <circle cx="60" cy="60" r="56" fill="currentColor" />
      <circle cx="60" cy="60" r="51" fill="var(--fond-accent)" />
      <circle cx="60" cy="60" r="49" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <text fill="currentColor" fontSize="9.6" fontWeight="700" letterSpacing="1.6" fontFamily="var(--font-dm-sans), sans-serif">
        <textPath href={`#ring-${id}`} startOffset="0">
          SÈVE · QUALITÉ CONTRÔLÉE · LOT ANALYSÉ ·
        </textPath>
      </text>
      {/* Centre : coche + nom */}
      <path d="M47 58 l9 9 l17 -19" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <text
        x="60"
        y="82"
        textAnchor="middle"
        fill="currentColor"
        fontSize="11"
        fontStyle="italic"
        fontFamily="var(--font-fraunces), Georgia, serif"
      >
        Sève
      </text>
    </svg>
  );
}
