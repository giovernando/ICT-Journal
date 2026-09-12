import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Camera, Trash2, User as UserIcon } from "lucide-react";

import { Button } from "@/components/kit/Button";
import { Card, CardBody, CardHeader } from "@/components/kit/Card";
import { Field } from "@/components/kit/Field";
import { Input, PasswordInput } from "@/components/kit/Input";
import { BottomNav } from "@/components/trades/BottomNav";
import { TopBar } from "@/components/trades/TopBar";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

export function SettingsPage() {
  const { user } = useAuth();
  const profileState = useProfile();
  const { profile, avatarUrl, loading, saving, error, info } = profileState;

  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) setName(profile.displayName);
  }, [profile]);

  const submitName = async (e: React.FormEvent) => {
    e.preventDefault();
    await profileState.updateName(name);
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi kata sandi tidak sama.");
      return;
    }
    if (!currentPassword) {
      setPasswordError("Masukkan kata sandi saat ini.");
      return;
    }
    await profileState.updatePassword(currentPassword, newPassword);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 -top-40 h-96 bg-[radial-gradient(60%_60%_at_50%_0%,var(--glow),transparent)]" />

      <div className="relative mx-auto w-full max-w-3xl px-4 pb-28 sm:px-6">
        <TopBar title="Pengaturan" backTo="/" backLabel="← Journal" />
        <header className="mt-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">
            Pengaturan Akun
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            Profil & keamanan
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            Ganti nama tampilan, avatar, dan kata sandi akun kamu. Perubahan hanya berlaku untuk
            akun ini.
          </p>
        </header>

        {error && (
          <p className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}
        {info && (
          <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300">
            {info}
          </p>
        )}

        <div className="mt-6 grid gap-6">
          <Card>
            <CardHeader title="Avatar" description="Gambar profil maksimal 3MB" />
            <CardBody>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-primary/10 text-primary">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar akun" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-8 w-8" />
                  )}
                </span>
                <div className="flex flex-wrap gap-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void profileState.updateAvatar(file);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={saving}
                    onClick={() => fileRef.current?.click()}
                  >
                    <Camera className="mr-1.5 h-4 w-4" />
                    Ganti avatar
                  </Button>
                  {avatarUrl && (
                    <Button
                      variant="danger"
                      size="sm"
                      disabled={saving}
                      onClick={() => void profileState.removeAvatar()}
                    >
                      <Trash2 className="mr-1.5 h-4 w-4" />
                      Hapus
                    </Button>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Nama tampilan" description={user?.email ?? ""} />
            <CardBody>
              <form
                className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end"
                onSubmit={submitName}
              >
                <Field label="Nama" hint="Maksimal 60 karakter">
                  <Input
                    value={loading ? "" : name}
                    maxLength={60}
                    placeholder="Nama kamu"
                    onChange={(e) => setName(e.target.value)}
                  />
                </Field>
                <Button type="submit" disabled={saving || loading}>
                  {saving ? "Menyimpan…" : "Simpan nama"}
                </Button>
              </form>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Kata sandi" description="Minimal 6 karakter" />
            <CardBody>
              <form className="grid gap-4" onSubmit={submitPassword}>
                <Field label="Kata sandi saat ini">
                  <PasswordInput
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Kata sandi baru">
                    <PasswordInput
                      autoComplete="new-password"
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </Field>
                  <Field label="Ulangi kata sandi baru" error={passwordError ?? undefined}>
                    <PasswordInput
                      autoComplete="new-password"
                      minLength={6}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </Field>
                </div>
                <div>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Menyimpan…" : "Ubah kata sandi"}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          <Link
            to="/"
            className="w-fit rounded-xl border border-border/60 bg-card/50 px-3.5 py-2 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-card"
          >
            ← Kembali ke journal
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
