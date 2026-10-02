import { cn } from "@/lib/cn";

/** Pochon noir hermétique Sève (fleurs et résines), dessiné en vectoriel */
export function SevePouch({ className, height = 120 }: { className?: string; height?: number }) {
  return (
    <svg
      viewBox="0 0 120 140"
      height={height}
      width={(height * 120) / 140}
      role="img"
      aria-label="Pochon hermétique noir Sève"
      className={cn("shrink-0", className)}
    >
      {/* Ombre portée */}
      <ellipse cx="60" cy="133" rx="40" ry="4" fill="var(--texte-principal)" opacity="0.12" />
      {/* Corps : haut droit avec encoches, bas légèrement bombé */}
      <path
        d="M18 10 H102 V16 L99 18 L102 20 V112 C102 124 94 129 84 129 H36 C26 129 18 124 18 112 V20 L21 18 L18 16 Z"
        fill="var(--texte-principal)"
      />
      {/* Fermeture zip */}
      <line x1="21" y1="27" x2="99" y2="27" stroke="var(--blanc)" strokeOpacity="0.12" strokeWidth="1.2" />
      <line x1="21" y1="30" x2="99" y2="30" stroke="var(--encre-900)" strokeOpacity="0.35" strokeWidth="1" />
      {/* Marque */}
      <text
        x="60"
        y="112"
        textAnchor="middle"
        fontFamily="var(--font-fraunces), Georgia, serif"
        fontWeight="600"
        fontSize="17"
        fill="var(--fond-confiance)"
      >
        Sève
      </text>
    </svg>
  );
}
