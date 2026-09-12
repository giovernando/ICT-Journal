import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  displayName: string;
  avatarPath: string | null;
}

const BUCKET = "avatars";

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Kamu harus masuk terlebih dahulu.");
  return data.user;
}

export async function fetchProfile(): Promise<Profile> {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;

  if (!data) {
    const fallback = user.email?.split("@")[0] ?? "Trader";
    const { error: insertError } = await supabase
      .from("profiles")
      .insert({ id: user.id, display_name: fallback });
    if (insertError) throw insertError;
    return { id: user.id, displayName: fallback, avatarPath: null };
  }

  return {
    id: data.id,
    displayName: data.display_name ?? "",
    avatarPath: data.avatar_url ?? null,
  };
}

export async function saveProfile(input: {
  displayName: string;
  avatarPath?: string | null;
}): Promise<void> {
  const user = await requireUser();
  const payload: { display_name: string; avatar_url?: string | null } = {
    display_name: input.displayName,
  };
  if (input.avatarPath !== undefined) payload.avatar_url = input.avatarPath;

  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
  if (error) throw error;
}

export async function uploadAvatar(file: File): Promise<string> {
  const user = await requireUser();
  if (!file.type.startsWith("image/")) throw new Error("File harus berupa gambar.");
  if (file.size > 3 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 3MB.");

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${user.id}/avatar-${Date.now()}.${ext || "jpg"}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

export async function getAvatarUrl(path: string | null): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60);
  if (error) return null;
  return data?.signedUrl ?? null;
}

export async function changePassword(nextPassword: string, currentPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: nextPassword,
    // Lovable Cloud requires the current password for signed-in changes.
    ...({ current_password: currentPassword } as Record<string, string>),
  });
  if (error) throw error;
}
