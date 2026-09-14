import { CountUp } from "@/components/trades/CountUp";
import { formatMoney, sumByCurrency } from "@/lib/money";
import type { Trade } from "@/types/trade";

export function AnimatedMoneyTotals({ trades }: { trades: Trade[] }) {
  const totals = sumByCurrency(trades);
  if (totals.length === 0) {
    return <CountUp value={0} format={(value) => formatMoney(value, "USD")} />;
  }

  return (
    <>
      {totals.map(({ currency, total }, index) => (
        <span key={currency}>
          {index > 0 ? " · " : null}
          <CountUp value={total} format={(value) => formatMoney(value, currency)} />
        </span>
      ))}
    </>
  );
}