import Link from "next/link";

const LEGAL = [
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/cgv", label: "CGV" },
  { href: "/legal/confidentialite", label: "Confidentialité" },
  { href: "/legal/cookies", label: "Cookies" },
];

export function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-surface pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div className="flex flex-col gap-3">
          <p className="font-display text-[26px] font-semibold leading-none">Sève</p>
          <p className="max-w-sm text-[14px] text-muted">
            CBD premium, 100 % transparent. Chaque lot est analysé par un laboratoire indépendant. Produits réservés
            aux adultes, sans allégation de santé.
          </p>
        </div>
        <nav aria-label="Boutique">
          <h2 className="font-sans text-[14px] font-bold">Boutique</h2>
          <ul className="mt-2 flex flex-col">
            {[
              ["/boutique", "Tous les produits"],
              ["/quiz", "Trouver mon CBD"],
              ["/analyses", "Analyses labo"],
              ["/guide", "Le guide"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="inline-flex min-h-11 items-center text-[14px] text-muted hover:text-ink hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Informations légales">
          <h2 className="font-sans text-[14px] font-bold">Informations</h2>
          <ul className="mt-2 flex flex-col">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="inline-flex min-h-11 items-center text-[14px] text-muted hover:text-ink hover:underline">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-caption text-muted">
        © 2026 Sève · Vente interdite aux mineurs · THC &lt; 0,3 % conformément à la réglementation française
      </p>
    </footer>
  );
}
