"use client";

import Link from "next/link";

export default function ErrorBoundary({ reset }: { reset: () => void }) {
  return (
    <main className="civx-container civx-state">
      <p>CIVX / Tampilan tidak dapat dimuat</p>
      <h1>Tampilan tidak dapat dimuat.</h1>
      <p>CIVX tidak mengganti data atau menghitung skor parsial. Coba lagi atau kembali ke Jelajah.</p>
      <div className="civx-state-actions"><button className="civx-button civx-button-primary" onClick={reset}>Coba lagi</button><Link className="civx-button civx-button-secondary" href="/explore">Jelajah wilayah</Link></div>
    </main>
  );
}
