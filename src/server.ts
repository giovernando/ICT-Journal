import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const FOREX_FACTORY_CALENDAR_URL = "https://nfs.faireconomy.media/ff_calendar_thisweek.json";
const ALLOWED_CURRENCIES = new Set(["USD", "EUR", "GBP"]);

async function economicCalendarResponse(): Promise<Response> {
  try {
    const upstream = await fetch(FOREX_FACTORY_CALENDAR_URL, {
      headers: { accept: "application/json" },
    });
    if (!upstream.ok) {
      return new Response(JSON.stringify({ error: "Economic calendar upstream unavailable" }), {
        status: 502,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }

    const source = (await upstream.json()) as Array<Record<string, unknown>>;
    const events = source
      .filter((event) => ALLOWED_CURRENCIES.has(String(event.country ?? "").toUpperCase()))
      .map((event, index) => ({
        id: `${event.date ?? "event"}-${event.title ?? index}-${index}`,
        title: String(event.title ?? "Untitled event"),
        currency: String(event.country).toUpperCase(),
        impact: String(event.impact ?? "Low"),
        date: String(event.date ?? ""),
        forecast: event.forecast == null || event.forecast === "" ? null : String(event.forecast),
        previous: event.previous == null || event.previous === "" ? null : String(event.previous),
        actual: event.actual == null || event.actual === "" ? null : String(event.actual),
      }));

    return new Response(JSON.stringify(events), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Failed to load economic calendar" }), {
      status: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      if (new URL(request.url).pathname === "/api/economic-calendar") {
        if (request.method !== "GET") {
          return new Response("Method Not Allowed", { status: 405 });
        }
        return await economicCalendarResponse();
      }
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
