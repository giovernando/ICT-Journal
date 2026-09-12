import { Link } from "@tanstack/react-router";
import { BarChart3, CalendarDays, Plus } from "lucide-react";

const itemClass =
  "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-semibold transition-colors";

export function BottomNav({ onNewTrade }: { onNewTrade?: () => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/85 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-end justify-between gap-2 px-4 pb-[env(safe-area-inset-bottom)] sm:px-6">
        <Link
          to="/reports"
          className={itemClass}
          activeProps={{ className: `${itemClass} text-primary` }}
          inactiveProps={{ className: `${itemClass} text-muted-foreground hover:text-foreground` }}
        >
          <BarChart3 className="h-5 w-5" />
          Laporan
        </Link>

        <div className="flex flex-1 justify-center">
          {onNewTrade ? (
            <button
              type="button"
              onClick={onNewTrade}
              className="-mt-3 flex flex-col items-center gap-1 text-[11px] font-semibold text-foreground"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-b from-primary to-primary/85 text-primary-foreground shadow-[0_10px_30px_-12px_var(--glow)]">
                <Plus className="h-6 w-6" />
              </span>
              Trade baru
            </button>
          ) : (
            <Link
              to="/"
              className="-mt-3 flex flex-col items-center gap-1 text-[11px] font-semibold text-foreground"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-b from-primary to-primary/85 text-primary-foreground shadow-[0_10px_30px_-12px_var(--glow)]">
                <Plus className="h-6 w-6" />
              </span>
              Trade baru
            </Link>
          )}
        </div>

        <Link
          to="/calendar"
          className={itemClass}
          activeProps={{ className: `${itemClass} text-primary` }}
          inactiveProps={{ className: `${itemClass} text-muted-foreground hover:text-foreground` }}
        >
          <CalendarDays className="h-5 w-5" />
          Kalender
        </Link>
      </div>
    </nav>
  );
}
