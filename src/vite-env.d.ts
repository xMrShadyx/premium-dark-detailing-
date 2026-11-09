/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string;
  /** Public URL of the inquiry endpoint (serverless function / form service). Empty = demo mode. */
  readonly VITE_INQUIRY_ENDPOINT?: string;
  /** Supabase project URL and anon (public) key. Empty = no database (demo mode / config gallery). */
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
