"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowRight, ChevronDown, LogOut, Mail, MapPin, Package, Phone, Trash2, User, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox, Radio } from "@/components/ui/Controls";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/data/products";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------------- Création de compte ---------------- */

const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:(?:\. |[ '-])[A-Za-zÀ-ÖØ-öø-ÿ]+)*\.?$/;
const PHONE_RE = /^(?:\+33\s?|0)[67](?:[\s.-]?\d{2}){4}$/;
const COUNTRIES = ["France", "Belgique", "Luxembourg", "Suisse", "Monaco"];

/** Âge à partir de JJ/MM/AAAA ; null si la date est invalide */
function ageFrom(date: string) {
  const m = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const birth = new Date(y, mo - 1, d);
  if (birth.getFullYear() !== y || birth.getMonth() !== mo - 1 || birth.getDate() !== d) return null;
  const now = new Date();
  if (birth > now) return null;
  let age = now.getFullYear() - y;
  if (now.getMonth() < mo - 1 || (now.getMonth() === mo - 1 && now.getDate() < d)) age--;
  return age;
}

/** Ajoute les « / » au fil de la saisie : 31051970 → 31/05/1970 */
function maskDate(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)].filter(Boolean).join("/");
}

const EMPTY_FORM = {
  title: "" as "M" | "Mme" | "",
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  birthDate: "",
  address: "",
  address2: "",
  postalCode: "",
  city: "",
  country: "France",
  phone: "",
  adult: false,
  privacy: false,
  newsletter: false,
  cgv: false,
};
type RegForm = typeof EMPTY_FORM;
type RegErrors = Partial<Record<keyof RegForm, string>>;

const FIELD_ORDER: (keyof RegForm)[] = [
  "title", "firstName", "lastName", "email", "password", "birthDate",
  "address", "postalCode", "city", "country", "phone", "adult", "privacy", "cgv",
];

function validateRegister(f: RegForm): RegErrors {
  const e: RegErrors = {};
  if (!f.title) e.title = "Choisissez M ou Mme.";
  if (!f.firstName.trim()) e.firstName = "Indiquez votre prénom.";
  else if (!NAME_RE.test(f.firstName.trim()))
    e.firstName = "Utilisez seulement des lettres, un tiret, une apostrophe ou un point suivi d'un espace.";
  if (!f.lastName.trim()) e.lastName = "Indiquez votre nom.";
  else if (!NAME_RE.test(f.lastName.trim()))
    e.lastName = "Utilisez seulement des lettres, un tiret, une apostrophe ou un point suivi d'un espace.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Vérifiez l'adresse : elle doit ressembler à prenom@mail.fr.";
  if (f.password.length < 8) e.password = "Choisissez un mot de passe d'au moins 8 caractères.";
  if (f.birthDate) {
    const age = ageFrom(f.birthDate);
    if (age === null) e.birthDate = "Saisissez une date valide au format JJ/MM/AAAA, ex. 31/05/1970.";
    else if (age < 18) e.birthDate = "La boutique est réservée aux personnes de 18 ans ou plus.";
  }
  if (!f.address.trim()) e.address = "Indiquez votre adresse (numéro et rue).";
  if (f.country === "France" ? !/^\d{5}$/.test(f.postalCode.trim()) : !/^\d{4,5}$/.test(f.postalCode.trim()))
    e.postalCode = f.country === "France" ? "Indiquez un code postal à 5 chiffres, ex. 75010." : "Indiquez un code postal valide.";
  if (!f.city.trim()) e.city = "Indiquez votre ville.";
  if (!PHONE_RE.test(f.phone.trim())) e.phone = "Indiquez un numéro de mobile, ex. 06 12 34 56 78.";
  if (!f.adult) e.adult = "Cochez cette case : la boutique est réservée aux adultes.";
  if (!f.privacy) e.privacy = "Cochez cette case pour confirmer avoir lu le message sur vos données.";
  if (!f.cgv) e.cgv = "Acceptez les conditions générales et la politique de confidentialité pour créer votre compte.";
  return e;
}

function FormError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1 flex items-start gap-1.5 text-caption font-medium text-alert">
      <AlertTriangle aria-hidden className="mt-px size-4 shrink-0" strokeWidth={2} />
      {children}
    </p>
  );
}

function RegisterForm({ initialEmail, onSwitch }: { initialEmail: string; onSwitch: () => void }) {
  const { register } = useAccount();
  const { show } = useToast();
  const [f, setF] = useState<RegForm>({ ...EMPTY_FORM, email: initialEmail });
  const [errors, setErrors] = useState<RegErrors>({});
  const [tried, setTried] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof RegForm>(k: K, v: RegForm[K]) => {
    const next = { ...f, [k]: v };
    setF(next);
    if (tried) setErrors(validateRegister(next));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTried(true);
    const err = validateRegister(f);
    setErrors(err);
    const first = FIELD_ORDER.find((k) => err[k]);
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const problem = register({
        title: f.title,
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email,
        birthDate: f.birthDate,
        address: f.address.trim(),
        address2: f.address2.trim(),
        postalCode: f.postalCode.trim(),
        city: f.city.trim(),
        country: f.country,
        phone: f.phone.trim(),
        newsletter: f.newsletter,
      });
      setLoading(false);
      if (problem) {
        setErrors({ email: problem });
        return;
      }
      show({ type: "success", message: `Compte créé · Bienvenue ${f.firstName.trim()} !` });
    }, 500);
  };

  const sectionTitle = "font-sans text-[13px] font-bold uppercase tracking-[0.06em] text-muted";

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-8">
      <p className="text-[15px] text-muted">
        Vous avez déjà un compte ?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-ink underline underline-offset-4">
          Connectez-vous
        </button>
      </p>

      {/* Identité */}
      <fieldset className="flex flex-col gap-5">
        <legend className={sectionTitle}>Vos informations</legend>
        <div>
          <p id="title-label" className="text-[14px] font-semibold">
            Civilité
          </p>
          <div role="radiogroup" aria-labelledby="title-label" aria-describedby={errors.title ? "title-error" : undefined} className="mt-1 flex gap-6">
            <Radio name="title" value="M" checked={f.title === "M"} onChange={() => set("title", "M")} label="M." />
            <Radio name="title" value="Mme" checked={f.title === "Mme"} onChange={() => set("title", "Mme")} label="Mme" />
          </div>
          <FormError id="title-error">{errors.title}</FormError>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Prénom" name="firstName" autoComplete="given-name" icon={User} helper="Lettres, tiret, apostrophe ; un point doit être suivi d'un espace." value={f.firstName} onChange={(e) => set("firstName", e.target.value)} error={errors.firstName} />
          <Field label="Nom" name="lastName" autoComplete="family-name" helper="Lettres, tiret, apostrophe ; un point doit être suivi d'un espace." value={f.lastName} onChange={(e) => set("lastName", e.target.value)} error={errors.lastName} />
        </div>
        <Field label="Adresse e-mail" name="email" type="email" inputMode="email" autoComplete="email" icon={Mail} placeholder="prenom@mail.fr" helper="Vos commandes passées avec cette adresse apparaîtront dans votre compte." value={f.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
        <Field label="Mot de passe" name="password" type="password" autoComplete="new-password" helper="8 caractères minimum." value={f.password} onChange={(e) => set("password", e.target.value)} error={errors.password} />
        <Field label="Date de naissance" optional name="birthDate" inputMode="numeric" autoComplete="bday" placeholder="JJ/MM/AAAA" helper="Ex. : 31/05/1970" value={f.birthDate} onChange={(e) => set("birthDate", maskDate(e.target.value))} error={errors.birthDate} />
      </fieldset>

      {/* Adresse */}
      <fieldset className="flex flex-col gap-5">
        <legend className={sectionTitle}>Votre adresse</legend>
        <Field label="Adresse" name="address" autoComplete="address-line1" icon={MapPin} placeholder="12 rue des Petites-Écuries" value={f.address} onChange={(e) => set("address", e.target.value)} error={errors.address} />
        <Field label="Complément d'adresse" optional name="address2" autoComplete="address-line2" placeholder="Bâtiment, étage, digicode…" value={f.address2} onChange={(e) => set("address2", e.target.value)} />
        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <Field label="Code postal" name="postalCode" inputMode="numeric" autoComplete="postal-code" maxLength={5} placeholder="75010" value={f.postalCode} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} error={errors.postalCode} />
          <Field label="Ville" name="city" autoComplete="address-level2" value={f.city} onChange={(e) => set("city", e.target.value)} error={errors.city} />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="country" className="text-[14px] font-semibold">
            Pays
          </label>
          <div className="relative">
            <select
              id="country"
              name="country"
              autoComplete="country-name"
              value={f.country}
              onChange={(e) => set("country", e.target.value)}
              aria-describedby="country-help"
              className="min-h-12 w-full appearance-none rounded-md border-2 border-line bg-surface px-4 pr-10 text-body text-ink transition-colors hover:border-muted focus:border-focus"
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-muted" strokeWidth={2} />
          </div>
          <p id="country-help" className="text-caption text-muted">
            Livraison actuellement en France métropolitaine.
          </p>
        </div>
        <Field label="Mobile" name="phone" type="tel" inputMode="tel" autoComplete="tel" icon={Phone} placeholder="06 12 34 56 78" helper="Uniquement pour le suivi de livraison." value={f.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
      </fieldset>

      {/* Consentements : rien n'est pré-coché */}
      <fieldset className="flex flex-col gap-3">
        <legend className={sectionTitle}>Vos choix</legend>
        <div>
          <Checkbox name="adult" checked={f.adult} onChange={(e) => set("adult", e.target.checked)} aria-invalid={errors.adult ? true : undefined} label="Je confirme avoir 18 ans ou plus" />
          <FormError id="adult-error">{errors.adult}</FormError>
        </div>
        <div>
          <Checkbox
            name="privacy"
            checked={f.privacy}
            onChange={(e) => set("privacy", e.target.checked)}
            aria-invalid={errors.privacy ? true : undefined}
            label="J'ai lu le message concernant la confidentialité de mes données"
            description="Conformément au RGPD et à la loi Informatique et Libertés du 6 janvier 1978, vous disposez d'un droit d'accès, de rectification et d'opposition sur vos données."
          />
          <FormError id="privacy-error">{errors.privacy}</FormError>
        </div>
        <Checkbox
          name="newsletter"
          checked={f.newsletter}
          onChange={(e) => set("newsletter", e.target.checked)}
          label="Recevoir notre newsletter"
          description="Nouveautés et nouveaux lots. Désinscription possible à tout moment, en un clic."
        />
        <div>
          <Checkbox
            name="cgv"
            checked={f.cgv}
            onChange={(e) => set("cgv", e.target.checked)}
            aria-invalid={errors.cgv ? true : undefined}
            label={
              <>
                J&apos;accepte les{" "}
                <Link href="/legal/cgv" target="_blank" className="font-semibold underline underline-offset-4">
                  conditions générales
                </Link>{" "}
                et la{" "}
                <Link href="/legal/confidentialite" target="_blank" className="font-semibold underline underline-offset-4">
                  politique de confidentialité
                </Link>
              </>
            }
          />
          <FormError id="cgv-error">{errors.cgv}</FormError>
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <Button type="submit" size="lg" icon={UserPlus} loading={loading} fullWidth>
          Créer mon compte
        </Button>
        <p className="text-center text-caption text-muted">
          Prototype : votre compte reste dans ce navigateur et le mot de passe n&apos;est pas enregistré.
        </p>
      </div>
    </form>
  );
}

/* ---------------- Connexion ---------------- */

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAccount();
  const { show } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!EMAIL_RE.test(email.trim())) err.email = "Vérifiez l'adresse : elle doit ressembler à prenom@mail.fr.";
    if (!password) err.password = "Indiquez votre mot de passe.";
    setErrors(err);
    if (err.email || err.password) return;
    const problem = login(email);
    if (problem) {
      setErrors({ email: problem });
      return;
    }
    show({ type: "success", message: "Vous êtes connecté." });
  };

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <Field label="Mot de passe" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
      <Button type="submit" size="lg" fullWidth>
        Me connecter
      </Button>
      <p className="text-center text-[15px] text-muted">
        Pas encore de compte ?{" "}
        <button type="button" onClick={onSwitch} className="font-semibold text-ink underline underline-offset-4">
          Créer un compte
        </button>
      </p>
    </form>
  );
}

/* ---------------- Espace connecté ---------------- */

function Dashboard() {
  const { account, orders, logout, deleteAccount } = useAccount();
  const { show } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  if (!account) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface p-6 shadow-e1 sm:flex-row sm:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-action font-display text-[22px] font-semibold text-on-action">
          {account.firstName.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-subtitle">Bonjour {account.firstName}</h2>
          <p className="truncate text-muted">
            {account.firstName} {account.lastName} · {account.email}
          </p>
          <p className="text-caption text-muted">
            Client depuis le {new Date(account.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <Button
          variant="secondary"
          icon={LogOut}
          onClick={() => {
            logout();
            show({ type: "info", message: "Vous êtes déconnecté." });
          }}
        >
          Me déconnecter
        </Button>
      </div>

      <section aria-labelledby="mes-commandes" className="rounded-lg border border-line bg-surface p-6 shadow-e1">
        <h2 id="mes-commandes" className="text-subtitle">
          Mes commandes
        </h2>
        {orders.length === 0 ? (
          <div className="mt-4 flex flex-col items-start gap-3">
            <p className="text-muted">Vous n&apos;avez pas encore de commande avec cette adresse.</p>
            <ButtonLink href="/boutique" icon={ArrowRight} iconPosition="end">
              Découvrir nos produits
            </ButtonLink>
          </div>
        ) : (
          <ul className="mt-4 flex flex-col gap-3">
            {orders.map((o) => (
              <li key={o.number} className="rounded-md border border-line p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold tabular-nums">Commande {o.number}</p>
                  <span className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-3 py-1 text-caption font-semibold text-success">
                    <Package aria-hidden className="size-4" strokeWidth={2} />
                    En préparation · livraison sous 48 h
                  </span>
                </div>
                <p className="mt-1 text-caption text-muted">
                  {new Date(o.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })} ·{" "}
                  {o.livraison === "relais" ? "Point relais" : "À domicile"} · {formatPrice(o.total)}
                </p>
                <ul className="mt-2 text-[15px]">
                  {o.items.map((it) => (
                    <li key={it.slug}>
                      <Link href={`/produit/${it.slug}`} className="hover:underline">
                        {it.qty} × {it.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="mes-coordonnees" className="rounded-lg border border-line bg-surface p-6 shadow-e1">
        <h2 id="mes-coordonnees" className="text-subtitle">
          Mes coordonnées
        </h2>
        <dl className="mt-3 grid gap-3 text-[15px] sm:grid-cols-2">
          <div>
            <dt className="text-caption font-semibold uppercase tracking-[0.04em] text-muted">Adresse de livraison</dt>
            <dd>
              {account.title ? `${account.title === "M" ? "M." : "Mme"} ` : ""}
              {account.firstName} {account.lastName}
              <br />
              {account.address}
              {account.address2 && (
                <>
                  <br />
                  {account.address2}
                </>
              )}
              <br />
              {account.postalCode} {account.city}, {account.country}
            </dd>
          </div>
          <div className="flex flex-col gap-3">
            <div>
              <dt className="text-caption font-semibold uppercase tracking-[0.04em] text-muted">Mobile</dt>
              <dd>{account.phone}</dd>
            </div>
            {account.birthDate && (
              <div>
                <dt className="text-caption font-semibold uppercase tracking-[0.04em] text-muted">Date de naissance</dt>
                <dd>{account.birthDate}</dd>
              </div>
            )}
          </div>
        </dl>
      </section>

      <section aria-labelledby="mes-infos" className="rounded-lg border border-line bg-surface p-6 shadow-e1">
        <h2 id="mes-infos" className="text-subtitle">
          Mes préférences
        </h2>
        <p className="mt-2 text-muted">
          Newsletter : {account.newsletter ? "inscrit·e" : "non inscrit·e"}. Vos coordonnées sont pré-remplies au paiement.
        </p>
        <Button variant="text" icon={Trash2} className="mt-3" onClick={() => setConfirmDelete(true)}>
          Supprimer mon compte
        </Button>
      </section>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Supprimer votre compte ?"
        primary={{
          label: "Supprimer mon compte",
          icon: Trash2,
          onClick: () => {
            setConfirmDelete(false);
            deleteAccount();
            show({ type: "info", message: "Votre compte et son historique ont été supprimés." });
          },
        }}
        secondary={{ label: "Annuler", onClick: () => setConfirmDelete(false) }}
      >
        Votre compte et l&apos;historique de vos commandes seront effacés de ce navigateur. Cette action est définitive.
      </Modal>
    </div>
  );
}

/* ---------------- Page ---------------- */

function CompteContent() {
  const params = useSearchParams();
  const { hydrated, account } = useAccount();
  const [tab, setTab] = useState<"creer" | "connexion">(params.get("mode") === "connexion" ? "connexion" : "creer");

  if (!hydrated) return <div className="mx-auto min-h-[50vh] max-w-[640px] px-4 py-10" aria-busy="true" />;

  return (
    <div className="mx-auto max-w-[680px] px-4 pb-12 pt-6 md:px-8 md:pt-10">
      <h1 className="text-title">{account ? "Mon compte" : "Votre compte Sève"}</h1>
      {!account && (
        <p className="mt-2 text-muted">
          Facultatif : vous pouvez toujours commander sans compte. Avec un compte, retrouvez vos commandes et gagnez du temps
          au paiement.
        </p>
      )}

      <div className="mt-6">
        {account ? (
          <Dashboard />
        ) : (
          <>
            <div role="tablist" aria-label="Compte" className="grid grid-cols-2 gap-1 rounded-pill border-2 border-line bg-surface p-1">
              {(
                [
                  ["creer", "Créer un compte"],
                  ["connexion", "J'ai déjà un compte"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  type="button"
                  aria-selected={tab === id}
                  onClick={() => setTab(id)}
                  className={cn(
                    "relative min-h-11 rounded-pill px-3 text-[14px] font-semibold transition-colors md:text-[15px]",
                    tab === id ? "text-on-action" : "text-ink hover:bg-action-tint"
                  )}
                >
                  {tab === id && (
                    <motion.span layoutId="compte-tab" className="absolute inset-0 rounded-pill bg-action" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-lg border border-line bg-surface p-6 shadow-e1 md:p-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                >
                  {tab === "creer" ? (
                    <RegisterForm initialEmail={params.get("email") ?? ""} onSwitch={() => setTab("connexion")} />
                  ) : (
                    <LoginForm onSwitch={() => setTab("creer")} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function ComptePage() {
  return (
    <Suspense>
      <CompteContent />
    </Suspense>
  );
}
