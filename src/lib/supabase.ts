import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client, loaded on demand so the public page does not pay for it
 * until a visitor submits the form or the gallery loads.
 *
 * VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are public by design: every
 * permission is enforced by Row Level Security in the database
 * (supabase/migrations). Never put the service_role key in a VITE_* variable.
 */
const url = (import.meta.env.VITE_SUPABASE_URL ?? "").trim();
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? "").trim();

export const isSupabaseConfigured = url !== "" && anonKey !== "";

let clientPromise: Promise<SupabaseClient> | null = null;

export function getSupabase(): Promise<SupabaseClient> | null {
  if (!isSupabaseConfigured) return null;
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    }),
  );
  return clientPromise;
}

export const GALLERY_BUCKET = "gallery";
