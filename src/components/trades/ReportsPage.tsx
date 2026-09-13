import { BottomNav } from "@/components/trades/BottomNav";
import { TopBar } from "@/components/trades/TopBar";
import { ClientOnly } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";
import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Select } from "@/components/kit/Input";
import { RRValue, RR_TOOLTIP } from "@/components/trades/RRValue";
import {
  ChartSkeleton,
  PairPerformanceSkeleton,
  ReportsSkeleton,
  SummaryTilesSkeleton,
} from "@/components/trades/Skeletons";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTrades } from "@/hooks/useTrades";
import { CURRENCY_OPTIONS, formatMoney, formatTotals } from "@/lib/money";
import type { Currency } from "@/types/trade";
import { groupByPair, groupTrades, overall, withCumulative } from "@/lib/reports";

type Mode = "week" | "month";

const MODE_LABEL: Record<Mode, string> = { week: "Mingguan", month: "Bulanan" };
const ALL_PAIRS = "Semua pair";
const ALL_CURRENCIES = "Semua mata uang";

export function ReportsPage() {
  const { trades: allTrades, hydrated, error } = useTrades();
  const [mode, setMode] = useState<Mode>("week");
  const [pairFilter, setPairFilter] = useState<string>(ALL_PAIRS);
  const [currency, setCurrency] = useState<string>(ALL_CURRENCIES);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const displayCurrency: Currency =
    currency === ALL_CURRENCIES ? "USD" : (currency as Currency);

  const pairOptions = useMemo(
    () => [ALL_PAIRS, ...Array.from(new Set(allTrades.map((t) => t.pair).filter(Boolean))).sort()],
    [allTrades],
  );
  const trades = useMemo(
    () =>
      allTrades
        .filter((t) => (pairFilter === ALL_PAIRS ? true : t.pair === pairFilter))
        .filter((t) => (currency === ALL_CURRENCIES ? true : (t.currency ?? "USD") === currency)),
    [allTrades, pairFilter, currency],
  );
  const reportTrades = useMemo(() => {
    if (!periodFrom && !periodTo) return trades;

    const from = periodFrom ? new Date(`${periodFrom}T00:00:00`) : null;
    const to = periodTo ? new Date(`${periodTo}T00:00:00`) : null;
    if (to) to.setDate(to.getDate() + 1);

    return trades.filter((trade) => {
      const date = new Date(trade.date);
      if (Number.isNaN(date.getTime())) return false;
      if (from && date < from) return false;
      if (to && date >= to) return false;
      return true;
    });
  }, [periodFrom, periodTo, trades]);
  const selectedRange = useMemo<DateRange | undefined>(() => {
    const from = periodFrom ? new Date(`${periodFrom}T00:00:00`) : undefined;
    const to = periodTo ? new Date(`${periodTo}T00:00:00`) : undefined;
    return from ? { from, to } : undefined;
  }, [periodFrom, periodTo]);
  const moneyLabel = (amount: number) =>
    currency === ALL_CURRENCIES ? formatMoney(amount, displayCurrency) : formatMoney(amount, displayCurrency);
  const pairStats = useMemo(() => groupByPair(reportTrades), [reportTrades]);

  const buckets = useMemo(() => withCumulative(groupTrades(reportTrades, mode)), [reportTrades, mode]);
  const total = useMemo(() => overall(reportTrades), [reportTrades]);
  const { best } = useMemo(() => {
    if (buckets.length === 0) return { best: null };

    const byBest = [...buckets].sort(
      (a, b) => b.netRR - a.netRR || b.netPnl - a.netPnl || b.key.localeCompare(a.key),
    );

    return {
      best: byBest[0] ?? null,
    };
  }, [buckets]);
  const worstWeek = useMemo(() => {
    const weeklyBuckets = groupTrades(reportTrades, "week");
    return [...weeklyBuckets].sort(
      (a, b) => a.netRR - b.netRR || a.netPnl - b.netPnl || a.key.localeCompare(b.key),
    )[0] ?? null;
  }, [reportTrades]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-24">
        <TopBar title="Laporan" backTo="/" backLabel="← Journal" />
        <div className="mt-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Grafik mingguan & bulanan
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Total profit/loss dalam satuan R, RR rata-rata, dan win rate dari seluruh riwayat
            trading kamu.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Filter pair
          </span>
          <div className="w-full sm:w-56">
            <Select
              aria-label="Filter pair"
              options={pairOptions}
              value={pairFilter}
              onChange={(e) => setPairFilter(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              aria-label="Filter mata uang"
              options={[ALL_CURRENCIES, ...CURRENCY_OPTIONS]}
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </div>
          {pairFilter !== ALL_PAIRS && (
            <button
              type="button"
              onClick={() => setPairFilter(ALL_PAIRS)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {!hydrated ? (
          <div className="mt-4">
            <SummaryTilesSkeleton count={5} />
          </div>
        ) : (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <SummaryTile label="Total trade" value={String(total.trades)} />
          <SummaryTile label="Win rate" value={`${total.winRate}%`} />
          <div className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Total profit
            </p>
            <p
              className={`mt-0.5 text-lg font-semibold tracking-tight ${
                total.netPnl > 0 ? "text-emerald-400" : total.netPnl < 0 ? "text-rose-400" : ""
              }`}
            >
              {currency === ALL_CURRENCIES ? formatTotals(reportTrades) : moneyLabel(total.netPnl)}
            </p>
          </div>
          <div
            title={RR_TOOLTIP}
            className="cursor-help rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Net P/L
            </p>
            <RRValue rr={total.netRR} ratio={total.netRRRatio} withLabel className="mt-0.5 text-lg" />
          </div>
          <div
            title={RR_TOOLTIP}
            className="cursor-help rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              RR rata-rata
            </p>
            <RRValue rr={total.avgRR} className="mt-0.5 text-lg" />
          </div>
        </div>
        )}

        <Card className="mt-6 min-w-0">
          <CardHeader
            title={`Profit / Loss ${MODE_LABEL[mode]}`}
            description={
              periodFrom || periodTo
                ? "Periode terpilih — data mengikuti rentang tanggal"
                : "Net R per periode — hijau profit, merah loss"
            }
            action={
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Pilih rentang tanggal laporan"
                      className="inline-flex h-9 items-center gap-2 rounded-xl border border-border/70 bg-card/50 px-3 text-xs font-semibold text-foreground shadow-[inset_0_1px_0_0_rgb(255_255_255/0.04)] transition-colors hover:border-border"
                    >
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      {periodFrom || periodTo ? formatDateRangeLabel(periodFrom, periodTo) : "Semua periode"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent align="end" className="w-auto p-0">
                    <Calendar
                      mode="range"
                      selected={selectedRange}
                      onSelect={(range: DateRange | undefined) => {
                        setPeriodFrom(range?.from ? toDateInputValue(range.from) : "");
                        setPeriodTo(range?.to ? toDateInputValue(range.to) : "");
                      }}
                      numberOfMonths={1}
                      captionLayout="dropdown"
                      {...(selectedRange?.from ? { defaultMonth: selectedRange.from } : {})}
                    />
                    {periodFrom || periodTo ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPeriodFrom("");
                          setPeriodTo("");
                          setCalendarOpen(false);
                        }}
                        className="mb-3 ml-3 text-xs font-semibold text-primary hover:underline"
                      >
                        Hapus rentang
                      </button>
                    ) : null}
                  </PopoverContent>
                </Popover>
                <div className="flex rounded-xl border border-border/60 bg-card/40 p-0.5">
                  {(["week", "month"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => {
                        setMode(m);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                        mode === m
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {MODE_LABEL[m]}
                    </button>
                  ))}
                </div>
              </div>
            }
          />
          <CardBody className="min-w-0 space-y-6">
            {error ? (
              <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}

            {!hydrated ? (
              <ReportsSkeleton />
            ) : buckets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 px-6 py-14 text-center">
                <p className="text-sm font-medium">Belum ada data untuk dilaporkan</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Catat beberapa trade dulu, laporan akan terisi otomatis.
                </p>
              </div>
            ) : (
              <>
                <ClientOnly fallback={<ChartSkeleton />}>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="netRR" name="Net R" radius={[6, 6, 0, 0]}>
                          {buckets.map((b) => (
                            <Cell
                              key={b.key}
                              fill={b.netRR >= 0 ? "oklch(0.72 0.15 160)" : "oklch(0.65 0.19 20)"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ClientOnly>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Kurva ekuitas & RR rata-rata
                  </p>
                  <ClientOnly fallback={<ChartSkeleton />}>
                    <div className="h-56 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={buckets} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="var(--border)"
                            vertical={false}
                          />
                          <XAxis
                            dataKey="label"
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip content={<ChartTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="cumulativeRR"
                            name="Kumulatif R"
                            stroke="var(--primary)"
                            strokeWidth={2.5}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="avgRR"
                            name="RR rata-rata"
                            stroke="var(--chart-4)"
                            strokeWidth={2}
                            strokeDasharray="5 4"
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </ClientOnly>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <HighlightTile label={`${MODE_LABEL[mode]} terbaik`} bucket={best} />
                  <HighlightTile label="Minggu terburuk" bucket={worstWeek} />
                </div>

                <div className="w-full max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-3 font-semibold">Periode</th>
                        <th className="py-2 pr-3 font-semibold">Trade</th>
                        <th className="py-2 pr-3 font-semibold">W/L</th>
                        <th className="py-2 pr-3 font-semibold">Win rate</th>
                        <th className="py-2 pr-3 font-semibold">Profit</th>
                        <th className="py-2 pr-3 font-semibold">Net R</th>
                        <th className="py-2 pr-3 font-semibold">RR rata-rata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...buckets].reverse().map((b) => (
                        <tr key={b.key} className="border-b border-border/40 last:border-0">
                          <td className="whitespace-nowrap py-2 pr-3 font-medium">{b.label}</td>
                          <td className="py-2 pr-3 tabular-nums">{b.trades}</td>
                          <td className="py-2 pr-3 tabular-nums">
                            {b.wins}/{b.losses}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">{b.winRate}%</td>
                          <td
                            className={`whitespace-nowrap py-2 pr-3 font-semibold tabular-nums ${
                              b.netPnl > 0
                                ? "text-emerald-400"
                                : b.netPnl < 0
                                  ? "text-rose-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {moneyLabel(b.netPnl)}
                          </td>
                          <td className="py-2 pr-3">
                            <RRValue rr={b.netRR} ratio={b.netRRRatio} />
                          </td>
                          <td className="py-2 pr-3">
                            <RRValue rr={b.avgRR} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardBody>
        </Card>

        <Card className="mt-6 min-w-0">
          <CardHeader
            title="Performa per Pair"
            description="Net R dan RR rata-rata untuk setiap pair"
          />
          <CardBody className="min-w-0 space-y-6">
            {!hydrated ? (
              <PairPerformanceSkeleton />
            ) : pairStats.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 px-6 py-14 text-center">
                <p className="text-sm font-medium">Belum ada data pair</p>
              </div>
            ) : (
              <>
                <ClientOnly fallback={<ChartSkeleton />}>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={pairStats} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="netRR" name="Net R" radius={[6, 6, 0, 0]}>
                          {pairStats.map((p) => (
                            <Cell
                              key={p.key}
                              fill={p.netRR >= 0 ? "oklch(0.72 0.15 160)" : "oklch(0.65 0.19 20)"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </ClientOnly>

                <div className="w-full max-w-full overflow-x-auto [-webkit-overflow-scrolling:touch]">
                  <table className="w-full min-w-[520px] text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                        <th className="py-2 pr-3 font-semibold">Pair</th>
                        <th className="py-2 pr-3 font-semibold">Trade</th>
                        <th className="py-2 pr-3 font-semibold">W/L</th>
                        <th className="py-2 pr-3 font-semibold">Win rate</th>
                        <th className="py-2 pr-3 font-semibold">Profit</th>
                        <th className="py-2 pr-3 font-semibold">Net R</th>
                        <th className="py-2 pr-3 font-semibold">RR rata-rata</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pairStats.map((p) => (
                        <tr key={p.key} className="border-b border-border/40 last:border-0">
                          <td className="whitespace-nowrap py-2 pr-3 font-semibold">{p.label}</td>
                          <td className="py-2 pr-3 tabular-nums">{p.trades}</td>
                          <td className="py-2 pr-3 tabular-nums">
                            {p.wins}/{p.losses}
                          </td>
                          <td className="py-2 pr-3 tabular-nums">{p.winRate}%</td>
                          <td
                            className={`whitespace-nowrap py-2 pr-3 font-semibold tabular-nums ${
                              p.netPnl > 0
                                ? "text-emerald-400"
                                : p.netPnl < 0
                                  ? "text-rose-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {moneyLabel(p.netPnl)}
                          </td>
                          <td className="py-2 pr-3">
                            <RRValue rr={p.netRR} ratio={p.netRRRatio} />
                          </td>
                          <td className="py-2 pr-3">
                            <RRValue rr={p.avgRR} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function toDateInputValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function formatDateRangeLabel(from: string, to: string) {
  const format = (value: string) =>
    new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  if (!from) return `Sampai ${format(to)}`;
  if (!to || from === to) return format(from);
  return `${format(from)} – ${format(to)}`;
}

function HighlightTile({
  label,
  bucket,
}: {
  label: string;
  bucket: { label: string; netRR: number; netRRRatio: string | null; trades: number } | null;
}) {
  if (!bucket) return null;
  return (
    <div className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{bucket.label}</span>
        <RRValue rr={bucket.netRR} ratio={bucket.netRRRatio} withLabel />
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">{bucket.trades} trade</p>
    </div>
  );
}


interface TooltipPayloadItem {
  name?: string | number;
  value?: string | number;
  color?: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border/60 bg-card/95 px-3 py-2 text-xs shadow-lg backdrop-blur">
      <p className="font-semibold">{label}</p>
      {payload.map((item, i) => (
        <p key={i} className="mt-0.5 tabular-nums text-muted-foreground">
          {item.name}: <span className="font-semibold text-foreground">{item.value}R</span>
        </p>
      ))}
    </div>
  );
}
