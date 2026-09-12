import { createFileRoute } from "@tanstack/react-router";
import { AuthGate } from "@/components/auth/AuthGate";
import { SettingsPage } from "@/components/trades/SettingsPage";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Akun — Trading Journal" },
      {
        name: "description",
        content:
          "Kelola profil trading journal kamu: ganti nama tampilan, unggah avatar, dan ubah kata sandi akun dengan aman.",
      },
      { property: "og:title", content: "Pengaturan Akun — Trading Journal" },
      {
        property: "og:description",
        content: "Ganti nama, avatar, dan kata sandi akun trading journal kamu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});
