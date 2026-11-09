import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, MessageSquareText, X } from "lucide-react";
import { Navigation } from "./Navigation";
import { MobileMenu } from "./MobileMenu";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { hasBusinessName, siteConfig } from "@/config";
import { useScrolled } from "@/hooks/useScrolled";
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

  return (
    <>
    <header
      data-scrolled={scrolled || menuOpen}
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || menuOpen
          ? "border-line/70 bg-bg/90 backdrop-blur-md"
          : // Over the always-dark hero the header uses the dark palette in both themes.
            "theme-dark border-transparent bg-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-4 focus:z-50 focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-bg"
      >
        {t("a11y.skipToContent")}
      </a>

      <Container className="flex h-16 items-center gap-8 lg:h-20">
        {/* Brand renders only when configured — no empty logo slot (SRS §1.2). */}
        {showBrand && (
          <a
            href="#home"
            className="flex shrink-0 items-center gap-2 font-display text-sm font-semibold tracking-wide text-fg-muted transition-colors hover:text-fg"
          >
            {siteConfig.logo && (
              <img src={assetUrl(siteConfig.logo)} alt="" width={28} height={28} className="h-7 w-7" />
            )}
            {siteConfig.businessName}
          </a>
        )}

        <nav aria-label={t("a11y.mainNavigation")} className="hidden lg:block">
          <Navigation variant="desktop" />
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ThemeToggle />

          <ButtonLink href="#contact" size="sm" className="max-md:hidden">
            {t("navigation.cta")}
          </ButtonLink>

          <a
            href="#contact"
            aria-label={t("a11y.contactShortcut")}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gold transition-colors hover:bg-surface md:hidden"
          >
            <MessageSquareText aria-hidden="true" size={20} />
          </a>

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
