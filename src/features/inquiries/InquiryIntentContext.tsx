import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Booking intent: which service the visitor picked, and whether the booking
 * dialog (the inquiry form) is open. Every "Запази час" button opens it.
 * Kept in memory only — no personal data, no URL parameters (SRS §6.5).
 */
type InquiryIntent = {
  serviceId: string | null;
  setServiceId: (id: string | null) => void;
  bookingOpen: boolean;
  /** Text to start the message with (e.g. the price-list line the visitor picked). */
  presetMessage: string | null;
  /** Opens the booking dialog, optionally with a service preselected and a message to start from. */
  openBooking: (serviceId?: string | null, presetMessage?: string) => void;
  closeBooking: () => void;
};

const InquiryIntentContext = createContext<InquiryIntent | null>(null);

export function InquiryIntentProvider({ children }: { children: ReactNode }) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [presetMessage, setPresetMessage] = useState<string | null>(null);
  const openBooking = useCallback((id?: string | null, preset?: string) => {
    if (id) setServiceId(id);
    setPresetMessage(preset ?? null);
    setBookingOpen(true);
  }, []);
  const closeBooking = useCallback(() => setBookingOpen(false), []);
  const value = useMemo(
    () => ({ serviceId, setServiceId, presetMessage, bookingOpen, openBooking, closeBooking }),
    [serviceId, presetMessage, bookingOpen, openBooking, closeBooking],
  );
  return <InquiryIntentContext.Provider value={value}>{children}</InquiryIntentContext.Provider>;
}

export function useInquiryIntent(): InquiryIntent {
  const ctx = useContext(InquiryIntentContext);
  if (!ctx) throw new Error("useInquiryIntent must be used inside <InquiryIntentProvider>");
  return ctx;
}
