import { Badge } from "@/components/kit/Badge";
import { Button } from "@/components/kit/Button";
import { RRValue } from "@/components/trades/RRValue";
import { formatMoney } from "@/lib/money";
import { BIAS_TONE, POSITION_TONE, STATUS_TONE, formatTradeDate } from "@/lib/trade-options";
import type { Trade } from "@/types/trade";

interface TradeCardProps {
  trade: Trade;
  onEdit: (trade: Trade) => void;
  onDelete: (id: string) => void;
  /** 1-based order number in the history list */
  number?: number;
}

export function TradeCard({ trade, onEdit, onDelete, number }: TradeCardProps) {
  return (
    <article className="group rounded-2xl border border-border/60 bg-card/45 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:bg-card/60">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold tracking-tight">
            {number ? (
              <span className="mr-1.5 text-muted-foreground">No {number}</span>
            ) : null}
            {trade.pair}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">{formatTradeDate(trade.date)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={STATUS_TONE[trade.status]}>{trade.status}</Badge>
          <span
            className={`text-sm font-semibold tabular-nums ${
              trade.pnl > 0
                ? "text-emerald-400"
                : trade.pnl < 0
                  ? "text-rose-400"
                  : "text-muted-foreground"
            }`}
          >
            {formatMoney(trade.pnl ?? 0, trade.currency ?? "USD")}
          </span>
        </div>
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge tone={BIAS_TONE[trade.bias]}>{trade.bias}</Badge>
        <Badge tone={POSITION_TONE[trade.position]}>{trade.position}</Badge>
        <Badge>{trade.killzone}</Badge>
        <Badge className="gap-1.5">
          <span className="text-muted-foreground">RR</span>
          <RRValue rr={trade.rr} className="text-[11px]" />
        </Badge>
      </div>


      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-muted-foreground/70">DOL</dt>
          <dd className="truncate text-foreground">{trade.dol || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground/70">Entry Model</dt>
          <dd className="truncate text-foreground">{trade.entryModel || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground/70">Quartal</dt>
          <dd className="truncate text-foreground">{trade.quartal || "—"}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground/70">Raid / POI</dt>
          <dd className="truncate text-foreground">{trade.raid || "—"}</dd>
        </div>
      </dl>

      {trade.notes ? (
        <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">{trade.notes}</p>
      ) : null}

      {trade.screenshot ? (
        <a
          href={trade.screenshot}
          target="_blank"
          rel="noreferrer"
          className="mt-3 block overflow-hidden rounded-xl border border-border/60"
        >
          <img
            src={trade.screenshot}
            alt={`Chart ${trade.pair}`}
            loading="lazy"
            className="h-32 w-full object-cover transition-transform duration-500 hover:scale-105"
          />
        </a>
      ) : null}

      <footer className="mt-4 flex justify-end gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
          onClick={() => onEdit(trade)}
        >
          Edit
        </Button>
        <Button variant="danger" size="sm" onClick={() => onDelete(trade.id)}>
          Hapus
        </Button>
      </footer>
    </article>
  );
}
