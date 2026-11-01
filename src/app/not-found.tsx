import Link from "next/link";

export default function NotFound() {
  return (
    <main className="civx-container civx-state">
      <p>CIVX / Wilayah tidak ditemukan</p>
      <h1>Wilayah tidak ditemukan.</h1>
      <p>Model CIVX 2023 mencakup 27 kabupaten/kota Jawa Barat. Cari wilayah melalui Jelajah.</p>
      <div className="civx-state-actions"><Link className="civx-button civx-button-primary" href="/explore">Jelajah wilayah</Link><Link className="civx-button civx-button-secondary" href="/">Kembali ke Beranda</Link></div>
    </main>
  );
}
