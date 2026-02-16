import { render, screen, fireEvent } from "@testing-library/react";
import { ReportFilters } from "../ReportFilters";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/reports",
  useSearchParams: () => new URLSearchParams("event=1"),
}));

describe("ReportFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders filter buttons", () => {
    render(<ReportFilters />);
    expect(screen.getByText("All")).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenditure")).toBeInTheDocument();
  });

  it("renders sort dropdown", () => {
    render(<ReportFilters />);
    const selects = screen.getAllByRole("combobox");
    expect(selects).toHaveLength(2);
  });

  it("calls router.push when filter clicked", () => {
    render(<ReportFilters />);
    fireEvent.click(screen.getByText("Income"));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("type=income"));
  });

  it("removes type param when All clicked", () => {
    render(<ReportFilters />);
    fireEvent.click(screen.getByText("All"));
    expect(mockPush).toHaveBeenCalled();
    const url = mockPush.mock.calls[0][0];
    expect(url).not.toContain("type=");
  });

  it("updates sort params on dropdown change", () => {
    render(<ReportFilters />);
    const selects = screen.getAllByRole("combobox");
    const sortSelect = selects[1];
    fireEvent.change(sortSelect, { target: { value: "amount-desc" } });
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining("sortBy=amount"));
  });
});
