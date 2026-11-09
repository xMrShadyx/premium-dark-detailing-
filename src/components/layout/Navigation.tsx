import { useTranslation } from "react-i18next";
import { navigationSections } from "@/config/sections";
import { useActiveSection } from "@/hooks/useActiveSection";
import { cn } from "@/lib/cn";

type Props = {
  variant: "desktop" | "mobile" | "footer";
  onNavigate?: () => void;
  className?: string;
};

/** Section links generated from the section registry (never a dead anchor). */
export function Navigation({ variant, onNavigate, className }: Props) {
  const { t } = useTranslation();
  const active = useActiveSection(navigationSections);

  const listClass = {
    desktop: "flex items-center gap-8",
    mobile: "flex flex-col",
    footer: "flex flex-col gap-2",
  }[variant];

  const linkClass = (isActive: boolean) =>
    ({
      desktop: cn(
        "relative py-2 text-sm font-semibold transition-colors hover:text-fg",
        "after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-accent after:shadow-[0_0_8px] after:shadow-accent",
        "after:origin-center after:transition-transform after:duration-300 motion-reduce:after:transition-none",
        isActive ? "text-fg after:scale-x-100" : "text-fg/80 after:scale-x-0 hover:after:scale-x-100",
      ),
      mobile:
        "flex min-h-14 items-center border-b border-line font-display text-2xl font-medium text-fg transition-colors hover:text-accent",
      footer: "text-sm text-fg-muted transition-colors hover:text-fg",
    })[variant];

  return (
    <ul className={cn(listClass, className)}>
      {navigationSections.map((id) => {
        const isActive = variant === "desktop" && active === id;
        return (
          <li key={id}>
            <a
              href={`#${id}`}
              className={linkClass(isActive)}
              aria-current={isActive ? "location" : undefined}
              onClick={onNavigate}
            >
              {t(`navigation.${id}`)}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
