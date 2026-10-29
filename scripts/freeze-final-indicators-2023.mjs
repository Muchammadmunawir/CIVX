import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

// Offline admission freeze only. Never import a production builder or write a release/policy/UI file.
const root = new URL("../", import.meta.url);
const outputPath = "data/processed/final-indicator-freeze-2023.json";
const csvPath = "data/processed/final-indicator-freeze-2023.csv";
const cache = new Map();
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
function read(path, json = true) {
  if (!cache.has(path)) {
    const bytes = readFileSync(new URL(path, root));
    cache.set(path, { bytes, sha256: hash(bytes), data: json ? JSON.parse(bytes) : null });
  }
  return cache.get(path).data;
}
const escapePointer = (text) => String(text).replaceAll("~", "~0").replaceAll("/", "~1");
const registryPath = "data/raw/civx-jabar-2023.json";
const regions = read(registryPath).regions.map(({ id, name }) => ({ id, name }));
const regionIds = regions.map(({ id }) => id);
assert.equal(regionIds.length, 27);
assert.equal(new Set(regionIds).size, 27);
const registryNames = new Map(regions.map(({ id, name }) => [id, name]));
const documents = {
  socioeconomic: "docs/SOCIOECONOMIC-EDUCATION-AUDIT-2023.md",
  education: "docs/SOCIOECONOMIC-EDUCATION-AUDIT-2023.md",
  basic_services: "docs/BASIC-SERVICES-AUDIT-2023.md",
  public_health: "docs/PUBLIC-HEALTH-AUDIT-2023.md",
  disaster_pressure: "docs/RESILIENCE-AUDIT-2023.md",
  environment: "docs/ENVIRONMENT-AUDIT-2023.md",
};
for (const path of new Set(Object.values(documents))) read(path, false);
const decisionPaths = {
  socioeconomic: "data/processed/audit-jabar-2023-statistics.json",
  education: "data/processed/audit-jabar-2023-statistics.json",
  basic_services: "data/processed/basic-services-audit-2023-statistics.json",
  public_health: "data/processed/public-health-audit-2023-statistics.json",
  disaster_pressure: "data/processed/resilience-audit-2023-statistics.json",
  environment: "data/processed/environment-audit-2023-decisions.json",
};
const decisions = Object.fromEntries(Object.entries(decisionPaths).map(([id, path]) => [id, read(path)]));
const auditedIds = {
  socioeconomic: decisions.socioeconomic.admission.socioeconomicCore,
  education: decisions.education.admission.educationCore,
  basic_services: decisions.basic_services.coreIndicatorIds,
  public_health: decisions.public_health.coreIds,
  disaster_pressure: decisions.disaster_pressure.decisions.core,
  environment: decisions.environment.decisions.CORE.map(({ id }) => id),
};
const expectedCounts = { socioeconomic: 4, education: 3, basic_services: 5, public_health: 4, disaster_pressure: 1, environment: 1 };
assert.equal(Object.keys(auditedIds).length, 6, "STOP FREEZE: dimension count differs from six");
assert.equal(Object.values(auditedIds).flat().length, 18, "STOP FREEZE: authoritative CORE total differs from 18");
for (const [id, count] of Object.entries(expectedCounts)) {
  assert.equal(auditedIds[id].length, count, `STOP FREEZE: ${id} audit count differs from ${count}`);
}
const nonCoreIds = {
  socioeconomic: decisions.socioeconomic.admission.contextOnly,
  education: decisions.education.admission.contextOnly,
  basic_services: Object.entries(decisions.basic_services.indicators).filter(([, item]) => item.recommendation !== "CORE").map(([id]) => id),
  public_health: Object.entries(decisions.public_health.admission).filter(([, item]) => item.recommendation.status !== "CORE").map(([id]) => id),
  disaster_pressure: Object.entries(decisions.disaster_pressure.decisions).filter(([status]) => status !== "core").flatMap(([, ids]) => ids),
  environment: Object.entries(decisions.environment.decisions).filter(([status]) => status !== "CORE").flatMap(([, items]) => items.map(({ id }) => id)),
};
for (const [dimension, ids] of Object.entries(auditedIds)) {
  assert(ids.every((id) => !nonCoreIds[dimension].includes(id)), `STOP FREEZE: CORE/context/rejected classification conflict in ${dimension}`);
}
const paths = {
  socioeconomic: "data/raw/audit-jabar-2023/socioeconomic.json",
  education: "data/raw/audit-jabar-2023/education.json",
  wash: "data/raw/basic-services-audit-2023/water-sanitation.json",
  care: "data/raw/basic-services-audit-2023/healthcare.json",
  housing: "data/raw/basic-services-audit-2023/household.json",
  insurance: "data/raw/basic-services-audit-2023/other-services.json",
  general_health: "data/raw/public-health-audit-2023/general-health.json",
  nutrition: "data/raw/public-health-audit-2023/nutrition.json",
  disaster: "data/raw/resilience-audit-2023/current-risk.json",
  environment: "data/raw/environment-audit-2023/indices.json",
};
// The identifiers below are existing audited IDs, not aliases for current production inputs.
// Last field names the exact measured numerator; no unpublished numeric totals are reconstructed.
const specifications = [
  ["poverty", "socioeconomic", "socioeconomic", "Poverty rate / Persentase Penduduk Miskin", "percent of residents", "higher_raw_higher_pressure", "PO", "Survey-weighted residents below the applicable regional food/non-food basic-needs poverty line."],
  ["unemployment", "socioeconomic", "socioeconomic", "Open Unemployment Rate / TPT, ages 15+", "percent of labour force aged 15+", "higher_raw_higher_pressure", "UN", "Unemployed residents aged 15+ under the common Sakernas definition."],
  ["gini_ratio", "socioeconomic", "socioeconomic", "Expenditure Gini Ratio", "coefficient 0–1", "higher_raw_higher_pressure", "GI", "Not a simple rate numerator; Lorenz population/expenditure shares define inequality."],
  ["expenditure_per_capita", "socioeconomic", "socioeconomic", "Real adjusted annual expenditure per capita", "thousand real PPP-adjusted rupiah per person per year", "higher_raw_lower_pressure", "EX", "Published annual per-capita consumption adjusted to 2012 real prices and purchasing power; no raw expenditure total reconstructed."],
  ["rls", "education", "education", "Average Years of Schooling / RLS, ages 25+", "years", "higher_raw_lower_pressure", "RL", "Published mean formal-schooling years completed by residents aged 25+; no individual totals reconstructed."],
  ["hls", "education", "education", "Expected Years of Schooling / HLS, age-7 entry expectation", "years", "higher_raw_lower_pressure", "HL", "Not a single rate numerator; sum of current age-specific enrollment proportions with the official boarding-school correction."],
  ["apm", "education", "education", "Upper-secondary Net Enrollment Rate / APM, ages 16–18", "percent of residents aged 16–18", "higher_raw_lower_pressure", "AP", "Resident persons aged 16–18 attending SMA/SMK/MA/equivalent, including Paket C."],
  ["sanitation", "basic_services", "wash", "Household improved-sanitation access", "percent of households", "higher_raw_lower_pressure", "SA", "Survey-weighted private households meeting the common BPS improved-sanitation classification."],
  ["drinking_water", "basic_services", "wash", "Household improved drinking-water-source access", "percent of households", "higher_raw_lower_pressure", "DW", "Survey-weighted private households meeting BPS improved-source classification, including conditional bottled/refill-source rules."],
  ["puskesmas_per_100k", "basic_services", "care", "Main Puskesmas availability per 100,000 residents", "main Puskesmas per 100,000 residents", "higher_raw_lower_pressure", "PC", "Explicit total main inpatient and non-inpatient Puskesmas; excludes auxiliary/mobile units, clinics, Posyandu and hospitals."],
  ["household-floor-per-capita-le7-2", "basic_services", "housing", "Households with dwelling floor area ≤7.2 m² per person", "percent of households", "higher_raw_higher_pressure", "CR", "Survey-weighted private households in the literal published floor-area-per-person band ≤7.2 m²."],
  ["health_insurance_ownership", "basic_services", "insurance", "Residents reporting any health-insurance ownership", "percent of residents", "higher_raw_lower_pressure", "HI", "Residents reporting any health-insurance ownership; derived only from the explicit no-insurance share, not summed insurer categories."],
  ["nutrition_ski2023_stunting", "public_health", "nutrition", "Stunting prevalence, SKI 2023, ages 0–59 months", "percent of measured children aged 0–59 months", "higher_raw_higher_pressure", "ST", "Survey-weighted measured children aged 0–59 months with height-for-age z-score below −2, including severe below −3."],
  ["nutrition_ski2023_wasting", "public_health", "nutrition", "Wasting prevalence, SKI 2023, ages 0–59 months", "percent of measured children aged 0–59 months", "higher_raw_higher_pressure", "WA", "Survey-weighted measured children aged 0–59 months with weight-for-length/height z-score below −2, including severe below −3."],
  ["morbidity_activity_limiting", "public_health", "general_health", "Activity-limiting morbidity in previous month", "percent of residents", "higher_raw_higher_pressure", "MO", "Survey-weighted residents reporting health complaints disrupting work, school or usual activities in the month before March 2023 interview."],
  ["life_expectancy_lfsp2020", "public_health", "general_health", "Life expectancy at birth / UHH, LFSP2020 basis", "years", "higher_raw_lower_pressure", "LE", "Not a simple case numerator; official life-table mortality schedule/model, with no CIVX life-table calculation."],
  ["irbi_overall_2023", "disaster_pressure", "disaster", "Overall IRBI 2023 — modeled disaster risk", "index points", "higher_raw_higher_pressure", "IR", "Not applicable: published residual-risk composite, not an event/person count."],
  ["iklh_2023", "environment", "environment", "District IKLH 2023 — environmental quality", "index points (0–100)", "higher_raw_lower_pressure", "EK", "Not applicable: published district environmental-quality composite, not a concentration or participation count."],
];
assert.equal(specifications.length, 18);
assert.equal(new Set(specifications.map(([id]) => id)).size, 18);
for (const id of Object.keys(expectedCounts)) {
  assert.deepEqual(specifications.filter(([, dimension]) => dimension === id).map(([key]) => key).sort(), [...auditedIds[id]].sort(), `STOP FREEZE: ${id} exact audited CORE set changed`);
}
const selectedIds = specifications.map(([id]) => id);
for (const forbidden of ["hdi", "ipm", "dbd_published_incidence", "disaster_risk", "ikd", "ika_component", "iku_component", "ikl_component", "ikal_component", "apk", "amh"]) {
  assert(!selectedIds.includes(forbidden), `STOP FREEZE: prohibited parent/context/legacy input ${forbidden}`);
}
function panelAt(group, id) {
  const path = paths[group], bundle = read(path);
  const field = Array.isArray(bundle.indicators) ? "indicators" : "series";
  const index = bundle[field].findIndex((item) => item.id === id);
  assert(index >= 0, `Missing audited panel: ${path}/${id}`);
  assert.equal(bundle[field].filter((item) => item.id === id).length, 1, `Duplicate raw audit ID: ${path}/${id}`);
  return { path, bundle, field, index, panel: bundle[field][index], pointer: `/${field}/${index}` };
}
function decisionAt(dimension, id) {
  const audit = decisions[dimension];
  if (["socioeconomic", "education", "basic_services"].includes(dimension)) {
    return { status: audit.indicators[id].recommendation, pointer: `/indicators/${escapePointer(id)}/recommendation` };
  }
  const field = dimension === "public_health" ? "recommendation" : "decision";
  return { status: audit.admission[id][field].status, pointer: `/admission/${escapePointer(id)}/${field}/status` };
}
const processedPanels = {
  public_health: "data/processed/public-health-audit-2023-observations.json",
  disaster_pressure: "data/processed/resilience-audit-2023-observations.json",
  environment: "data/processed/environment-audit-2023-observations.json",
};
const indicators = specifications.map(([id, dimensionId, group, displayName, unit, pressureDirection, shortCode, numeratorDefinition]) => {
  const raw = panelAt(group, id), panel = raw.panel;
  const decision = decisionAt(dimensionId, id);
  assert.equal(decision.status, "CORE", `STOP FREEZE: non-CORE authoritative decision ${id}`);
  const rawStatus = panel.recommendation?.status ?? panel.preliminaryRecommendation?.status ?? panel.preliminaryRecommendation?.admission;
  assert.equal(rawStatus, "CORE", `STOP FREEZE: raw audit class conflicts for ${id}`);
  const scopeYear = raw.bundle.scope.referenceYear ?? raw.bundle.scope.year;
  assert.equal(scopeYear, 2023, `Wrong raw scope year: ${id}`);
  if (panel.year !== undefined) assert.equal(panel.year, 2023, id);
  if (panel.source.referenceYear !== undefined) assert.equal(panel.source.referenceYear, 2023, id);
  assert(panel.source.publisher && panel.source.url && panel.source.table, `Incomplete source contract: ${id}`);
  assert.deepEqual(panel.observations.map(({ regionId }) => regionId), regionIds, `Incompatible geography/order: ${id}`);
  for (const row of panel.observations) {
    assert(Number.isFinite(row.value), `Missing/nonfinite CORE value: ${id}/${row.regionId}`);
    if (row.status !== undefined) assert.equal(row.status, "observed", `Unresolved CORE cell: ${id}/${row.regionId}`);
    if (row.regionName !== undefined) assert.equal(row.regionName, registryNames.get(row.regionId));
    if (row.year !== undefined) assert.equal(row.year, 2023);
    if (row.sourceRecord?.selectedYear !== undefined) assert.equal(row.sourceRecord.selectedYear, 2023);
    assert(row.sourceRecord, `No source receipt: ${id}/${row.regionId}`);
    assert(row.value >= 0, `Negative CORE value: ${id}`);
    if (unit.startsWith("percent")) assert(row.value <= 100, `Percentage outside bounds: ${id}`);
    if (id === "gini_ratio") assert(row.value <= 1, "Gini coefficient must not be rescaled to percent");
    if (id === "iklh_2023") assert(row.value <= 100);
  }
  let processedPanel = null;
  if (processedPanels[dimensionId]) {
    const path = processedPanels[dimensionId], processed = read(path);
    const rows = dimensionId === "public_health"
      ? processed.observations.filter((row) => row.indicatorId === id)
      : processed.series.find((item) => item.id === id).observations;
    assert.deepEqual(rows.map(({ regionId, value }) => ({ regionId, value })), panel.observations.map(({ regionId, value }) => ({ regionId, value })), `Raw/processed panel conflict: ${id}`);
    if (dimensionId === "public_health") {
      assert(rows.every(({ recommendation }) => recommendation === "CORE"));
      const metadata = processed.indicators.filter((item) => item.id === id);
      assert.equal(metadata.length, 1);
      assert.equal(metadata[0].recommendation.status, "CORE");
    }
    processedPanel = { path, indicatorId: id, matchingObservations: rows.length };
  }
  let rawOrDerived = id === "life_expectancy_lfsp2020" ? "published_estimate"
    : ["irbi_overall_2023", "iklh_2023"].includes(id) ? "published_composite"
      : ["gini_ratio", "expenditure_per_capita", "rls", "hls"].includes(id) ? "published_measure" : "published_rate";
  let formula = null;
  let numerator = panel.numerator ?? { definition: numeratorDefinition, numericTotalsReconstructed: false };
  let denominator = panel.denominator ?? { definition: panel.source.denominator ?? "Not applicable to a published composite index; no population/area division." };
  let derivation = { kind: "none", valuePolicy: "Retain audited source value; no normalization, pressure inversion or new calculation." };
  if (id === "puskesmas_per_100k") {
    rawOrDerived = "derived_rate";
    formula = "main_puskesmas_count / exact_2023_resident_population * 100000";
    const counts = panelAt("care", "puskesmas_count"), population = panelAt("care", "population_2023_exact_persons");
    for (const [index, row] of panel.observations.entries()) {
      assert.equal(row.sourceRecord.numerator, counts.panel.observations[index].value);
      assert.equal(row.sourceRecord.denominator, population.panel.observations[index].value);
      assert(row.sourceRecord.denominator > 0);
      assert(Math.abs(row.sourceRecord.numerator / row.sourceRecord.denominator * 100000 - row.value) <= 1e-12);
    }
    assert.equal(counts.panel.observations.reduce((n, row) => n + row.value, 0), 1106);
    assert.equal(population.panel.observations.reduce((n, row) => n + row.value, 0), 49860330);
    numerator = { definition: numeratorDefinition, unit: "main facilities", source: counts.panel.source, panelReference: { path: counts.path, jsonPointer: counts.pointer } };
    denominator = { definition: "Exact-person 2023 resident population from Dinkes profile appendix 1 / PDF 180, column 7; not rounded BPS thousands or an alternative profile population.", unit: "persons", source: population.panel.source, panelReference: { path: population.path, jsonPointer: population.pointer } };
    derivation = { kind: "audited_facility_rate", multiplier: 100000, valuePolicy: "Retain audited full-precision derived values; verify each stored numerator/denominator without replacing the rate.", originalAuditFormula: panel.transformation.formula };
  }
  if (id === "health_insurance_ownership") {
    rawOrDerived = "derived_percentage";
    formula = "100 - published_no_health_insurance_percent";
    for (const row of panel.observations) {
      assert(Number.isFinite(row.publishedNonePercent) && row.publishedNonePercent >= 0 && row.publishedNonePercent <= 100);
      assert.equal(row.derivation.publishedNonePercent, row.publishedNonePercent);
      assert(Math.abs(100 - row.publishedNonePercent - row.value) <= 1e-12);
    }
    derivation = { kind: "audited_complement", input: "publishedNonePercent", sourceColumn: "4.7 column 6, Tidak Punya", valuePolicy: "Retain audited two-decimal complement. This defines ownership; it is not a CIVX pressure inversion. Never sum overlapping insurer categories.", originalAuditFormula: panel.transformation };
  }
  const limits = panel.limitations ?? panel.caveats ?? [];
  assert(limits.length > 0, `No limitations: ${id}`);
  const values = panel.observations.map(({ value }) => value);
  assert(new Set(values).size > 1, `Constant frozen series: ${id}`);
  return {
    indicatorId: id, dimensionId, displayName, shortCode, year: 2023, unit,
    definition: panel.definition ?? panel.concept,
    referencePeriod: panel.source.referencePeriod ?? ({
      morbidity_activity_limiting: "Susenas March 2023; reported functional illness during the month preceding interview, not an annual average.",
      life_expectancy_lfsp2020: "Published 2023 life-expectancy estimate on the LFSP2020 basis, not a cohort observed through life in 2023.",
      nutrition_ski2023_stunting: "SKI 2023 probability-survey prevalence, measured children aged 0–59 months.",
      nutrition_ski2023_wasting: "SKI 2023 probability-survey prevalence, measured children aged 0–59 months.",
    })[id],
    sourceReference: panel.source, rawOrDerived,
    auditValueType: panel.valueType ?? panel.rawOrDerived,
    formula, numerator, denominator, derivation,
    rawDirection: { higherIs: pressureDirection === "higher_raw_higher_pressure" ? "less_favorable_for_literal_construct" : "more_favorable_for_literal_construct", auditStatement: panel.direction, interpretation: panel.directionExplanation ?? numeratorDefinition },
    civxPressureDirection: pressureDirection,
    coverage: { expectedRegions: 27, usableRegions: 27, missingRegions: [], unresolvedMissingValues: 0, uniqueValues: new Set(values).size, exactRegistryMatch: true, provinceAggregateIncluded: false },
    geography: { level: "kabupaten/kota", province: "Jawa Barat", codeConvention: "BPS 2019 identifiers, as admitted by the source audit", certifiedPolygonCompatibilityClaimed: false },
    auditProvenance: {
      document: { path: documents[dimensionId], sha256: cache.get(documents[dimensionId]).sha256 },
      decision: { path: decisionPaths[dimensionId], jsonPointer: decision.pointer, status: decision.status, sha256: cache.get(decisionPaths[dimensionId]).sha256 },
      panel: { path: raw.path, jsonPointer: raw.pointer, sha256: cache.get(raw.path).sha256, sourceScopeYear: scopeYear, rawAuditStatus: rawStatus },
      processedCrossCheck: processedPanel,
    },
    limitations: limits, uncertainty: panel.uncertainty ?? null,
    frozenStatus: "FROZEN", classification: "CORE", eligibleForNextNormalization: true,
    observations: panel.observations.map((row, index) => ({ ...row, auditObservationPointer: `${raw.pointer}/observations/${index}` })),
  };
});
assert.equal(indicators.reduce((n, indicator) => n + indicator.observations.length, 0), 486);
const byId = new Map(indicators.map((item) => [item.indicatorId, item]));
const overlapRules = [];
function overlap(a, b, category, rationale) {
  assert(byId.has(a) && byId.has(b));
  overlapRules.push({ a, b, category, rationale });
}
const material = ["poverty", "gini_ratio", "expenditure_per_capita"];
for (let i = 0; i < material.length; i++) for (const b of material.slice(i + 1)) overlap(material[i], b, "shared_domain", "Consumption-based measures distinguish lower-tail poverty, distributional inequality and mean real adjusted resources. Not the same estimand; retain all three without assuming independence.");
for (const [a, b] of [["rls", "hls"], ["rls", "apm"], ["hls", "apm"]]) overlap(a, b, "shared_domain", "Adult attained schooling, synthetic age-7 schooling expectation and level-specific age-16–18 participation differ. HLS/APM share participation information but APM is not the complete HLS construct. Full IPM is excluded.");
overlap("sanitation", "drinking_water", "shared_domain", "Distinct household essential-service classifications; neither is a safely-managed-water/sludge outcome. The adequate-housing parent bundle is excluded.");
overlap("puskesmas_per_100k", "health_insurance_ownership", "shared_domain", "Local primary-care supply intensity differs from formal financial-protection ownership. Neither guarantees actual care or service quality; retain the audited healthcare subdimension without an indicator-count budget.");
overlap("nutrition_ski2023_stunting", "nutrition_ski2023_wasting", "shared_domain", "Chronic linear growth deficit and acute low weight-for-length/height use different anthropometric axes. Children can have both; do not sum prevalence as disjoint cases. Total outcomes already include severe subclasses.");
overlap("morbidity_activity_limiting", "life_expectancy_lfsp2020", "shared_domain", "Recent self-reported functional illness and long-run modeled survival differ in time horizon and measurement, and are not an algebraic component/complement pair.");
for (const a of ["puskesmas_per_100k", "health_insurance_ownership"]) {
  for (const b of ["nutrition_ski2023_stunting", "nutrition_ski2023_wasting", "morbidity_activity_limiting", "life_expectancy_lfsp2020"]) {
    overlap(a, b, "cross_domain_pathway", "Health-system supply or formal coverage can relate to health outcomes, but input/entitlement and outcome are not identical or mathematically nested. This cross-section does not estimate service effects; reverse need-based allocation, age, reporting and other confounding remain.");
  }
}
for (const a of ["poverty", "expenditure_per_capita", "gini_ratio"]) overlap(a, "household-floor-per-capita-le7-2", "cross_domain_pathway", "Material resources/distribution and occupied floor area per person can share deprivation mechanisms. A physical crowding share is neither a consumption poverty rate nor a deterministic expenditure component. Preserve the literal ≤7.2 m² boundary.");
for (const a of ["sanitation", "drinking_water", "household-floor-per-capita-le7-2"]) {
  for (const b of ["nutrition_ski2023_stunting", "nutrition_ski2023_wasting", "morbidity_activity_limiting"]) overlap(a, b, "cross_domain_pathway", "Living/service conditions can relate to nutrition and illness through plausible pathways, not a measured causal effect or repeated identical variable. Do not relabel service access as a health outcome.");
}
for (const [a, b] of [["rls", "life_expectancy_lfsp2020"], ["hls", "life_expectancy_lfsp2020"], ["expenditure_per_capita", "life_expectancy_lfsp2020"], ["expenditure_per_capita", "rls"], ["expenditure_per_capita", "hls"]]) {
  overlap(a, b, "shared_former_parent", "These are distinct former components of IPM across education, living standards and survival. The parent aggregate is absent, so no parent/component input is duplicated; shared social-development mechanisms remain acceptable.");
}
overlap("irbi_overall_2023", "iklh_2023", "composite_boundary_contact", "IRBI includes hazard-conditioned environmental damage/assets within vulnerability; IKLH summarizes ambient water/air/land quality. Shared land/ecosystem concepts are not identity of either composite. No explicit IRBI or IKLH subcomponent is added, and statistical independence is not claimed.");
for (const b of ["poverty", "household-floor-per-capita-le7-2", "sanitation", "drinking_water"]) overlap("irbi_overall_2023", b, "composite_boundary_contact", "IRBI vulnerability/exposure has conceptual socioeconomic and physical-system contact. No identical frozen row or explicit additional disaster-vulnerability component is established; retain the authoritative overall-risk admission without claiming domain independence.");
const pairKey = (a, b) => [a, b].sort().join("|");
assert.equal(new Set(overlapRules.map(({ a, b }) => pairKey(a, b))).size, overlapRules.length);
const ruleMap = new Map(overlapRules.map((rule) => [pairKey(rule.a, rule.b), rule]));
function pearson(a, b) {
  const mean = (values) => values.reduce((n, value) => n + value, 0) / values.length;
  const ma = mean(a), mb = mean(b);
  let cross = 0, va = 0, vb = 0;
  for (let i = 0; i < a.length; i++) { const x = a[i] - ma, y = b[i] - mb; cross += x * y; va += x * x; vb += y * y; }
  return va === 0 || vb === 0 ? null : cross / Math.sqrt(va * vb);
}
const overlapPairs = [];
for (let i = 0; i < indicators.length; i++) {
  const a = indicators[i];
  for (const b of indicators.slice(i + 1)) {
    const av = a.observations.map(({ value }) => value), bv = b.observations.map(({ value }) => value);
    const identical = av.every((value, index) => value === bv[index]);
    assert(!identical, `STOP FREEZE: source-identical numerical panels require review: ${a.indicatorId}/${b.indicatorId}`);
    const rule = ruleMap.get(pairKey(a.indicatorId, b.indicatorId));
    const correlation = pearson(av, bv);
    overlapPairs.push({ a: a.indicatorId, b: b.indicatorId, count: 27,
      category: rule?.category ?? "no_direct_duplication_identified",
      decision: rule ? "ACCEPTED_OVERLAP" : "RETAIN_DISTINCT_ESTIMANDS",
      rationale: rule?.rationale ?? "No direct component, algebraic complement or essentially identical estimand is identified in the admitted audit definitions. Shared causes, survey frames and ecological correlation remain possible; absence of a marked relationship is not proof of independence.",
      auditDocuments: [...new Set([documents[a.dimensionId], documents[b.dimensionId]])],
      diagnostic: { pearson: correlation, rawValuesIdentical: identical, absolutePearsonAtLeast085: correlation !== null && Math.abs(correlation) >= 0.85, usedAsSoleAdmissionRule: false },
    });
  }
}
assert.equal(overlapPairs.length, 153);
const categoryCodes = { no_direct_duplication_identified: ".", shared_domain: "S", cross_domain_pathway: "P", shared_former_parent: "F", composite_boundary_contact: "V" };
const matrix = indicators.map((a) => indicators.map((b) => a.indicatorId === b.indicatorId ? "—" : categoryCodes[ruleMap.get(pairKey(a.indicatorId, b.indicatorId))?.category ?? "no_direct_duplication_identified"]));
const dimensionNames = { socioeconomic: "Socioeconomic", education: "Education", basic_services: "Basic Services", public_health: "Public Health", disaster_pressure: "Disaster Pressure / modeled disaster risk", environment: "Environmental Quality Pressure / Tekanan Kualitas Lingkungan" };
const dimensions = Object.entries(expectedCounts).map(([dimensionId, expected]) => ({ dimensionId, displayName: dimensionNames[dimensionId], indicatorIds: indicators.filter((item) => item.dimensionId === dimensionId).map(({ indicatorId }) => indicatorId), indicatorCount: expected, finalWeightAssigned: false }));
const evidenceManifest = [...cache].map(([path, value]) => ({ path, sha256: value.sha256, bytes: value.bytes.length })).sort((a, b) => a.path.localeCompare(b.path));
if (existsSync(new URL(outputPath, root))) {
  const prior = JSON.parse(readFileSync(new URL(outputPath, root), "utf8"));
  assert.deepEqual(prior.evidenceManifest, evidenceManifest, "STOP FREEZE: pinned audit/registry inputs changed; an explicit reviewed freeze revision is required");
}
const contract = {
  contractId: "civx-jabar-2023-final-indicator-freeze", version: 1, frozenAt: "2026-10-29", referenceYear: 2023,
  status: "FROZEN_SCORING_INPUTS_ONLY", totalCoreIndicators: 18, totalDimensions: 6,
  productionScoringChanged: false, productionMethodologyChanged: false, productionCutoverAuthorized: false,
  authority: "Consolidation of the five merged audit documents covering six dimensions, authorized by the final indicator-freeze task. Existing production is a separate eight-input release and remains unchanged.",
  referencePolicy: "2023-compatible vintage exactly as admitted in each audit. March/previous-month surveys, annual inventories, modeled life expectancy and official annual index vintages are not asserted simultaneous. Older IRBI baselines, LFSP2020 basis, retrospective models and permitted prior-year IKLH land imagery remain explicit; no source year is replaced.",
  missingPolicy: "All 18 require 27 usable same-contract regional observations; zero unresolved missingness. No imputation, interpolation, zero-fill, year replacement, clipping or regional indicator substitution.",
  geography: { province: "Jawa Barat", level: "kabupaten/kota", registry: registryPath, regionCount: 27, regions, displayGeometryIsAnalyticalDenominator: false },
  dimensions, indicators, evidenceManifest,
  safeguards: {
    hdiFree: true, dbdCoreExcluded: true, contextPromotionProhibited: true,
    nestedIrbiComponentsExcluded: true, nestedIklhComponentsExcluded: true, adequateHousingCompositeExcluded: true,
    retainedServicesHierarchy: decisions.basic_services.recommendedHierarchy,
    publicHealthHierarchy: [{ subdimension: "Nutrition", core: ["nutrition_ski2023_stunting", "nutrition_ski2023_wasting"] }, { subdimension: "General Population Health", core: ["morbidity_activity_limiting", "life_expectancy_lfsp2020"] }],
    weightingConstraint: "Indicator count must not silently determine dimension importance. A singleton must receive neither an automatic premium nor penalty. Choose dimension and any subdimension budgets explicitly and assess overlap/sensitivity in the next stage; no final weights are assigned here.",
    sourceCompositeCoefficientsAreCivxWeights: false,
    excludedParentInputs: ["HDI/IPM", "IRBI hazard/exposure/vulnerability/IKD components beside overall IRBI", "IKA/IKU/IKL/IKAL beside IKLH", "adequate-housing composite beside selected household components"],
  },
  overlapReview: { scope: "All 153 unordered frozen-indicator pairs; conceptual review precedes raw-value Pearson diagnostics.", fatalIssues: [], removals: [], pairCount: overlapPairs.length, matrixIndicatorOrder: indicators.map(({ indicatorId }) => indicatorId), matrixShortCodes: indicators.map(({ shortCode }) => shortCode), matrixLegend: categoryCodes, matrix, pairs: overlapPairs,
    limitations: "Accepted overlap is not statistical independence, causal validation or a weighting decision. Same publisher/survey frame and pathways do not alone create a duplicate. Mathematical parent/component stacks remain prohibited regardless of correlation.",
  },
  verification: { auditedCoreCount: 18, dimensions: 6, usableObservations: 486, unresolvedMissingValues: 0, duplicateIndicatorIds: 0, duplicatedNumericVectors: 0,
    conflictingAuditClassifications: 0,
    rawAndProcessedCrossChecks: indicators.filter((item) => item.auditProvenance.processedCrossCheck).length,
    derivedFormulaChecks: { puskesmas: 27, insuranceComplement: 27 },
    highAbsolutePearsonPairs: overlapPairs.filter((pair) => pair.diagnostic.absolutePearsonAtLeast085).length,
    allSourcesClassifiedCoreInAuthoritativeAudit: true,
    checksPerformed: ["Exact authoritative CORE sets/counts", "27 canonical region IDs/names/order per panel", "Finite, source-resolved values and declared 2023 scope", "Published unit/type, source and rate definitions", "Raw/processed equality where an observation output exists", "54 audited formula/operand checks", "All 153 conceptual/numeric pair checks", "Pinned audit/registry file hashes"],
  },
  nextStage: { readyForNormalizationDesign: true, normalizationMethodSelected: false, valuesNormalized: false, pressureValuesInverted: false, finalWeightsAssigned: false, civicIndexCalculated: false, rankingsGenerated: false, productionIntegrationPerformed: false,
    remainingDecisions: ["Normalization design and interpretation of narrow ranges/uncertainty", "Explicit dimension/subdimension budgets and weighting sensitivity", "Joint validation without treating shared IPM components as independent external validation", "Production cutover, rights, independent review and release approval as separate tasks"] },
  generator: { path: "scripts/freeze-final-indicators-2023.mjs", sha256: hash(readFileSync(new URL(import.meta.url))) },
};
const cell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
const csv = [
  ["indicator_id", "dimension_id", "display_name", "year", "unit", "raw_or_derived", "formula", "natural_higher_raw", "civx_pressure_direction", "usable_regions", "missing", "publisher", "source_url", "source_table", "reference_period", "audit_document", "audited_panel", "limitations", "frozen_status"],
  ...indicators.map((item) => [item.indicatorId, item.dimensionId, item.displayName, item.year, item.unit, item.rawOrDerived, item.formula, item.rawDirection.higherIs, item.civxPressureDirection, item.coverage.usableRegions, item.coverage.unresolvedMissingValues, item.sourceReference.publisher, item.sourceReference.url, item.sourceReference.table, item.referencePeriod, item.auditProvenance.document.path, `${item.auditProvenance.panel.path}#${item.auditProvenance.panel.jsonPointer}`, item.limitations.join(" | "), item.frozenStatus]),
].map((row) => row.map(cell).join(",")).join("\n") + "\n";
const outputs = new Map([[outputPath, JSON.stringify(contract, null, 2) + "\n"], [csvPath, csv]]);
for (const [path, content] of outputs) {
  if (process.argv.includes("--check")) assert.equal(readFileSync(new URL(path, root), "utf8"), content, `Frozen output differs: ${path}`);
  else writeFileSync(new URL(path, root), content);
}
console.log(JSON.stringify({ mode: process.argv.includes("--check") ? "check" : "freeze", status: contract.status, coreIndicators: indicators.length, dimensions: dimensions.map(({ dimensionId, indicatorCount }) => ({ dimensionId, indicatorCount })), regionalObservations: 486, unresolvedMissingValues: 0, formulaChecks: 54, pairChecks: overlapPairs.length, highCorrelationPairs: contract.verification.highAbsolutePearsonPairs, pinnedEvidenceFiles: evidenceManifest.length, fatalIssues: [], productionCutover: false, normalizationSelected: false, weightsAssigned: false }, null, 2));
