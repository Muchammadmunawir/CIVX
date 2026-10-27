import Link from "next/link";
import { notFound } from "next/navigation";
import { PressureBadge } from "@/components/data/pressure-badge";
import { categoryForScore, civicRelease, coreIndicators, getCurrentRegion } from "@/lib/civx/current";
import type { V2Observation } from "@/lib/civx/v2/types";
import { ObservationEvidence, observationStatus, observationValue } from "./evidence";
import styles from "./region-detail.module.css";
import record from "./record.module.css";

const decimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const candidatesById = new Map(civicRelease.candidates.map(candidate => [candidate.id, candidate]));

function OptionalEvidence({ observations }: { observations: V2Observation[] }) {
  return observations.map(observation => <details className={record.disclosure} key={observation.id}>
    <summary>{coreIndicators.find(policy => policy.id === observation.indicatorId)?.label ?? candidatesById.get(observation.indicatorId)?.label ?? observation.indicatorId}<span className={record.status}>{observation.kind === "advantage_signal" ? observationValue(observation) : `${observationStatus(observation)} · ${observationValue(observation)}`} · {observation.period ?? "No regional observation year"}</span></summary>
    <ObservationEvidence observation={observation} />
  </details>);
}

export function RegionDetail({ id, contextual = false }: { id: string; contextual?: boolean }) {
  const region = getCurrentRegion(id);
  if (!region) notFound();
  const { pressure } = region;
  const { methodology } = civicRelease;
  const labelPrefix = `region-${id}-${contextual ? "context" : "page"}`;
  const context = region.observations.filter(observation => observation.kind === "context_indicator");
  const advantages = region.observations.filter(observation => observation.kind === "advantage_signal");
  const present = advantages.filter(observation => observation.kind === "advantage_signal" && observation.presence === "verified_present" && observation.verificationState === "verified" && observation.comparabilityStatus === "comparable");
  const otherAdvantages = advantages.filter(observation => !present.includes(observation));
  return (
    <article className={`${contextual ? styles.contextual : "civx-container"} ${styles.page}`}>
      {!contextual && <Link className={`civx-text-link ${styles.back}`} href="/explore">← Explore regions</Link>}
      <header className={styles.hero}>
        <div className={styles.identity}>
          <p className="civx-eyebrow">CIVX / Regional record / Jawa Barat / {civicRelease.period}</p>
          <h1 id={`${labelPrefix}-title`}>{region.name}</h1>
          <p className={styles.identityMeta}>{region.type === "kabupaten" ? "Regency" : "City"} · BPS region {region.id}</p>
          <p className={styles.boundary}>Boundary reference: {region.boundaryReference}</p>
          <p className={styles.releaseNote}>One common contract: {coreIndicators.length} validated core indicators across {methodology.dimensions.length} pressure dimensions. No imputation or region-specific reweighting.</p>
        </div>
        <div className={styles.result} aria-labelledby={`${labelPrefix}-status`}>
          <p className={styles.resultLabel}>Civic Index <span>· {civicRelease.period}</span></p>
          {pressure.status === "available" ? <>
            <PressureBadge category={categoryForScore(pressure.score)} />
            <h2 className={styles.score} id={`${labelPrefix}-status`}>{decimal.format(pressure.score)}<span> / 100</span></h2>
            <p className={styles.interpretation}>Higher means more modeled relative pressure, not better performance. Context and advantages do not change this score.</p>
            <div className={styles.scale} role="img" aria-label={`${region.name}: ${decimal.format(pressure.score)} out of 100. Higher means more modeled pressure.`}><div className={styles.scaleTrack}><span className={styles.scaleFill} style={{ width: `${pressure.score}%` }} /><span className={styles.primaryMarker} style={{ left: `${pressure.score}%` }} /></div><div className={styles.scaleTicks}><span>0 · lower</span><span>50</span><span>100 · higher</span></div></div>
          </> : <><h2 className={styles.unavailable} id={`${labelPrefix}-status`}>Index unavailable</h2><p>{pressure.reason}</p></>}
        </div>
      </header>
      <section className={styles.section} aria-labelledby={`${labelPrefix}-dimensions`}>
        <div className={styles.sectionHeading}><div><p className="civx-eyebrow">01 / Pressure dimensions</p><h2 id={`${labelPrefix}-dimensions`}>Inside the Civic Index</h2></div><Link className="civx-text-link" href={`/compare?a=${region.id}`}>Compare this region ↗</Link></div>
        <p className={styles.sectionIntro}>Dimension scores use the same fixed reference and budgets for every region. Expand a dimension for its index contribution.</p>
        {pressure.status === "available" && pressure.dimensions.map(dimension => <details className={record.disclosure} key={dimension.id}>
          <summary><span className={record.dimensionLine}><strong>{dimension.label}</strong><span>{decimal.format(dimension.score)} / 100 <small>{decimal.format(dimension.weight * 100)}% of index</small></span></span></summary>
          <p>{decimal.format(dimension.contribution)} index points contributed. A dimension score is not its weighted index contribution.</p>
        </details>)}
        {methodology.unsupportedDimensions.length > 0 && <details className={record.disclosure}><summary>Unscored dimensions · no zero or substitute score</summary><ul>{methodology.unsupportedDimensions.map(dimension => <li key={dimension.id}><strong>{dimension.label}:</strong> {dimension.reason}</li>)}</ul></details>}
      </section>
      <section className={styles.section} aria-labelledby={`${labelPrefix}-indicators`}>
        <div className={styles.sectionHeading}><div><p className="civx-eyebrow">02 / Validated core</p><h2 id={`${labelPrefix}-indicators`}>Core indicators</h2></div><p>{coreIndicators.length} shared inputs</p></div>
        <p className={styles.sectionIntro}>Raw observations, normalized pressure and weighted contributions are separate quantities. Expand each input for its source and calculation evidence.</p>
        {pressure.status === "available" && methodology.dimensions.flatMap(dimension => dimension.indicators.map(policy => {
          const component = pressure.dimensions.find(value => value.id === dimension.id)?.components.find(value => value.indicatorId === policy.id);
          const observation = component && region.observations.find(value => value.id === component.observationId);
          if (!component || !observation) return null;
          return <details className={record.disclosure} key={policy.id}>
            <summary>{policy.label}<span className={record.status}>{observationValue(observation)} · {decimal.format(component.score)} / 100 pressure · {decimal.format(component.contribution)} index points</span></summary>
            <dl className={record.keyValues}><div><dt>Dimension</dt><dd>{dimension.label}</dd></div><div><dt>Raw observed · {observation.period}</dt><dd>{observationValue(observation)}</dd></div><div><dt>Normalized pressure</dt><dd>{decimal.format(component.score)} / 100</dd></div><div><dt>Index contribution</dt><dd>{decimal.format(component.contribution)} points<small>{decimal.format(component.effectiveWeight * 100)}% effective weight</small></dd></div></dl>
            <p>{policy.direction === "higher" ? "Higher" : "Lower"} raw values mean more modeled pressure. Fixed reference: {policy.minimum}–{policy.maximum} {policy.unit}. Within-dimension weight: {decimal.format(policy.withinDimensionWeight * 100)}%.</p>
            <details className={record.disclosure}><summary>Definition, raw source &amp; derivation</summary><ObservationEvidence observation={observation} /></details>
          </details>;
        }))}
      </section>
      <div className={record.grid}>
        <section className={record.panel} aria-labelledby={`${labelPrefix}-context`}>
          <h2 id={`${labelPrefix}-context`}>Context Signals</h2>
          <p className={record.note}>No effect on the Civic Index. Density does not imply poor performance. Facility supply is not actual healthcare access.</p>
          <OptionalEvidence observations={context} />
          {!context.length && <p>No comparable verified data.</p>}
        </section>
        <section className={record.panel} aria-labelledby={`${labelPrefix}-advantages`}>
          <h2 id={`${labelPrefix}-advantages`}>Regional Advantages</h2>
          <p className={record.note}>Verified capabilities, not score bonuses. Dated evidence does not claim province-wide completeness.</p>
          {present.length ? <OptionalEvidence observations={present} /> : <p>No comparable verified data. This does not establish absence.</p>}
          {otherAdvantages.length > 0 && <details className={record.disclosure}><summary>Other capability evidence &amp; coverage gaps</summary><p>Unknown is not zero, verified absence or a disadvantage.</p><OptionalEvidence observations={otherAdvantages} /></details>}
        </section>
      </div>
      <aside className={styles.provenance} aria-labelledby={`${labelPrefix}-provenance`}>
        <h2 id={`${labelPrefix}-provenance`}>Sources &amp; record notes</h2>
        <p>Each expanded observation retains raw values, source locators, artifacts and any numerator/denominator derivation.</p>
        <details className={record.disclosure}><summary>Release identifiers &amp; interpretation limits</summary><p>{methodology.weightDecision}</p><p>Release {civicRelease.releaseId} · Method {methodology.methodologyVersion} · Reference {methodology.referenceSetId}.</p><p>Source windows differ. Improved sanitation and drinking-water sources do not establish safely managed services. Project-validated only; no government endorsement.</p></details>
        <div className={record.links}><Link href="/methodology">Methodology &amp; sensitivity ↗</Link><Link href="/sources">Full source directory ↗</Link></div>
      </aside>
    </article>
  );
}
