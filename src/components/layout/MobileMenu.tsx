import { useEffect, useRef, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Navigation } from "./Navigation";
import { ButtonLink } from "@/components/ui/Button";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { cn } from "@/lib/cn";

type Props = {
  id: string;
  open: boolean;
  onClose: () => void;
  /** Focus returns here on close. */
  triggerRef: RefObject<HTMLButtonElement | null>;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function MobileMenu({ id, open, onClose, triggerRef }: Props) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        triggerRef.current?.focus();
        return;
      }
      // Keep Tab focus inside panel + trigger while open.
      if (event.key === "Tab" && panel) {
        const items = [
          triggerRef.current,
          ...panel.querySelectorAll<HTMLElement>(FOCUSABLE),
        ].filter((el): el is HTMLElement => !!el);
        const first = items[0];
        const last = items[items.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, triggerRef]);

  return (
    <div
      id={id}
      ref={panelRef}
      hidden={!open}
      className={cn(
        "fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-bg/98 backdrop-blur-sm lg:hidden",
        open && "animate-rise",
      )}
    >
      <nav aria-label={t("a11y.mobileNavigation")} className="px-4 pt-4 pb-10 sm:px-6">
        <Navigation variant="mobile" onNavigate={onClose} />
        <ButtonLink href="#contact" onClick={onClose} className="mt-8 w-full">
          {t("hero.primaryButton")}
        </ButtonLink>
      </nav>
    </div>
  );
}
