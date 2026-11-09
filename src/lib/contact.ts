/** Helpers that turn configured contact values into links. Empty input → null (hide). */

function digits(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

export function telHref(phone: string): string | null {
  return phone.trim() ? `tel:${digits(phone)}` : null;
}

export function mailtoHref(email: string): string | null {
  return email.trim() ? `mailto:${email.trim()}` : null;
}

/**
 * Opens a Viber chat with the configured number. A prefilled message is not
 * reliable across platforms (SRS §6.4) — the copy-to-clipboard flow arrives in Sprint 4.
 */
export function viberHref(phone: string): string | null {
  return phone.trim() ? `viber://chat?number=${encodeURIComponent(digits(phone))}` : null;
}
