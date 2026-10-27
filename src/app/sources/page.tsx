import type { Metadata } from "next";
import Link from "next/link";
import { CandidateAudits, RawInputReferences, RegionalSourceEvidence, SourceArtifacts, SourceDirectory } from "@/components/data/source-directory";
import { civicRelease, coreIndicators, currentRegions } from "@/lib/civx/current";
import styles from "./sources-page.module.css";

export const metadata: Metadata = {
  title: "Sources",
  description: "Institutional sources, artifacts, candidate audits, raw-input fingerprints, and regional evidence behind the current CIVX Jawa Barat release.",
};

export default function SourcesRoute() {
  const institutions = [...new Set([
    ...civicRelease.sources.map((source) => source.publisher),
    ...civicRelease.candidates.map((candidate) => candidate.institution),
  ])];

  return (
    <main className={`civx-container ${styles.page}`}>
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <span className="civx-eyebrow">CIVX / Jawa Barat / {civicRelease.period} / Sources</span>
          <h1>Follow the evidence</h1>
          <p className={styles.lead}>Follow every source institution, original artifact, raw-input reference, and candidate decision. Keep common-core inputs separate from optional context and advantages.</p>
          <p className={styles.release}>Release {civicRelease.releaseId} <span aria-hidden="true">·</span> {coreIndicators.length} core indicators <span aria-hidden="true">·</span> {civicRelease.sources.length} source records</p>
        </div>
        <div className={styles.publicationPanel}>
          <span className="civx-eyebrow">All release institutions</span>
          <p className={styles.introContext}>Evidence extends beyond any single publisher.</p>
          <p className={styles.publisher}>Source records describe cited publications. Candidate audits retain discovery, exclusions, coverage limits, and evidence that cannot support scoring. Presence in this directory is not institutional endorsement.</p>
          <dl className={styles.publicationFacts}>
            <div><dt>Artifacts</dt><dd className="civx-mono">{civicRelease.artifacts.length}</dd></div>
            <div><dt>Candidate audits</dt><dd className="civx-mono">{civicRelease.candidates.length}</dd></div>
            <div><dt>Raw inputs</dt><dd className="civx-mono">{civicRelease.inputs.length}</dd></div>
          </dl>
        </div>
      </header>
      <nav className={styles.contents} aria-label="On this page">
        <span>On this page</span>
        <a href="#source-table-heading">Source catalog</a>
        <a href="#source-artifact-heading">Artifacts</a>
        <a href="#source-audit-heading">Candidate audits</a>
        <a href="#source-input-heading">Raw references</a>
        <a href="#source-regional-heading">Regional evidence</a>
      </nav>

      <section className={styles.section} aria-labelledby="source-table-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">01 / Source catalog</span>
          <h2 id="source-table-heading">{civicRelease.sources.length} cited source records</h2>
          <p>All current release sources appear here, whether used for common-core scoring, context, advantages, or quality audits. Each record keeps its institution, year, table or excerpt, page, period, revision, and artifact reference.</p>
        </div>
        <details className={styles.disclosure}>
          <summary>Institutions named by the release</summary>
          <ul>{institutions.map((institution) => <li key={institution}>{institution}</li>)}</ul>
        </details>
        <nav className={styles.indicatorNav} aria-label="Jump to a core indicator source">
          {coreIndicators.map((indicator) => <a key={indicator.id} href={`#source-${indicator.sourceId}`}>{indicator.label}</a>)}
        </nav>
        <SourceDirectory />
      </section>

      <section className={styles.section} aria-labelledby="source-artifact-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">02 / Artifact register</span>
          <h2 id="source-artifact-heading">Verify every preserved reference</h2>
          <p>Artifact identifiers are SHA-256 fingerprints of the inspected files or snapshots. Repository paths are reproducibility references, not public download links. External originals remain subject to their source terms; a fingerprint does not grant redistribution rights.</p>
        </div>
        {civicRelease.sourceVerification?.mode === "validated_transcriptions" && <p className={styles.note}>This release explicitly replays previously audited, fingerprinted transcriptions. Available original artifacts were checked again. The health-profile original could not be reacquired; its prior audited observations remain unchanged. Each artifact records its build-verification status below.</p>}
        <SourceArtifacts />
      </section>

      <section className={styles.section} aria-labelledby="source-audit-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">03 / Candidate decisions</span>
          <h2 id="source-audit-heading">Keep accepted and excluded evidence visible</h2>
          <p>Open any of the {civicRelease.candidates.length} candidate audits for its definition, coverage, classification, reason, limitations, and full evidence locators. Historical, partial, incompatible, and rejected candidates remain visible without becoming score inputs.</p>
        </div>
        <CandidateAudits />
      </section>

      <section className={styles.section} aria-labelledby="source-input-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">04 / Reproducibility inputs</span>
          <h2 id="source-input-heading">Raw references, fixed fingerprints</h2>
          <p>These exact input paths and SHA-256 hashes belong to release {civicRelease.releaseId}, method {civicRelease.methodology.methodologyVersion}, reference set {civicRelease.methodology.referenceSetId}. Historical names in paths identify immutable lineage, not a product switch.</p>
        </div>
        <RawInputReferences />
      </section>

      <section className={styles.section} aria-labelledby="source-regional-heading">
        <div className={styles.sectionHeading}>
          <span className="civx-eyebrow">05 / Regional observation evidence</span>
          <h2 id="source-regional-heading">From each value to its source row</h2>
          <p>Open a region, then an observation, for raw values, source locators, artifact references, geography, units, verification, denominator definitions, and derived numerator/denominator evidence. All {currentRegions.length} regions retain optional context, advantage presence states, and reasons for missing evidence. Missing data is not zero or verified absence.</p>
        </div>
        <RegionalSourceEvidence />
        <nav className={styles.nextLinks} aria-label="Continue exploring CIVX">
          <Link className="civx-text-link" href="/methodology">How CIVX transforms observations <span aria-hidden="true">↗</span></Link>
          <Link className="civx-text-link" href="/explore">Explore regional results <span aria-hidden="true">↗</span></Link>
        </nav>
      </section>
    </main>
  );
}
