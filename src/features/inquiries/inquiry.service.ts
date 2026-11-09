import type { Language } from "@/config/schema";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import type { InquiryValues } from "./inquiry.schema";

/**
 * Sends an inquiry. Preferred: Supabase (row in `inquiries`; RLS allows anon
 * insert only, the database re-validates, rate-limits and rejects the honeypot).
 * Alternative: a custom endpoint in VITE_INQUIRY_ENDPOINT.
 *
 * With neither configured the form runs in a clearly labelled demo mode:
 * nothing is sent and the UI never claims otherwise.
 */
export type SubmitResult =
  | { status: "accepted" }
  | { status: "demo" }
  | { status: "error"; reason: "network" | "server" };

export function getInquiryEndpoint(): string {
  return (import.meta.env.VITE_INQUIRY_ENDPOINT ?? "").trim();
}

export function isDemoMode(): boolean {
  return !isSupabaseConfigured && getInquiryEndpoint() === "";
}

export async function submitInquiry(
  data: InquiryValues,
  lang: Language,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
  const supabase = getSupabase();
  if (supabase) {
    try {
      const client = await supabase;
      const { error } = await client.from("inquiries").insert({
        name: data.name.trim(),
        phone: data.phone.trim(),
        email: data.email.trim() || null,
        service_id: data.serviceId,
        vehicle: data.vehicle.trim() || null,
        preferred_date: data.preferredDate || null,
        message: data.message.trim(),
        lang,
        consent: data.consent,
        website: data.website,
      });
      if (!error) return { status: "accepted" };
      return { status: "error", reason: /fetch|network/i.test(error.message) ? "network" : "server" };
    } catch {
      return { status: "error", reason: "network" };
    }
  }

  const endpoint = getInquiryEndpoint();
  if (!endpoint) return { status: "demo" };

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...data, lang }),
    });
    return response.ok ? { status: "accepted" } : { status: "error", reason: "server" };
  } catch {
    return { status: "error", reason: "network" };
  }
}
