import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-title">Page introuvable</h1>
      <p className="text-muted">Cette page n&apos;existe pas ou a été déplacée. Votre panier est intact.</p>
      <ButtonLink href="/boutique" icon={ArrowRight} iconPosition="end">
        Voir nos produits
      </ButtonLink>
    </div>
  );
}
