import { z } from "zod";

/**
 * Client-side inquiry validation (SRS §6.2). Messages are i18n keys,
 * translated at render time. The server endpoint must validate again.
 */

export const PHONE_RE = /^\+?[0-9\s\-()]{6,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type InquiryValues = {
  name: string;
  phone: string;
  email: string;
  serviceId: string;
  vehicle: string;
  preferredDate: string;
  message: string;
  consent: boolean;
  /** Honeypot: hidden from people, bots tend to fill it. Checked server-side. */
  website: string;
};

export type InquiryField = keyof InquiryValues;
export type InquiryErrors = Partial<Record<InquiryField, string>>;

export const emptyInquiry: InquiryValues = {
  name: "",
  phone: "",
  email: "",
  serviceId: "",
  vehicle: "",
  preferredDate: "",
  message: "",
  consent: false,
  website: "",
};

/** Field order — used to focus the first invalid field. */
export const INQUIRY_FIELDS: InquiryField[] = [
  "name",
  "phone",
  "email",
  "serviceId",
  "vehicle",
  "preferredDate",
  "message",
  "consent",
];

export function createInquirySchema(serviceIds: readonly string[]) {
  return z.object({
    name: z.string().trim().min(2, { message: "validation.name" }).max(100, { message: "validation.name" }),
    phone: z.string().trim().regex(PHONE_RE, { message: "validation.phone" }),
    email: z
      .string()
      .trim()
      .refine((v) => v === "" || EMAIL_RE.test(v), { message: "validation.email" }),
    serviceId: z.string().refine((v) => serviceIds.includes(v), { message: "validation.service" }),
    vehicle: z.string().trim().max(100, { message: "validation.vehicle" }),
    preferredDate: z
      .string()
      .refine((v) => v === "" || DATE_RE.test(v), { message: "validation.date" }),
    message: z
      .string()
      .trim()
      .min(10, { message: "validation.message" })
      .max(2000, { message: "validation.message" }),
    consent: z.boolean().refine((v) => v, { message: "validation.consent" }),
    website: z.string(),
  });
}

export type InquiryResult =
  | { ok: true; data: InquiryValues }
  | { ok: false; errors: InquiryErrors };

export function validateInquiry(values: InquiryValues, serviceIds: readonly string[]): InquiryResult {
  const result = createInquirySchema(serviceIds).safeParse(values);
  if (result.success) return { ok: true, data: result.data };

  const errors: InquiryErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as InquiryField | undefined;
    if (field && !errors[field]) errors[field] = issue.message;
  }
  return { ok: false, errors };
}
