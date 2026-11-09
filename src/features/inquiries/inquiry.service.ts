import type { Language } from "@/config/schema";
import type { InquiryValues } from "./inquiry.schema";

/**
 * Sends an inquiry to the secure endpoint (serverless function or managed form
 * service) configured in VITE_INQUIRY_ENDPOINT. The endpoint holds the email
 * API key, validates again, applies spam checks and rate limiting (SRS §2.2, §6.3).
 *
 * With no endpoint configured the form runs in a clearly labelled demo mode:
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
  return getInquiryEndpoint() === "";
}

export async function submitInquiry(
  data: InquiryValues,
  lang: Language,
  fetchImpl: typeof fetch = fetch,
): Promise<SubmitResult> {
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
