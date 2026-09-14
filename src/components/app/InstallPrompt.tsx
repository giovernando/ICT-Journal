import { Download, Share2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/kit/Button";
import { useAuth } from "@/hooks/useAuth";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isAppInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  );
}

function isIOSDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

export function InstallPrompt() {
  const { user } = useAuth();
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [iosDevice, setIOSDevice] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setIOSDevice(isIOSDevice());
    if (isAppInstalled()) {
      setInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const handleAppInstalled = () => {
      setInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installEvent) return;

    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") setInstalled(true);
  };

  if (!user || installed || dismissed || (!installEvent && !iosDevice)) return null;

  const isIOSInstall = iosDevice && !installEvent;

  return (
    <div
      role="dialog"
      aria-label="Install ICT Journal"
      className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[45] mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-2xl shadow-black/25 backdrop-blur-xl sm:inset-x-auto sm:bottom-6 sm:right-6 sm:mx-0"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        {isIOSInstall ? <Share2 className="h-4 w-4" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
      </div>
      <p className="min-w-0 flex-1 text-xs leading-5 text-muted-foreground">
        {isIOSInstall ? "Tekan Bagikan, lalu pilih Tambahkan ke Layar Utama." : "Install ICT Journal agar lebih cepat dibuka."}
      </p>
      {!isIOSInstall && <Button size="sm" onClick={install}>Install</Button>}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Tutup"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}