import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { scoreCivicIndex, pressureCategory, interpretCivicIndex } from "../src/lib/civx/scoring.ts";

const root = new URL("../", import.meta.url);
const raw = JSON.parse(readFileSync(new URL("data/raw/civx-jabar-2023.json", root), "utf8"));
const methodology = JSON.parse(readFileSync(new URL("data/methodology/civx-jabar-2023.json", root), "utf8"));

// BPS kabupaten/kota identifiers (Peraturan BPS No. 3 Tahun 2019).
// The tables repeat several place names under Kabupaten and Kota headings.
const geography = new Map([
  ["3201", "Kabupaten Bogor"], ["3202", "Kabupaten Sukabumi"],
  ["3203", "Kabupaten Cianjur"], ["3204", "Kabupaten Bandung"],
  ["3205", "Kabupaten Garut"], ["3206", "Kabupaten Tasikmalaya"],
  ["3207", "Kabupaten Ciamis"], ["3208", "Kabupaten Kuningan"],
  ["3209", "Kabupaten Cirebon"], ["3210", "Kabupaten Majalengka"],
  ["3211", "Kabupaten Sumedang"], ["3212", "Kabupaten Indramayu"],
  ["3213", "Kabupaten Subang"], ["3214", "Kabupaten Purwakarta"],
  ["3215", "Kabupaten Karawang"], ["3216", "Kabupaten Bekasi"],
  ["3217", "Kabupaten Bandung Barat"], ["3218", "Kabupaten Pangandaran"],
  ["3271", "Kota Bogor"], ["3272", "Kota Sukabumi"],
  ["3273", "Kota Bandung"], ["3274", "Kota Cirebon"],
  ["3275", "Kota Bekasi"], ["3276", "Kota Depok"],
  ["3277", "Kota Cimahi"], ["3278", "Kota Tasikmalaya"],
  ["3279", "Kota Banjar"],
]);
function requireValid(condition, message) {
  if (!condition) throw new Error(message);
}

requireValid(raw.releaseId === methodology.releaseId && raw.period === methodology.period,
  "Raw observations and scoring configuration refer to different releases.");
requireValid(methodology.status === "approved" && methodology.indicators.length === 4,
  "The four-indicator release method has not been approved for publication.");
requireValid(raw.artifact?.localPath === "data/raw/bps-jabar-dalam-angka-2024.pdf" &&
  /^sha256:[a-f0-9]{64}$/.test(raw.artifact.id) && Number.isInteger(raw.artifact.bytes),
  "The BPS source artifact manifest is invalid.");
const artifact = readFileSync(new URL(raw.artifact.localPath, root));
const digest = `sha256:${createHash("sha256").update(artifact).digest("hex")}`;
requireValid(artifact.length === raw.artifact.bytes && digest === raw.artifact.id,
  "BPS PDF size/checksum mismatch; do not publish derived values.");

requireValid(Array.isArray(raw.sources) && raw.sources.length === methodology.indicators.length,
  "The BPS source inventory is incomplete.");
const sources = new Map();
for (const source of raw.sources) {
  requireValid(source?.id && !sources.has(source.id) && source.publisher && source.title &&
    source.url === raw.artifact.publicationUrl && source.artifactId === raw.artifact.id &&
    source.dataYear === Number(raw.period) && source.table && source.page &&
    source.referencePeriod && source.accessedAt === raw.artifact.retrievedAt,
    `Invalid or inconsistent BPS table reference: ${source?.id}`);
  sources.set(source.id, source);
}
for (const indicator of methodology.indicators) {
  requireValid(sources.has(indicator.sourceId) && indicator.minimumRegion &&
    indicator.maximumRegion, `No verified source and reference extrema for ${indicator.id}.`);
}

requireValid(Array.isArray(raw.regions) && raw.regions.length === geography.size,
  "The 27-region Jawa Barat cohort is incomplete.");
const regionIds = new Set();
const regionNames = new Set();
const exclusions = [];
const regions = raw.regions.flatMap((record) => {
  requireValid(typeof record?.id === "string" && !regionIds.has(record.id) &&
    geography.get(record.id) === record.name && !regionNames.has(record.name) &&
    record.province === "Jawa Barat" &&
    record.type === (record.id.startsWith("320") || record.id.startsWith("321") ? "kabupaten" : "kota") &&
    record.boundaryReference === "BPS kabupaten/kota code, Peraturan BPS No. 3 Tahun 2019" &&
    Array.isArray(record.observations), `Invalid, mismatched, or duplicate region: ${record?.id}`);
  regionIds.add(record.id);
  regionNames.add(record.name);
  const observationIds = new Set();
  const observations = record.observations.map((observation) => {
    const policy = methodology.indicators.find((item) => item.id === observation?.indicatorId);
    requireValid(policy && !observationIds.has(policy.id) && observation.unit === policy.unit &&
      observation.period === raw.period &&
      (observation.value === null ||
        (Number.isFinite(observation.value) && observation.value >= 0 && observation.value <= 100)) &&
      (observation.value !== null || observation.missingReason) &&
      observation.sourceId === policy.sourceId,
      `Invalid, duplicate, or inconsistent observation for ${record.id}/${observation?.indicatorId}.`);
    observationIds.add(policy.id);
    const source = sources.get(observation.sourceId);
    requireValid(source, `Source reference missing for ${record.id}/${observation.indicatorId}.`);
    return {
      indicatorId: observation.indicatorId,
      value: observation.value,
      unit: observation.unit,
      period: observation.period,
      sources: [source],
      ...(observation.missingReason ? { missingReason: observation.missingReason } : {}),
    };
  });
  const civicIndex = scoreCivicIndex(observations, methodology);
  if (civicIndex.status !== "available" || observationIds.size !== methodology.indicators.length) {
    exclusions.push({
      id: record.id,
      name: record.name,
      reason: civicIndex.status === "unavailable" ? civicIndex.reason : "Incomplete four-indicator observations.",
    });
    return [];
  }
  return [{
    id: record.id,
    name: record.name,
    province: record.province,
    type: record.type,
    period: raw.period,
    boundaryReference: record.boundaryReference,
    observations,
    civicIndex,
    category: pressureCategory(civicIndex.score),
    interpretation: interpretCivicIndex(civicIndex),
  }];
});
requireValid(regionIds.size === geography.size, "Not all BPS districts were attempted.");

const release = {
  releaseId: raw.releaseId,
  period: raw.period,
  referenceSetId: methodology.referenceSetId,
  artifact: raw.artifact,
  methodology,
  sources: raw.sources,
  regions,
  coverage: {
    attempted: raw.regions.length,
    published: regions.length,
    excluded: exclusions.length,
    exclusions,
  },
  limitations: [
    `${regions.length} of ${raw.regions.length} Jawa Barat kabupaten/kota have complete, verified four-indicator 2023 scores${exclusions.length ? `; ${exclusions.length} excluded (see coverage.exclusions)` : "; none excluded"}.`,
    "Poverty and sanitation use 2023 Susenas; unemployment uses August Sakernas; IPM is a 2023 composite. These are not same-month observations.",
    "CIVX is a relative, release-specific decision-support model, not an official government ranking or a causal assessment.",
  ],
};
const output = new URL("data/processed/civx-jabar-2023.json", root);
writeFileSync(output, `${JSON.stringify(release, null, 2)}\n`);
console.log(`Published ${regions.length} of ${raw.regions.length} reviewed regions to ${fileURLToPath(output)}`);
