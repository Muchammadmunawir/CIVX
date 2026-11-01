import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="civx-footer">
      <div className="civx-container">
        <div className="civx-footer-grid">
          <div><Link className="civx-footer-brand" href="/">CIV<span>X</span></Link><p>Memahami tekanan relatif wilayah.<br />CIVX · Jawa Barat 2023.</p></div>
          <div><p>Jelajahi CIVX</p><nav aria-label="Navigasi footer"><Link href="/explore">Jelajah wilayah</Link><Link href="/compare">Bandingkan</Link><Link href="/methodology">Metodologi</Link><Link href="/sources">Sumber Data</Link></nav></div>
          <div><span className="product-tag">27 wilayah · 6 dimensi · 18 indikator</span><p>Skor bukan penilaian absolut kualitas wilayah.<br />Baca indikator, konteks, dan keterbatasannya.</p></div>
        </div>
        <div className="civx-footer-bottom"><span>CIVX — Civic Index</span><span>Jawa Barat, Indonesia</span></div>
      </div>
    </footer>
  );
}
