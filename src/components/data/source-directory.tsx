import { civicRelease, coreIndicators, currentRegions } from "@/lib/civx/current";
import { ObservationEvidence } from "@/components/regions/evidence";
import styles from "./source-directory.module.css";

export function SourceDirectory() {
  return (
    <ol className={styles.records} aria-label="All release source records">
      {civicRelease.sources.map((source, index) => {
        const indicators = coreIndicators.filter((indicator) => indicator.sourceId === source.id);
        return (
          <li key={source.id}>
            <article className={styles.record} aria-labelledby={`source-${source.id}`}>
              <div className={styles.recordIntro}>
                <div className={styles.identity}>
                  <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <span className={styles.recordLabel}>{indicators.length > 0 ? "Common-core source" : "Context / advantage / audit source"}</span>
                    <h3 id={`source-${source.id}`}>{source.title}</h3>
                    <p>{indicators.map((indicator) => indicator.label).join(" · ") || "Retained as evidence, not an extra scoring input."}</p>
                  </div>
                </div>
              </div>
              <dl className={styles.facts}>
                <div><dt>Organization</dt><dd>{source.publisher}</dd></div>
                <div><dt>Revision</dt><dd>{source.revision}</dd></div>
                <div><dt>Data year</dt><dd className="civx-mono">{source.dataYear}</dd></div>
                <div><dt>Table</dt><dd className="civx-mono">{source.table ?? "No table; see source locator"}</dd></div>
                <div><dt>Page / locator</dt><dd>{source.page}</dd></div>
                <div><dt>Accessed</dt><dd className="civx-mono">{source.accessedAt}</dd></div>
                <div><dt>Reference period</dt><dd>{source.referencePeriod}</dd></div>
                <div><dt>Original link</dt><dd><a className={styles.sourceLink} href={source.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${source.title} (opens in a new tab)`}>View original source <span aria-hidden="true">↗</span></a></dd></div>
              </dl>
              <details className={styles.technical}>
                <summary>Source identifier and artifact reference</summary>
                <dl>
                  <div><dt>Source record</dt><dd className="civx-mono">{source.id}</dd></div>
                  <div><dt>Artifact SHA-256</dt><dd className="civx-mono"><a className={styles.sourceLink} href={`#artifact-${source.artifactId}`}>{source.artifactId}</a></dd></div>
                </dl>
              </details>
            </article>
          </li>
        );
      })}
    </ol>
  );
}

export function SourceArtifacts() {
  return (
    <ol className={styles.records} aria-label="All preserved source artifact references">
      {civicRelease.artifacts.map((artifact, index) => (
        <li key={artifact.id}>
          <article className={styles.record} aria-labelledby={`artifact-${artifact.id}`}>
            <div className={styles.recordIntro}>
              <span className={styles.recordLabel}>Artifact {index + 1} / {civicRelease.artifacts.length}</span>
              <h3 id={`artifact-${artifact.id}`}>{artifact.localPath ?? "External source artifact; not stored locally"}</h3>
              <p>{artifact.redistribution}</p>
            </div>
            <dl className={styles.facts}>
              {civicRelease.sourceVerification && <div><dt>Build verification</dt><dd>{civicRelease.sourceVerification.artifacts.find(record => record.artifactId === artifact.id)?.state === "bytes_verified" ? "Original bytes verified for this build" : "Previously audited, fingerprinted transcription; original not reverified for this build"}</dd></div>}
              <div><dt>SHA-256 identifier</dt><dd className="civx-mono">{artifact.id}</dd></div>
              <div><dt>Repository reference</dt><dd>{artifact.localPath ?? "Not persisted; reacquire from original URL subject to source terms"}</dd></div>
              <div><dt>Retrieved</dt><dd>{artifact.retrievedAt}</dd></div>
              <div><dt>Bytes</dt><dd className="civx-mono">{artifact.bytes.toLocaleString("en-US")}</dd></div>
              <div><dt>Original artifact</dt><dd><a className={styles.sourceLink} href={artifact.url} target="_blank" rel="noopener noreferrer">Open original artifact <span aria-hidden="true">↗</span></a></dd></div>
            </dl>
          </article>
        </li>
      ))}
    </ol>
  );
}

export function CandidateAudits() {
  return (
    <div className={styles.auditList}>
      {civicRelease.candidates.map((candidate) => (
        <details className={styles.audit} key={candidate.id} id={`candidate-${candidate.id}`}>
          <summary>{candidate.label} · {candidate.classification === "core" ? "Common core" : candidate.classification} · {candidate.status.replaceAll("_", " ")}</summary>
          <dl className={styles.facts}>
            <div><dt>Institution</dt><dd>{candidate.institution}</dd></div>
            <div><dt>Candidate identifier</dt><dd className="civx-mono">{candidate.id}</dd></div>
            <div><dt>Years inspected / discovered</dt><dd>{candidate.years.join(", ")}</dd></div>
            <div><dt>Unit</dt><dd>{candidate.unit}</dd></div>
            <div><dt>Coverage</dt><dd>{candidate.coverage}</dd></div>
            <div><dt>Definition</dt><dd>{candidate.definition}</dd></div>
            <div><dt>Classification reason</dt><dd>{candidate.reason}</dd></div>
            <div><dt>Original candidate source</dt><dd><a className={styles.sourceLink} href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer">Open candidate source <span aria-hidden="true">↗</span></a></dd></div>
          </dl>
          <h3>Limits and exclusions</h3>
          <ul className={styles.evidenceList}>{candidate.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}</ul>
          <h3>Full evidence and locators</h3>
          <ol className={styles.evidenceList}>{candidate.evidence.map((evidence, index) => <li key={`${candidate.id}-${index}`}>{evidence}</li>)}</ol>
        </details>
      ))}
    </div>
  );
}

export function RawInputReferences() {
  return (
    <ol className={styles.records} aria-label="Release input paths and SHA-256 fingerprints">
      {civicRelease.inputs.map((input) => (
        <li key={input.path}>
          <div className={styles.record}>
            <dl className={styles.facts}>
              <div><dt>Raw input / policy path</dt><dd className="civx-mono">{input.path}</dd></div>
              <div><dt>SHA-256</dt><dd className="civx-mono">{input.sha256}</dd></div>
            </dl>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function RegionalSourceEvidence() {
  return (
    <div className={styles.auditList}>
      {currentRegions.map((region) => (
        <details className={styles.audit} key={region.id}>
          <summary>{region.name} · {region.id} · {region.observations.length} evidence records</summary>
          <p className={styles.note}>Core observations, optional context, advantages, and explicitly missing evidence remain distinct. Optional evidence never changes pressure.</p>
          {region.observations.map((observation) => (
            <details className={styles.technical} key={observation.id}>
              <summary>{civicRelease.candidates.find((candidate) => candidate.id === observation.indicatorId)?.label ?? observation.indicatorId} · {observation.kind === "core_score_indicator" ? "Common core" : observation.kind === "context_indicator" ? "Context only" : "Advantage only"}</summary>
              <p className={`${styles.note} civx-mono`}>{observation.id}</p>
              <ObservationEvidence observation={observation} />
            </details>
          ))}
        </details>
      ))}
    </div>
  );
}
