import { useTranslation } from "react-i18next";
import { navigationSections } from "@/config/sections";
import { cn } from "@/lib/cn";

type Props = {
  variant: "desktop" | "mobile" | "footer";
  onNavigate?: () => void;
  className?: string;
};

/** Section links generated from the section registry (never a dead anchor). */
export function Navigation({ variant, onNavigate, className }: Props) {
  const { t } = useTranslation();

  const listClass = {
    desktop: "flex items-center gap-8",
    mobile: "flex flex-col",
    footer: "flex flex-wrap gap-x-6 gap-y-2",
  }[variant];

  const linkClass = {
    desktop:
      "relative py-2 text-sm text-fg-muted transition-colors hover:text-fg " +
      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-gold " +
      "after:transition-transform after:duration-300 hover:after:scale-x-100 motion-reduce:after:transition-none",
    mobile:
      "flex min-h-14 items-center border-b border-line font-display text-2xl font-medium text-fg " +
      "transition-colors hover:text-gold",
    footer: "text-sm text-fg-muted transition-colors hover:text-fg",
  }[variant];

  return (
    <ul className={cn(listClass, className)}>
      {navigationSections.map((id) => (
        <li key={id}>
          <a href={`#${id}`} className={linkClass} onClick={onNavigate}>
            {t(`navigation.${id}`)}
          </a>
        </li>
      ))}
    </ul>
  );
}
