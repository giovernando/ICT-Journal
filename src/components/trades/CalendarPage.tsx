import { BottomNav } from "@/components/trades/BottomNav";
import { TopBar } from "@/components/trades/TopBar";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { CalendarSkeleton } from "@/components/trades/Skeletons";
import { TradeTable } from "@/components/trades/TradeTable";
import { RRValue, RR_TOOLTIP } from "@/components/trades/RRValue";
import { Modal } from "@/components/kit/Modal";
import { Select } from "@/components/kit/Input";
import { useTrades } from "@/hooks/useTrades";
import { WEEKDAY_LABELS, buildMonthGrid, monthLabel } from "@/lib/calendar";
import { CURRENCY_OPTIONS, formatMoney } from "@/lib/money";
import type { Currency } from "@/types/trade";

function toneOf(pnl: number, trades: number) {
  if (trades === 0) return "border-border/40 bg-card/25 text-muted-foreground";
  if (pnl > 0) return "border-emerald-500/25 bg-emerald-500/10 text-emerald-400";
  if (pnl < 0) return "border-rose-500/25 bg-rose-500/10 text-rose-400";
  return "border-border/50 bg-card/40 text-muted-foreground";
}

export function CalendarPage() {
  const { trades, hydrated, error } = useTrades();
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [currency, setCurrency] = useState<Currency>("USD");
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const { weeks, monthPnl, monthTrades } = useMemo(
    () => buildMonthGrid(trades, cursor.year, cursor.month, currency),
    [trades, cursor, currency],
  );

  const shift = (delta: number) => {
    const d = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: d.getFullYear(), month: d.getMonth() });
  };
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const selectedDayTrades = selectedDayKey
    ? trades
        .filter((trade) => {
          const date = new Date(trade.date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          return key === selectedDayKey;
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-24">
        <TopBar title="Kalender" backTo="/" backLabel="← Journal" />
        <div className="mt-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Profit harian & mingguan
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Setiap tanggal menampilkan total profit/loss dan jumlah trade hari itu, dengan rekap
            mingguan di kolom paling kanan.
          </p>
          <div className="mt-3 flex gap-2">
            <Link
              to="/reports"
              className="rounded-xl border border-border/60 bg-card/50 px-3.5 py-2 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-card"
            >
              Laporan
            </Link>
          </div>
        </div>

        <Card className="mt-6 min-w-0">
          <CardHeader
            title={`Monthly P/L: ${formatMoney(monthPnl, currency)}`}
            description={`${monthTrades} trade di ${monthLabel(cursor.year, cursor.month)}`}
            action={
              <div className="flex items-center gap-2">
                <div className="w-28">
                  <Select
                    aria-label="Mata uang"
                    options={CURRENCY_OPTIONS}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as Currency)}
                  />
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/40 p-0.5">
                  <button
                    type="button"
                    aria-label="Bulan sebelumnya"
                    onClick={() => shift(-1)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ‹
                  </button>
                  <span className="min-w-[110px] px-1 text-center text-xs font-semibold">
                    {monthLabel(cursor.year, cursor.month)}
                  </span>
                  <button
                    type="button"
                    aria-label="Bulan berikutnya"
                    onClick={() => shift(1)}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                  >
                    ›
                  </button>
                </div>
              </div>
            }
          />
          <CardBody className="min-w-0">
            {error ? (
              <p className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </p>
            ) : null}
            {!hydrated ? (
              <CalendarSkeleton />
            ) : (
              <div className="-mx-4 w-full max-w-full overflow-x-auto px-4 [-webkit-overflow-scrolling:touch] sm:-mx-6 sm:px-6">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-8 gap-1.5 pb-1.5">
                    {WEEKDAY_LABELS.map((d) => (
                      <p
                        key={d}
                        className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {d}
                      </p>
                    ))}
                    <p className="text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Week
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    {weeks.map((week) => (
                      <div key={week.key} className="grid grid-cols-8 gap-1.5">
                        {week.days.map((day) => (
                          <div
                            key={day.key}
                            className={`rounded-xl border px-2 py-2 text-center backdrop-blur-sm transition-colors ${toneOf(day.pnl, day.trades)} ${
                              day.inMonth ? "" : "opacity-35"
                            } ${day.key === todayKey ? "ring-2 ring-primary/50" : ""}`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[11px] font-semibold text-foreground/70">
                                {day.date.getDate()}
                              </p>
                              {day.trades > 0 ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDayKey(day.key)}
                                  className="text-[10px] font-semibold text-primary underline-offset-2 hover:underline"
                                >
                                  Detail
                                </button>
                              ) : null}
                            </div>
                            {day.trades > 0 ? (
                              <>
                                <p className="mt-1 text-xs font-bold tabular-nums">
                                  {formatMoney(day.pnl, currency)}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {day.trades} trade
                                </p>
                                <div title={RR_TOOLTIP} className="mt-1">
                                  <RRValue rr={day.rr} className="text-[10px]" />
                                </div>
                              </>
                            ) : (
                              <p className="mt-1 text-[10px] text-muted-foreground/60">—</p>
                            )}
                          </div>
                        ))}
                        <div className="rounded-xl border border-border/60 bg-card/50 px-2 py-2 text-center backdrop-blur-sm">
                          <p className="text-[11px] font-semibold text-foreground/70">
                            {week.label}
                          </p>
                          <p
                            className={`mt-1 text-xs font-bold tabular-nums ${
                              week.pnl > 0
                                ? "text-emerald-400"
                                : week.pnl < 0
                                  ? "text-rose-400"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {formatMoney(week.pnl, currency)}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{week.trades} trade</p>
                          <div title={RR_TOOLTIP} className="mt-1">
                            <RRValue rr={week.rr} className="text-[10px]" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      <BottomNav />
      <Modal
        open={selectedDayKey !== null}
        onClose={() => setSelectedDayKey(null)}
        title={
          selectedDayTrades.length > 0
            ? `Trade ${new Date(selectedDayTrades[0].date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}`
            : "Detail trade"
        }
        className="sm:max-w-6xl"
      >
        {selectedDayTrades.length > 0 ? (
          <TradeTable
            trades={selectedDayTrades}
            readOnly
            onEdit={() => undefined}
            onDelete={() => undefined}
          />
        ) : (
          <p className="text-sm text-muted-foreground">Tidak ada trade pada tanggal ini.</p>
        )}
      </Modal>
    </div>
  );
}
