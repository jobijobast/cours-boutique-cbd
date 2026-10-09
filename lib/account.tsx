"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readStorage, removeStorage, writeStorage } from "./storage";

/**
 * Comptes clients — prototype sans serveur : tout reste dans le navigateur (localStorage).
 * Aucun mot de passe n'est enregistré.
 */
export type Account = {
  title: "M" | "Mme" | "";
  firstName: string;
  lastName: string;
  email: string;
  /** JJ/MM/AAAA, facultative */
  birthDate: string;
  address: string;
  address2: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
  newsletter: boolean;
  createdAt: string;
};

export type Order = {
  number: string;
  date: string;
  email: string;
  total: number;
  livraison: "relais" | "domicile";
  items: { slug: string; name: string; qty: number; price: number }[];
};

const ACCOUNTS_KEY = "seve-accounts";
const SESSION_KEY = "seve-session";
const ORDERS_KEY = "seve-orders";

const norm = (email: string) => email.trim().toLowerCase();

type AccountContextValue = {
  hydrated: boolean;
  account: Account | null;
  orders: Order[];
  /** Renvoie un message d'erreur, ou null si tout va bien */
  register: (data: Omit<Account, "createdAt">) => string | null;
  login: (email: string) => string | null;
  logout: () => void;
  deleteAccount: () => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

/** Enregistre une commande (appelé à la fin du paiement, avec ou sans compte) */
export function saveOrder(order: Order) {
  const list = readStorage<Order[]>(ORDERS_KEY, []);
  writeStorage(ORDERS_KEY, [order, ...list].slice(0, 50));
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const loadOrders = useCallback((email: string | null) => {
    if (!email) return setOrders([]);
    setOrders(readStorage<Order[]>(ORDERS_KEY, []).filter((o) => norm(o.email) === norm(email)));
  }, []);

  useEffect(() => {
    const session = readStorage<string | null>(SESSION_KEY, null);
    const found = session ? readStorage<Account[]>(ACCOUNTS_KEY, []).find((a) => a.email === session) ?? null : null;
    setAccount(found);
    loadOrders(found?.email ?? null);
    setHydrated(true);
    // Les commandes passées dans un autre onglet apparaissent au retour sur la page
    const onFocus = () => loadOrders(readStorage<string | null>(SESSION_KEY, null));
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [loadOrders]);

  const register = useCallback(
    (data: Omit<Account, "createdAt">) => {
      const email = norm(data.email);
      const accounts = readStorage<Account[]>(ACCOUNTS_KEY, []);
      if (accounts.some((a) => a.email === email)) {
        return "Un compte existe déjà avec cette adresse. Connectez-vous avec l'onglet « J'ai déjà un compte ».";
      }
      const created: Account = { ...data, email, createdAt: new Date().toISOString() };
      writeStorage(ACCOUNTS_KEY, [...accounts, created]);
      writeStorage(SESSION_KEY, email);
      setAccount(created);
      loadOrders(email);
      return null;
    },
    [loadOrders]
  );

  const login = useCallback(
    (emailRaw: string) => {
      const email = norm(emailRaw);
      const found = readStorage<Account[]>(ACCOUNTS_KEY, []).find((a) => a.email === email);
      if (!found) return "Aucun compte n'existe avec cette adresse. Vérifiez l'e-mail ou créez un compte.";
      writeStorage(SESSION_KEY, email);
      setAccount(found);
      loadOrders(email);
      return null;
    },
    [loadOrders]
  );

  const logout = useCallback(() => {
    removeStorage(SESSION_KEY);
    setAccount(null);
    setOrders([]);
  }, []);

  const deleteAccount = useCallback(() => {
    if (!account) return;
    writeStorage(
      ACCOUNTS_KEY,
      readStorage<Account[]>(ACCOUNTS_KEY, []).filter((a) => a.email !== account.email)
    );
    writeStorage(
      ORDERS_KEY,
      readStorage<Order[]>(ORDERS_KEY, []).filter((o) => norm(o.email) !== account.email)
    );
    logout();
  }, [account, logout]);

  const value = useMemo(
    () => ({ hydrated, account, orders, register, login, logout, deleteAccount }),
    [hydrated, account, orders, register, login, logout, deleteAccount]
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error("useAccount doit être utilisé dans <AccountProvider>");
  return ctx;
}
