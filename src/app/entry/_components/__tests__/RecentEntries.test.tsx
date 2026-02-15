import { render, screen, fireEvent } from "@testing-library/react";
import { RecentEntries } from "../RecentEntries";
import type { Transaction } from "@/db/schema";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/entry",
  useSearchParams: () => new URLSearchParams("event=1"),
}));

vi.mock("@/lib/actions", () => ({
  deleteTransaction: vi.fn(),
}));

const mockEntries: Transaction[] = [
  {
    id: 1, date: "2026-01-15", name: "Rajesh Kumar", amount: 5000,
    type: "income", paymentMode: "cash", description: "Donation", eventId: 1, createdAt: new Date(),
  },
  {
    id: 2, date: "2026-01-16", name: "Flower Shop", amount: 2000,
    type: "expenditure", paymentMode: "bank", description: "", eventId: 1, createdAt: new Date(),
  },
];

describe("RecentEntries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no entries", () => {
    render(<RecentEntries entries={[]} eventId={1} />);
    expect(screen.getByText(/No entries yet/)).toBeInTheDocument();
  });

  it("renders entry names", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    expect(screen.getAllByText("Rajesh Kumar").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Flower Shop").length).toBeGreaterThanOrEqual(1);
  });

  it("renders type badges", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    expect(screen.getAllByText("Income").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Expenditure").length).toBeGreaterThanOrEqual(1);
  });

  it("renders formatted amounts", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    expect(screen.getAllByText(/5,000/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders edit links with correct href", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    const editLinks = screen.getAllByTitle("Edit transaction");
    expect(editLinks[0].closest("a")).toHaveAttribute("href", "/entry?event=1&edit=1");
  });

  it("renders Recent Entries heading", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    expect(screen.getByText("Recent Entries")).toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    expect(screen.getByPlaceholderText("Search by name...")).toBeInTheDocument();
  });

  it("navigates with search param on search button click", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    const input = screen.getByPlaceholderText("Search by name...");
    fireEvent.change(input, { target: { value: "Rajesh" } });
    fireEvent.click(screen.getByRole("button", { name: "" }));
    expect(mockPush).toHaveBeenCalledWith("/entry?event=1&search=Rajesh");
  });

  it("navigates with search param on Enter key", () => {
    render(<RecentEntries entries={mockEntries} eventId={1} />);
    const input = screen.getByPlaceholderText("Search by name...");
    fireEvent.change(input, { target: { value: "Flower" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(mockPush).toHaveBeenCalledWith("/entry?event=1&search=Flower");
  });
});
