"use client";

import Link from "next/link";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <main className="civx-container civx-state">
      <p className="civx-eyebrow">CIVX / Unable to load</p>
      <h1>This view couldn’t load.</h1>
      <p>CIVX has not substituted data or calculated a partial score. Try the view again, or return to Explore.</p>
      <div className="civx-state-actions"><button className="civx-button civx-button-primary" onClick={reset}>Try again</button><Link className="civx-button civx-button-secondary" href="/explore">Explore regions</Link></div>
    </main>
  );
}
