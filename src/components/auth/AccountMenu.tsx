import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, Settings, User as UserIcon } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAuth();
  const { profile, avatarUrl } = useProfile();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (!user) return null;

  const name = profile?.displayName?.trim() || user.email?.split("@")[0] || "Trader";

  return (
    <div ref={ref} className={compact ? "relative" : "relative ml-auto"}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md transition-colors hover:bg-card ${
          compact ? "p-1" : "px-2.5 py-1.5"
        }`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-primary/15 text-primary">
          {avatarUrl ? (
            <img src={avatarUrl} alt={`Avatar ${name}`} className="h-full w-full object-cover" />
          ) : (
            <UserIcon className="h-4 w-4" />
          )}
        </span>
        {!compact && (
          <span className="max-w-[120px] truncate text-xs font-semibold text-foreground">{name}</span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-border/60 bg-card/95 p-1.5 shadow-2xl backdrop-blur-xl ${
            compact ? "left-0" : "right-0"
          }`}
        >
          <div className="px-2.5 py-2">
            <p className="truncate text-xs font-semibold text-foreground">{name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{user.email}</p>
          </div>
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
            Pengaturan akun
          </Link>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void signOut();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Keluar
          </button>
        </div>
      )}
    </div>
  );
}
