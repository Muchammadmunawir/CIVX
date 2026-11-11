import styles from "@/components/compare/comparison.module.css";

export default function LoadingComparison() {
  return <main className={`civx-container product-page ${styles.loading}`} aria-busy="true"><h1>Bandingkan wilayah.</h1><p role="status">Memuat skor CIVX 2023 dan perbedaan indikator…</p><div className="civx-skeleton" aria-hidden="true" /></main>;
}
