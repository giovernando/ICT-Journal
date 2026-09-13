export type Bias = "Bullish" | "Bearish";
export type Position = "Long" | "Short";
export type TradeStatus = "Win" | "Lose" | "Running" | "Close" | "SL+" | "BE";
export type Currency = "IDR" | "USD" | "USC";
export type Quartal = "Q1" | "Q2" | "Q3";
export type Killzone =
  | "Asian"
  | "London Open"
  | "NY AM"
  | "NY PM"
  | "London Close"
  | "Silver Bullet";

export interface Trade {
  id: string;
  /** ISO datetime-local string, e.g. 2026-08-25T14:30 */
  date: string;
  pair: string;
  bias: Bias;
  dol: string;
  entryModel: string;
  killzone: Killzone;
  position: Position;
  status: TradeStatus;
  quartal: Quartal;
  /** Raid on Liquidity / POI, e.g. "Monday H/L", "SMT" */
  raid: string;
  /** Reward multiple, e.g. 2 means 1:2 */
  rr: number | null;
  /** Original ratio text entered by the user, e.g. "2:4" */
  rrRatio: string | null;
  /** Realised profit/loss in `currency` (negative = loss) */
  pnl: number;
  currency: Currency;
  /** Data URL (upload) or remote URL */
  screenshot: string | null;
  notes: string;
  createdAt: string;
}

export type TradeDraft = Omit<Trade, "id" | "createdAt">;
