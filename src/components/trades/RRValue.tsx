import { formatRR } from "@/lib/trade-options";
import { cn } from "@/lib/utils";

export const RR_TOOLTIP =
  "RR = reward dibanding risk. 1:2 berarti profit 2x risk. Nilai negatif (mis. -1R) berarti loss/defisit sebesar 1x risk. 0R = break even.";

export function rrTone(rr: number | null): string {
  if (rr === null) return "text-muted-foreground";
  if (rr > 0) return "text-emerald-400";
  if (rr < 0) return "text-rose-400";
  return "text-muted-foreground";
}

interface RRValueProps {
  rr: number | null;
  className?: string;
  /** Show a Loss/BE/Profit label next to the value */
  withLabel?: boolean;
}

export function RRValue({ rr, className, withLabel = false }: RRValueProps) {
  const label = rr === null ? null : rr > 0 ? "profit" : rr < 0 ? "loss" : "BE";
  return (
    <span
      title={RR_TOOLTIP}
      className={cn(
        "inline-flex cursor-help items-center gap-1.5 whitespace-nowrap font-semibold tabular-nums",
        rrTone(rr),
        className,
      )}
    >
      {formatRR(rr)}
      {withLabel && label ? (
        <span className="rounded-md border border-current/30 bg-current/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
          {label}
        </span>
      ) : null}
    </span>
  );
}
