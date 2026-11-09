import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServicesSection } from "@/sections/ServicesSection";
import { PricingSection } from "@/sections/PricingSection";
import { ContactSection } from "@/sections/ContactSection";
import { allServices, getEnabledServices } from "@/config";
import type { Service } from "@/config/schema";
import { renderWithProviders } from "../test-utils";

const priced: Service = {
  ...allServices[0]!,
  id: "priced",
  price: { amount: 80, currency: "EUR", type: "starting_from" },
  durationMinutes: 150,
};

describe("ServicesSection", () => {
  it("renders one card per enabled service from config", () => {
    renderWithProviders(<ServicesSection />);
    expect(screen.getAllByRole("article")).toHaveLength(getEnabledServices().length);
    expect(screen.getByRole("heading", { name: "Пране на интериор" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Възстановяване на фарове" })).toBeInTheDocument();
  });

  it("shows 'price on request' and hides duration when not configured", () => {
    renderWithProviders(<ServicesSection />, { lang: "en" });
    expect(screen.getAllByText("Price on request")).toHaveLength(getEnabledServices().length);
    expect(screen.queryByText("Duration")).not.toBeInTheDocument();
  });

  it("renders configured price and duration", () => {
    renderWithProviders(<ServicesSection services={[priced]} />);
    const card = screen.getByRole("article");
    expect(within(card).getByText(/От 80/)).toBeInTheDocument();
    expect(within(card).getByText("2 ч 30 мин")).toBeInTheDocument();
  });

  it("renders nothing when every service is disabled", () => {
    const { container } = renderWithProviders(<ServicesSection services={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("remembers the chosen service for the contact section", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ServicesSection />
        <ContactSection />
      </>,
    );
    await user.click(screen.getByRole("link", { name: /Запитване за услугата\s*:\s*Възстановяване на фарове/ }));
    expect(screen.getByRole("combobox", { name: "Услуга" })).toHaveValue("headlight-restoration");
  });
});

describe("PricingSection", () => {
  it("lists every enabled service with a price label", () => {
    renderWithProviders(<PricingSection />);
    const rows = screen.getAllByRole("row").slice(1); // skip header row
    expect(rows).toHaveLength(getEnabledServices().length);
    rows.forEach((row) => expect(row).toHaveTextContent("Цена по запитване"));
  });
});
