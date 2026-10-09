"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CreditCard, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Radio } from "@/components/ui/Controls";
import { Field } from "@/components/ui/Field";
import { ProductVisual } from "@/components/shop/ProductBits";
import { useCart } from "@/lib/cart";
import { saveOrder, useAccount } from "@/lib/account";
import { cn } from "@/lib/cn";
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/data/products";

const STEPS = ["Coordonnées", "Livraison", "Paiement"] as const;
const HOME_FEE = 4.9;

type Form = {
  prenom: string;
  nom: string;
  email: string;
  tel: string;
  adresse: string;
  cp: string;
  ville: string;
  livraison: "relais" | "domicile";
  cgv: boolean;
};
type Errors = Partial<Record<keyof Form, string>>;

const EMPTY: Form = {
  prenom: "",
  nom: "",
  email: "",
  tel: "",
  adresse: "",
  cp: "",
  ville: "",
  livraison: "relais",
  cgv: false,
};

const FIELDS_BY_STEP: (keyof Form)[][] = [
  ["prenom", "nom", "email", "tel"],
  ["adresse", "cp", "ville"],
  ["cgv"],
];

function validate(f: Form, step: number): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!f.prenom.trim()) e.prenom = "Indiquez votre prénom.";
    if (!f.nom.trim()) e.nom = "Indiquez votre nom.";
    if (!f.email.trim()) e.email = "Indiquez votre adresse e-mail pour recevoir le suivi.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim()))
      e.email = "Vérifiez l'adresse : elle doit ressembler à prenom@mail.fr.";
    if (f.tel.trim() && !/^(?:\+33\s?|0)[1-9](?:[\s.-]?\d{2}){4}$/.test(f.tel.trim()))
      e.tel = "Vérifiez le numéro : 10 chiffres, ex. 06 12 34 56 78.";
  }
  if (step === 1) {
    if (!f.adresse.trim()) e.adresse = "Indiquez votre adresse (numéro et rue).";
    if (!/^\d{5}$/.test(f.cp.trim())) e.cp = "Indiquez un code postal à 5 chiffres, ex. 75010.";
    if (!f.ville.trim()) e.ville = "Indiquez votre ville.";
  }
  if (step === 2 && !f.cgv) e.cgv = "Cochez cette case pour accepter les CGV et finaliser la commande.";
  return e;
}

export default function PaiementPage() {
  const cart = useCart();
  const { account } = useAccount();
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [tried, setTried] = useState<boolean[]>([false, false, false]);
  const [paying, setPaying] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const mounted = useRef(false);


  // Client connecté : coordonnées pré-remplies (modifiables)
  useEffect(() => {
    if (!account) return;
    setForm((f) => ({
      ...f,
      prenom: f.prenom || account.firstName,
      nom: f.nom || account.lastName,
      email: f.email || account.email,
    }));
  }, [account]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const shipping =
    form.livraison === "domicile" && cart.subtotal < FREE_SHIPPING_THRESHOLD ? HOME_FEE : 0;
  const total = Math.round((cart.subtotal + shipping) * 100) / 100;

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (tried[step]) setErrors(validate(next, step));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(form, step);
    setErrors(errs);
    setTried((t) => t.map((v, i) => (i === step ? true : v)));
    const firstBad = FIELDS_BY_STEP[step].find((k) => errs[k]);
    if (firstBad) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      setErrors({});
      return;
    }
    setPaying(true);
    window.setTimeout(() => {
      const number = `SV-${Math.floor(10000 + Math.random() * 89999)}`;
      saveOrder({
        number,
        date: new Date().toISOString(),
        email: form.email.trim(),
        total,
        livraison: form.livraison,
        items: cart.lines.map((l) => ({ slug: l.slug, name: l.product.name, qty: l.qty, price: l.product.price })),
      });
      try {
        sessionStorage.setItem(
          "seve-last-order",
          JSON.stringify({ number, total, email: form.email.trim(), livraison: form.livraison, items: cart.count })
        );
      } catch {
        /* rien */
      }
      router.push("/confirmation");
      cart.clear();
    }, 1200);
  };

  if (!cart.hydrated) {
    return <div className="mx-auto min-h-[60vh] max-w-[1280px] px-4 py-8 md:px-8" aria-busy="true" />;
  }

  if (cart.lines.length === 0 && !paying) {
    return (
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-4 px-4 py-16 text-center">
        <h1 className="text-title">Votre panier est vide</h1>
        <p className="text-muted">Ajoutez un produit pour passer commande.</p>
        <ButtonLink href="/boutique" icon={ArrowRight} iconPosition="end">
          Découvrir nos produits
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <Link
        href="/panier"
        className="inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold text-ink underline-offset-4 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-5" strokeWidth={2} />
        Retour au panier
      </Link>

      {/* Stepper */}
      <nav aria-label="Étapes de la commande" className="mt-4">
        <ol className="flex items-center gap-2 md:gap-3">
          {STEPS.map((label, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={label} className="flex flex-1 items-center gap-2 md:gap-3">
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => done && setStep(i)}
                  aria-current={current ? "step" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-2 rounded-pill pr-2 text-left disabled:cursor-default",
                    done && "hover:underline"
                  )}
                >
                  <span
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full border-2 text-[14px] font-bold transition-colors duration-200",
                      done && "border-action bg-action text-on-action",
                      current && "border-action bg-surface text-ink",
                      !done && !current && "border-line bg-surface text-muted"
                    )}
                  >
                    {done ? <Check aria-hidden className="size-4" strokeWidth={3} /> : i + 1}
                  </span>
                  <span
                    className={cn(
                      "text-[14px] md:text-[15px]",
                      current ? "font-semibold text-ink" : "text-muted",
                      !current && "hidden sm:inline"
                    )}
                  >
                    {label}
                    {done && <span className="sr-only"> (terminé, modifier)</span>}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <span aria-hidden className={cn("h-0.5 flex-1 rounded-pill", done ? "bg-action" : "bg-line")} />
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_380px]">
        <form
          ref={formRef}
          noValidate
          onSubmit={submit}
          className="rounded-lg border border-line bg-surface p-5 shadow-e1 md:p-8"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="flex flex-col gap-5"
            >
              <h1 ref={headingRef} tabIndex={-1} className="text-subtitle focus:outline-none">
                <span className="sr-only">
                  Étape {step + 1} sur 3 :{" "}
                </span>
                {step === 0 && "Vos coordonnées"}
                {step === 1 && "Livraison"}
                {step === 2 && "Paiement"}
              </h1>

              {step === 0 && (
                <>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field
                      label="Prénom"
                      name="prenom"
                      autoComplete="given-name"
                      value={form.prenom}
                      onChange={(e) => set("prenom", e.target.value)}
                      error={errors.prenom}
                      icon={User}
                    />
                    <Field
                      label="Nom"
                      name="nom"
                      autoComplete="family-name"
                      value={form.nom}
                      onChange={(e) => set("nom", e.target.value)}
                      error={errors.nom}
                    />
                  </div>
                  <Field
                    label="Adresse e-mail"
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="prenom@mail.fr"
                    helper="Pour suivre votre commande. Aucun compte n'est créé."
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    error={errors.email}
                    icon={Mail}
                  />
                  <Field
                    label="Téléphone"
                    optional
                    name="tel"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    helper="Uniquement pour le transporteur."
                    value={form.tel}
                    onChange={(e) => set("tel", e.target.value)}
                    error={errors.tel}
                    icon={Phone}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <Field
                    label="Adresse"
                    name="adresse"
                    autoComplete="street-address"
                    placeholder="12 rue des Petites-Écuries"
                    value={form.adresse}
                    onChange={(e) => set("adresse", e.target.value)}
                    error={errors.adresse}
                    icon={MapPin}
                  />
                  <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
                    <Field
                      label="Code postal"
                      name="cp"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={5}
                      placeholder="75010"
                      value={form.cp}
                      onChange={(e) => set("cp", e.target.value.replace(/\D/g, ""))}
                      error={errors.cp}
                    />
                    <Field
                      label="Ville"
                      name="ville"
                      autoComplete="address-level2"
                      value={form.ville}
                      onChange={(e) => set("ville", e.target.value)}
                      error={errors.ville}
                    />
                  </div>
                  <fieldset className="flex flex-col gap-2">
                    <legend className="mb-2 text-[14px] font-semibold">Mode de livraison</legend>
                    <div className="rounded-md border-2 border-line px-4 py-2 has-[:checked]:border-action has-[:checked]:bg-action-tint">
                      <Radio
                        name="livraison"
                        value="relais"
                        checked={form.livraison === "relais"}
                        onChange={() => set("livraison", "relais")}
                        label={
                          <span className="flex w-full justify-between gap-3">
                            Point relais · 48 h <span className="font-semibold text-success">Offert</span>
                          </span>
                        }
                        description="Colis neutre, retrait avec une pièce d'identité."
                        className="[&>span:last-child]:flex-1"
                      />
                    </div>
                    <div className="rounded-md border-2 border-line px-4 py-2 has-[:checked]:border-action has-[:checked]:bg-action-tint">
                      <Radio
                        name="livraison"
                        value="domicile"
                        checked={form.livraison === "domicile"}
                        onChange={() => set("livraison", "domicile")}
                        label={
                          <span className="flex w-full justify-between gap-3">
                            À domicile · 48 h
                            <span className="font-semibold">
                              {cart.subtotal >= FREE_SHIPPING_THRESHOLD ? "Offert" : formatPrice(HOME_FEE)}
                            </span>
                          </span>
                        }
                        description="Offert dès 50 € d'achat. Emballage sans marque visible."
                        className="[&>span:last-child]:flex-1"
                      />
                    </div>
                  </fieldset>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="flex flex-col gap-2">
                    <p className="text-[14px] font-semibold">Moyen de paiement</p>
                    <div className="flex items-center gap-3 rounded-md border-2 border-action bg-action-tint px-4 py-3">
                      <CreditCard aria-hidden className="size-6 shrink-0" strokeWidth={2} />
                      <div className="flex-1">
                        <p className="font-semibold">
                          Carte de test <span className="tabular-nums">•••• 4242</span>
                        </p>
                        <p className="text-caption text-muted">Expire 12/28 · prototype, aucun débit réel</p>
                      </div>
                      <Check aria-label="Sélectionnée" className="size-5 text-success" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Checkbox
                      name="cgv"
                      checked={form.cgv}
                      onChange={(e) => set("cgv", e.target.checked)}
                      aria-invalid={errors.cgv ? true : undefined}
                      aria-describedby={errors.cgv ? "cgv-error" : undefined}
                      label={
                        <>
                          J&apos;accepte les{" "}
                          <Link href="/legal/cgv" target="_blank" className="font-semibold underline underline-offset-4">
                            conditions générales de vente
                          </Link>{" "}
                          et confirme avoir 18 ans ou plus.
                        </>
                      }
                    />
                    {errors.cgv && (
                      <p id="cgv-error" className="flex items-start gap-1.5 text-caption font-medium text-alert">
                        <AlertTriangle aria-hidden className="mt-px size-4 shrink-0" strokeWidth={2} />
                        {errors.cgv}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                {step > 0 ? (
                  <Button variant="text" icon={ArrowLeft} onClick={() => setStep(step - 1)} disabled={paying}>
                    Étape précédente
                  </Button>
                ) : (
                  <span />
                )}
                <Button
                  type="submit"
                  size="lg"
                  loading={paying}
                  icon={step === 2 ? Lock : ArrowRight}
                  iconPosition={step === 2 ? "start" : "end"}
                  className="w-full sm:w-auto"
                >
                  {step === 2 ? (paying ? "Paiement en cours…" : `Payer ${formatPrice(total)}`) : "Continuer"}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </form>

        {/* Récapitulatif */}
        <aside aria-labelledby="recap-commande" className="rounded-lg border border-line bg-surface p-5 shadow-e1 lg:sticky lg:top-24 md:p-6">
          <h2 id="recap-commande" className="text-[19px]">
            Votre commande
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {cart.lines.map(({ slug, qty, product }) => (
              <li key={slug} className="flex items-center gap-3">
                <ProductVisual product={product} size="sm" className="size-12 shrink-0 rounded-sm [&>span]:text-[11px]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{product.name}</p>
                  <p className="text-caption text-muted">Quantité : {qty}</p>
                </div>
                <p className="text-[15px] font-semibold">{formatPrice(product.price * qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-muted">Sous-total</dt>
              <dd>{formatPrice(cart.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Livraison {form.livraison === "relais" ? "point relais" : "à domicile"}</dt>
              <dd className={shipping === 0 ? "font-medium text-success" : ""}>
                {shipping === 0 ? "Offerte" : formatPrice(shipping)}
              </dd>
            </div>
            <div className="flex justify-between pt-1 text-[18px] font-bold">
              <dt>Total</dt>
              <dd>{formatPrice(total)}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>
  );
}
