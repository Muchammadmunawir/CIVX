import Link from "next/link";
import type { ReactNode } from "react";
import type { CivxDimensionProduct2023, CivxProductSource2023 } from "@/lib/civx/product-view-types-2023";
import { formatScore } from "./format";

export function PageHeading({ title, description, breadcrumb, action }: {
  title: string; description: string; breadcrumb?: string; action?: ReactNode;
}) {
  return <header className="product-heading">
    {breadcrumb && <nav className="product-breadcrumb" aria-label="Jejak halaman"><Link href="/">Beranda</Link><span aria-hidden="true">/</span><span>{breadcrumb}</span></nav>}
    <div className="product-title-row"><div><h1>{title}<span className="product-period">.</span></h1><p>{description}</p></div>{action}</div>
  </header>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <div className="product-notice"><span aria-hidden="true">i</span><div>{children}</div></div>;
}

export function ScoreDisplay({ score, label = "Skor CIVX 2023" }: { score: number; label?: string }) {
  return <div className="product-score"><p>{label}</p><strong>{formatScore(score)} <small>/ 100</small></strong></div>;
}

export function DimensionBars({ dimensions }: { dimensions: readonly CivxDimensionProduct2023[] }) {
  return <div className="dimension-bars">{dimensions.map(dimension => <div className="dimension-row" key={dimension.dimensionId}>
    <div><span>{dimension.displayName}</span><strong>{formatScore(dimension.score)}</strong></div>
    <div className="pressure-track" aria-hidden="true"><span style={{ width: `${dimension.score}%` }} /></div>
  </div>)}<p className="product-caption">Skala tekanan relatif 0–100 · lebih tinggi berarti tekanan relatif lebih tinggi.</p></div>;
}

export function SourceLink({ source }: { source: CivxProductSource2023 }) {
  return <a className="civx-text-link" href={source.url} target="_blank" rel="noopener noreferrer">{source.title ?? source.publisher}<span className="civx-sr-only"> (buka tab baru)</span> ↗</a>;
}
