import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InquiryForm } from "@/features/inquiries/InquiryForm";
import { renderWithProviders } from "../test-utils";

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Име"), "Иван Петров");
  await user.type(screen.getByLabelText("Телефон"), "+359 88 123 4567");
  await user.selectOptions(screen.getByRole("combobox", { name: "Услуга" }), "interior-cleaning");
  await user.type(screen.getByLabelText("Съобщение"), "Петна по задната седалка.");
  await user.click(screen.getByRole("checkbox"));
}

describe("InquiryForm", () => {
  it("shows a demo-mode notice while no endpoint is configured", () => {
    renderWithProviders(<InquiryForm />);
    expect(screen.getByText("Демонстрационен режим.")).toBeInTheDocument();
  });

  it("marks invalid fields and focuses the first one", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InquiryForm />);
    await user.click(screen.getByRole("button", { name: "Изпрати запитване" }));

    const name = screen.getByLabelText("Име");
    expect(name).toHaveAttribute("aria-invalid", "true");
    expect(name).toHaveAccessibleDescription("Въведете име между 2 и 100 символа.");
    expect(name).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Моля, поправете отбелязаните полета.");
  });

  it("does not claim success in demo mode and keeps the data", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InquiryForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Изпрати запитване" }));

    expect(await screen.findByText(/не е изпратено/)).toBeInTheDocument();
    expect(screen.getByLabelText("Име")).toHaveValue("Иван Петров");
  });

  it("copies the formatted inquiry", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    renderWithProviders(<InquiryForm />);
    await fillValid(user);
    await user.click(screen.getByRole("button", { name: "Копирай запитването" }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("Име: Иван Петров"));
    expect(await screen.findByText(/Запитването е копирано/)).toBeInTheDocument();
  });

  it("hides the Viber button when no Viber number is configured", () => {
    renderWithProviders(<InquiryForm />);
    expect(screen.queryByRole("button", { name: "Отвори Viber" })).not.toBeInTheDocument();
  });
});
