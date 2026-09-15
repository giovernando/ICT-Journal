import { Link } from "@tanstack/react-router";
import { AlertTriangle, CalendarDays, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BottomNav } from "@/components/trades/BottomNav";
import { TopBar } from "@/components/trades/TopBar";
import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import {
  readEconomicCalendarCache,
  saveEconomicCalendarCache,
  setEconomicCalendarEvents,
} from "@/lib/economic-calendar";
import type { EconomicEvent, EconomicImpact } from "@/types/economic-calendar";

type DatePreset = "yesterday" | "today" | "tomorrow" | "this-week" | "next-week" | "custom";

const impactClass: Record<EconomicImpact, string> = {
  High: "bg-rose-400 text-rose-950",
  Medium: "bg-orange-300 text-orange-950",
  Low: "bg-yellow-200 text-yellow-950",
  Holiday: "bg-slate-400 text-slate-950",
};

export function EconomicCalendarPage() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);
  const [selectedImpact, setSelectedImpact] = useState<EconomicImpact>("High");
  const [datePreset, setDatePreset] = useState<DatePreset>("this-week");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async (force = false) => {
    if (!force) {
      const cached = readEconomicCalendarCache();
      if (cached) {
        setEvents(cached);
        setLoading(false);
        return;
      }
    }
    setRefreshing(force);
    setError(null);
    try {
      const response = await fetch("/api/economic-calendar");
      if (!response.ok) throw new Error("Kalender ekonomi tidak tersedia");
      const nextEvents = (await response.json()) as EconomicEvent[];
      setEconomicCalendarEvents(nextEvents);
      saveEconomicCalendarCache(nextEvents);
      setEvents(nextEvents);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat kalender ekonomi");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadEvents();
  }, []);

  const dateRange = useMemo(() => getDateRange(datePreset, customFrom, customTo), [datePreset, customFrom, customTo]);
  const visibleEvents = useMemo(() => events.filter((event) => {
    const eventDate = new Date(event.date);
    if (Number.isNaN(eventDate.getTime())) return false;
    const day = startOfDay(eventDate).getTime();
    return day >= dateRange.from && day <= dateRange.to && event.impact === selectedImpact;
  }), [dateRange, events, selectedImpact]);
  const groupedEvents = useMemo(() => {
    const groups = new Map<string, EconomicEvent[]>();
    for (const event of visibleEvents) {
      const key = new Date(event.date).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      groups.set(key, [...(groups.get(key) ?? []), event]);
    }
    return [...groups.entries()];
  }, [visibleEvents]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent)]" />
      <div className="relative mx-auto w-full max-w-5xl px-4 pb-24 sm:px-6 sm:pb-24">
        <TopBar title="Economic Calendar" />
        <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              News awareness
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Kalender Ekonomi
            </h1>
            <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
              Event penting USD, EUR, dan GBP dalam waktu lokal perangkat kamu.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/calendar"
              className="rounded-xl border border-border/60 bg-card/50 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Kalender trade
            </Link>
            <Button variant="outline" size="sm" onClick={() => void loadEvents(true)} disabled={refreshing}>
              <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="mt-6">
          <div className="flex flex-wrap gap-2 border-b border-border/50 px-4 py-3 sm:px-6">
            {([
              ["yesterday", "Yesterday"],
              ["today", "Today"],
              ["tomorrow", "Tomorrow"],
              ["this-week", "This Week"],
              ["next-week", "Next Week"],
              ["custom", "Custom dates"],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setDatePreset(value)}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors ${
                  datePreset === value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-transparent bg-muted/60 text-foreground hover:border-border hover:bg-muted"
                }`}
              >
                {value === "custom" ? <CalendarDays className="h-4 w-4" /> : null}
                {label}
              </button>
            ))}
          </div>
          {datePreset === "custom" ? (
            <div className="flex flex-wrap gap-2 border-b border-border/50 px-4 py-3 sm:px-6">
              <label className="flex min-w-[150px] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Dari
                <input type="date" value={customFrom} onChange={(event) => setCustomFrom(event.target.value)} className="h-9 rounded-lg border border-border/60 bg-background/60 px-2 text-xs font-normal tracking-normal text-foreground" />
              </label>
              <label className="flex min-w-[150px] flex-1 flex-col gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Sampai
                <input type="date" value={customTo} onChange={(event) => setCustomTo(event.target.value)} className="h-9 rounded-lg border border-border/60 bg-background/60 px-2 text-xs font-normal tracking-normal text-foreground" />
              </label>
            </div>
          ) : null}
          <CardHeader
            title="Forex Factory News"
            description="Cache lokal berlaku hingga 6 jam"
            action={
              <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-card/40 p-1">
                {(["Low", "Medium", "High"] as EconomicImpact[]).map((impact) => (
                  <button
                    key={impact}
                    type="button"
                    aria-pressed={selectedImpact === impact}
                    onClick={() => setSelectedImpact(impact)}
                    className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                      selectedImpact === impact
                        ? "bg-primary/15 text-primary"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }`}
                  >
                    <span className={`h-2 w-2 rounded-full ${impact === "High" ? "bg-rose-400" : impact === "Medium" ? "bg-orange-300" : "bg-yellow-200"}`} />
                    {impact}
                  </button>
                ))}
              </div>
            }
          />
          <CardBody>
            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-3 text-xs text-rose-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-muted/40" />)}
              </div>
            ) : groupedEvents.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border/60 px-6 py-12 text-center">
                <CalendarDays className="mx-auto h-7 w-7 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">Tidak ada event pada filter ini</p>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedEvents.map(([day, dayEvents]) => (
                  <section key={day}>
                    <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{day}</h2>
                    <div className="overflow-hidden rounded-xl border border-border/60">
                      {dayEvents.map((event) => (
                        <div key={event.id} className="grid gap-2 border-b border-border/50 bg-card/30 px-3 py-3 last:border-0 sm:grid-cols-[76px_60px_minmax(0,1fr)_260px] sm:items-center sm:gap-3">
                          <time className="text-xs font-semibold tabular-nums text-muted-foreground">{formatEventTime(event.date)}</time>
                          <span className="w-fit rounded-md border border-border/60 bg-background/60 px-2 py-1 text-[10px] font-bold tracking-wide text-foreground">{event.currency}</span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">{event.title}</p>
                            <span className={`mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold ${impactClass[event.impact] ?? impactClass.Low}`}>
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {event.impact}
                            </span>
                          </div>
                          <div className="grid grid-cols-3 gap-5 text-xs text-muted-foreground sm:justify-self-end">
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span>Forecast</span>
                              <strong className="whitespace-nowrap text-sm font-semibold text-foreground">
                                {event.forecast ?? "-"}
                              </strong>
                            </span>
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span>Previous</span>
                              <strong className="whitespace-nowrap text-sm font-semibold text-foreground">
                                {event.previous ?? "-"}
                              </strong>
                            </span>
                            <span className="flex min-w-0 flex-col gap-0.5">
                              <span>Actual</span>
                              <strong className="whitespace-nowrap text-sm font-semibold text-foreground">
                                {event.actual ?? "-"}
                              </strong>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}

function formatEventTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function getDateRange(preset: DatePreset, customFrom: string, customTo: string) {
  const today = startOfDay(new Date());
  const day = 24 * 60 * 60 * 1000;
  if (preset === "custom") {
    const from = customFrom ? startOfDay(new Date(`${customFrom}T00:00:00`)) : today;
    const to = customTo ? startOfDay(new Date(`${customTo}T00:00:00`)) : from;
    return { from: from.getTime(), to: to.getTime() };
  }
  if (preset === "yesterday") return { from: today.getTime() - day, to: today.getTime() - day };
  if (preset === "tomorrow") return { from: today.getTime() + day, to: today.getTime() + day };
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = today.getTime() - mondayOffset * day;
  if (preset === "next-week") return { from: monday + 7 * day, to: monday + 13 * day };
  if (preset === "this-week") return { from: monday, to: monday + 6 * day };
  return { from: today.getTime(), to: today.getTime() };
}
