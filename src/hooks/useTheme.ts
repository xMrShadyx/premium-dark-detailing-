import { useCallback, useEffect, useState } from "react";
import { applyTheme, currentTheme, readStoredTheme, storeTheme, type Theme } from "@/lib/theme";

/**
 * Light / dark theme. Follows the OS setting until the visitor chooses;
 * an explicit choice is remembered and wins from then on.
 */
export function useTheme(): { theme: Theme; toggleTheme: () => void } {
  const [theme, setTheme] = useState<Theme>(currentTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Track OS changes only while the visitor has not made a choice.
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: light)");
    if (!media) return;
    const onChange = (e: MediaQueryListEvent) => {
      if (!readStoredTheme()) setTheme(e.matches ? "light" : "dark");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      storeTheme(next);
      return next;
    });
  }, []);

  return { theme, toggleTheme };
}
