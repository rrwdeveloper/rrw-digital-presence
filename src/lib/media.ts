import { supabase } from "@/integrations/supabase/client";

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

/** Uploads an image to the private media bucket and returns a long-lived signed URL. */
export async function uploadImage(file: File, folder = "uploads") {
  if (!ALLOWED.includes(file.type)) throw new Error("Format gambar tidak didukung");
  if (file.size > 10 * 1024 * 1024) throw new Error("Ukuran maksimal 10MB");
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type });
  if (error) throw error;
  const { data, error: e2 } = await supabase.storage.from("media").createSignedUrl(path, TEN_YEARS);
  if (e2 || !data) throw e2 ?? new Error("Gagal membuat URL");
  return data.signedUrl;
}
