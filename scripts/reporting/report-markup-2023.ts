import { createHash } from "node:crypto";
import { formatScore } from "../../src/components/product/format.ts";

export const PRINT_SCRIPT = 'document.getElementById("print-report").addEventListener("click", function () { window.print(); });';
export const REPORT_CSP = `default-src 'none'; script-src 'sha256-${createHash("sha256").update(PRINT_SCRIPT).digest("base64")}'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; object-src 'none'; connect-src 'none'`;

export function escapeHtml(value: string | number | boolean): string {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]!);
}

export function number(value: number): string {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new TypeError("Nilai laporan harus berupa angka hingga dari facade.");
  return String(value);
}

export function pressure(value: number): string {
  const exact = number(value);
  if (value < 0 || value > 100) throw new RangeError("Tekanan laporan harus berada pada skala 0–100.");
  return `<data value="${exact}" title="Nilai facade: ${exact}">${formatScore(value)}</data>`;
}

export function link(url: string): string {
  let parsed: URL;
  try { parsed = new URL(url); } catch { throw new TypeError("URL sumber atau rujukan laporan tidak sah."); }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new TypeError("URL sumber atau rujukan laporan harus memakai HTTP atau HTTPS.");
  return `<a href="${escapeHtml(url)}" rel="noreferrer">${escapeHtml(url)}</a>`;
}
