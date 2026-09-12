import type { Currency, Trade } from "@/types/trade";

export const CURRENCY_OPTIONS: Currency[] = ["IDR", "USD", "USC"];

const SYMBOL: Record<Currency, string> = { IDR: "Rp", USD: "$", USC: "¢" };
const DECIMALS: Record<Currency, number> = { IDR: 0, USD: 2, USC: 2 };

export function formatMoney(amount: number, currency: Currency): string {
  const d = DECIMALS[currency] ?? 2;
  const sign = amount < 0 ? "-" : "";
  const body = Math.abs(amount).toLocaleString("id-ID", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
  return `${sign}${SYMBOL[currency]}${body}`;
}

/** Sum P/L per currency — different currencies are never mixed together. */
export function sumByCurrency(trades: Trade[]): Array<{ currency: Currency; total: number }> {
  const map = new Map<Currency, number>();
  for (const t of trades) {
    const cur = (t.currency ?? "USD") as Currency;
    map.set(cur, (map.get(cur) ?? 0) + (Number(t.pnl) || 0));
  }
  return CURRENCY_OPTIONS.filter((c) => map.has(c)).map((c) => ({
    currency: c,
    total: Math.round((map.get(c) ?? 0) * 100) / 100,
  }));
}

export function formatTotals(trades: Trade[]): string {
  const totals = sumByCurrency(trades);
  if (totals.length === 0) return formatMoney(0, "USD");
  return totals.map((t) => formatMoney(t.total, t.currency)).join(" · ");
}

export function totalsTone(trades: Trade[]): string {
  const net = sumByCurrency(trades).reduce((s, t) => s + t.total, 0);
  if (net > 0) return "text-emerald-400";
  if (net < 0) return "text-rose-400";
  return "text-foreground";
}

/** Parse a free-form money input, tolerating thousand separators. */
export function parsePnlInput(raw: string): number {
  const cleaned = raw.replace(/[^0-9.,-]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
