import type { SupabaseClient } from "@supabase/supabase-js";
import { GALLERY_BUCKET } from "@/lib/supabase";

export type InquiryStatus = "new" | "scheduled" | "done" | "rejected";

export type InquiryRow = {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  service_id: string;
  vehicle: string | null;
  preferred_date: string | null;
  message: string | null;
  lang: "bg" | "en";
  status: InquiryStatus;
  scheduled_at: string | null;
  duration_minutes: number | null;
  admin_note: string | null;
  source: "website" | "admin";
  /** EUR, set by the owner; null when not entered. */
  price: number | null;
};

export type InquiryPatch = Partial<
  Pick<
    InquiryRow,
    | "status"
    | "scheduled_at"
    | "duration_minutes"
    | "admin_note"
    | "name"
    | "phone"
    | "service_id"
    | "vehicle"
    | "price"
  >
>;

export type NewBooking = Pick<
  InquiryRow,
  "name" | "phone" | "service_id" | "vehicle" | "scheduled_at" | "duration_minutes" | "admin_note" | "price"
>;

export type ClosedDay = { day: string; note: string | null };

export type GalleryRow = {
  id: string;
  created_at: string;
  service_id: string;
  title_bg: string;
  title_en: string;
  description_bg: string | null;
  description_en: string | null;
  before_path: string;
  after_path: string;
  published: boolean;
  sort_order: number;
};

export type NewGalleryRow = Omit<GalleryRow, "id" | "created_at">;

function check<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data;
}

export async function isAdmin(sb: SupabaseClient): Promise<boolean> {
  return check(await sb.rpc("is_admin")) === true;
}

export async function listInquiries(sb: SupabaseClient): Promise<InquiryRow[]> {
  return (check(
    await sb.from("inquiries").select("*").order("created_at", { ascending: false }).limit(1000),
  ) ?? []) as InquiryRow[];
}

export async function updateInquiry(sb: SupabaseClient, id: string, patch: InquiryPatch): Promise<void> {
  check(await sb.from("inquiries").update(patch).eq("id", id));
}

/** A booking the owner enters by hand (phone call, walk-in). */
export async function createBooking(sb: SupabaseClient, booking: NewBooking): Promise<void> {
  check(
    await sb.from("inquiries").insert({ ...booking, status: "scheduled", source: "admin", lang: "bg" }),
  );
}

export async function listClosedDays(sb: SupabaseClient): Promise<ClosedDay[]> {
  return (check(await sb.from("closed_days").select("day, note").order("day")) ?? []) as ClosedDay[];
}

export async function setClosedDay(sb: SupabaseClient, day: string, closed: boolean): Promise<void> {
  if (closed) check(await sb.from("closed_days").insert({ day }));
  else check(await sb.from("closed_days").delete().eq("day", day));
}

export async function deleteInquiry(sb: SupabaseClient, id: string): Promise<void> {
  check(await sb.from("inquiries").delete().eq("id", id));
}

export async function listGallery(sb: SupabaseClient): Promise<GalleryRow[]> {
  return (check(
    await sb
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ) ?? []) as GalleryRow[];
}

export function galleryUrl(sb: SupabaseClient, path: string): string {
  return sb.storage.from(GALLERY_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadGalleryImage(sb: SupabaseClient, path: string, file: Blob): Promise<void> {
  check(
    await sb.storage
      .from(GALLERY_BUCKET)
      .upload(path, file, { contentType: file.type || "image/webp", cacheControl: "31536000", upsert: false }),
  );
}

export async function createGalleryItem(sb: SupabaseClient, row: NewGalleryRow): Promise<void> {
  check(await sb.from("gallery_items").insert(row));
}

export async function updateGalleryItem(
  sb: SupabaseClient,
  id: string,
  patch: Partial<NewGalleryRow>,
): Promise<void> {
  check(await sb.from("gallery_items").update(patch).eq("id", id));
}

export async function deleteGalleryItem(sb: SupabaseClient, row: GalleryRow): Promise<void> {
  check(await sb.from("gallery_items").delete().eq("id", row.id));
  // Best effort: the row is gone either way; leftover files are harmless.
  await sb.storage.from(GALLERY_BUCKET).remove([row.before_path, row.after_path]);
}
