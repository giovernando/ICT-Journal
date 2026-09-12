import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth/AuthGate";
import { ReportsPage } from "@/components/trades/ReportsPage";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Laporan Performa Trading — Grafik Mingguan & Bulanan" },
      {
        name: "description",
        content:
          "Laporan performa trading: grafik profit/loss mingguan dan bulanan, kurva ekuitas, RR rata-rata, dan win rate dari riwayat trade kamu.",
      },
      { property: "og:title", content: "Laporan Performa Trading — Grafik Mingguan & Bulanan" },
      {
        property: "og:description",
        content:
          "Lihat total profit/loss dalam satuan R, RR rata-rata, dan win rate per minggu maupun per bulan.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <ReportsPage />
    </AuthGate>
  ),
});
