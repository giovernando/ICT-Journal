import type { EconomicEvent } from "@/types/economic-calendar";

const CACHE_KEY = "trading-journal:economic-calendar:v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cachedEvents: EconomicEvent[] = [];

interface CachedCalendar {
  expiresAt: number;
  events: EconomicEvent[];
}

export function readEconomicCalendarCache(): EconomicEvent[] | null {
  if (typeof window === "undefined") return null;
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "null") as CachedCalendar | null;
    if (!cached || cached.expiresAt <= Date.now()) return null;
    cachedEvents = cached.events;
    return cached.events;
  } catch {
    return null;
  }
}

export function saveEconomicCalendarCache(events: EconomicEvent[]) {
  cachedEvents = events;
  if (typeof window === "undefined") return;
  const payload: CachedCalendar = { events, expiresAt: Date.now() + CACHE_TTL_MS };
  window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
}

export function setEconomicCalendarEvents(events: EconomicEvent[]) {
  cachedEvents = events;
}

export function isHighImpactNewsNear(
  tradeTime: string | Date,
  toleranceMinutes = 30,
): boolean {
  const target = new Date(tradeTime).getTime();
  if (Number.isNaN(target)) return false;
  const tolerance = Math.max(0, toleranceMinutes) * 60 * 1000;
  return cachedEvents.some((event) => {
    if (event.currency !== "USD" || event.impact !== "High") return false;
    const eventTime = new Date(event.date).getTime();
    return !Number.isNaN(eventTime) && Math.abs(eventTime - target) <= tolerance;
  });
}

export function calendarCacheTtlMs() {
  return CACHE_TTL_MS;
}
