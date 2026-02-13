import { render, screen } from "@testing-library/react";
import { SummaryBar } from "../SummaryBar";

describe("SummaryBar", () => {
  it("renders all three summary sections", () => {
    render(
      <SummaryBar totalIncome={8000} totalExpenditure={2000} netTotal={6000} />
    );
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenditure")).toBeInTheDocument();
    expect(screen.getByText("Net Total")).toBeInTheDocument();
  });

  it("formats currency amounts", () => {
    render(
      <SummaryBar totalIncome={8000} totalExpenditure={2000} netTotal={6000} />
    );
    expect(screen.getByText(/8,000/)).toBeInTheDocument();
    expect(screen.getByText(/2,000/)).toBeInTheDocument();
    expect(screen.getByText(/6,000/)).toBeInTheDocument();
  });

  it("applies blue color for positive net total", () => {
    const { container } = render(
      <SummaryBar totalIncome={8000} totalExpenditure={2000} netTotal={6000} />
    );
    const netElement = container.querySelector(".text-blue-700");
    expect(netElement).toBeInTheDocument();
  });

  it("applies red color for negative net total", () => {
    const { container } = render(
      <SummaryBar totalIncome={2000} totalExpenditure={8000} netTotal={-6000} />
    );
    const netElements = container.querySelectorAll(".text-red-700");
    // Both expenditure and negative net should have red
    expect(netElements.length).toBeGreaterThanOrEqual(2);
  });
});
