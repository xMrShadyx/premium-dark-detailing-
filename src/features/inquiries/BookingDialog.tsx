import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, X } from "lucide-react";
import { InquiryForm } from "./InquiryForm";
import { useInquiryIntent } from "./InquiryIntentContext";

/** The inquiry form in a native modal <dialog> (focus trap, Escape, backdrop). */
export function BookingDialog() {
  const { t } = useTranslation();
  const { bookingOpen, closeBooking } = useInquiryIntent();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (bookingOpen && !dialog.open) dialog.showModal?.();
    if (!bookingOpen && dialog.open) dialog.close?.();
  }, [bookingOpen]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="booking-title"
      onClose={closeBooking}
      onClick={(e) => {
        // A click on the backdrop (the dialog element itself) closes it.
        if (e.target === e.currentTarget) closeBooking();
      }}
      className="m-auto w-[min(44rem,calc(100vw-1.5rem))] rounded-2xl border border-accent/30 bg-bg-2 p-0 text-fg shadow-[0_0_60px_-10px] shadow-accent/40 backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      {bookingOpen && (
        <div className="flex max-h-[90svh] flex-col">
          <header className="flex items-start gap-3 border-b border-line px-5 py-4 sm:px-8">
            <CalendarDays aria-hidden="true" size={26} className="mt-1 shrink-0 text-accent text-glow" />
            <div className="min-w-0">
              <h2 id="booking-title" className="font-brand text-2xl font-extrabold italic">
                {t("booking.title")}
              </h2>
              <p className="mt-1 text-sm text-fg-muted">{t("booking.subtitle")}</p>
            </div>
            <button
              type="button"
              onClick={closeBooking}
              aria-label={t("booking.close")}
              className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-fg-muted hover:bg-surface hover:text-fg"
            >
              <X aria-hidden="true" size={22} />
            </button>
          </header>
          <div className="overflow-y-auto px-5 py-6 sm:px-8">
            <InquiryForm />
          </div>
        </div>
      )}
    </dialog>
  );
}
