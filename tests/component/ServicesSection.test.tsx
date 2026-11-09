import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ServicesSection } from "@/sections/ServicesSection";
import { BookingDialog } from "@/features/inquiries/BookingDialog";
import { getEnabledServices } from "@/config";
import { renderWithProviders } from "../test-utils";

describe("ServicesSection", () => {
  it("renders one card per enabled service from config, with its checklist", () => {
    renderWithProviders(<ServicesSection />);
    expect(screen.getAllByRole("article")).toHaveLength(getEnabledServices().length);
    expect(screen.getByRole("heading", { name: "Пране на интериор" })).toBeInTheDocument();
    const headlights = screen.getByRole("article", { name: "Полиране на фарове" });
    expect(within(headlights).getByText("Възстановяване на прозрачността")).toBeInTheDocument();
  });

  it("renders nothing when every service is disabled", () => {
    const { container } = renderWithProviders(<ServicesSection services={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("opens the booking form with the chosen service preselected", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ServicesSection />
        <BookingDialog />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Запази час за услугата: Полиране на фарове" }));
    expect(screen.getByRole("combobox", { name: "Услуга", hidden: true })).toHaveValue("headlight-restoration");
  });
});
