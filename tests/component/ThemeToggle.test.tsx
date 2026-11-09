import { beforeEach, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { renderWithProviders } from "../test-utils";

describe("ThemeToggle", () => {
  beforeEach(() => {
    document.documentElement.dataset.theme = "dark";
  });

  it("switches dark → light → dark and remembers the choice", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeToggle />);

    await user.click(screen.getByRole("button", { name: "Включи светла тема" }));
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    await user.click(screen.getByRole("button", { name: "Включи тъмна тема" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });
});
