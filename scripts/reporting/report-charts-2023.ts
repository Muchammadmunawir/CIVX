import { formatScore } from "../../src/components/product/format.ts";
import type { CivxDimensionProduct2023 } from "../../src/lib/civx/product-view-types-2023.ts";
import { orderedPressureDimensions2023, pressureDimensionLabel2023, type PressureComparisonData2023 } from "../../src/lib/civx/visualization-2023.ts";
import { escapeHtml, number } from "./report-markup-2023.ts";

const x = (score: number): number => {
  number(score);
  if (score < 0 || score > 100) throw new RangeError("Tekanan visualisasi harus berada pada skala 0–100.");
  return 230 + score * 5;
};
const axis = [0, 25, 50, 75, 100].map(score => `<line x1="${x(score)}" x2="${x(score)}" y1="32" y2="254" stroke="var(--border)" stroke-dasharray="3 4"/><text x="${x(score)}" y="18" text-anchor="middle" font-size="12">${score}</text>`).join("");

function chart(title: string, rows: string): string {
  return `<div class="table-scroll chart-scroll" tabindex="0" role="region" aria-label="Grafik enam dimensi, tersedia pula sebagai tabel"><svg class="pressure-chart" viewBox="0 0 800 270" role="img" aria-labelledby="pressure-chart-title pressure-chart-description"><title id="pressure-chart-title">${escapeHtml(title)}</title><desc id="pressure-chart-description">Enam dimensi tekanan relatif pada sumbu tetap 0–100. Nilai lengkap tersedia pada tabel sesudah grafik.</desc><g fill="var(--foreground)" font-family="Arial,Helvetica,sans-serif" font-size="14">${axis}${rows}</g></svg></div>`;
}

export function renderPressureProfileSvg2023(dimensions: readonly CivxDimensionProduct2023[]): string {
  return chart("Profil tekanan relatif enam dimensi CORE 2023", orderedPressureDimensions2023(dimensions).map((dimension, index) => {
    const y = 54 + index * 38;
    return `<g data-dimension-id="${dimension.dimensionId}" data-score="${number(dimension.score)}"><text x="8" y="${y + 5}">${escapeHtml(pressureDimensionLabel2023(dimension.dimensionId))}</text><line x1="230" x2="730" y1="${y}" y2="${y}" stroke="var(--border)"/><rect x="230" y="${y - 4}" width="${dimension.score * 5}" height="8" rx="4" fill="var(--accent)"/><circle cx="${x(dimension.score)}" cy="${y}" r="5" fill="var(--accent)"/><text x="792" y="${y + 5}" text-anchor="end">${formatScore(dimension.score)}</text></g>`;
  }).join(""));
}

export function renderPressureComparisonSvg2023(data: PressureComparisonData2023): string {
  return chart(`Perbandingan ${data.regionA.name} dan ${data.regionB.name}`, data.dimensions.map((row, index) => {
    const y = 54 + index * 38;
    const equal = row.relation === "EQUAL";
    return `<g data-dimension-id="${escapeHtml(row.id)}" data-score-a="${number(row.scoreA)}" data-score-b="${number(row.scoreB)}"><text x="8" y="${y + 5}">${escapeHtml(row.label)}</text><line x1="230" x2="730" y1="${y}" y2="${y}" stroke="var(--border)"/><line x1="${x(row.scoreA)}" x2="${x(row.scoreB)}" y1="${y}" y2="${y}" stroke="var(--foreground)" stroke-width="2"/><circle cx="${x(row.scoreA)}" cy="${y}" r="${equal ? 9 : 6}" fill="${equal ? "none" : "var(--accent)"}" stroke="var(--accent)" stroke-width="2"/><rect x="${x(row.scoreB) - 5}" y="${y - 5}" width="10" height="10" fill="none" stroke="var(--foreground)" stroke-width="2"/></g>`;
  }).join(""));
}
