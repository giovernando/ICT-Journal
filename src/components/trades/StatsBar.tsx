import { Card } from "@/components/kit/Card";
import type { TradeStats } from "@/hooks/useTrades";

export function StatsBar({ stats }: { stats: TradeStats }) {
  const items = [
    { label: "Total Trade", value: String(stats.total), tone: "text-foreground" },
    { label: "Win Rate", value: `${stats.winRate}%`, tone: "text-emerald-400" },
    { label: "Win / Lose", value: `${stats.wins} / ${stats.losses}`, tone: "text-foreground" },
    {
      label: "Net RR",
      value: `${stats.totalRR > 0 ? "+" : ""}${stats.totalRR}R`,
      tone: stats.totalRR >= 0 ? "text-emerald-400" : "text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((item) => (
        <Card key={item.label} className="p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {item.label}
          </p>
          <p className={`mt-1.5 text-2xl font-semibold tracking-tight ${item.tone}`}>{item.value}</p>
        </Card>
      ))}
    </div>
  );
}
