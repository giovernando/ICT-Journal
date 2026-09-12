import { Badge } from "@/components/kit/Badge";
import { Button } from "@/components/kit/Button";
import { RRValue, RR_TOOLTIP } from "@/components/trades/RRValue";
import { formatMoney } from "@/lib/money";
import {
  BIAS_TONE,
  POSITION_TONE,
  STATUS_TONE,
  formatTradeDate,
} from "@/lib/trade-options";
import type { Trade } from "@/types/trade";

interface TradeTableProps {
  trades: Trade[];
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  /** Number shown for the first row (1-based) */
  startNumber?: number;
}

const headers = [
  "No",
  "Date",
  "Pair",
  "Bias",
  "DOL",
  "Entry Model",
  "Killzone",
  "Quartal",
  "Raid / POI",
  "Position",
  "Status",
  "RR",
  "P/L",
  "Chart",
  "",
];


export function TradeTable({ trades, onEdit, onDelete, startNumber = 1 }: TradeTableProps) {
  return (
    <div className="-mx-4 w-full max-w-full overflow-x-auto overscroll-x-contain px-4 [-webkit-overflow-scrolling:touch] sm:-mx-6 sm:px-6">
      <table className="w-full min-w-[960px] border-separate border-spacing-0 text-sm">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th
                key={`${h}-${i}`}
                title={h === "RR" ? RR_TOOLTIP : undefined}
                className="sticky top-0 border-b border-border/60 bg-card/60 px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground backdrop-blur-md"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, index) => (
            <tr key={trade.id} className="transition-colors hover:bg-foreground/[0.03]">
              <td className="whitespace-nowrap border-b border-border/40 px-3 py-3 text-xs font-semibold tabular-nums text-muted-foreground">
                {startNumber + index}
              </td>
              <td className="whitespace-nowrap border-b border-border/40 px-3 py-3 text-xs text-muted-foreground">
                {formatTradeDate(trade.date)}
              </td>

              <td className="border-b border-border/40 px-3 py-3 font-semibold">{trade.pair}</td>
              <td className="border-b border-border/40 px-3 py-3">
                <Badge tone={BIAS_TONE[trade.bias]}>{trade.bias}</Badge>
              </td>
              <td className="max-w-[160px] truncate border-b border-border/40 px-3 py-3 text-xs">
                {trade.dol || "—"}
              </td>
              <td className="max-w-[160px] truncate border-b border-border/40 px-3 py-3 text-xs">
                {trade.entryModel || "—"}
              </td>
              <td className="whitespace-nowrap border-b border-border/40 px-3 py-3 text-xs">
                {trade.killzone}
              </td>
              <td className="whitespace-nowrap border-b border-border/40 px-3 py-3 text-xs font-semibold">
                {trade.quartal || "—"}
              </td>
              <td className="max-w-[160px] truncate border-b border-border/40 px-3 py-3 text-xs">
                {trade.raid || "—"}
              </td>
              <td className="border-b border-border/40 px-3 py-3">
                <Badge tone={POSITION_TONE[trade.position]}>{trade.position}</Badge>
              </td>
              <td className="border-b border-border/40 px-3 py-3">
                <Badge tone={STATUS_TONE[trade.status]}>{trade.status}</Badge>
              </td>
              <td className="whitespace-nowrap border-b border-border/40 px-3 py-3 text-xs">
                <RRValue rr={trade.rr} />
              </td>

              <td
                className={`whitespace-nowrap border-b border-border/40 px-3 py-3 text-xs font-semibold tabular-nums ${
                  trade.pnl > 0
                    ? "text-emerald-400"
                    : trade.pnl < 0
                      ? "text-rose-400"
                      : "text-muted-foreground"
                }`}
              >
                {formatMoney(trade.pnl ?? 0, trade.currency ?? "USD")}
              </td>

              <td className="border-b border-border/40 px-3 py-3">
                {trade.screenshot ? (
                  <a
                    href={trade.screenshot}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-primary underline-offset-4 hover:underline"
                  >
                    Lihat
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="whitespace-nowrap border-b border-border/40 px-3 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="mr-1.5 border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                  onClick={() => onEdit(trade)}
                >
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => onDelete(trade.id)}>
                  Hapus
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
