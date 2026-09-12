import type { Trade } from "@/types/trade";

export interface BucketStats {
  key: string;
  label: string;
  trades: number;
  wins: number;
  losses: number;
  winRate: number;
  netRR: number;
  avgRR: number;
  /** Sum of realised profit/loss in the currency the caller filtered on */
  netPnl: number;
}

/** RR contribution of a single trade (loss counts as -1R when RR is positive). */
export function tradeRR(trade: Trade): number | null {
  if (trade.status === "Running") return null;
  if (trade.rr === null) return null;
  if (trade.status === "Lose") return trade.rr < 0 ? trade.rr : -1;
  if (trade.status === "Win") return trade.rr;
  return trade.rr;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = (x.getDay() + 6) % 7; // Monday start
  x.setDate(x.getDate() - day);
  return x;
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function bucketOf(trade: Trade, mode: "week" | "month") {
  const d = new Date(trade.date);
  if (Number.isNaN(d.getTime())) return null;
  if (mode === "week") {
    const from = startOfWeek(d);
    const to = new Date(from.getTime() + 6 * 86400000);
    return { key: from.toISOString().slice(0, 10), label: `${fmtDay(from)} – ${fmtDay(to)}` };
  }
  return {
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: d.toLocaleDateString("id-ID", { month: "short", year: "numeric" }),
  };
}

export function groupTrades(trades: Trade[], mode: "week" | "month"): BucketStats[] {
  const map = new Map<string, { label: string; items: Trade[] }>();
  for (const trade of trades) {
    const bucket = bucketOf(trade, mode);
    if (!bucket) continue;
    const entry = map.get(bucket.key) ?? { label: bucket.label, items: [] };
    entry.items.push(trade);
    map.set(bucket.key, entry);
  }

  return Array.from(map.entries())
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([key, { label, items }]) => summarize(key, label, items));
}

export function summarize(key: string, label: string, items: Trade[]): BucketStats {
  const wins = items.filter((t) => t.status === "Win").length;
  const losses = items.filter((t) => t.status === "Lose").length;
  const decided = wins + losses;
  const rrs = items.map(tradeRR).filter((v): v is number => v !== null);
  const netRR = rrs.reduce((sum, v) => sum + v, 0);
  return {
    key,
    label,
    trades: items.length,
    wins,
    losses,
    winRate: decided ? Math.round((wins / decided) * 100) : 0,
    netRR: round2(netRR),
    avgRR: rrs.length ? round2(netRR / rrs.length) : 0,
    netPnl: round2(items.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0)),
  };
}

export function overall(trades: Trade[]): BucketStats {
  return summarize("all", "Total", trades);
}

/** Aggregate stats per pair, sorted by net R descending. */
export function groupByPair(trades: Trade[]): BucketStats[] {
  const map = new Map<string, Trade[]>();
  for (const trade of trades) {
    const pair = trade.pair?.trim() || "—";
    const items = map.get(pair) ?? [];
    items.push(trade);
    map.set(pair, items);
  }
  return Array.from(map.entries())
    .map(([pair, items]) => summarize(pair, pair, items))
    .sort((a, b) => b.netRR - a.netRR);
}

export function withCumulative(buckets: BucketStats[]) {
  let running = 0;
  return buckets.map((b) => {
    running = round2(running + b.netRR);
    return { ...b, cumulativeRR: running };
  });
}
