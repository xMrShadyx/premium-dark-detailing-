import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { STORAGE_KEY } from "@/lib/locale";
import { renderWithProviders } from "../test-utils";

function Probe() {
  const { t } = useTranslation();
  return <h1>{t("hero.title")}</h1>;
}

describe("LanguageSwitcher", () => {
  it("switches /bg/#gallery → /en/#gallery and updates content, lang and storage", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <LanguageSwitcher />
        <Probe />
      </>,
      { lang: "bg", hash: "#pricing" },
    );

    expect(screen.getByRole("heading")).toHaveTextContent("Всеки детайл има значение.");
    expect(screen.getByRole("link", { name: "bg" })).toHaveAttribute("aria-current", "true");

    await user.click(screen.getByRole("link", { name: "en" }));

    expect(window.location.pathname).toBe("/en/");
    expect(window.location.hash).toBe("#pricing");
    expect(document.documentElement.lang).toBe("en");
    expect(screen.getByRole("heading")).toHaveTextContent("Every detail matters.");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe("en");
  });

  it("uses real, crawlable hrefs", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByRole("link", { name: "en" })).toHaveAttribute("href", "/en/");
    expect(screen.getByRole("link", { name: "bg" })).toHaveAttribute("href", "/bg/");
  });
});
