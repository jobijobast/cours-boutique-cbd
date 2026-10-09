"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, LogOut, Mail, Package, Trash2, User, UserPlus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Suspense, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Controls";
import { Field } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAccount } from "@/lib/account";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/data/products";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------------- Création de compte ---------------- */

function RegisterForm({ initialEmail }: { initialEmail: string }) {
  const { register } = useAccount();
  const { show } = useToast();
  const [f, setF] = useState({ firstName: "", lastName: "", email: initialEmail, password: "", adult: false, newsletter: false });
  const [errors, setErrors] = useState<Partial<Record<keyof typeof f | "form", string>>>({});
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err: typeof errors = {};
    if (!f.firstName.trim()) err.firstName = "Indiquez votre prénom.";
    if (!f.lastName.trim()) err.lastName = "Indiquez votre nom.";
    if (!EMAIL_RE.test(f.email.trim())) err.email = "Vérifiez l'adresse : elle doit ressembler à prenom@mail.fr.";
    if (f.password.length < 8) err.password = "Choisissez un mot de passe d'au moins 8 caractères.";
    if (!f.adult) err.adult = "Cochez cette case : la boutique est réservée aux adultes.";
    setErrors(err);
    const first = Object.keys(err)[0];
    if (first) {
      e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      const problem = register({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        email: f.email,
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

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Prénom" name="firstName" autoComplete="given-name" icon={User} value={f.firstName} onChange={(e) => set("firstName", e.target.value)} error={errors.firstName} />
        <Field label="Nom" name="lastName" autoComplete="family-name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} error={errors.lastName} />
      </div>
      <Field
        label="Adresse e-mail"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        icon={Mail}
        placeholder="prenom@mail.fr"
        helper="Vos commandes passées avec cette adresse apparaîtront dans votre compte."
        value={f.email}
        onChange={(e) => set("email", e.target.value)}
        error={errors.email}
      />
      <Field
        label="Mot de passe"
        name="password"
        type="password"
        autoComplete="new-password"
        helper="8 caractères minimum."
        value={f.password}
        onChange={(e) => set("password", e.target.value)}
        error={errors.password}
      />
      <div className="flex flex-col gap-1">
        <Checkbox
          name="adult"
          checked={f.adult}
          onChange={(e) => set("adult", e.target.checked)}
          aria-invalid={errors.adult ? true : undefined}
          label="Je confirme avoir 18 ans ou plus"
        />
        {errors.adult && <p className="text-caption font-medium text-alert">{errors.adult}</p>}
        <Checkbox
          name="newsletter"
          checked={f.newsletter}
          onChange={(e) => set("newsletter", e.target.checked)}
          label="Recevoir les nouveautés et les nouveaux lots par e-mail"
          description="Facultatif, désinscription en un clic."
        />
      </div>
      <Button type="submit" size="lg" icon={UserPlus} loading={loading} fullWidth>
        Créer mon compte
      </Button>
      <p className="text-center text-caption text-muted">
        Prototype : votre compte reste dans ce navigateur et le mot de passe n&apos;est pas enregistré.
      </p>
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
                    <RegisterForm initialEmail={params.get("email") ?? ""} />
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
