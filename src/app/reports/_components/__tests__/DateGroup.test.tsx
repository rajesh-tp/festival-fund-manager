import { render, screen } from "@testing-library/react";
import { DateGroup } from "../DateGroup";
import type { DateGroupData } from "@/lib/queries";
import type { Transaction } from "@/db/schema";

const mockEntries: Transaction[] = [
  {
    id: 1, date: "2026-01-15", name: "Rajesh Kumar", amount: 5000,
    type: "income", description: "Donation", eventId: 1, createdAt: new Date(),
  },
  {
    id: 2, date: "2026-01-15", name: "Flower Shop", amount: 2000,
    type: "expenditure", description: "", eventId: 1, createdAt: new Date(),
  },
];

const mockData: DateGroupData = {
  entries: mockEntries,
  incomeTotal: 5000,
  expenditureTotal: 2000,
};

describe("DateGroup", () => {
  it("renders formatted date header", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getByText(/15/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it("renders all entry names", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getAllByText("Rajesh Kumar").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Flower Shop").length).toBeGreaterThanOrEqual(1);
  });

  it("renders type badges", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getAllByText("Income").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Expenditure").length).toBeGreaterThanOrEqual(1);
  });

  it("renders description or dash for empty description", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getAllByText("Donation").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("-").length).toBeGreaterThanOrEqual(1);
  });

  it("shows income subtotal when present", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getByText(/Income:/)).toBeInTheDocument();
  });

  it("shows expenditure subtotal when present", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getByText(/Expenditure:/)).toBeInTheDocument();
  });

  it("hides income subtotal when zero", () => {
    const data: DateGroupData = { entries: mockEntries, incomeTotal: 0, expenditureTotal: 2000 };
    render(<DateGroup date="2026-01-15" data={data} />);
    expect(screen.queryByText(/Income:/)).not.toBeInTheDocument();
  });

  it("shows net subtotal", () => {
    render(<DateGroup date="2026-01-15" data={mockData} />);
    expect(screen.getByText(/Net:/)).toBeInTheDocument();
  });
});
