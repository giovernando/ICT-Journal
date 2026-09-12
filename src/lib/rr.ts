/** Single source of truth for Risk-to-Reward parsing, normalising and formatting. */

/** Only digits, dot, minus and ratio separator are allowed in the RR input. */
export function sanitizeRRInput(raw: string): string {
  return raw.replace(/[^0-9.:-]/g, "");
}

/** Round to 2 decimals, keeping -0 out of the data. */
export function normalizeRR(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return rounded === 0 ? 0 : rounded;
}

export interface RRParseResult {
  /** Normalised reward multiple, e.g. 3.5 or -1. Null when input is empty or invalid. */
  value: number | null;
  error?: string;
}

const RATIO = /^(-?)(\d+(?:\.\d+)?)\s*:\s*(-?\d+(?:\.\d+)?)$/;
const PLAIN = /^-?\d+(?:\.\d+)?$/;

export function parseRRInput(raw: string): RRParseResult {
  const value = raw.trim().replace(",", ".");
  if (!value) return { value: null };

  if (value.includes(":")) {
    const match = value.match(RATIO);
    if (!match) {
      return { value: null, error: "Format rasio harus seperti 1:3.5 (risk:reward)" };
    }
    const risk = Number(match[2]);
    const reward = Number(match[3]);
    if (!risk) return { value: null, error: "Bagian risk tidak boleh 0 (contoh: 1:2)" };
    const signed = (match[1] === "-" ? -1 : 1) * (reward / risk);
    return { value: normalizeRR(signed) };
  }

  if (!PLAIN.test(value)) {
    return { value: null, error: "Hanya angka, titik, minus, dan ':' — contoh: 2, -1, 1:3.5" };
  }
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return { value: null, error: "Nilai RR tidak valid (contoh: 2 atau -1)" };
  }
  if (Math.abs(num) > 100) {
    return { value: null, error: "RR terlalu besar, gunakan nilai antara -100 dan 100" };
  }
  return { value: normalizeRR(num) };
}

/** Canonical text for a stored RR value, used to seed the form when editing. */
export function rrToInput(rr: number | null | undefined): string {
  if (rr === null || rr === undefined || Number.isNaN(rr)) return "";
  return String(normalizeRR(rr));
}

/** Display format: positive values as 1:R, negative as -1R (loss). */
export function formatRRValue(rr: number | null): string {
  if (rr === null || Number.isNaN(rr)) return "—";
  const n = normalizeRR(rr);
  const abs = Number.isInteger(n) ? String(Math.abs(n)) : Math.abs(n).toFixed(2);
  if (n < 0) return `-${abs}R`;
  if (n === 0) return "0R";
  return `1:${abs}`;
}
