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
  pnl: number | string | null;
  currency: string | null;
  screenshot: string | null;
  notes: string | null;
  created_at: string;
}

function toTrade(row: TradeRow): Trade {
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
    pnl: draft.pnl,
    currency: draft.currency,
    screenshot: draft.screenshot,
    notes: draft.notes,
  };
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
  const { data, error } = await supabase
    .from("trades")
    .insert({ ...toRow(draft), user_id: await requireUserId() })
    .select("*")
    .single();
  if (error) throw error;
  return toTrade(data as TradeRow);
}

export async function insertTrades(drafts: TradeDraft[]): Promise<Trade[]> {
  if (drafts.length === 0) return [];
  const userId = await requireUserId();
  const { data, error } = await supabase
    .from("trades")
    .insert(drafts.map((d) => ({ ...toRow(d), user_id: userId })))
    .select("*");
  if (error) throw error;
  return ((data ?? []) as TradeRow[]).map(toTrade);
}

export async function updateTradeRow(id: string, draft: TradeDraft): Promise<Trade> {
  const { data, error } = await supabase
    .from("trades")
    .update(toRow(draft))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return toTrade(data as TradeRow);
}

export async function deleteTradeRow(id: string): Promise<void> {
  const { error } = await supabase.from("trades").delete().eq("id", id);
  if (error) throw error;
}
