export type PressureDirection2023 =
  | "higher_raw_higher_pressure"
  | "higher_raw_lower_pressure";

export interface RegionIdentity2023 {
  readonly id: string;
  readonly name: string;
}

export interface ExpectedBounds2023 {
  readonly minimum: number;
  readonly maximum: number | null;
}

export interface Dimension2023 {
  readonly dimensionId: string;
  readonly displayName: string;
  readonly indicatorIds: readonly string[];
  readonly weight: number;
  readonly exactFraction: string;
}

export interface IndicatorWeights2023 {
  readonly indicatorId: string;
  readonly dimensionId: string;
  readonly withinDimensionWeight: number;
  readonly dimensionWeight: number;
  readonly effectiveWeight: number;
  readonly exactWithinFraction: string;
  readonly exactDimensionFraction: string;
  readonly exactEffectiveFraction: string;
}

export interface Indicator2023 extends IndicatorWeights2023 {
  readonly displayName: string;
  readonly unit: string;
  readonly pressureDirection: PressureDirection2023;
  readonly minimum: number;
  readonly maximum: number;
  readonly expectedBounds: ExpectedBounds2023;
  readonly frozenIndicatorPointer: string;
}

export interface CalibrationEvidence2023 {
  readonly indicatorId: string;
  readonly minimum: number;
  readonly maximum: number;
  readonly frozenMinimumValuePointer: string;
  readonly frozenMaximumValuePointer: string;
  readonly normalizationCalibrationPointer: string;
}

export interface Model2023 {
  readonly modelId: string;
  readonly modelVersion: number;
  readonly referenceYear: 2023;
  readonly normalizationMethod: "min_max";
  readonly weightingSchemeId: "equal_dimension_equal_indicator";
  readonly regions: readonly RegionIdentity2023[];
  readonly dimensions: readonly Dimension2023[];
  readonly indicators: readonly Indicator2023[];
  /** Validated frozen extrema, not a second observation panel. Pointers resolve in the pinned upstream files. */
  readonly calibrationEvidence: readonly CalibrationEvidence2023[];
}

export interface IndicatorInput2023 {
  readonly indicatorId: string;
  readonly rawValue: number;
  readonly normalizedPressure: number;
  readonly frozenValuePointer: string;
  readonly normalizationValuePointer: string;
}

export interface RegionInput2023 {
  readonly regionId: string;
  readonly regionName: string;
  readonly referenceYear: 2023;
  readonly indicators: readonly IndicatorInput2023[];
}

export interface FrozenInputs2023 {
  readonly contractId: string;
  readonly version: number;
  readonly referenceYear: number;
  readonly status: string;
  readonly totalCoreIndicators: number;
  readonly totalDimensions: number;
  readonly geography: {
    readonly regionCount: number;
    readonly regions: readonly RegionIdentity2023[];
  };
  readonly dimensions: readonly {
    readonly dimensionId: string;
    readonly displayName: string;
    readonly indicatorIds: readonly string[];
    readonly indicatorCount: number;
  }[];
  readonly indicators: readonly {
    readonly indicatorId: string;
    readonly dimensionId: string;
    readonly displayName: string;
    readonly unit: string;
    readonly year: number;
    readonly civxPressureDirection: string;
    readonly classification: string;
    readonly frozenStatus: string;
    readonly eligibleForNextNormalization: boolean;
    readonly observations: readonly {
      readonly regionId: string;
      readonly regionName?: string;
      readonly value: number;
    }[];
  }[];
}

export interface NormalizationInputs2023 {
  readonly designId: string;
  readonly version: number;
  readonly referenceYear: number;
  readonly status: string;
  readonly input: {
    readonly path: string;
    readonly contractId: string;
    readonly regions: readonly RegionIdentity2023[];
    readonly dimensionIds: readonly string[];
    readonly indicatorIds: readonly string[];
  };
  readonly recommendation: { readonly methodId: string };
  readonly methods: readonly {
    readonly id: string;
    readonly selected: boolean;
    readonly clipsObservations: boolean;
  }[];
  readonly indicators: readonly {
    readonly indicatorId: string;
    readonly dimensionId: string;
    readonly displayName: string;
    readonly year: number;
    readonly unit: string;
    readonly pressureDirection: string;
    readonly frozenIndicatorPointer: string;
    readonly expectedBounds: ExpectedBounds2023;
    readonly statistics: { readonly n: number; readonly minimum: number; readonly maximum: number };
    readonly calibration: { readonly min_max: { readonly minimum: number; readonly maximum: number } };
    readonly observations: readonly {
      readonly regionId: string;
      readonly regionName: string;
      readonly frozenObservationPointer: string;
      readonly rawValue: number;
      readonly normalizedPressure: { readonly min_max: number };
    }[];
  }[];
}

type WeightingIndicatorInput2023 = Omit<IndicatorWeights2023, "exactWithinFraction" | "exactDimensionFraction" | "exactEffectiveFraction"> & {
  readonly exactWithinFraction: string | null;
  readonly exactDimensionFraction: string | null;
  readonly exactEffectiveFraction: string | null;
};

export interface WeightingInputs2023 {
  readonly designId: string;
  readonly version: number;
  readonly referenceYear: number;
  readonly status: string;
  readonly selectedSchemeId: string;
  readonly input: {
    readonly freezePath: string;
    readonly normalizationPath: string;
    readonly normalizationMethod: string;
    readonly regionIds: readonly string[];
    readonly dimensionIds: readonly string[];
    readonly indicatorIds: readonly string[];
    readonly panels: readonly {
      readonly indicatorId: string;
      readonly dimensionId: string;
      readonly displayName: string;
      readonly year: number;
      readonly unit: string;
      readonly pressureDirection: string;
      readonly observations: readonly {
        readonly regionId: string;
        readonly rawValue: number;
        readonly normalizedPressure: number;
        readonly frozenValuePointer: string;
        readonly normalizationValuePointer: string;
      }[];
    }[];
  };
  readonly schemes: readonly {
    readonly schemeId: string;
    readonly selected: boolean;
    readonly dimensionWeights: readonly (Dimension2023 & { readonly effectiveIndicatorWeightTotal: number })[];
    readonly indicatorWeights: readonly WeightingIndicatorInput2023[];
  }[];
}

const MODEL_ID = "civx-jabar-2023-frozen-pressure";
const SCHEME_ID = "equal_dimension_equal_indicator";
const WEIGHT_TOLERANCE = 1e-12;
const SCORE_TOLERANCE = 1e-10;
const FREEZE_PATH = "data/processed/final-indicator-freeze-2023.json";
const NORMALIZATION_PATH = "data/processed/normalization-design-2023.json";

// These are methodology membership and direction rules, never regional observations or fitted anchors.
const DIMENSIONS = [
  { id: "socioeconomic", ids: ["poverty", "unemployment", "gini_ratio", "expenditure_per_capita"] },
  { id: "education", ids: ["rls", "hls", "apm"] },
  { id: "basic_services", ids: ["sanitation", "drinking_water", "puskesmas_per_100k", "household-floor-per-capita-le7-2", "health_insurance_ownership"] },
  { id: "public_health", ids: ["nutrition_ski2023_stunting", "nutrition_ski2023_wasting", "morbidity_activity_limiting", "life_expectancy_lfsp2020"] },
  { id: "disaster_pressure", ids: ["irbi_overall_2023"] },
  { id: "environment", ids: ["iklh_2023"] },
] as const;
const INDICATOR_IDS: readonly string[] = DIMENSIONS.flatMap((dimension) => [...dimension.ids]);
const DIMENSION_IDS: readonly string[] = DIMENSIONS.map((dimension) => dimension.id);
const REGION_IDS: readonly string[] = [
  ...Array.from({ length: 18 }, (_, index) => String(3201 + index)),
  ...Array.from({ length: 9 }, (_, index) => String(3271 + index)),
];
const HIGHER_PRESSURE_IDS: Readonly<Record<string, true | undefined>> = {
  poverty: true,
  unemployment: true,
  gini_ratio: true,
  "household-floor-per-capita-le7-2": true,
  nutrition_ski2023_stunting: true,
  nutrition_ski2023_wasting: true,
  morbidity_activity_limiting: true,
  irbi_overall_2023: true,
};
const NONNEGATIVE_ONLY_IDS: Readonly<Record<string, true | undefined>> = {
  expenditure_per_capita: true,
  rls: true,
  hls: true,
  puskesmas_per_100k: true,
  life_expectancy_lfsp2020: true,
  irbi_overall_2023: true,
};

function requireContract(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(`CIVX 2023: ${message}`);
}

function finite(value: unknown, label: string): asserts value is number {
  requireContract(typeof value === "number" && Number.isFinite(value), `${label} must be a finite number`);
}

function text(value: unknown, label: string): asserts value is string {
  requireContract(typeof value === "string" && value.trim().length > 0, `${label} must be a nonempty string`);
}

function orderedIds(actual: readonly string[], expected: readonly string[], label: string): void {
  requireContract(Array.isArray(actual) && actual.length === expected.length && actual.every((id, index) => id === expected[index]), `${label} membership or order changed`);
}

function equalNumber(actual: unknown, expected: number, label: string, tolerance = 0): void {
  finite(actual, label);
  requireContract(Math.abs(actual - expected) <= tolerance, `${label} differs from the frozen contract`);
}

function expectedMaximum(indicatorId: string): number | null {
  return indicatorId === "gini_ratio" ? 1 : NONNEGATIVE_ONLY_IDS[indicatorId] === true ? null : 100;
}

function expectedDirection(indicatorId: string): PressureDirection2023 {
  return HIGHER_PRESSURE_IDS[indicatorId] === true ? "higher_raw_higher_pressure" : "higher_raw_lower_pressure";
}

function validateBounds(bounds: ExpectedBounds2023, indicatorId: string): void {
  requireContract(bounds.minimum === 0 && bounds.maximum === expectedMaximum(indicatorId), `${indicatorId} physical bounds changed`);
}

function validateWeights(indicator: WeightingIndicatorInput2023, dimensionId: string, count: number): asserts indicator is IndicatorWeights2023 {
  requireContract(indicator.dimensionId === dimensionId, `${indicator.indicatorId} dimension changed`);
  equalNumber(indicator.withinDimensionWeight, 1 / count, `${indicator.indicatorId} within-dimension weight`, WEIGHT_TOLERANCE);
  equalNumber(indicator.dimensionWeight, 1 / 6, `${indicator.indicatorId} dimension weight`, WEIGHT_TOLERANCE);
  equalNumber(indicator.effectiveWeight, (1 / 6) * (1 / count), `${indicator.indicatorId} effective weight`, WEIGHT_TOLERANCE);
  requireContract(indicator.exactWithinFraction === `1/${count}` && indicator.exactDimensionFraction === "1/6" && indicator.exactEffectiveFraction === `1/${6 * count}`, `${indicator.indicatorId} exact weight fractions changed`);
}

export function normalizePressure2023(
  rawValue: number,
  indicator: Pick<Indicator2023, "minimum" | "maximum" | "pressureDirection"> & { readonly expectedBounds?: ExpectedBounds2023 },
): number {
  finite(rawValue, "raw value");
  finite(indicator.minimum, "minimum anchor");
  finite(indicator.maximum, "maximum anchor");
  requireContract(indicator.minimum >= 0 && indicator.maximum >= 0 && rawValue >= 0, "raw values and anchors must be nonnegative");
  requireContract(indicator.pressureDirection === "higher_raw_higher_pressure" || indicator.pressureDirection === "higher_raw_lower_pressure", "unknown pressure direction");
  requireContract(indicator.minimum !== indicator.maximum, "CONSTANT_SERIES");
  requireContract(indicator.minimum < indicator.maximum, "minimum anchor must be below maximum anchor");
  const bounds = indicator.expectedBounds;
  if (bounds !== undefined) {
    finite(bounds.minimum, "physical minimum");
    requireContract(bounds.minimum >= 0, "physical minimum must be nonnegative");
    if (bounds.maximum !== null) {
      finite(bounds.maximum, "physical maximum");
      requireContract(bounds.maximum > bounds.minimum, "invalid physical bounds");
    }
    requireContract(indicator.minimum >= bounds.minimum && rawValue >= bounds.minimum && (bounds.maximum === null || (indicator.maximum <= bounds.maximum && rawValue <= bounds.maximum)), "OUTSIDE_PHYSICAL_BOUNDS");
  }
  requireContract(rawValue >= indicator.minimum && rawValue <= indicator.maximum, "OUTSIDE_CALIBRATION_RANGE");
  const numerator = indicator.pressureDirection === "higher_raw_higher_pressure"
    ? rawValue - indicator.minimum
    : indicator.maximum - rawValue;
  const score = (numerator / (indicator.maximum - indicator.minimum)) * 100;
  finite(score, "normalized pressure");
  requireContract(score >= 0 && score <= 100, "normalized pressure outside 0–100");
  return score;
}

export function assertModel2023(model: Model2023): void {
  requireContract(model.modelId === MODEL_ID && model.modelVersion === 1 && model.referenceYear === 2023, "model identity, version or year changed");
  requireContract(model.normalizationMethod === "min_max" && model.weightingSchemeId === SCHEME_ID, "normalization method or weighting scheme changed");
  orderedIds(model.regions.map((region) => region.id), REGION_IDS, "regions");
  for (const region of model.regions) text(region.name, `${region.id} name`);
  requireContract(new Set(model.regions.map((region) => region.name)).size === 27, "duplicate region names");
  orderedIds(model.dimensions.map((dimension) => dimension.dimensionId), DIMENSION_IDS, "dimensions");
  orderedIds(model.indicators.map((indicator) => indicator.indicatorId), INDICATOR_IDS, "indicators");
  orderedIds(model.calibrationEvidence.map((evidence) => evidence.indicatorId), INDICATOR_IDS, "calibration evidence");
  let dimensionTotal = 0;
  let effectiveTotal = 0;
  for (let dimensionIndex = 0; dimensionIndex < DIMENSIONS.length; dimensionIndex += 1) {
    const expected = DIMENSIONS[dimensionIndex];
    const dimension = model.dimensions[dimensionIndex];
    text(dimension.displayName, `${dimension.dimensionId} display name`);
    orderedIds(dimension.indicatorIds, expected.ids, `${dimension.dimensionId} indicators`);
    equalNumber(dimension.weight, 1 / 6, `${dimension.dimensionId} weight`, WEIGHT_TOLERANCE);
    requireContract(dimension.exactFraction === "1/6", `${dimension.dimensionId} exact fraction changed`);
    dimensionTotal += dimension.weight;
    let withinTotal = 0;
    let dimensionEffectiveTotal = 0;
    for (const indicatorId of expected.ids) {
      const index = INDICATOR_IDS.indexOf(indicatorId);
      const indicator = model.indicators[index];
      const evidence = model.calibrationEvidence[index];
      validateWeights(indicator, expected.id, expected.ids.length);
      text(indicator.displayName, `${indicatorId} display name`);
      text(indicator.unit, `${indicatorId} unit`);
      requireContract(indicator.pressureDirection === expectedDirection(indicatorId), `${indicatorId} pressure direction changed`);
      validateBounds(indicator.expectedBounds, indicatorId);
      requireContract(indicator.frozenIndicatorPointer === `/indicators/${index}`, `${indicatorId} frozen indicator pointer changed`);
      finite(evidence.minimum, `${indicatorId} evidence minimum`);
      finite(evidence.maximum, `${indicatorId} evidence maximum`);
      equalNumber(indicator.minimum, evidence.minimum, `${indicatorId} minimum anchor`);
      equalNumber(indicator.maximum, evidence.maximum, `${indicatorId} maximum anchor`);
      normalizePressure2023(indicator.minimum, indicator);
      normalizePressure2023(indicator.maximum, indicator);
      const valuePointer = new RegExp(`^/indicators/${index}/observations/(?:[0-9]|1[0-9]|2[0-6])/value$`);
      requireContract(valuePointer.test(evidence.frozenMinimumValuePointer) && valuePointer.test(evidence.frozenMaximumValuePointer), `${indicatorId} extrema evidence pointers changed`);
      requireContract(evidence.normalizationCalibrationPointer === `/indicators/${index}/calibration/min_max`, `${indicatorId} calibration pointer changed`);
      withinTotal += indicator.withinDimensionWeight;
      dimensionEffectiveTotal += indicator.effectiveWeight;
      effectiveTotal += indicator.effectiveWeight;
    }
    equalNumber(withinTotal, 1, `${dimension.dimensionId} within-dimension budget`, WEIGHT_TOLERANCE);
    equalNumber(dimensionEffectiveTotal, dimension.weight, `${dimension.dimensionId} effective budget`, WEIGHT_TOLERANCE);
  }
  equalNumber(dimensionTotal, 1, "dimension budget", WEIGHT_TOLERANCE);
  equalNumber(effectiveTotal, 1, "effective indicator budget", WEIGHT_TOLERANCE);
}

export function prepareModel2023(
  frozen: FrozenInputs2023,
  normalized: NormalizationInputs2023,
  weighting: WeightingInputs2023,
): { model: Model2023; regions: RegionInput2023[] } {
  requireContract(frozen.contractId === "civx-jabar-2023-final-indicator-freeze" && frozen.version === 1 && frozen.referenceYear === 2023 && frozen.status === "FROZEN_SCORING_INPUTS_ONLY", "frozen contract metadata changed");
  requireContract(frozen.totalCoreIndicators === 18 && frozen.totalDimensions === 6 && frozen.geography.regionCount === 27, "frozen counts changed");
  requireContract(normalized.designId === "civx-jabar-2023-normalization-design" && normalized.version === 1 && normalized.referenceYear === 2023 && normalized.status === "METHODOLOGY_DESIGN_ONLY", "normalization metadata changed");
  requireContract(weighting.designId === "civx-jabar-2023-weighting-design" && weighting.version === 1 && weighting.referenceYear === 2023 && weighting.status === "READY_FOR_SCORING_ENGINE_IMPLEMENTATION", "weighting metadata changed");
  requireContract(normalized.input.path === FREEZE_PATH && normalized.input.contractId === frozen.contractId && weighting.input.freezePath === FREEZE_PATH && weighting.input.normalizationPath === NORMALIZATION_PATH, "upstream source pointers changed");
  requireContract(normalized.recommendation.methodId === "min_max" && weighting.input.normalizationMethod === "min_max" && weighting.selectedSchemeId === SCHEME_ID, "selected method or scheme changed");
  const selectedMethods = normalized.methods.filter((method) => method.selected);
  requireContract(selectedMethods.length === 1 && selectedMethods[0].id === "min_max" && selectedMethods[0].clipsObservations === false, "selected normalization must be unclipped min-max");
  const selectedSchemes = weighting.schemes.filter((scheme) => scheme.selected);
  requireContract(selectedSchemes.length === 1 && selectedSchemes[0].schemeId === SCHEME_ID, "weighting must select only the approved scheme");
  const scheme = selectedSchemes[0];
  orderedIds(frozen.geography.regions.map((region) => region.id), REGION_IDS, "frozen regions");
  orderedIds(normalized.input.regions.map((region) => region.id), REGION_IDS, "normalization regions");
  orderedIds(weighting.input.regionIds, REGION_IDS, "weighting regions");
  orderedIds(frozen.dimensions.map((dimension) => dimension.dimensionId), DIMENSION_IDS, "frozen dimensions");
  orderedIds(normalized.input.dimensionIds, DIMENSION_IDS, "normalization dimensions");
  orderedIds(weighting.input.dimensionIds, DIMENSION_IDS, "weighting dimensions");
  orderedIds(scheme.dimensionWeights.map((dimension) => dimension.dimensionId), DIMENSION_IDS, "selected dimension weights");
  orderedIds(frozen.indicators.map((indicator) => indicator.indicatorId), INDICATOR_IDS, "frozen indicators");
  orderedIds(normalized.input.indicatorIds, INDICATOR_IDS, "normalization input indicators");
  orderedIds(normalized.indicators.map((indicator) => indicator.indicatorId), INDICATOR_IDS, "normalization indicators");
  orderedIds(weighting.input.indicatorIds, INDICATOR_IDS, "weighting input indicators");
  orderedIds(weighting.input.panels.map((panel) => panel.indicatorId), INDICATOR_IDS, "weighting panels");
  orderedIds(scheme.indicatorWeights.map((indicator) => indicator.indicatorId), INDICATOR_IDS, "selected indicator weights");
  const regions: RegionInput2023[] = frozen.geography.regions.map((region, index) => {
    text(region.name, `${region.id} name`);
    requireContract(normalized.input.regions[index].name === region.name, `${region.id} normalization region name changed`);
    return { regionId: region.id, regionName: region.name, referenceYear: 2023, indicators: [] };
  });
  const regionIndicators: IndicatorInput2023[][] = regions.map(() => []);
  const dimensions: Dimension2023[] = frozen.dimensions.map((dimension, index) => {
    const expected = DIMENSIONS[index];
    const selected = scheme.dimensionWeights[index];
    orderedIds(dimension.indicatorIds, expected.ids, `${dimension.dimensionId} frozen membership`);
    orderedIds(selected.indicatorIds, expected.ids, `${dimension.dimensionId} selected membership`);
    requireContract(dimension.indicatorCount === expected.ids.length && dimension.displayName === selected.displayName, `${dimension.dimensionId} dimension metadata changed`);
    equalNumber(selected.effectiveIndicatorWeightTotal, 1 / 6, `${dimension.dimensionId} selected effective budget`, WEIGHT_TOLERANCE);
    return { dimensionId: dimension.dimensionId, displayName: dimension.displayName, indicatorIds: [...dimension.indicatorIds], weight: selected.weight, exactFraction: selected.exactFraction };
  });
  const calibrationEvidence: CalibrationEvidence2023[] = [];
  const indicators: Indicator2023[] = frozen.indicators.map((indicator, index) => {
    const normalization = normalized.indicators[index];
    const panel = weighting.input.panels[index];
    const weights = scheme.indicatorWeights[index];
    const dimension = dimensions.find((entry) => entry.indicatorIds.includes(indicator.indicatorId));
    requireContract(dimension !== undefined && indicator.dimensionId === dimension.dimensionId, `${indicator.indicatorId} frozen dimension changed`);
    requireContract(indicator.year === 2023 && normalization.year === 2023 && panel.year === 2023, `${indicator.indicatorId} year changed`);
    requireContract(indicator.classification === "CORE" && indicator.frozenStatus === "FROZEN" && indicator.eligibleForNextNormalization === true, `${indicator.indicatorId} not frozen CORE`);
    requireContract(indicator.civxPressureDirection === expectedDirection(indicator.indicatorId), `${indicator.indicatorId} frozen direction changed`);
    text(indicator.displayName, `${indicator.indicatorId} display name`);
    text(indicator.unit, `${indicator.indicatorId} unit`);
    for (const metadata of [normalization, panel]) {
      requireContract(metadata.dimensionId === indicator.dimensionId && metadata.displayName === indicator.displayName && metadata.unit === indicator.unit && metadata.pressureDirection === indicator.civxPressureDirection, `${indicator.indicatorId} upstream metadata mismatch`);
    }
    requireContract(normalization.frozenIndicatorPointer === `/indicators/${index}`, `${indicator.indicatorId} frozen pointer mismatch`);
    validateBounds(normalization.expectedBounds, indicator.indicatorId);
    orderedIds(indicator.observations.map((observation) => observation.regionId), REGION_IDS, `${indicator.indicatorId} frozen observations`);
    orderedIds(normalization.observations.map((observation) => observation.regionId), REGION_IDS, `${indicator.indicatorId} normalized observations`);
    orderedIds(panel.observations.map((observation) => observation.regionId), REGION_IDS, `${indicator.indicatorId} weighting observations`);
    for (const observation of indicator.observations) finite(observation.value, `${indicator.indicatorId} frozen raw value`);
    const minimum = Math.min(...indicator.observations.map((observation) => observation.value));
    const maximum = Math.max(...indicator.observations.map((observation) => observation.value));
    equalNumber(normalization.calibration.min_max.minimum, minimum, `${indicator.indicatorId} calibration minimum`);
    equalNumber(normalization.calibration.min_max.maximum, maximum, `${indicator.indicatorId} calibration maximum`);
    equalNumber(normalization.statistics.minimum, minimum, `${indicator.indicatorId} statistical minimum`);
    equalNumber(normalization.statistics.maximum, maximum, `${indicator.indicatorId} statistical maximum`);
    requireContract(normalization.statistics.n === 27, `${indicator.indicatorId} calibration cohort changed`);
    validateWeights(weights, dimension.dimensionId, dimension.indicatorIds.length);
    const prepared: Indicator2023 = {
      indicatorId: indicator.indicatorId,
      dimensionId: indicator.dimensionId,
      displayName: indicator.displayName,
      unit: indicator.unit,
      pressureDirection: expectedDirection(indicator.indicatorId),
      minimum,
      maximum,
      expectedBounds: { minimum: normalization.expectedBounds.minimum, maximum: normalization.expectedBounds.maximum },
      frozenIndicatorPointer: normalization.frozenIndicatorPointer,
      withinDimensionWeight: weights.withinDimensionWeight,
      dimensionWeight: weights.dimensionWeight,
      effectiveWeight: weights.effectiveWeight,
      exactWithinFraction: weights.exactWithinFraction,
      exactDimensionFraction: weights.exactDimensionFraction,
      exactEffectiveFraction: weights.exactEffectiveFraction,
    };
    calibrationEvidence.push({
      indicatorId: indicator.indicatorId,
      minimum,
      maximum,
      frozenMinimumValuePointer: `/indicators/${index}/observations/${indicator.observations.findIndex((observation) => observation.value === minimum)}/value`,
      frozenMaximumValuePointer: `/indicators/${index}/observations/${indicator.observations.findIndex((observation) => observation.value === maximum)}/value`,
      normalizationCalibrationPointer: `/indicators/${index}/calibration/min_max`,
    });
    for (let regionIndex = 0; regionIndex < regions.length; regionIndex += 1) {
      const raw = indicator.observations[regionIndex];
      const normalizedValue = normalization.observations[regionIndex];
      const weightedValue = panel.observations[regionIndex];
      const region = regions[regionIndex];
      const frozenObservationPointer = `/indicators/${index}/observations/${regionIndex}`;
      const frozenValuePointer = `${frozenObservationPointer}/value`;
      const normalizationValuePointer = `${frozenObservationPointer}/normalizedPressure/min_max`;
      requireContract((raw.regionName === undefined || raw.regionName === region.regionName) && normalizedValue.regionName === region.regionName, `${indicator.indicatorId}/${region.regionId} region name mismatch`);
      equalNumber(normalizedValue.rawValue, raw.value, `${indicator.indicatorId}/${region.regionId} normalization raw value`);
      equalNumber(weightedValue.rawValue, raw.value, `${indicator.indicatorId}/${region.regionId} weighting raw value`);
      requireContract(normalizedValue.frozenObservationPointer === frozenObservationPointer && weightedValue.frozenValuePointer === frozenValuePointer && weightedValue.normalizationValuePointer === normalizationValuePointer, `${indicator.indicatorId}/${region.regionId} observation pointer mismatch`);
      const pressure = normalizedValue.normalizedPressure.min_max;
      finite(pressure, `${indicator.indicatorId}/${region.regionId} normalized pressure`);
      requireContract(pressure >= 0 && pressure <= 100, `${indicator.indicatorId}/${region.regionId} pressure outside 0–100`);
      equalNumber(pressure, normalizePressure2023(raw.value, prepared), `${indicator.indicatorId}/${region.regionId} recomputed pressure`, SCORE_TOLERANCE);
      equalNumber(weightedValue.normalizedPressure, pressure, `${indicator.indicatorId}/${region.regionId} weighting pressure`);
      regionIndicators[regionIndex].push({ indicatorId: indicator.indicatorId, rawValue: raw.value, normalizedPressure: pressure, frozenValuePointer, normalizationValuePointer });
    }
    return prepared;
  });
  const model: Model2023 = {
    modelId: MODEL_ID,
    modelVersion: 1,
    referenceYear: 2023,
    normalizationMethod: "min_max",
    weightingSchemeId: SCHEME_ID,
    regions: frozen.geography.regions.map((region) => ({ id: region.id, name: region.name })),
    dimensions,
    indicators,
    calibrationEvidence,
  };
  assertModel2023(model);
  return { model, regions: regions.map((region, index) => ({ ...region, indicators: regionIndicators[index] })) };
}
