import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PricingSection } from "@/sections/PricingSection";
import { BookingDialog } from "@/features/inquiries/BookingDialog";
import { bundleValue, getEnabledOffers } from "@/config";
import { renderWithProviders } from "../test-utils";

const norm = (s: string | null) => (s ?? "").replace(/[  ]/g, " ");

describe("PricingSection", () => {
  it("lists every regular offer with its price, and the promo package separately", () => {
    renderWithProviders(<PricingSection />);
    const offers = getEnabledOffers();
    const list = document.querySelector("#pricing ol") as HTMLElement;
    const rows = within(list).getAllByRole("listitem", { hidden: false });
    expect(rows).toHaveLength(offers.filter((o) => !o.promo).length);
    expect(norm(rows[0]!.textContent)).toContain("40 €");
    expect(screen.getByRole("article", { name: /Промо пакет/ })).toBeInTheDocument();
  });

  it("shows what the promo package would cost separately", () => {
    const promo = getEnabledOffers().find((o) => o.promo)!;
    expect(bundleValue(promo)).toBe(60);
    renderWithProviders(<PricingSection />);
    expect(norm(screen.getByText(/поотделно/).textContent)).toBe("Вместо 60 € поотделно");
  });

  it("opens the booking form with the service and the chosen line in the message", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <PricingSection />
        <BookingDialog />
      </>,
    );
    await user.click(screen.getByRole("button", { name: /Запази час: Пране на пътнически бус/ }));
    expect(screen.getByRole("combobox", { name: "Услуга", hidden: true })).toHaveValue("interior-cleaning");
    expect(norm((screen.getByRole("textbox", { name: "Съобщение", hidden: true }) as HTMLTextAreaElement).value)).toContain(
      "Пране на пътнически бус – 60 €",
    );
  });
});
