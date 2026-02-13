import { render, screen } from "@testing-library/react";
import { AmountSortedList } from "../AmountSortedList";
import type { Transaction } from "@/db/schema";

const mockEntries: Transaction[] = [
  {
    id: 1, date: "2026-01-15", name: "Rajesh Kumar", amount: 5000,
    type: "income", description: "Donation", eventId: 1, createdAt: new Date(),
  },
  {
    id: 2, date: "2026-01-16", name: "Flower Shop", amount: 2000,
    type: "expenditure", description: "", eventId: 1, createdAt: new Date(),
  },
];

describe("AmountSortedList", () => {
  it("renders table headers", () => {
    render(<AmountSortedList entries={mockEntries} />);
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Type")).toBeInTheDocument();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("renders entry names", () => {
    render(<AmountSortedList entries={mockEntries} />);
    expect(screen.getAllByText("Rajesh Kumar").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Flower Shop").length).toBeGreaterThanOrEqual(1);
  });

  it("renders type badges", () => {
    render(<AmountSortedList entries={mockEntries} />);
    expect(screen.getAllByText("Income").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Expenditure").length).toBeGreaterThanOrEqual(1);
  });

  it("shows dash for empty description", () => {
    render(<AmountSortedList entries={mockEntries} />);
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });

  it("renders formatted amounts", () => {
    render(<AmountSortedList entries={mockEntries} />);
    expect(screen.getAllByText(/5,000/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/2,000/).length).toBeGreaterThanOrEqual(1);
  });
});
