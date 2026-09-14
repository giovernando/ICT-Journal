import { useState, type ReactNode } from "react";
import { ArrowUpRight, BarChart3, Check, LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Input, PasswordInput } from "@/components/kit/Input";
import { Field } from "@/components/kit/Field";
import { ThemeToggle } from "@/components/trades/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

type Mode = "signin" | "signup";

function AuthScreen() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        // Auto-confirm aktif: signUp biasanya langsung mengembalikan session,
        // jadi user langsung masuk lewat onAuthStateChange.
        if (!data.session) {
          const { error: signInErr } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (signInErr) {
            setInfo("Akun dibuat. Silakan masuk dengan email dan password kamu.");
            setMode("signin");
          }
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal memproses permintaan";
      setError(
        message.toLowerCase().includes("invalid login credentials")
          ? "Kamu belum memiliki akun, daftar terlebih dahulu."
          : message,
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-4 py-6 text-foreground sm:px-8 sm:py-8">
      <img
        src="/trading-chart-bg.svg"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-fill opacity-15 dark:opacity-55"
      />
      <div className="pointer-events-none absolute inset-0 bg-background/70 dark:bg-background/45" />
      <div className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl overflow-hidden rounded-[1.75rem] border border-border/70 bg-card/70 shadow-2xl shadow-black/10 dark:bg-card/20 dark:shadow-black/20 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="absolute right-4 top-4 z-20">
          <ThemeToggle />
        </div>
        <section className="relative hidden overflow-hidden border-r border-border/60 bg-card/85 p-10 lg:flex lg:flex-col lg:justify-between dark:bg-[#0c141b]/55 xl:p-14">
          <div className="relative">
            <div className="flex items-center gap-3 text-sm font-semibold tracking-tight">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                <BarChart3 className="h-4 w-4" />
              </span>
              ICT Journal
            </div>
            <div className="mt-24 max-w-lg">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                Trade with intention
              </p>
              <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight text-foreground dark:text-white xl:text-5xl">
                Review every trade. Improve every edge.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground dark:text-slate-400">
                Satu ruang tenang untuk mencatat setup, membaca hasil, dan membangun disiplin trading.
              </p>
            </div>
          </div>
          <div className="relative grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 dark:bg-black/20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Workspace</p>
              <p className="mt-2 text-lg font-semibold text-foreground dark:text-white">Private by default</p>
              <ShieldCheck className="mt-5 h-5 w-5 text-emerald-300" />
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/60 p-4 dark:bg-black/20">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Focus</p>
              <p className="mt-2 text-lg font-semibold text-foreground dark:text-white">Process over noise</p>
              <ArrowUpRight className="mt-5 h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-background/10 p-5 sm:p-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-400/10 text-emerald-300">
                <BarChart3 className="h-4 w-4" />
              </span>
              <span className="font-semibold tracking-tight">ICT Journal</span>
            </div>
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300/80">Your trading workspace</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                {mode === "signin" ? "Selamat datang kembali" : "Mulai jurnalmu"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {mode === "signin" ? "Masuk dan lanjutkan membaca performamu." : "Buat ruang privat untuk setiap eksekusi."}
              </p>
            </div>
            <Card className="border-border/70 bg-card/85 shadow-xl shadow-black/10 backdrop-blur-[2px] dark:bg-background/25">
              <CardBody className="p-5 sm:p-6">
                <form className="grid gap-4" onSubmit={submit}>
                  <Field label="Email">
                    <Input
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="kamu@email.com"
                    />
                  </Field>
                  <Field label="Password">
                    <PasswordInput
                      autoComplete={mode === "signin" ? "current-password" : "new-password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                    />
                  </Field>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="grid h-4 w-4 place-items-center rounded border border-emerald-400/40 bg-emerald-400/10 text-emerald-300">
                      <Check className="h-3 w-3" />
                    </span>
                    Sesi kamu akan tetap tersimpan di perangkat ini.
                  </div>

                  <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground">
                    Email tidak harus aktif. Gunakan alamat apa saja selama formatnya valid.
                  </p>
                  {error && (
                    <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                      {error}
                    </p>
                  )}
                  {info && (
                    <p className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-primary">
                      {info}
                    </p>
                  )}

                  <Button type="submit" disabled={busy} className="mt-1 w-full">
                    {busy ? "Memproses…" : mode === "signin" ? "Masuk ke Journal" : "Buat Akun"}
                  </Button>

                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      setError(null);
                      setInfo(null);
                    }}
                  >
                    {mode === "signin" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk"}
                  </button>
                </form>
              </CardBody>
            </Card>
            <p className="mt-5 text-center text-[11px] text-muted-foreground/70">
              Data trade kamu privat dan hanya dapat diakses dari akunmu.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export function AccountChip() {
  const { user, signOut } = useAuth();
  if (!user) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/50 px-3 py-2 backdrop-blur-md">
      <span className="max-w-[160px] truncate text-xs text-muted-foreground">{user.email}</span>
      <Button variant="ghost" size="sm" onClick={signOut} title="Keluar">
        <LogOut className="h-4 w-4" />
        Keluar
      </Button>
    </div>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted-foreground">Memuat…</p>
      </div>
    );
  }

  if (!user) return <AuthScreen />;

  return <>{children}</>;
}
