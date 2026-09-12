import { useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Input } from "@/components/kit/Input";
import { Field } from "@/components/kit/Field";
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
      setError(e instanceof Error ? e.message : "Gagal memproses permintaan");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent)]" />
      <Card className="relative w-full max-w-sm">
        <CardHeader
          title={mode === "signin" ? "Masuk ke Journal" : "Buat Akun Baru"}
          description="Data trade kamu privat — hanya bisa dilihat oleh akun kamu sendiri."
        />
        <CardBody>
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
              <Input
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </Field>

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

            <Button type="submit" disabled={busy}>
              {busy ? "Memproses…" : mode === "signin" ? "Masuk" : "Daftar"}
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
