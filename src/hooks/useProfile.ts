import { useCallback, useEffect, useState } from "react";

import {
  changePassword,
  fetchProfile,
  getAvatarUrl,
  saveProfile,
  uploadAvatar,
  type Profile,
} from "@/lib/profile-repo";

export interface UseProfile {
  profile: Profile | null;
  avatarUrl: string | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  info: string | null;
  clearMessages: () => void;
  updateName: (name: string) => Promise<void>;
  updateAvatar: (file: File) => Promise<void>;
  removeAvatar: () => Promise<void>;
  updatePassword: (currentPassword: string, nextPassword: string) => Promise<void>;
}

function message(e: unknown, fallback: string) {
  return e instanceof Error ? e.message : fallback;
}

export function useProfile(): UseProfile {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const next = await fetchProfile();
      setProfile(next);
      setAvatarUrl(await getAvatarUrl(next.avatarPath));
    } catch (e) {
      setError(message(e, "Gagal memuat profil"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const clearMessages = useCallback(() => {
    setError(null);
    setInfo(null);
  }, []);

  const run = useCallback(
    async (fn: () => Promise<void>, successMessage: string, fallback: string) => {
      setSaving(true);
      setError(null);
      setInfo(null);
      try {
        await fn();
        setInfo(successMessage);
      } catch (e) {
        setError(message(e, fallback));
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateName = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        setError("Nama tidak boleh kosong.");
        return;
      }
      if (trimmed.length > 60) {
        setError("Nama maksimal 60 karakter.");
        return;
      }
      await run(
        async () => {
          await saveProfile({ displayName: trimmed });
          setProfile((p) => (p ? { ...p, displayName: trimmed } : p));
        },
        "Nama berhasil diperbarui.",
        "Gagal menyimpan nama",
      );
    },
    [run],
  );

  const updateAvatar = useCallback(
    async (file: File) => {
      await run(
        async () => {
          const path = await uploadAvatar(file);
          await saveProfile({
            displayName: profile?.displayName ?? "",
            avatarPath: path,
          });
          setProfile((p) => (p ? { ...p, avatarPath: path } : p));
          setAvatarUrl(await getAvatarUrl(path));
        },
        "Avatar berhasil diperbarui.",
        "Gagal mengunggah avatar",
      );
    },
    [profile?.displayName, run],
  );

  const removeAvatar = useCallback(async () => {
    await run(
      async () => {
        await saveProfile({ displayName: profile?.displayName ?? "", avatarPath: null });
        setProfile((p) => (p ? { ...p, avatarPath: null } : p));
        setAvatarUrl(null);
      },
      "Avatar dihapus.",
      "Gagal menghapus avatar",
    );
  }, [profile?.displayName, run]);

  const updatePassword = useCallback(
    async (currentPassword: string, nextPassword: string) => {
      if (nextPassword.length < 6) {
        setError("Kata sandi baru minimal 6 karakter.");
        return;
      }
      await run(
        () => changePassword(nextPassword, currentPassword),
        "Kata sandi berhasil diubah.",
        "Gagal mengubah kata sandi",
      );
    },
    [run],
  );

  return {
    profile,
    avatarUrl,
    loading,
    saving,
    error,
    info,
    clearMessages,
    updateName,
    updateAvatar,
    removeAvatar,
    updatePassword,
  };
}
