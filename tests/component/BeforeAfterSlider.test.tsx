import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BeforeAfterSlider } from "@/components/gallery/BeforeAfterSlider";

describe("BeforeAfterSlider", () => {
  it("starts at 50% and moves with the keyboard", async () => {
    const user = userEvent.setup();
    render(<BeforeAfterSlider before="/b.webp" after="/a.webp" beforeLabel="Преди" afterLabel="След" label="Сравнение" />);
    const slider = screen.getByRole("slider", { name: "Сравнение" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");

    slider.focus();
    await user.keyboard("{ArrowRight}");
    expect(slider).toHaveAttribute("aria-valuenow", "55");
    await user.keyboard("{Home}");
    expect(slider).toHaveAttribute("aria-valuenow", "0");
    await user.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "100");
  });

  it("shows localized labels", () => {
    render(<BeforeAfterSlider before="/b.webp" after="/a.webp" beforeLabel="Преди" afterLabel="След" label="x" />);
    expect(screen.getByText("Преди")).toBeInTheDocument();
    expect(screen.getByText("След")).toBeInTheDocument();
  });
});

import { GallerySection } from "@/sections/GallerySection";
import { renderWithProviders } from "../test-utils";

describe("GallerySection filter", () => {
  it("filters items by service", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GallerySection />);
    const total = screen.getAllByRole("slider").length;
    await user.click(screen.getByRole("button", { name: "Пране на интериор" }));
    const filtered = screen.getAllByRole("slider").length;
    expect(filtered).toBeLessThan(total);
    expect(screen.getByRole("button", { name: "Пране на интериор" })).toHaveAttribute("aria-pressed", "true");
  });
});
