"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, ShoppingBag, Store, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/cn";
import { isActive } from "./Header";

const TABS = [
  { href: "/boutique", label: "Nos produits", icon: Store, match: ["/boutique", "/produit", "/analyses", "/guide"] },
  { href: "/quiz", label: "Quiz", icon: Compass, match: ["/quiz", "/resultats"] },
  { href: "/panier", label: "Panier", icon: ShoppingBag, match: ["/panier", "/paiement"] },
  { href: "/compte", label: "Compte", icon: User, match: ["/compte"] },
];

export function TabBar() {
  const pathname = usePathname();
  const { count, hydrated } = useCart();
  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = isActive(pathname, match);
          const badge = href === "/panier" && hydrated && count > 0 ? count : null;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 text-[12px] font-medium transition-colors duration-200",
                  active ? "text-ink" : "text-muted"
                )}
              >
                <span
                  className={cn(
                    "relative grid h-8 w-14 place-items-center rounded-pill transition-colors duration-200",
                    active && "bg-action-tint"
                  )}
                >
                  <Icon aria-hidden className="size-6" strokeWidth={2} />
                  {badge !== null && (
                    <span className="absolute -top-1 right-1.5 grid min-w-5 place-items-center rounded-pill bg-action px-1 text-[11px] font-bold leading-5 text-on-action">
                      {badge}
                      <span className="sr-only"> article{badge > 1 ? "s" : ""}</span>
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
