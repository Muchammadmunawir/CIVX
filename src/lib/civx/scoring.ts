import type {
  CivicIndexInput,
  CivicIndexPolicy,
  CivicIndexResult,
  PressureCategory,
} from "./types";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function pressureCategory(score: number): PressureCategory {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("Civic Index score must be between 0 and 100.");
  }
  return score < 33.33 ? "lower" : score < 66.67 ? "moderate" : "higher";
}

export function interpretCivicIndex(result: CivicIndexResult): string | null {
  if (result.status === "unavailable") return null;
  let leading = result.components[0];
  for (const component of result.components) {
    if (component.contribution > leading.contribution) leading = component;
  }
  return `${leading.label} contributes the most modeled pressure (${leading.contribution.toFixed(2)} of 100 points). This is relative to Jawa Barat's 2023 reference set; it does not identify a cause or prescribe a policy.`;
}

/**
 * Published results require every configured observation from the same period.
 * No missing component is imputed, zero-filled, or silently reweighted.
 */
export function scoreCivicIndex(
  inputs: readonly CivicIndexInput[],
  policy: CivicIndexPolicy,
): CivicIndexResult {
  if (policy.status !== "approved") {
    return { status: "unavailable", reason: "This methodology is not approved for publication." };
  }
  if (
    !policy.releaseId || !policy.methodologyVersion || !policy.referenceSetId ||
    !policy.period || policy.indicators.length < 2
  ) {
    throw new Error("An approved Civic Index needs release metadata and at least two indicators.");
  }

  const observations = new Map<string, CivicIndexInput>();
  for (const input of inputs) {
    if (observations.has(input.indicatorId)) {
      throw new Error(`Duplicate observation for ${input.indicatorId}.`);
    }
    observations.set(input.indicatorId, input);
  }

  const configured = new Set<string>();
  let totalWeight = 0;
  for (const indicator of policy.indicators) {
    if (
      !indicator.id || !indicator.label || !indicator.unit ||
      !indicator.minimumRegion || !indicator.maximumRegion || !indicator.sourceId ||
      configured.has(indicator.id) ||
      !Number.isFinite(indicator.minimum) || !Number.isFinite(indicator.maximum) ||
      indicator.minimum >= indicator.maximum ||
      !Number.isFinite(indicator.weight) || indicator.weight <= 0 ||
      (indicator.direction !== "higher" && indicator.direction !== "lower")
    ) {
      throw new Error(`Invalid scoring policy for ${indicator.id}.`);
    }
    configured.add(indicator.id);
    totalWeight += indicator.weight;
  }
  if (!Number.isFinite(totalWeight)) throw new Error("Total indicator weight is invalid.");
  for (const id of observations.keys()) {
    if (!configured.has(id)) throw new Error(`Unconfigured observation: ${id}.`);
  }

  const components: Extract<CivicIndexResult, { status: "available" }>["components"] = [];
  let weightedScore = 0;
  for (const indicator of policy.indicators) {
    const input = observations.get(indicator.id);
    if (!input || input.value === null) {
      return {
        status: "unavailable",
        reason: `Missing ${indicator.label}${input?.missingReason ? `: ${input.missingReason}` : ""}; the index is not reweighted.`,
      };
    }
    if (
      !Number.isFinite(input.value) || input.unit !== indicator.unit ||
      input.period !== policy.period || !input.sources.length ||
      input.sources.some((source) =>
        source.id !== indicator.sourceId || !source.publisher || !source.title || !source.url ||
        !source.table || !source.page || !source.referencePeriod ||
        !source.accessedAt || source.dataYear !== Number(policy.period) ||
        !/^sha256:[a-f0-9]{64}$/.test(source.artifactId))
    ) {
      return {
        status: "unavailable",
        reason: `Unverifiable or non-comparable ${indicator.label} input; no Civic Index is published.`,
      };
    }
    if (input.value < indicator.minimum || input.value > indicator.maximum) {
      return {
        status: "unavailable",
        reason: `${indicator.label} is outside the fixed 2023 reference range.`,
      };
    }

    const relative = (input.value - indicator.minimum) / (indicator.maximum - indicator.minimum);
    const score = round((indicator.direction === "higher" ? relative : 1 - relative) * 100);
    const contribution = score * indicator.weight / totalWeight;
    weightedScore += contribution;
    components.push({
      indicatorId: indicator.id,
      label: indicator.label,
      value: input.value,
      unit: input.unit,
      period: input.period,
      score,
      weight: indicator.weight,
      contribution: round(contribution),
      direction: indicator.direction,
      sources: input.sources,
    });
  }

  return {
    status: "available",
    score: round(weightedScore),
    components,
    releaseId: policy.releaseId,
    methodologyVersion: policy.methodologyVersion,
    referenceSetId: policy.referenceSetId,
    period: policy.period,
  };
}
