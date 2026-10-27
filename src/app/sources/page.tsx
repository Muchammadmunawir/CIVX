import type { Metadata } from "next";
import Link from "next/link";
import { SourceDirectory } from "@/components/data/source-directory";
import { release } from "@/lib/civx/data";
import styles from "./sources-page.module.css";

export const metadata: Metadata = {
  title: "Sources",
  description: "BPS Jawa Barat yearbook tables and preserved source artifact references behind the 2023 Civic Index.",
};

export default function SourcesRoute() {
  return (
    <main className={`civx-container ${styles.page}`}>
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <span className="civx-eyebrow">Sources / {release.period}</span>
          <h1>Follow the evidence<span className={styles.accent}>.</span></h1>
          <p className={styles.lead}>Every indicator points back to its published BPS table. Find the year, unit, page, and original publication in one place.</p>
          <p className={styles.release}>CIVX release {release.releaseId} <span aria-hidden="true">·</span> {release.methodology.indicators.length} cited indicator tables</p>
        </div>
        <div className={styles.publicationPanel}>
          <span className="civx-eyebrow">Primary publication</span>
          <p className={styles.introContext}><a className={styles.inlineLink} href={release.artifact.publicationUrl} target="_blank" rel="noopener noreferrer"><cite>{release.artifact.publication}</cite> <span aria-hidden="true">↗</span></a></p>
          <p className={styles.publisher}>Badan Pusat Statistik Provinsi Jawa Barat (BPS Jawa Barat)</p>
          <dl className={styles.publicationFacts}>
            <div><dt>Publication no.</dt><dd className="civx-mono">{release.artifact.publicationNumber}</dd></div>
            <div><dt>Released</dt><dd className="civx-mono">{release.artifact.releasedAt}</dd></div>
            <div><dt>Revised</dt><dd className="civx-mono">{release.artifact.revisedAt}</dd></div>
          </dl>
        </div>
      </header>

      <section className={styles.section} aria-labelledby="source-table-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">01 / Data catalog</span>
          <h2 id="source-table-heading">Four indicators, four cited tables</h2>
          <p>Publication, organization, data year, table and page, unit, and original link appear on each record. Expand a record for its survey window and preserved fingerprint.</p>
        </div>
        <SourceDirectory indicators={release.methodology.indicators} sources={release.sources} publication={release.artifact.publication} />
      </section>

      <section className={styles.section} aria-labelledby="source-artifact-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">02 / Source artifact</span>
          <h2 id="source-artifact-heading">Verify the publication</h2>
        </div>
        <div className={styles.artifact}>
          <div>
            <h3>Preserved reference</h3>
            <p>The referenced PDF was retrieved {release.artifact.retrievedAt} ({release.artifact.bytes.toLocaleString("en-US")} bytes). Its SHA-256 fingerprint is:</p>
            <p className={`civx-mono ${styles.sha}`}>{release.artifact.id.slice(7)}</p>
          </div>
          <div>
            <h3>Access and limitations</h3>
            <p><a className={styles.inlineLink} href={release.artifact.downloadUrl} target="_blank" rel="noopener noreferrer">Download the original PDF from BPS <span aria-hidden="true">↗</span></a>. CIVX does not host the full publication; BPS usage terms and its reproduction restriction apply. Survey windows within {release.period} differ by indicator.</p>
          </div>
        </div>
        <nav className={styles.nextLinks} aria-label="Continue exploring CIVX">
          <Link className="civx-text-link" href="/methodology">How CIVX transforms the observations <span aria-hidden="true">↗</span></Link>
          <Link className="civx-text-link" href="/explore">Explore regional results <span aria-hidden="true">↗</span></Link>
        </nav>
      </section>
    </main>
  );
}
