import { rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createLocalAnalyticalCsv2023 } from "./reporting/analytical-csv-2023.ts";
import { renderLocalAnalyticalHtml2023 } from "./reporting/analytical-html-2023.ts";
import { renderLocalComparisonHtml2023 } from "./reporting/comparison-html-2023.ts";
import { createPrivateReportDirectory2023 } from "./reporting/private-output-2023.ts";
import { prepareLocalAnalyticalReport2023, prepareLocalComparisonReport2023, type LocalReportFilters2023 } from "./reporting/report-data-2023.ts";

const usage = `CIVX — laporan analitis untuk peninjauan lokal terbatas

node scripts/prepare-analytical-report-2023.ts --region 3273 [--q Bandung] [--type kota] [--compare-with 3201]

--region  Kode BPS satu wilayah yang termasuk hasil filter.
--q       Pencarian nama seperti pada Jelajah; default tanpa pencarian.
--type    all, kabupaten, atau kota; default all.
--compare-with  Tambahkan HTML perbandingan dengan kode BPS dari kohort 2023.
                Pembanding dipilih langsung, di luar filter CSV.

CSV memuat seluruh hasil filter. HTML A4 memuat satu wilayah dan dapat
 dicetak/disimpan sebagai PDF melalui peramban. Berkas dibuat di direktori
 privat di luar repository. Tidak ada pengaktifan ekspor numerik publik.`;

function parseOptions(args: readonly string[]): { regionId: string; filters: LocalReportFilters2023; peerId: string | undefined } {
  const options = new Map<string, string>();
  for (let index = 0; index < args.length; index += 2) {
    const key = args[index];
    const value = args[index + 1];
    if (!["--region", "--q", "--type", "--compare-with"].includes(key) || options.has(key) || value === undefined || value.startsWith("--")) {
      throw new Error("Argumen tidak sah atau berulang. Gunakan --help untuk petunjuk; opsi publikasi dan lokasi keluaran tidak tersedia.");
    }
    options.set(key, value);
  }
  const regionId = options.get("--region");
  if (!regionId) throw new Error("Berikan --region beserta kode BPS wilayah laporan.");
  const type = options.get("--type") ?? "all";
  if (type !== "all" && type !== "kabupaten" && type !== "kota") throw new Error("Jenis wilayah harus all, kabupaten, atau kota.");
  return { regionId, filters: { q: options.get("--q") ?? "", type }, peerId: options.get("--compare-with") };
}

function run(): void {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
    return;
  }
  const { regionId, filters, peerId } = parseOptions(args);
  const report = prepareLocalAnalyticalReport2023(regionId, filters);
  const csv = createLocalAnalyticalCsv2023(report);
  const html = renderLocalAnalyticalHtml2023(report);
  const comparison = peerId === undefined ? undefined : prepareLocalComparisonReport2023(report, peerId);
  const comparisonHtml = comparison ? renderLocalComparisonHtml2023(comparison) : undefined;
  const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
  const directory = createPrivateReportDirectory2023(repositoryRoot);
  const csvPath = join(directory, csv.filename);
  const htmlPath = join(directory, `civx-2023-${report.selected.region.id}-analitis-lokal.html`);
  const comparisonPath = comparison ? join(directory, `civx-2023-${regionId}-${comparison.regionB.region.id}-perbandingan-lokal.html`) : undefined;
  try {
    writeFileSync(csvPath, csv.content, { encoding: "utf8", flag: "wx", mode: 0o600 });
    writeFileSync(htmlPath, html, { encoding: "utf8", flag: "wx", mode: 0o600 });
    if (comparisonPath !== undefined && comparisonHtml !== undefined) writeFileSync(comparisonPath, comparisonHtml, { encoding: "utf8", flag: "wx", mode: 0o600 });
  } catch (error) {
    rmSync(directory, { recursive: true, force: true });
    throw error;
  }
  console.log(JSON.stringify({
    scope: report.scope,
    directory,
    csv: csvPath,
    html: pathToFileURL(htmlPath).href,
    comparisonHtml: comparisonPath ? pathToFileURL(comparisonPath).href : undefined,
    regions: report.regions.length,
    instruction: "Buka HTML secara lokal, lalu pilih Cetak / Simpan PDF lokal dan kertas A4. Jangan unggah hasil ke repository atau layanan publik.",
  }, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    run();
  } catch (error) {
    console.error(error instanceof Error ? error.message : "Laporan lokal tidak dapat dibuat.");
    process.exitCode = 1;
  }
}
