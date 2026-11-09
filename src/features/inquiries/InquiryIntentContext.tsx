import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/**
 * Remembers which service a visitor clicked "Ask about this service" on.
 * The inquiry form (Sprint 4) reads this to preselect its service field.
 * Kept in memory only — no personal data, no URL parameters (SRS §6.5).
 */
type InquiryIntent = {
  serviceId: string | null;
  setServiceId: (id: string | null) => void;
};

const InquiryIntentContext = createContext<InquiryIntent | null>(null);

export function InquiryIntentProvider({ children }: { children: ReactNode }) {
  const [serviceId, setServiceId] = useState<string | null>(null);
  const value = useMemo(() => ({ serviceId, setServiceId }), [serviceId]);
  return <InquiryIntentContext.Provider value={value}>{children}</InquiryIntentContext.Provider>;
}

export function useInquiryIntent(): InquiryIntent {
  const ctx = useContext(InquiryIntentContext);
  if (!ctx) throw new Error("useInquiryIntent must be used inside <InquiryIntentProvider>");
  return ctx;
}
