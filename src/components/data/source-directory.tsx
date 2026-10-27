import type { CivicIndicatorPolicy, SourceReference } from "@/lib/civx/types";
import styles from "./source-directory.module.css";

interface SourceDirectoryProps {
  indicators: readonly CivicIndicatorPolicy[];
  sources: readonly SourceReference[];
  publication: string;
}

export function SourceDirectory({ indicators, sources, publication }: SourceDirectoryProps) {
  return (
    <ol className={styles.records} aria-label="Indicator source records">
      {indicators.map((indicator, index) => {
        const source = sources.find((entry) => entry.id === indicator.sourceId);
        return (
          <li key={indicator.id}>
            <article className={styles.record} aria-labelledby={`source-${indicator.id}`}>
              <div className={styles.recordIntro}>
                <div className={styles.identity}>
                  <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <span className={styles.recordLabel}>Indicator / source record</span>
                    <h3 id={`source-${indicator.id}`}>{indicator.label}</h3>
                    <p>{source ? source.title : "The source record is unavailable."}</p>
                  </div>
                </div>
              </div>
              {source && (
                <>
                  <dl className={styles.facts}>
                    <div><dt>Organization</dt><dd>{source.publisher}</dd></div>
                    <div><dt>Publication</dt><dd>{publication}</dd></div>
                    <div><dt>Data year</dt><dd className="civx-mono">{source.dataYear}</dd></div>
                    <div><dt>Table</dt><dd className="civx-mono">{source.table}</dd></div>
                    <div><dt>Page</dt><dd className="civx-mono">{source.page}</dd></div>
                    <div><dt>Unit</dt><dd>{indicator.unit}</dd></div>
                    <div><dt>Reference period</dt><dd>{source.referencePeriod}</dd></div>
                    <div><dt>Original link</dt><dd><a className={styles.sourceLink} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`Open BPS publication for ${indicator.label} (opens in a new tab)`}>View publication <span aria-hidden="true">↗</span></a></dd></div>
                  </dl>
                  <details className={styles.technical}>
                    <summary>Source identifier &amp; PDF fingerprint</summary>
                    <dl>
                      <div><dt>Source record</dt><dd className="civx-mono">{source.id}</dd></div>
                      <div><dt>PDF SHA-256</dt><dd className="civx-mono">{source.artifactId.slice(7)}</dd></div>
                      <div><dt>Accessed</dt><dd className="civx-mono">{source.accessedAt}</dd></div>
                    </dl>
                  </details>
                </>
              )}
            </article>
          </li>
        );
      })}
    </ol>
  );
}
