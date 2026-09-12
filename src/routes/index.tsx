import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth/AuthGate";
import { JournalPage } from "@/components/trades/JournalPage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Trading Journal — Catatan Setup & Hasil Trade" },
      {
        name: "description",
        content:
          "Journal trading modern: catat pair, bias, draw on liquidity, entry model, killzone, RR, dan screenshot chart. Bisa diinstal di HP.",
      },
      { property: "og:title", content: "Trading Journal — Catatan Setup & Hasil Trade" },
      {
        property: "og:description",
        content:
          "Catat bias, DOL, entry model, killzone, RR, dan hasil setiap trade dalam satu journal yang rapi.",
      },
    ],
  }),
  component: () => (
    <AuthGate>
      <JournalPage />
    </AuthGate>
  ),
});
