"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";

export const NAV = [
  { href: "/boutique", label: "Boutique", match: ["/boutique", "/produit"] },
  { href: "/quiz", label: "Trouver mon CBD", match: ["/quiz", "/resultats"] },
  { href: "/analyses", label: "Analyses labo", match: ["/analyses"] },
  { href: "/guide", label: "Le guide", match: ["/guide"] },
];

export function isActive(pathname: string, match: string[]) {
  return match.some((m) => pathname === m || pathname.startsWith(m + "/"));
}

export function Logo() {
  return (
    <Link href="/" className="font-display text-[26px] font-semibold leading-none tracking-tight text-ink">
      Sève<span className="sr-only"> — accueil</span>
    </Link>
  );
}

export function CartPill({ className }: { className?: string }) {
  const { count, hydrated } = useCart();
  const reduce = useReducedMotion();
  const n = hydrated ? count : 0;
  return (
    <Link
      href="/panier"
      data-cart-target
      className={cn(
        "inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-pill border-2 border-action bg-surface px-4 text-[15px] font-semibold text-ink",
        "transition-colors duration-200 hover:bg-action-tint",
        className
      )}
      aria-label={`Panier, ${n} article${n > 1 ? "s" : ""}`}
    >
      <ShoppingBag aria-hidden className="size-5" strokeWidth={2} />
      <span aria-hidden>
        Panier ·{" "}
        <motion.span
          key={n}
          className="inline-block tabular-nums"
          initial={reduce ? false : { scale: 1.5 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          {n}
        </motion.span>
      </span>
    </Link>
  );
}

function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/boutique?q=${encodeURIComponent(q.trim())}` : "/boutique");
  };
  return (
    <form role="search" onSubmit={submit} className="relative hidden xl:block">
      <label htmlFor="header-search" className="sr-only">
        Rechercher un produit
      </label>
      <Search
        aria-hidden
        strokeWidth={2}
        className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted"
      />
      <input
        id="header-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Rechercher un produit"
        className="min-h-11 w-56 rounded-pill border-2 border-line bg-page pl-11 pr-4 text-[15px] text-ink placeholder:text-muted transition-colors duration-200 hover:border-muted focus:border-focus xl:w-64"
      />
    </form>
  );
}

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-line bg-surface transition-shadow duration-300",
        scrolled && "shadow-e2"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-6 px-4 md:h-[72px] md:px-8">
        <Logo />
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => {
              const active = isActive(pathname, item.match);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative inline-flex min-h-11 items-center whitespace-nowrap rounded-pill px-3 text-[15px] font-medium transition-colors duration-200 hover:bg-action-tint",
                      active ? "text-ink" : "text-muted hover:text-ink"
                    )}
                  >
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="nav-underline"
                        aria-hidden
                        className="absolute inset-x-3 bottom-1.5 h-0.5 rounded-pill bg-action"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchBox />
          <Link
            href="/compte"
            className="hidden min-h-11 items-center gap-2 rounded-pill px-3 text-[15px] font-medium text-ink transition-colors duration-200 hover:bg-action-tint lg:inline-flex"
          >
            <User aria-hidden className="size-5" strokeWidth={2} />
            Compte
          </Link>
          <CartPill />
        </div>
      </div>
    </header>
  );
}
