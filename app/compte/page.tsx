import type { Metadata } from "next";
import { ArrowRight, Package, User } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Compte" };

export default function ComptePage() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-12 text-center md:py-20">
      <span className="grid size-16 place-items-center rounded-full bg-accent">
        <User aria-hidden className="size-7" strokeWidth={2} />
      </span>
      <h1 className="text-title">Votre compte</h1>
      <p className="text-muted">
        Pas besoin de compte pour commander : votre suivi arrive par e-mail. L&apos;espace client sera disponible
        dans la version finale.
      </p>
      <ButtonLink href="/boutique" icon={ArrowRight} iconPosition="end">
        Continuer mes achats
      </ButtonLink>
      <p className="flex items-center gap-2 text-caption text-muted">
        <Package aria-hidden className="size-4" strokeWidth={2} />
        Une question sur une commande ? Répondez simplement à l&apos;e-mail de suivi.
      </p>
    </div>
  );
}
