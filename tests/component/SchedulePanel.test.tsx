import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SchedulePanel } from "@/admin/SchedulePanel";
import type { InquiryRow } from "@/admin/api";

const base: InquiryRow = {
  id: "1",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  name: "Иван",
  phone: "+359881234567",
  email: null,
  service_id: "interior-cleaning",
  vehicle: null,
  preferred_date: null,
  message: "Петна по седалките.",
  lang: "bg",
  status: "scheduled",
  scheduled_at: null,
  duration_minutes: 120,
  admin_note: null,
  price: null,
  source: "website",
};

function at(daysAhead: number, hour: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

describe("SchedulePanel", () => {
  it("lists upcoming scheduled jobs and flags overlaps", () => {
    render(
      <SchedulePanel
        inquiries={[
          { ...base, id: "a", name: "Иван", scheduled_at: at(1, 9) },
          { ...base, id: "b", name: "Мария", scheduled_at: at(1, 10) }, // overlaps 09:00–11:00
          { ...base, id: "c", name: "Петър", scheduled_at: at(2, 9) },
          { ...base, id: "d", name: "Нова", status: "new", scheduled_at: null },
        ]}
      />,
    );
    expect(screen.getByText(/Иван/)).toBeInTheDocument();
    expect(screen.getByText(/Петър/)).toBeInTheDocument();
    expect(screen.queryByText(/Нова/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Застъпва се с друг час")).toHaveLength(2);
  });

  it("shows an empty state", () => {
    render(<SchedulePanel inquiries={[]} />);
    expect(screen.getByText("Няма насрочени часове.")).toBeInTheDocument();
  });
});
