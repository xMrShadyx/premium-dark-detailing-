import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarDays, Menu, X } from "lucide-react";
import { Navigation } from "./Navigation";
import { MobileMenu } from "./MobileMenu";
import { Container } from "@/components/ui/Container";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { hasBusinessName, siteConfig } from "@/config";
import { useScrolled } from "@/hooks/useScrolled";
import { useInquiryIntent } from "@/features/inquiries/InquiryIntentContext";
import { cn } from "@/lib/cn";
import { assetUrl } from "@/lib/locale";

const MENU_ID = "mobile-menu";

export function Header() {
  const { t } = useTranslation();
  const scrolled = useScrolled();
  const [menuOpen, setMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const showBrand = hasBusinessName();
  const { openBooking } = useInquiryIntent();

  return (
    <>
    <header
      data-scrolled={scrolled || menuOpen}
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        // Always the dark palette: the glowing logo is drawn for a dark background.
        "theme-dark",
        scrolled || menuOpen
          ? "border-accent/15 bg-bg/90 backdrop-blur-md"
          : "border-transparent bg-bg/95 backdrop-blur-sm",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-bg"
      >
        {t("a11y.skipToContent")}
      </a>

      <Container className="flex h-16 items-center gap-8 lg:h-24">
        {/* Brand renders only when configured — no empty logo slot (SRS §1.2). */}
        {showBrand && (
          <a
            href="#home"
            className="flex shrink-0 items-center gap-2 font-display text-sm font-semibold tracking-wide text-fg-muted transition-colors hover:text-fg"
          >
            {siteConfig.logo ? (
              // The logo already spells the name (MM), so it carries the name as alt text.
              <img
                src={assetUrl(siteConfig.logo)}
                alt={siteConfig.businessName}
                width={900}
                height={260}
                className="h-10 w-auto xs:h-12 lg:h-16"
              />
            ) : (
              siteConfig.businessName
            )}
          </a>
        )}

        <nav aria-label={t("a11y.mainNavigation")} className="ml-auto hidden lg:block">
          <Navigation variant="desktop" />
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-6">
          <LanguageSwitcher className="max-sm:hidden" />

          <button
            type="button"
            onClick={() => openBooking()}
            aria-label={t("navigation.cta")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-accent transition-colors hover:bg-surface lg:hidden"
          >
            <CalendarDays aria-hidden="true" size={21} />
          </button>

          <button
            ref={triggerRef}
            type="button"
            aria-expanded={menuOpen}
            aria-controls={MENU_ID}
            aria-label={menuOpen ? t("a11y.closeMenu") : t("a11y.openMenu")}
            onClick={() => setMenuOpen((open) => !open)}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-fg transition-colors hover:bg-surface lg:hidden"
          >
            {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
        </div>
      </Container>
    </header>

    {/* Sibling of <header>: its backdrop-filter would otherwise trap position:fixed. */}
    <MobileMenu id={MENU_ID} open={menuOpen} onClose={closeMenu} triggerRef={triggerRef} />
    </>
  );
}
