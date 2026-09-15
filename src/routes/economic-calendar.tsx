import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth/AuthGate";
import { EconomicCalendarPage } from "@/components/trades/EconomicCalendarPage";

export const Route = createFileRoute("/economic-calendar")({
  head: () => ({
    meta: [
      { title: "Economic Calendar — ICT Trade Journal" },
      {
        name: "description",
        content: "Kalender berita ekonomi high impact untuk membantu news awareness sebelum trading.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <EconomicCalendarPage />
    </AuthGate>
  ),
});
