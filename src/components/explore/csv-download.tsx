"use client";

import { useState } from "react";
import type { CivxRegionProductHeader2023 } from "@/lib/civx/product-view-types-2023";
import { createExploreCsv2023, REPORTING_SCOPE_2023 } from "@/lib/civx/export-2023";
import { createExploreExcel2023 } from "@/lib/civx/excel-export-2023";
import styles from "./explore.module.css";

function downloadFile(content: Blob, filename: string) {
  const url = URL.createObjectURL(content);
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
}

export function CsvDownload({ regions, filters }: {
  regions: readonly CivxRegionProductHeader2023[];
  filters: { readonly q: string; readonly type: "all" | "kabupaten" | "kota" };
}) {
  const [feedback, setFeedback] = useState("");
  const [preparingExcel, setPreparingExcel] = useState(false);
  const download = () => {
    try {
      const { content, filename } = createExploreCsv2023(regions);
      downloadFile(new Blob([content], { type: "text/csv;charset=utf-8" }), filename);
      setFeedback(`Permintaan unduhan CSV ${regions.length} identitas wilayah telah dikirim. Skor tidak disertakan.`);
    } catch {
      setFeedback("CSV tidak dapat disiapkan. Coba kembali melalui peramban yang mendukung unduhan berkas.");
    }
  };
  const downloadExcel = async () => {
    setPreparingExcel(true);
    setFeedback("Menyiapkan Excel berisi identitas wilayah dan informasi data.");
    try {
      const { content, filename } = await createExploreExcel2023(regions, filters);
      downloadFile(content, filename);
      setFeedback(`Permintaan unduhan Excel ${regions.length} identitas wilayah telah dikirim. Skor tidak disertakan.`);
    } catch {
      setFeedback("Excel tidak dapat disiapkan. Coba kembali melalui peramban yang mendukung unduhan berkas.");
    } finally {
      setPreparingExcel(false);
    }
  };

  return <div className={styles.export}>
    <div className={styles.exportActions} role="group" aria-label="Unduh identitas wilayah">
      <button className="civx-button civx-button-secondary" type="button" onClick={download} disabled={regions.length === 0} aria-describedby="export-scope">Unduh CSV</button>
      <button className="civx-button civx-button-secondary" type="button" onClick={downloadExcel} disabled={regions.length === 0 || preparingExcel} aria-busy={preparingExcel} aria-describedby="export-scope">Unduh Excel</button>
    </div>
    <p id="export-scope" className="product-caption">{REPORTING_SCOPE_2023}. Seluruh hasil filter, tanpa skor atau indikator. <a className="civx-text-link" href="/methodology#ekspor-dan-laporan">Informasi ekspor</a>.</p>
    <p className="product-caption" role="status" aria-atomic="true">{regions.length === 0 ? "Tidak ada wilayah sesuai filter untuk diunduh." : feedback}</p>
  </div>;
}
