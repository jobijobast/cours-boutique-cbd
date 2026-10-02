import type { Metadata, Viewport } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { Providers } from "./providers";
import { Header } from "@/components/layout/Header";
import { TrustBanner } from "@/components/layout/TrustBanner";
import { Footer } from "@/components/layout/Footer";
import { TabBar } from "@/components/layout/TabBar";
import { AgeGate } from "@/components/layout/AgeGate";
import { CookieBanner } from "@/components/layout/CookieBanner";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["300", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Sève — CBD premium et transparent", template: "%s · Sève" },
  description:
    "CBD premium 100 % transparent : analyse labo sur chaque lot, THC < 0,3 %, livraison discrète en 48 h. Réservé aux adultes.",
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-dvh">
        <Providers>
          <a href="#contenu" className="skip-link rounded-pill bg-action px-4 py-2 font-semibold text-on-action">
            Aller au contenu
          </a>
          <Header />
          <TrustBanner />
          <main id="contenu" tabIndex={-1} className="focus:outline-none">
            {children}
          </main>
          <Footer />
          <TabBar />
          <CookieBanner />
          <AgeGate />
        </Providers>
      </body>
    </html>
  );
}
