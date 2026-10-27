import Link from "next/link";

export default function NotFound() {
  return (
    <main className="civx-container civx-state">
      <p className="civx-eyebrow">CIVX / Record not found</p>
      <h1>This record isn’t in the release.</h1>
      <p>The 2023 Jawa Barat release contains 27 kabupaten/kota. Use Explore to find a published regional record.</p>
      <div className="civx-state-actions"><Link className="civx-button civx-button-primary" href="/explore">Explore regions</Link><Link className="civx-button civx-button-secondary" href="/">Return home</Link></div>
    </main>
  );
}
