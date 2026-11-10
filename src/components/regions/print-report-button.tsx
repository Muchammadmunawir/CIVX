"use client";

import { useState } from "react";

export function PrintReportButton() {
  const [error, setError] = useState("");
  const print = () => {
    setError("");
    try {
      window.print();
    } catch {
      setError("Dialog cetak tidak dapat dibuka. Gunakan menu Cetak pada peramban, lalu pilih kertas A4.");
    }
  };
  return <div>
    <button className="civx-button civx-button-secondary" type="button" onClick={print} aria-describedby="print-scope">Cetak / Simpan PDF</button>
    <p id="print-scope" className="product-caption">A4 · identitas dan referensi saja. <a className="civx-text-link" href="/methodology#ekspor-dan-laporan">Ketentuan laporan</a>.</p>
    <p className="product-caption" role="alert">{error}</p>
  </div>;
}
