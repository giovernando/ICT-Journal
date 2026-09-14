import { BottomNav } from "@/components/trades/BottomNav";
import { TopBar } from "@/components/trades/TopBar";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { AnimatedMoneyTotals } from "@/components/trades/AnimatedMoneyTotals";
import { CountUp } from "@/components/trades/CountUp";
import { Input, Select } from "@/components/kit/Input";
import { Modal } from "@/components/kit/Modal";
import { RRValue, RR_TOOLTIP } from "@/components/trades/RRValue";
import { StatsBar } from "@/components/trades/StatsBar";
import {
  ChartSkeleton,
  SummaryTilesSkeleton,
  TradeCardsSkeleton,
} from "@/components/trades/Skeletons";
import { TradeCard } from "@/components/trades/TradeCard";
import { TradeForm } from "@/components/trades/TradeForm";
import { TradeTable } from "@/components/trades/TradeTable";
import { useTrades, type PeriodFilter } from "@/hooks/useTrades";
import { totalsTone } from "@/lib/money";
import { tradeRR } from "@/lib/reports";
import { STATUS_OPTIONS } from "@/lib/trade-options";
import type { Trade, TradeStatus } from "@/types/trade";

const PAGE_SIZE = 9;


function computeFilteredRR(trades: Trade[]) {
  const wins = trades.filter((t) => t.status === "Win").length;
  const losses = trades.filter((t) => t.status === "Lose").length;
  const running = trades.filter((t) => t.status === "Running").length;
  const decided = wins + losses;
  const netRR = trades.reduce((sum, trade) => sum + (tradeRR(trade) ?? 0), 0);
  return {
    count: trades.length,
    wins,
    losses,
    running,
    winRate: decided ? Math.round((wins / decided) * 100) : 0,
    netRR: Math.round(netRR * 100) / 100,
    netRRRatio: trades.length === 1 ? trades[0]?.rrRatio ?? null : null,
  };
}

const PERIOD_OPTIONS: PeriodFilter[] = ["All", "Today", "This week", "This month", "Custom"];

type ViewMode = "cards" | "table";

export function JournalPage() {
  const journal = useTrades();
  const [view, setView] = useState<ViewMode>("cards");
  const [editing, setEditing] = useState<Trade | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Trade | null>(null);
  const filteredSummary = useMemo(
    () => computeFilteredRR(journal.filteredTrades),
    [journal.filteredTrades],
  );

  const totalPages = Math.max(1, Math.ceil(journal.filteredTrades.length / PAGE_SIZE));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);
  useEffect(() => {
    setPage(1);
  }, [journal.search, journal.statusFilter, journal.pairFilter, journal.period, journal.dateFrom, journal.dateTo]);

  const startIndex = (page - 1) * PAGE_SIZE;
  const pagedTrades = journal.filteredTrades.slice(startIndex, startIndex + PAGE_SIZE);

  const closeModal = () => {
    setFormOpen(false);
    setEditing(null);
  };


  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent)]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6 sm:pb-24">
        <TopBar title="Trade Journal" />
        <div className="mt-6">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
            Catat setiap eksekusi, ukur setiap edge
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Journal ICT-style dengan bias, DOL, entry model, killzone, dan hasil trade — tersimpan
            di akun kamu.
          </p>
        </div>

        {journal.error && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {journal.error}
          </p>
        )}


        <div className="mt-6">
          {!journal.hydrated ? (
            <SummaryTilesSkeleton />
          ) : (
            <StatsBar
              stats={journal.stats}
              rrRatio={
                journal.stats.total === journal.filteredTrades.length
                  ? filteredSummary.netRRRatio
                  : null
              }
            />
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
          <Card className="hidden h-fit lg:block">
            <CardHeader title="Input Trade" description="Isi detail setup dan hasilnya" />
            <CardBody>
              <TradeForm onSubmit={journal.addTrade} />
            </CardBody>
          </Card>

          <Card className="h-fit min-w-0">
            <CardHeader
              title="Riwayat Trading"
              description={`${journal.filteredTrades.length} trade ditampilkan`}
              action={
                <div className="flex rounded-xl border border-border/60 bg-card/40 p-0.5">
                  {(["cards", "table"] as ViewMode[]).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setView(mode)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                        view === mode
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              }
            />
            <CardBody className="min-w-0 space-y-4">
              <div className="space-y-2">
                <Input
                  value={journal.search}
                  placeholder="Cari pair, DOL, entry model, catatan..."
                  onChange={(e) => journal.setSearch(e.target.value)}
                />
                <div className="grid gap-2 sm:grid-cols-3">
                  <Select
                    aria-label="Filter status"
                    options={["All", ...STATUS_OPTIONS]}
                    value={journal.statusFilter}
                    onChange={(e) => journal.setStatusFilter(e.target.value as TradeStatus | "All")}
                  />
                  <Select
                    aria-label="Filter pair"
                    options={journal.pairOptions}
                    value={journal.pairFilter}
                    onChange={(e) => journal.setPairFilter(e.target.value)}
                  />
                  <Select
                    aria-label="Filter periode"
                    options={PERIOD_OPTIONS}
                    value={journal.period}
                    onChange={(e) => journal.setPeriod(e.target.value as PeriodFilter)}
                  />
                </div>
                {journal.period === "Custom" && (
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      aria-label="Dari tanggal"
                      value={journal.dateFrom}
                      onChange={(e) => journal.setDateFrom(e.target.value)}
                    />
                    <Input
                      type="date"
                      aria-label="Sampai tanggal"
                      value={journal.dateTo}
                      onChange={(e) => journal.setDateTo(e.target.value)}
                    />
                  </div>
                )}
                {journal.activeFilterCount > 0 && (
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span>{journal.activeFilterCount} filter aktif</span>
                    <Button variant="ghost" size="sm" onClick={journal.resetFilters}>
                      Reset filter
                    </Button>
                  </div>
                )}
              </div>

              {!journal.hydrated ? (
                <>
                  <ChartSkeleton className="h-20" />
                  <SummaryTilesSkeleton />
                </>
              ) : (
                <>
              <div className="rounded-2xl border border-border/50 bg-card/40 px-4 py-3 backdrop-blur-sm">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Total Profit / Loss {journal.activeFilterCount > 0 ? "(sesuai filter)" : ""}
                </p>
                <p
                  className={`mt-1 text-2xl font-semibold tracking-tight ${totalsTone(journal.filteredTrades)}`}
                >
                  <AnimatedMoneyTotals trades={journal.filteredTrades} />
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Trade", "Win Rate", "W/L"].map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 text-lg font-semibold tracking-tight text-foreground">
                      {label === "Trade" ? (
                        <CountUp value={filteredSummary.count} />
                      ) : label === "Win Rate" ? (
                        <CountUp value={filteredSummary.winRate} suffix="%" />
                      ) : (
                        <>
                          <CountUp value={filteredSummary.wins} />/
                          <CountUp value={filteredSummary.losses} />
                        </>
                      )}
                    </p>
                  </div>
                ))}
                <div
                  title={RR_TOOLTIP}
                  className="cursor-help rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Net RR
                  </p>
                  <RRValue
                    rr={filteredSummary.netRR}
                    ratio={filteredSummary.netRRRatio}
                    animate
                    className="mt-0.5 text-lg"
                  />
                </div>
              </div>
                </>
              )}

              {!journal.hydrated ? (
                <TradeCardsSkeleton />
              ) : journal.filteredTrades.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 px-6 py-14 text-center">
                  <p className="text-sm font-medium">Belum ada trade tercatat</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Tambahkan trade pertama kamu untuk mulai melacak performa.
                  </p>
                  <Button className="mt-4" size="sm" onClick={() => setFormOpen(true)}>
                    Catat trade
                  </Button>
                </div>
              ) : view === "cards" ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {pagedTrades.map((trade, i) => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      number={startIndex + i + 1}
                      onEdit={(t) => {
                        setEditing(t);
                        setFormOpen(true);
                      }}
                      onDelete={(id) => setPendingDelete(journal.filteredTrades.find((t) => t.id === id) ?? null)}
                    />
                  ))}
                </div>
              ) : (
                <TradeTable
                  trades={pagedTrades}
                  startNumber={startIndex + 1}
                  onEdit={(t) => {
                    setEditing(t);
                    setFormOpen(true);
                  }}
                  onDelete={(id) => setPendingDelete(journal.filteredTrades.find((t) => t.id === id) ?? null)}
                />
              )}

              {journal.filteredTrades.length > PAGE_SIZE && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
                  <p className="text-xs text-muted-foreground">
                    Menampilkan {startIndex + 1}–{startIndex + pagedTrades.length} dari{" "}
                    {journal.filteredTrades.length} trade
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Sebelumnya
                    </Button>
                    <span className="px-1 text-xs font-semibold tabular-nums">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Berikutnya
                    </Button>
                  </div>
                </div>
              )}

            </CardBody>
          </Card>
        </div>
      </div>

      <BottomNav
        onNewTrade={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />


      <Modal
        open={formOpen}
        onClose={closeModal}
        title={editing ? "Edit Trade" : "Trade Baru"}
      >
        <TradeForm
          initial={editing}
          onCancel={closeModal}
          onSubmit={(draft) => {
            if (editing) journal.updateTrade(editing.id, draft);
            else journal.addTrade(draft);
            closeModal();
          }}
        />
      </Modal>

      <Modal
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title="Hapus trade ini?"
        className="sm:max-w-md"
      >
        <p className="text-sm text-muted-foreground">
          Trade{" "}
          <span className="font-semibold text-foreground">{pendingDelete?.pair}</span>{" "}
          akan dihapus permanen dan tidak bisa dikembalikan.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setPendingDelete(null)}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (pendingDelete) journal.removeTrade(pendingDelete.id);
              setPendingDelete(null);
            }}
          >
            Ya, hapus
          </Button>
        </div>
      </Modal>
    </div>
  );
}
