import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth/AuthGate";
import { CalendarPage } from "@/components/trades/CalendarPage";

export const Route = createFileRoute("/calendar")({
  head: () => ({
    meta: [
      { title: "Kalender Trading — Profit Harian & Rekap Mingguan" },
      {
        name: "description",
        content:
          "Kalender performa trading: total profit/loss dan jumlah trade untuk setiap tanggal, lengkap dengan rekap mingguan dan bulanan.",
      },
      { property: "og:title", content: "Kalender Trading — Profit Harian & Rekap Mingguan" },
      {
        property: "og:description",
        content: "Lihat profit/loss tiap hari dan total per minggu dalam satu kalender.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGate>
      <CalendarPage />
    </AuthGate>
  ),
});
