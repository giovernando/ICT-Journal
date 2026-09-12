import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  tone?: string;
  className?: string;
  children: ReactNode;
}

export function Badge({ tone, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-sm",
        tone ?? "border-border/70 bg-foreground/5 text-muted-foreground",
        className,
      )}
    >
      {children}
    </span>
  );
}
