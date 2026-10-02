"use client";

import Link from "next/link";
import { ArrowRight, Bell, Heart, Mail, ShoppingBag, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox, Radio, Toggle } from "@/components/ui/Controls";
import { Field } from "@/components/ui/Field";
import { FilterChip } from "@/components/ui/FilterChip";
import { Modal } from "@/components/ui/Modal";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { ToastPreview, useToast } from "@/components/ui/Toast";
import { ProductCard, ProductCardSkeleton } from "@/components/shop/ProductCard";
import { catalog } from "@/lib/data/products";

const COLORS = [
  ["fond/page", "--fond-page"],
  ["fond/surface", "--fond-surface"],
  ["fond/accent", "--fond-accent"],
  ["fond/confiance", "--fond-confiance"],
  ["texte/principal", "--texte-principal"],
  ["texte/secondaire", "--texte-secondaire"],
  ["texte/sur-action", "--texte-sur-action"],
  ["action/principale", "--action-principale"],
  ["action/survol", "--action-survol"],
  ["action/teinte", "--action-teinte"],
  ["bordure/défaut", "--bordure-defaut"],
  ["bordure/focus", "--bordure-focus"],
  ["statut/succès", "--statut-succes"],
  ["statut/alerte", "--statut-alerte"],
  ["statut/alerte-fond", "--statut-alerte-fond"],
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-10">
      <h2 id={id} className="text-subtitle">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Label({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-caption font-semibold uppercase tracking-[0.06em] text-muted">{children}</p>;
}

export default function DesignSystemPage() {
  const { show } = useToast();
  const [modal, setModal] = useState(false);
  const [chip, setChip] = useState("tous");
  const [qty, setQty] = useState(1);

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <h1 className="text-title">Design system Sève</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Tokens, composants et états. Basculez le thème avec l&apos;icône lune de l&apos;en-tête : seuls les rôles
        changent.
      </p>

      <nav aria-label="Démo des états" className="mt-6 flex flex-wrap gap-2">
        {[
          ["/resultats?state=loading", "État chargement"],
          ["/resultats?state=empty", "État vide"],
          ["/resultats?state=error", "État erreur"],
          ["/resultats?state=edge", "Edge Case rupture"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-pill border-2 border-line bg-surface px-4 text-[15px] font-medium hover:border-action"
          >
            {label}
            <ArrowRight aria-hidden className="size-4" strokeWidth={2} />
          </Link>
        ))}
      </nav>

      <Section id="ds-couleurs" title="Couleurs · rôles">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {COLORS.map(([name, v]) => (
            <li key={name}>
              <div className="h-16 rounded-md border border-line" style={{ background: `var(${v})` }} />
              <p className="mt-1.5 text-[14px] font-semibold">{name}</p>
              <p className="text-caption text-muted">{v}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="ds-typo" title="Typographie">
        <div className="flex flex-col gap-3">
          <p className="font-display text-title font-semibold">Titre · Fraunces SemiBold 36/26</p>
          <p className="font-display text-subtitle font-semibold">Sous-titre · Fraunces 22/19</p>
          <p className="text-body">Corps · DM Sans Regular 16/15 — Vos 6 produits adaptés.</p>
          <p className="text-caption text-muted">Légende · DM Sans 13/12 — 10 ml · 1 000 mg CBD · Lot L-2409</p>
          <p className="font-display text-[34px] font-light italic">Huile · Fraunces Light Italic</p>
        </div>
      </Section>

      <Section id="ds-espaces" title="Espacements, rayons, élévations">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <Label>Espaces 4 → 48</Label>
            {[4, 8, 12, 16, 24, 32, 48].map((s) => (
              <div key={s} className="mb-1.5 flex items-center gap-3">
                <span className="h-3 rounded-sm bg-action" style={{ width: s * 2 }} />
                <span className="text-caption text-muted">espace/{s}</span>
              </div>
            ))}
          </div>
          <div>
            <Label>Rayons</Label>
            <div className="flex flex-wrap gap-3">
              {[
                ["rounded-sm", "petit 6"],
                ["rounded-md", "moyen 12"],
                ["rounded-lg", "grand 16"],
                ["rounded-pill", "pilule"],
              ].map(([c, l]) => (
                <div key={l} className="text-center">
                  <div className={`h-12 w-16 border-2 border-action bg-accent ${c}`} />
                  <p className="mt-1 text-caption text-muted">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label>Élévations</Label>
            <div className="flex flex-wrap gap-4">
              {["shadow-e1", "shadow-e2", "shadow-e3"].map((c, i) => (
                <div key={c} className={`grid h-16 w-20 place-items-center rounded-md bg-surface text-caption ${c}`}>
                  niveau {i + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section id="ds-boutons" title="Bouton · 3 types × états">
        <div className="flex flex-col gap-4">
          {(["primary", "secondary", "text"] as const).map((v) => (
            <div key={v}>
              <Label>{v === "primary" ? "Primaire" : v === "secondary" ? "Secondaire" : "Texte"}</Label>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant={v} icon={ShoppingBag}>
                  Ajouter au panier
                </Button>
                <Button variant={v} icon={ShoppingBag} loading>
                  Chargement
                </Button>
                <Button variant={v} icon={ShoppingBag} disabled>
                  Désactivé
                </Button>
                <Button variant={v}>Sans icône</Button>
              </div>
            </div>
          ))}
          <p className="text-caption text-muted">Survol, focus clavier (anneau 3 px) et pression : interagissez avec les boutons.</p>
        </div>
      </Section>

      <Section id="ds-champs" title="Champ de saisie · états">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Adresse e-mail" placeholder="prenom@mail.fr" helper="Pour suivre votre commande." icon={Mail} />
          <Field label="Adresse e-mail · rempli" defaultValue="lea@mail.fr" helper="Pour suivre votre commande." icon={Mail} />
          <Field
            label="Adresse e-mail · erreur"
            defaultValue="lea@mail"
            error="Vérifiez l'adresse : elle doit ressembler à prenom@mail.fr."
            icon={Mail}
          />
          <Field label="Adresse e-mail · désactivé" placeholder="prenom@mail.fr" disabled icon={Mail} />
          <Field label="Adresse de livraison complète (numéro, rue, bâtiment)" defaultValue="12 rue des Petites-Écuries, bât. B, 3e étage" />
        </div>
      </Section>

      <Section id="ds-controles" title="Case, radio, interrupteur, compteur">
        <div className="grid gap-6 md:grid-cols-4">
          <div>
            <Label>Case à cocher</Label>
            <Checkbox label="Sans arôme ajouté" />
            <Checkbox label="Origine France" defaultChecked />
            <Checkbox label="Désactivé" disabled />
          </div>
          <div>
            <Label>Radio</Label>
            <Radio name="ds-format" label="Format huile" defaultChecked />
            <Radio name="ds-format" label="Format gummies" />
            <Radio name="ds-format" label="Désactivé" disabled />
          </div>
          <div>
            <Label>Interrupteur</Label>
            <Toggle label="Afficher les analyses labo" defaultChecked />
            <Toggle label="Alertes de retour en stock" />
          </div>
          <div>
            <Label>Quantité (max 4)</Label>
            <QtyStepper value={qty} onChange={setQty} label="Quantité de démonstration" />
          </div>
        </div>
      </Section>

      <Section id="ds-filtres" title="Filtres">
        <div className="flex flex-wrap gap-2">
          {[
            ["tous", "Tous", 6],
            ["huile", "Huiles", 2],
            ["gummies", "Gummies", 1],
            ["fleur", "Fleurs", 1],
          ].map(([k, l, n]) => (
            <FilterChip key={k} label={l as string} count={n as number} active={chip === k} onClick={() => setChip(k as string)} />
          ))}
          <FilterChip label="Menthe" removable />
        </div>
      </Section>

      <Section id="ds-cartes" title="Carte produit · normale, meilleur choix, chargement">
        <ul className="grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(min(320px,100%),1fr))]">
          <li>
            <ProductCard product={catalog[0]} bestChoice />
          </li>
          <li>
            <ProductCard product={{ ...catalog[1], image: undefined }} />
          </li>
          <li>
            <ProductCard product={catalog[catalog.length - 1]} />
          </li>
          <li>
            <ProductCardSkeleton />
          </li>
        </ul>
      </Section>

      <Section id="ds-retours" title="Toasts et fenêtre modale">
        <div className="flex flex-col gap-3">
          <ToastPreview type="success" message="Ajouté au panier · Huile CBD 10 % Spearmint" />
          <ToastPreview type="error" message="Paiement refusé. Vérifiez votre carte ou essayez-en une autre." />
          <ToastPreview type="info" message="Livraison offerte dès 50 € d'achat." />
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => show({ type: "success", message: "Ajouté au panier · Huile CBD 10 % Spearmint" })}>
            Déclencher un toast succès
          </Button>
          <Button variant="secondary" icon={Bell} onClick={() => show({ type: "info", message: "Livraison offerte dès 50 € d'achat." })}>
            Toast info
          </Button>
          <Button variant="secondary" icon={Heart} onClick={() => show({ type: "error", message: "Paiement refusé. Vérifiez votre carte ou essayez-en une autre." })}>
            Toast erreur
          </Button>
          <Button variant="secondary" icon={Trash2} onClick={() => setModal(true)}>
            Ouvrir la modale
          </Button>
        </div>
      </Section>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Vider le panier ?"
        primary={{ label: "Vider le panier", icon: Trash2, onClick: () => setModal(false) }}
        secondary={{ label: "Annuler", onClick: () => setModal(false) }}
      >
        1 article sera retiré. Vous pourrez le rajouter plus tard.
      </Modal>
    </div>
  );
}
