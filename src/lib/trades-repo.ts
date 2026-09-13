import { supabase } from "@/integrations/supabase/client";
import type { Bias, Currency, Killzone, Position, Quartal, Trade, TradeDraft, TradeStatus } from "@/types/trade";

interface TradeRow {
  id: string;
  date: string;
  pair: string;
  bias: string;
  dol: string;
  entry_model: string;
  killzone: string;
  position: string;
  status: string;
  quartal: string | null;
  raid: string | null;
  rr: number | string | null;
  rr_ratio: string | null;
  pnl: number | string | null;
  currency: string | null;
  screenshot: string | null;
  notes: string | null;
  created_at: string;
}

const RR_RATIO_CACHE_KEY = "trading-journal:rr-ratios:v1";

function readRRRatioCache(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(RR_RATIO_CACHE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function cacheRRRatio(id: string, ratio: string | null) {
  if (typeof window === "undefined" || !ratio) return;
  const cache = readRRRatioCache();
  cache[id] = ratio;
  window.localStorage.setItem(RR_RATIO_CACHE_KEY, JSON.stringify(cache));
}

function toTrade(row: TradeRow): Trade {
  const cachedRatio = readRRRatioCache()[row.id] ?? null;
  return {
    id: row.id,
    date: row.date,
    pair: row.pair,
    bias: row.bias as Bias,
    dol: row.dol,
    entryModel: row.entry_model,
    killzone: row.killzone as Killzone,
    position: row.position as Position,
    status: row.status as TradeStatus,
    quartal: (row.quartal ?? "Q1") as Quartal,
    raid: row.raid ?? "",
    rr: row.rr === null ? null : Number(row.rr),
    rrRatio: row.rr_ratio ?? cachedRatio,
    pnl: row.pnl === null ? 0 : Number(row.pnl),
    currency: (row.currency ?? "USD") as Currency,
    notes: row.notes ?? "",
    screenshot: row.screenshot,
    createdAt: row.created_at,
  };
}

function toRow(draft: TradeDraft) {
  return {
    date: draft.date,
    pair: draft.pair,
    bias: draft.bias,
    dol: draft.dol,
    entry_model: draft.entryModel,
    killzone: draft.killzone,
    position: draft.position,
    status: draft.status,
    quartal: draft.quartal,
    raid: draft.raid,
    rr: draft.rr,
    rr_ratio: draft.rrRatio,
    pnl: draft.pnl,
    currency: draft.currency,
    screenshot: draft.screenshot,
    notes: draft.notes,
  };
}

function withoutRRRatio(row: ReturnType<typeof toRow>) {
  const { rr_ratio: _rrRatio, ...legacyRow } = row;
  return legacyRow;
}

function isMissingRRRatioColumn(error: { message?: string } | null) {
  return Boolean(error?.message?.toLowerCase().includes("rr_ratio"));
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Kamu harus masuk dulu untuk menyimpan trade");
  return data.user.id;
}

export async function fetchTrades(): Promise<Trade[]> {
  const { data, error } = await supabase.from("trades").select("*").order("date", {
    ascending: false,
  });
  if (error) throw error;
  return ((data ?? []) as TradeRow[]).map(toTrade);
}

export async function insertTrade(draft: TradeDraft): Promise<Trade> {
  const row = toRow(draft);
  let { data, error } = await supabase
    .from("trades")
    .insert({ ...row, user_id: await requireUserId() })
    .select("*")
    .single();
  if (error && isMissingRRRatioColumn(error)) {
    ({ data, error } = await supabase
      .from("trades")
      .insert({ ...withoutRRRatio(row), user_id: await requireUserId() })
      .select("*")
      .single());
  }
  if (error) throw error;
  const trade = { ...toTrade(data as TradeRow), rrRatio: draft.rrRatio };
  cacheRRRatio(trade.id, trade.rrRatio);
  return trade;
}

export async function insertTrades(drafts: TradeDraft[]): Promise<Trade[]> {
  if (drafts.length === 0) return [];
  const userId = await requireUserId();
  const rows = drafts.map((d) => ({ ...toRow(d), user_id: userId }));
  let { data, error } = await supabase
    .from("trades")
    .insert(rows)
    .select("*");
  if (error && isMissingRRRatioColumn(error)) {
    ({ data, error } = await supabase
      .from("trades")
      .insert(rows.map(({ rr_ratio: _rrRatio, ...row }) => row))
      .select("*"));
  }
  if (error) throw error;
  const trades = ((data ?? []) as TradeRow[]).map(toTrade);
  trades.forEach((trade, index) => cacheRRRatio(trade.id, drafts[index]?.rrRatio ?? null));
  return trades;
}

export async function updateTradeRow(id: string, draft: TradeDraft): Promise<Trade> {
  const row = toRow(draft);
  let { data, error } = await supabase
    .from("trades")
    .update(row)
    .eq("id", id)
    .select("*")
    .single();
  if (error && isMissingRRRatioColumn(error)) {
    ({ data, error } = await supabase
      .from("trades")
      .update(withoutRRRatio(row))
      .eq("id", id)
      .select("*")
      .single());
  }
  if (error) throw error;
  const trade = { ...toTrade(data as TradeRow), rrRatio: draft.rrRatio };
  cacheRRRatio(trade.id, trade.rrRatio);
  return trade;
}

export async function deleteTradeRow(id: string): Promise<void> {
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) throw error;
}
