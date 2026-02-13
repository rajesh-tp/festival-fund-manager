import { render, screen } from "@testing-library/react";
import { SummaryCard } from "@/components/SummaryCard";

describe("SummaryCard", () => {
  it("renders title and formatted amount", () => {
    render(<SummaryCard title="Total Income" amount={5000} variant="income" />);
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText(/5,000/)).toBeInTheDocument();
  });

  it("renders income variant", () => {
    const { container } = render(
      <SummaryCard title="Income" amount={1000} variant="income" />
    );
    expect(container.querySelector(".bg-green-50")).toBeInTheDocument();
  });

  it("renders expenditure variant", () => {
    const { container } = render(
      <SummaryCard title="Expenditure" amount={2000} variant="expenditure" />
    );
    expect(container.querySelector(".bg-red-50")).toBeInTheDocument();
  });

  it("renders net variant", () => {
    const { container } = render(
      <SummaryCard title="Net" amount={3000} variant="net" />
    );
    expect(container.querySelector(".bg-blue-50")).toBeInTheDocument();
  });

  it("handles zero amount", () => {
    render(<SummaryCard title="Zero" amount={0} variant="income" />);
    expect(screen.getByText(/₹0/)).toBeInTheDocument();
  });
});
