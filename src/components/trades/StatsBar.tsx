import { Card } from "@/components/kit/Card";
import { CountUp } from "@/components/trades/CountUp";
import type { TradeStats } from "@/hooks/useTrades";

export function StatsBar({ stats, rrRatio }: { stats: TradeStats; rrRatio?: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Total Trade
        </p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
          <CountUp value={stats.total} />
        </p>
      </Card>
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Win Rate
        </p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-emerald-400">
          <CountUp value={stats.winRate} suffix="%" />
        </p>
      </Card>
      <Card className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Win / Lose
        </p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground">
          <CountUp value={stats.wins} /> / <CountUp value={stats.losses} />
        </p>
      </Card>
      <Card className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Net RR
          </p>
          <p
            className={`mt-1.5 text-2xl font-semibold tracking-tight ${stats.totalRR >= 0 ? "text-emerald-400" : "text-rose-400"}`}
          >
            {rrRatio ?? stats.totalRRRatio ? (
              rrRatio ?? stats.totalRRRatio
            ) : (
              <>
                {stats.totalRR > 0 ? "+" : ""}
                <CountUp
                  value={stats.totalRR}
                  format={(value) => `${value.toFixed(2).replace(/\.?0+$/, "")}R`}
                />
              </>
            )}
          </p>
        </Card>
    </div>
  );
}
