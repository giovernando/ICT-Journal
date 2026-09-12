import { useCallback, useEffect, useMemo, useState } from "react";
import {
  deleteTradeRow,
  fetchTrades,
  insertTrade,
  insertTrades,
  updateTradeRow,
} from "@/lib/trades-repo";
import type { Trade, TradeDraft, TradeStatus } from "@/types/trade";

const STORAGE_KEY = "trading-journal:trades:v1";
const MIGRATED_KEY = "trading-journal:migrated-to-cloud";

function readStorage(): Trade[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Trade[]) : [];
  } catch {
    return [];
  }
}


export interface TradeStats {
  total: number;
  wins: number;
  losses: number;
  running: number;
  winRate: number;
  totalRR: number;
}

export type PeriodFilter = "All" | "Today" | "This week" | "This month" | "Custom";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function periodRange(period: PeriodFilter): { from: Date | null; to: Date | null } {
  const now = new Date();
  if (period === "Today") {
    const from = startOfDay(now);
    const to = new Date(from.getTime() + 86400000);
    return { from, to };
  }
  if (period === "This week") {
    const day = (now.getDay() + 6) % 7; // Monday start
    const from = startOfDay(new Date(now.getTime() - day * 86400000));
    const to = new Date(from.getTime() + 7 * 86400000);
    return { from, to };
  }
  if (period === "This month") {
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { from, to };
  }
  return { from: null, to: null };
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TradeStatus | "All">("All");
  const [pairFilter, setPairFilter] = useState<string>("All");
  const [period, setPeriod] = useState<PeriodFilter>("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        let rows = await fetchTrades();

        // One-time migration of trades previously kept only in this browser.
        const legacy = readStorage();
        if (legacy.length > 0 && !window.localStorage.getItem(MIGRATED_KEY)) {
          const created = await insertTrades(
            legacy.map(({ id: _id, createdAt: _createdAt, ...draft }) => draft),
          );
          window.localStorage.setItem(MIGRATED_KEY, "1");
          window.localStorage.removeItem(STORAGE_KEY);
          rows = [...created, ...rows].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        }

        if (!active) return;
        setTrades(rows);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "Gagal memuat data trade");
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addTrade = useCallback(async (draft: TradeDraft) => {
    const trade = await insertTrade(draft);
    setTrades((prev) => [trade, ...prev]);
    return trade;
  }, []);

  const updateTrade = useCallback(async (id: string, draft: TradeDraft) => {
    const trade = await updateTradeRow(id, draft);
    setTrades((prev) => prev.map((t) => (t.id === id ? trade : t)));
  }, []);

  const removeTrade = useCallback(async (id: string) => {
    setTrades((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTradeRow(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus trade");
      setTrades(await fetchTrades());
    }
  }, []);


  const pairOptions = useMemo(
    () => ["All", ...Array.from(new Set(trades.map((t) => t.pair).filter(Boolean))).sort()],
    [trades],
  );

  const filteredTrades = useMemo(() => {
    const q = search.trim().toLowerCase();
    let from: Date | null = null;
    let to: Date | null = null;
    if (period === "Custom") {
      from = dateFrom ? startOfDay(new Date(dateFrom)) : null;
      to = dateTo ? new Date(startOfDay(new Date(dateTo)).getTime() + 86400000) : null;
    } else {
      ({ from, to } = periodRange(period));
    }

    return trades
      .filter((t) => (statusFilter === "All" ? true : t.status === statusFilter))
      .filter((t) => (pairFilter === "All" ? true : t.pair === pairFilter))
      .filter((t) => {
        if (!from && !to) return true;
        const d = new Date(t.date).getTime();
        if (Number.isNaN(d)) return false;
        if (from && d < from.getTime()) return false;
        if (to && d >= to.getTime()) return false;
        return true;
      })
      .filter((t) =>
        q
          ? [t.pair, t.dol, t.entryModel, t.killzone, t.notes]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [trades, statusFilter, pairFilter, period, dateFrom, dateTo, search]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setStatusFilter("All");
    setPairFilter("All");
    setPeriod("All");
    setDateFrom("");
    setDateTo("");
  }, []);

  const activeFilterCount =
    (search.trim() ? 1 : 0) +
    (statusFilter !== "All" ? 1 : 0) +
    (pairFilter !== "All" ? 1 : 0) +
    (period !== "All" ? 1 : 0);

  const stats: TradeStats = useMemo(() => {
    const wins = trades.filter((t) => t.status === "Win").length;
    const losses = trades.filter((t) => t.status === "Lose").length;
    const running = trades.filter((t) => t.status === "Running").length;
    const decided = wins + losses;
    const totalRR = trades.reduce((sum, t) => {
      if (t.rr === null) return sum;
      if (t.status === "Win") return sum + t.rr;
      if (t.status === "Lose") return sum - 1;
      return sum;
    }, 0);
    return {
      total: trades.length,
      wins,
      losses,
      running,
      winRate: decided ? Math.round((wins / decided) * 100) : 0,
      totalRR: Math.round(totalRR * 100) / 100,
    };
  }, [trades]);

  return {
    trades,
    filteredTrades,
    stats,
    hydrated,
    error,
    statusFilter,
    setStatusFilter,
    pairFilter,
    setPairFilter,
    pairOptions,
    period,
    setPeriod,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    resetFilters,
    activeFilterCount,
    search,
    setSearch,
    addTrade,
    updateTrade,
    removeTrade,
  };
}
