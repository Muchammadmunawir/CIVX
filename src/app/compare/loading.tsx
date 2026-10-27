import styles from "@/components/compare/comparison.module.css";

export default function LoadingComparison() {
  return (
    <main className={`civx-container ${styles.page}`} aria-busy="true" aria-describedby="comparison-loading">
      <header className={styles.intro}>
        <div><h1>Compare regions</h1><p>Jawa Barat · Published release</p></div>
      </header>
      <section className={styles.selector} aria-labelledby="loading-selection-heading">
        <div className={styles.sectionHead}><h2 id="loading-selection-heading">Choose your pair</h2></div>
        <div className={styles.loadingBlocks} aria-hidden="true"><span /><span /><span /></div>
        <p id="comparison-loading" role="status" className={styles.loadingStatus}>Loading selected CIVX records and indicator differences…</p>
      </section>
    </main>
  );
}
