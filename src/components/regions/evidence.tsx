import { civicRelease } from "@/lib/civx/current";
import type { V2Observation } from "@/lib/civx/v2/types";
import styles from "./record.module.css";

const candidatesById = new Map(civicRelease.candidates.map(candidate => [candidate.id, candidate]));
const sourcesById = new Map(civicRelease.sources.map(source => [source.id, source]));
const artifactsById = new Map(civicRelease.artifacts.map(artifact => [artifact.id, artifact]));
export const evidenceStatus = (status: string) => status.replaceAll("_", " ");

export function observationStatus(observation: V2Observation): string {
  if (observation.comparabilityStatus === "incompatible_geography") return "Incompatible geography";
  if (observation.comparabilityStatus !== "comparable") return "Unavailable";
  if (observation.coverageStatus === "historical") return "Historical";
  if (observation.coverageStatus === "partial_coverage") return "Partial";
  if (observation.coverageStatus === "available" && observation.verificationState === "verified") return "Available";
  return "Unavailable";
}

export function observationValue(observation: V2Observation): string {
  if (observation.kind === "advantage_signal") {
    return ({ verified_present: "Verified present", verified_absent: "Verified absent", no_comparable_data: "No comparable verified data", not_applicable: "Not applicable" })[observation.presence];
  }
  return observation.value === null ? "No comparable verified data" : `${String(observation.value)} ${observation.unit}`;
}

export function ObservationEvidence({ observation }: { observation: V2Observation }) {
  const candidate = candidatesById.get(observation.indicatorId);
  return (
    <div className={styles.evidence}>
      <p>Observation year: {observation.period ?? "unavailable"} · {observationStatus(observation)} · Comparability: {evidenceStatus(observation.comparabilityStatus)} · Verification: {observation.verificationState}.</p>
      {observation.missingReason && <p>{observation.missingReason}</p>}
      {observation.kind === "advantage_signal" && observation.whyAssigned && <p><strong>Assignment reason:</strong> {observation.whyAssigned}</p>}
      <dl>
        <div><dt>Raw observed value</dt><dd>{observationValue(observation)}</dd></div>
        <div><dt>Geography</dt><dd>{evidenceStatus(observation.geography.level)} · {observation.geography.code} · {observation.geography.boundaryReference}</dd></div>
        <div><dt>Unit and denominator</dt><dd>{observation.unit} · {observation.denominator?.definition ?? "No denominator: count, composite index or unavailable observation."}</dd></div>
        {observation.denominator && Object.entries(observation.denominator).filter(([key]) => key !== "definition").map(([key, value]) => <div key={key}><dt>Denominator {evidenceStatus(key)}</dt><dd>{String(value)}</dd></div>)}
        {observation.derivation && Object.entries(observation.derivation).map(([key, value]) => <div key={key}><dt>Derivation · {evidenceStatus(key)}</dt><dd>{String(value)}</dd></div>)}
      </dl>
      {observation.provenance.map((reference, index) => {
        const source = sourcesById.get(reference.sourceId);
        const artifact = artifactsById.get(reference.artifactId);
        return <div key={`${reference.sourceId}-${reference.artifactId}-${index}`}>
          {source && <><p><a href={source.url} target="_blank" rel="noopener noreferrer">{source.publisher} · {source.title} ↗</a></p><p>{source.table ? `Table ${source.table}` : "Official source record"} · {source.page} · {source.referencePeriod}</p><p>{source.revision} · Retrieved {source.accessedAt}.</p></>}
          <p>Source {reference.sourceId} · Row/excerpt: {reference.locator}</p>
          <p>Artifact {reference.artifactId}{artifact?.localPath ? ` · Raw reference: ${artifact.localPath}` : ""}</p>
          {artifact && <p><a href={artifact.url} target="_blank" rel="noopener noreferrer">Original artifact ↗</a> · {artifact.bytes.toLocaleString("en-US")} bytes · Retrieved {artifact.retrievedAt} · {artifact.redistribution}</p>}
        </div>;
      })}
      {!observation.provenance.length && candidate && <p><a href={candidate.sourceUrl} target="_blank" rel="noopener noreferrer">Candidate source ↗</a> · Discovery/audit only; no verified regional value.</p>}
      {candidate && <><p>{candidate.definition}</p><ul>{candidate.limitations.map(limit => <li key={limit}>{limit}</li>)}</ul></>}
      <p>Release {observation.releaseId}. Confidence: not assessed; no numeric confidence claim.</p>
    </div>
  );
}
