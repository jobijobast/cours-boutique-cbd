import { FlaskConical, Lock, Package, ShieldCheck } from "lucide-react";

const ITEMS = [
  { icon: FlaskConical, label: "Analyse labo sur chaque lot" },
  { icon: ShieldCheck, label: "THC < 0,3 %" },
  { icon: Package, label: "Livraison discrète en 48 h" },
  { icon: Lock, label: "Paiement sécurisé" },
];

export function TrustBanner() {
  return (
    <section aria-label="Garanties Sève" className="border-b border-line bg-trust">
      <ul className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 md:gap-x-6 md:px-8">
        {ITEMS.map(({ icon: Icon, label }) => (
          <li key={label} className="flex shrink-0 items-center gap-1.5 text-caption font-medium text-ink">
            <Icon aria-hidden className="size-4" strokeWidth={2} />
            {label}
          </li>
        ))}
      </ul>
    </section>
  );
}
