import { Link } from "@tanstack/react-router";

import { AccountMenu } from "@/components/auth/AccountMenu";
import { ThemeToggle } from "@/components/trades/ThemeToggle";

interface TopBarProps {
  title?: string;
  backTo?: string;
  backLabel?: string;
}

export function TopBar({ title = "Trade Journal", backTo, backLabel }: TopBarProps) {
  return (
    <div className="sticky top-0 z-40 -mx-4 px-4 pt-3 sm:-mx-6 sm:px-6">
      <div className="mx-auto flex max-w-6xl items-center gap-2 rounded-2xl border border-border/60 bg-card/70 px-3 py-2 shadow-lg backdrop-blur-xl">
        <div className="flex min-w-[40px] flex-1 items-center justify-start">
          <AccountMenu compact />
        </div>

        <div className="flex min-w-0 flex-shrink-0 items-center justify-center">
          <Link
            to="/"
            className="truncate text-sm font-semibold tracking-tight text-foreground"
          >
            {title}
          </Link>
        </div>

        <div className="flex min-w-[40px] flex-1 items-center justify-end">
          <ThemeToggle />
          {backTo ? (
            <Link
              to={backTo}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              {backLabel ?? "←"}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
