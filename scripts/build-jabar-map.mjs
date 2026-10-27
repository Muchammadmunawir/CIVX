import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// Display geometry only. This never changes observations, scores, or BPS region IDs.
const sourceUrl = "https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/9469f09/releaseData/gbOpen/IDN/ADM2/geoBoundaries-IDN-ADM2_simplified.geojson";
const sourceHash = "146653d488331086ddc43d159a261b01ea6dd08c7ed422e34a9886c3c690430c";
const raw = JSON.parse(readFileSync(new URL("../data/raw/civx-jabar-2023.json", import.meta.url), "utf8"));
const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Boundary download failed: HTTP ${response.status}`);
const bytes = Buffer.from(await response.arrayBuffer());
if (createHash("sha256").update(bytes).digest("hex") !== sourceHash) {
  throw new Error("Pinned geoBoundaries artifact checksum changed; no map generated.");
}
const features = JSON.parse(bytes.toString("utf8")).features;
if (!Array.isArray(features) || raw.regions.length !== 27) throw new Error("Unexpected geography cohort.");

const selected = raw.regions.map((region) => {
  const name = region.type === "kabupaten" ? region.name.slice("Kabupaten ".length) : region.name;
  const matches = features.filter((feature) => feature.properties?.shapeName === name);
  if (matches.length !== 1) throw new Error(`Missing or ambiguous ADM2 geometry: ${region.id} ${name}`);
  return { region, feature: matches[0] };
});
if (new Set(selected.map(({ feature }) => feature.properties.shapeID)).size !== selected.length) {
  throw new Error("Two CIVX regions map to the same ADM2 geometry.");
}

const polygons = (geometry) => geometry.type === "Polygon" ? [geometry.coordinates] :
  geometry.type === "MultiPolygon" ? geometry.coordinates : (() => { throw new Error("Unexpected ADM2 geometry type."); })();
const bounds = [Infinity, Infinity, -Infinity, -Infinity];
for (const { feature } of selected) {
  for (const polygon of polygons(feature.geometry)) for (const ring of polygon) for (const point of ring) {
    const [lon, lat] = point;
    if (!Number.isFinite(lon) || !Number.isFinite(lat) || lon < 106 || lon > 110 || lat < -9 || lat > -5) {
      throw new Error(`Geometry outside Jawa Barat envelope: ${feature.properties.shapeName}`);
    }
    bounds[0] = Math.min(bounds[0], lon);
    bounds[1] = Math.min(bounds[1], lat);
    bounds[2] = Math.max(bounds[2], lon);
    bounds[3] = Math.max(bounds[3], lat);
  }
}
const width = 940;
const height = 735;
const margin = 28;
const scale = Math.min((width - 2 * margin) / (bounds[2] - bounds[0]), (height - 2 * margin) / (bounds[3] - bounds[1]));
const offsetX = (width - (bounds[2] - bounds[0]) * scale) / 2;
const offsetY = (height - (bounds[3] - bounds[1]) * scale) / 2;
const project = ([lon, lat]) => `${(offsetX + (lon - bounds[0]) * scale).toFixed(1)} ${(offsetY + (bounds[3] - lat) * scale).toFixed(1)}`;
const regions = selected.map(({ region, feature }) => ({
  id: region.id,
  shapeId: feature.properties.shapeID,
  path: polygons(feature.geometry).flatMap((polygon) => polygon.map((ring) =>
    `M${ring.map(project).join("L")}Z`)).join(""),
}));
const output = {
  source: {
    title: "geoBoundaries IDN ADM2 gbOpen (2020 represented boundaries)",
    url: sourceUrl,
    sha256: sourceHash,
    license: "CC BY 3.0 IGO",
    boundaryYear: 2020,
    shapeType: "ADM2",
  },
  viewBox: `0 0 ${width} ${height}`,
  regions,
};
mkdirSync(new URL("../data/geography/", import.meta.url), { recursive: true });
writeFileSync(new URL("../data/geography/jabar-adm2-2020.json", import.meta.url), `${JSON.stringify(output)}\n`);
console.log(`Mapped ${regions.length} named release regions to pinned 2020 ADM2 shapes.`);
