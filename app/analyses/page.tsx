import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { ProductVisual, labReportHref } from "@/components/shop/ProductBits";
import { catalog } from "@/lib/data/products";

export const metadata: Metadata = { title: "Analyses labo" };

export default function AnalysesPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 pb-8 pt-6 md:px-8 md:pt-10">
      <h1 className="text-title">Analyses labo</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Chaque lot est analysé par un laboratoire indépendant : taux de CBD, THC &lt; 0,3 %, pesticides et métaux
        lourds. Les rapports sont publiés sans retouche.
      </p>
      <ul className="mt-8 grid gap-3">
        {catalog.map((p) => (
          <li
            key={p.slug}
            className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-4 shadow-e1 sm:flex-row sm:items-center"
          >
            <ProductVisual product={p} size="sm" className="size-14 shrink-0 rounded-md" />
            <div className="flex-1">
              <h2 className="text-[17px]">
                <Link href={`/produit/${p.slug}`} className="hover:underline">
                  {p.name}
                </Link>
              </h2>
              <p className="text-caption text-muted">Lot {p.lot} · THC &lt; 0,3 % · conforme</p>
            </div>
            <a
              href={labReportHref(p.lot)}
              download={`analyse-${p.lot}.pdf`}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-pill border-2 border-action px-4 text-[15px] font-semibold transition-colors duration-200 hover:bg-action-tint"
            >
              <Download aria-hidden className="size-5" strokeWidth={2} />
              Rapport du lot {p.lot} <span className="font-normal text-muted">(PDF)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
