import { Skeleton } from "@/components/ui/skeleton";

/** Baris tile ringkasan (Total trade, Win rate, dst.) */
export function SummaryTilesSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm"
        >
          <Skeleton className="h-2.5 w-16" />
          <Skeleton className="mt-2 h-6 w-20" />
        </div>
      ))}
    </div>
  );
}

/** Kartu-kartu trade (tampilan cards) */
export function TradeCardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-2xl border border-border/50 bg-card/40 p-4 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
          <div className="flex justify-end gap-2">
            <Skeleton className="h-8 w-16 rounded-lg" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Placeholder grafik */
export function ChartSkeleton({ className = "h-56" }: { className?: string }) {
  return (
    <Skeleton
      className={`w-full rounded-xl border border-border/50 bg-card/40 ${className}`}
    />
  );
}

/** Placeholder isi laporan performa. */
export function ReportsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat laporan" aria-busy="true">
      <ChartSkeleton className="h-64" />

      <div className="space-y-2">
        <Skeleton className="h-3 w-44" />
        <ChartSkeleton />
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/50 bg-card/40 px-3 py-2.5 backdrop-blur-sm"
          >
            <Skeleton className="h-2.5 w-28" />
            <div className="mt-2 flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-16" />
            </div>
            <Skeleton className="mt-2 h-3 w-16" />
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40">
        <div className="grid grid-cols-4 gap-4 border-b border-border/50 px-3 py-3 sm:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-4 gap-4 border-b border-border/40 px-3 py-3 last:border-0 sm:grid-cols-7"
          >
            {Array.from({ length: 7 }).map((_, column) => (
              <Skeleton key={column} className="h-3 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Placeholder performa per pair. */
export function PairPerformanceSkeleton() {
  return (
    <div className="space-y-6" aria-label="Memuat performa pair" aria-busy="true">
      <ChartSkeleton className="h-64" />
      <div className="overflow-hidden rounded-xl border border-border/40">
        <div className="grid grid-cols-4 gap-4 border-b border-border/50 px-3 py-3 sm:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
        {Array.from({ length: 4 }).map((_, row) => (
          <div
            key={row}
            className="grid grid-cols-4 gap-4 border-b border-border/40 px-3 py-3 last:border-0 sm:grid-cols-7"
          >
            {Array.from({ length: 7 }).map((_, column) => (
              <Skeleton key={column} className="h-3 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Grid kalender bulanan */
export function CalendarSkeleton() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <div
            key={i}
            className="space-y-1.5 rounded-xl border border-border/40 bg-card/30 p-2"
          >
            <Skeleton className="h-3.5 w-5" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
