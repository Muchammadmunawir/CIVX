"use client";

import { useState } from "react";
import type { CivxRegionProductHeader2023 } from "@/lib/civx/product-view-types-2023";
import { createExploreCsv2023, REPORTING_SCOPE_2023 } from "@/lib/civx/export-2023";
import styles from "./explore.module.css";

export function CsvDownload({ regions }: { regions: readonly CivxRegionProductHeader2023[] }) {
  const [feedback, setFeedback] = useState("");
  const download = () => {
    try {
      const { content, filename } = createExploreCsv2023(regions, {
        methodologyUrl: new URL("/methodology", window.location.origin).href,
        sourcesUrl: new URL("/sources", window.location.origin).href,
        reportingUrl: new URL("/methodology#ekspor-dan-laporan", window.location.origin).href,
      });
      const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      try {
        link.href = url;
        link.download = filename;
        document.body.append(link);
        link.click();
      } finally {
        link.remove();
        // Keep the URL alive while browsers start reading the download.
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      }
      setFeedback(`Permintaan unduhan ${regions.length} identitas wilayah telah dikirim. Skor tidak disertakan.`);
    } catch {
      setFeedback("CSV tidak dapat disiapkan. Coba kembali melalui peramban yang mendukung unduhan berkas.");
    }
  };

  return <div className={styles.export}>
    <button className="civx-button civx-button-secondary" type="button" onClick={download} disabled={regions.length === 0} aria-describedby="csv-scope">Unduh CSV</button>
    <p id="csv-scope" className="product-caption">{REPORTING_SCOPE_2023}. Seluruh hasil filter, bukan hanya halaman tabel. <a className="civx-text-link" href="/methodology#ekspor-dan-laporan">Ketentuan ekspor</a>.</p>
    <p className="product-caption" role="status" aria-atomic="true">{regions.length === 0 ? "Tidak ada wilayah sesuai filter untuk diunduh." : feedback}</p>
  </div>;
}
