import { useEffect, useState } from "react";
import { getPublishedGallery } from "@/config";
import type { GalleryItem } from "@/config/schema";
import { GALLERY_BUCKET, getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type Row = {
  id: string;
  service_id: string;
  title_bg: string;
  title_en: string;
  description_bg: string | null;
  description_en: string | null;
  before_path: string;
  after_path: string;
  sort_order: number;
};

/**
 * Gallery items for the public page.
 * - No database configured → items from src/config/gallery.ts.
 * - Database configured → published items uploaded in the admin panel; while there
 *   are none yet, the config items (demo pairs) are shown instead.
 */
export function useGalleryItems(): { items: GalleryItem[]; loading: boolean } {
  const fallback = getPublishedGallery();
  const [state, setState] = useState<{ items: GalleryItem[]; loading: boolean }>(() => ({
    items: isSupabaseConfigured ? [] : fallback,
    loading: isSupabaseConfigured,
  }));

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;
    let cancelled = false;

    supabase
      .then(async (client) => {
        const { data, error } = await client
          .from("gallery_items")
          .select("id, service_id, title_bg, title_en, description_bg, description_en, before_path, after_path, sort_order")
          .eq("published", true)
          .order("sort_order", { ascending: true })
          .order("created_at", { ascending: true });
        if (error) throw error;
        const url = (path: string) => client.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
        return ((data ?? []) as Row[]).map<GalleryItem>((row) => ({
          id: row.id,
          serviceId: row.service_id,
          beforeImage: url(row.before_path),
          afterImage: url(row.after_path),
          title: { bg: row.title_bg, en: row.title_en },
          description:
            row.description_bg && row.description_en
              ? { bg: row.description_bg, en: row.description_en }
              : undefined,
          published: true,
          order: row.sort_order,
        }));
      })
      .then((remote) => {
        if (!cancelled) setState({ items: remote.length > 0 ? remote : fallback, loading: false });
      })
      .catch(() => {
        if (!cancelled) setState({ items: fallback, loading: false });
      });

    return () => {
      cancelled = true;
    };
    // fallback comes from static config; run once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
