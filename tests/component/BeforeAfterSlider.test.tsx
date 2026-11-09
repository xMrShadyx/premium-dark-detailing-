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

describe("GallerySection carousel", () => {
  it("shows every comparison with one page dot per view (two per view on wide screens)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<GallerySection />);
    const sliders = screen.getAllByRole("slider").length;
    const dots = screen.getAllByRole("button", { name: /Покажи сравнения/ });
    const perView = window.matchMedia("(min-width: 40rem)").matches ? 2 : 1;
    expect(dots).toHaveLength(Math.ceil(sliders / perView));
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    await user.click(dots[1]!);
    expect(dots[1]).toHaveAttribute("aria-current", "true");
  });
});
