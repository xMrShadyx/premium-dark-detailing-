import { useTranslation } from "react-i18next";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/cn";

/** Switches between light and dark. The label names the theme it switches to. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const toLight = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={toLight ? t("a11y.switchToLight") : t("a11y.switchToDark")}
      title={toLight ? t("a11y.switchToLight") : t("a11y.switchToDark")}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full text-fg-muted transition-colors hover:bg-surface hover:text-fg",
        className,
      )}
    >
      {toLight ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    </button>
  );
}
