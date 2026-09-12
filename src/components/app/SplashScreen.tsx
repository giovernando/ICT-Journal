import { CandlestickChart } from "lucide-react";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  ready: boolean;
  minimumDuration?: number;
  fadeDuration?: number;
  storageKey?: string;
}

export function SplashScreen({
  ready,
  minimumDuration = 1200,
  fadeDuration = 450,
  storageKey = "trade-journal:splash-seen",
}: SplashScreenProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (window.sessionStorage.getItem(storageKey)) {
      setVisible(false);
      return;
    }

    if (!ready) return;

    const timer = window.setTimeout(() => {
      setExiting(true);
      window.setTimeout(() => {
        window.sessionStorage.setItem(storageKey, "1");
        setVisible(false);
      }, fadeDuration);
    }, minimumDuration);

    return () => window.clearTimeout(timer);
  }, [fadeDuration, minimumDuration, ready, storageKey]);

  if (!visible) return null;

  return (
    <div
      aria-label="Memuat Trade Journal"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#080c12] transition-opacity duration-500 ease-out ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,oklch(0.32_0.08_163_/_18%),transparent_34%)]" />
      <div className="relative flex w-full max-w-sm flex-col items-center px-6 text-center">
        <div className="animate-in fade-in zoom-in-95 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-primary/30 bg-primary/10 text-primary shadow-[0_0_55px_oklch(0.72_0.15_163_/_18%)] duration-700">
          <CandlestickChart className="h-10 w-10" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h1 className="animate-in fade-in slide-in-from-bottom-2 mt-7 text-2xl font-semibold tracking-tight text-white duration-700 [animation-delay:120ms] [animation-fill-mode:both]">
          Trade Journal
        </h1>
        <p className="animate-in fade-in slide-in-from-bottom-2 mt-2 text-xs font-medium uppercase tracking-[0.22em] text-white/45 duration-700 [animation-delay:220ms] [animation-fill-mode:both]">
          Precision Trading Journal
        </p>
        <div className="animate-in fade-in mt-10 h-px w-40 overflow-hidden bg-white/10 duration-700 [animation-delay:320ms] [animation-fill-mode:both]">
          <div className="splash-progress h-full w-1/2 bg-primary shadow-[0_0_14px_oklch(0.72_0.15_163_/_80%)]" />
        </div>
      </div>
    </div>
  );
}
