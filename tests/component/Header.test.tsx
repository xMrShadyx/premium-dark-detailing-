import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "@/components/layout/Header";
import { renderWithProviders } from "../test-utils";

describe("Header", () => {
  it("renders navigation links that point to existing section anchors", () => {
    renderWithProviders(<Header />);
    const nav = screen.getByRole("navigation", { name: "Основна навигация" });
    const hrefs = within(nav)
      .getAllByRole("link")
      .map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["#services", "#pricing", "#gallery", "#contact"]);
  });

  it("renders the logo as a link home, named after the business", () => {
    renderWithProviders(<Header />);
    const logo = screen.getByRole("img", { name: "MM Detailing" });
    expect(logo.closest("a")).toHaveAttribute("href", "#home");
  });

  it("opens the mobile menu, locks scroll, and closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    const trigger = screen.getByRole("button", { name: "Отвори менюто" });

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("navigation", { name: "Мобилна навигация" })).toBeVisible();
    expect(document.body.style.overflow).toBe("hidden");

    await user.keyboard("{Escape}");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
    expect(trigger).toHaveFocus();
  });

  it("closes the mobile menu after selecting a link", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Header />);
    await user.click(screen.getByRole("button", { name: "Отвори менюто" }));
    const mobileNav = screen.getByRole("navigation", { name: "Мобилна навигация" });
    await user.click(within(mobileNav).getByRole("link", { name: "Цени" }));
    expect(screen.getByRole("button", { name: "Отвори менюто" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
});
