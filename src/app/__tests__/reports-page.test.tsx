import { render, screen } from "@testing-library/react";

vi.mock("@/lib/queries", () => ({
  getTransactionsGroupedByDate: vi.fn(),
  getSummary: vi.fn(),
  getEventById: vi.fn(),
}));

vi.mock("../reports/_components/SummaryBar", () => ({
  SummaryBar: () => <div data-testid="summary-bar">Summary Bar</div>,
}));

vi.mock("../reports/_components/ReportFilters", () => ({
  ReportFilters: () => <div data-testid="report-filters">Filters</div>,
}));

vi.mock("../reports/_components/DateGroup", () => ({
  DateGroup: ({ date }: { date: string }) => <div data-testid="date-group">{date}</div>,
}));

vi.mock("../reports/_components/AmountSortedList", () => ({
  AmountSortedList: () => <div data-testid="amount-sorted-list">Sorted List</div>,
}));

vi.mock("../reports/_components/DownloadPdfButton", () => ({
  DownloadPdfButton: () => <div data-testid="download-pdf">Download</div>,
}));

import { getTransactionsGroupedByDate, getSummary, getEventById } from "@/lib/queries";
import ReportsPage from "../reports/page";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockEvent = {
  id: 1,
  name: "Ayyappa Festival",
  description: "",
  isActive: true,
  createdAt: new Date(),
};

describe("ReportsPage", () => {
  it("shows select event message when no eventId", async () => {
    const jsx = await ReportsPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/select an event to view reports/i)).toBeInTheDocument();
  });

  it("shows event not found for invalid event", async () => {
    vi.mocked(getEventById).mockResolvedValue(undefined);

    const jsx = await ReportsPage({ searchParams: Promise.resolve({ event: "999" }) });
    render(jsx);
    expect(screen.getByText("Event not found.")).toBeInTheDocument();
  });

  it("renders reports with date-grouped transactions", async () => {
    vi.mocked(getEventById).mockResolvedValue(mockEvent);
    vi.mocked(getSummary).mockResolvedValue({
      totalIncome: 5000,
      totalExpenditure: 1000,
      netTotal: 4000,
    });
    const grouped = new Map([
      [
        "2025-01-15",
        {
          entries: [
            { id: 1, date: "2025-01-15", name: "Donation", type: "income" as const, amount: 5000, description: "", eventId: 1, createdAt: new Date() },
          ],
          incomeTotal: 5000,
          expenditureTotal: 0,
        },
      ],
    ]);
    vi.mocked(getTransactionsGroupedByDate).mockResolvedValue({
      grouped,
      sorted: null,
    });

    const jsx = await ReportsPage({ searchParams: Promise.resolve({ event: "1" }) });
    render(jsx);
    expect(screen.getByText("Transaction Reports")).toBeInTheDocument();
    expect(screen.getByText("Ayyappa Festival")).toBeInTheDocument();
    expect(screen.getByTestId("summary-bar")).toBeInTheDocument();
    expect(screen.getByTestId("report-filters")).toBeInTheDocument();
    expect(screen.getByTestId("date-group")).toBeInTheDocument();
    expect(screen.getByTestId("download-pdf")).toBeInTheDocument();
  });

  it("renders empty state when no transactions", async () => {
    vi.mocked(getEventById).mockResolvedValue(mockEvent);
    vi.mocked(getSummary).mockResolvedValue({
      totalIncome: 0,
      totalExpenditure: 0,
      netTotal: 0,
    });
    vi.mocked(getTransactionsGroupedByDate).mockResolvedValue({
      grouped: new Map(),
      sorted: null,
    });

    const jsx = await ReportsPage({ searchParams: Promise.resolve({ event: "1" }) });
    render(jsx);
    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
    expect(screen.queryByTestId("download-pdf")).not.toBeInTheDocument();
  });

  it("renders amount-sorted list when sortBy is amount", async () => {
    vi.mocked(getEventById).mockResolvedValue(mockEvent);
    vi.mocked(getSummary).mockResolvedValue({
      totalIncome: 5000,
      totalExpenditure: 0,
      netTotal: 5000,
    });
    vi.mocked(getTransactionsGroupedByDate).mockResolvedValue({
      grouped: null,
      sorted: [
        { id: 1, date: "2025-01-15", name: "Donation", type: "income" as const, amount: 5000, description: "", eventId: 1, createdAt: new Date() },
      ],
    });

    const jsx = await ReportsPage({
      searchParams: Promise.resolve({ event: "1", sortBy: "amount", sortOrder: "desc" }),
    });
    render(jsx);
    expect(screen.getByTestId("amount-sorted-list")).toBeInTheDocument();
    expect(screen.queryByTestId("date-group")).not.toBeInTheDocument();
  });

  it("renders empty state message with type filter info", async () => {
    vi.mocked(getEventById).mockResolvedValue(mockEvent);
    vi.mocked(getSummary).mockResolvedValue({
      totalIncome: 0,
      totalExpenditure: 0,
      netTotal: 0,
    });
    vi.mocked(getTransactionsGroupedByDate).mockResolvedValue({
      grouped: new Map(),
      sorted: null,
    });

    const jsx = await ReportsPage({
      searchParams: Promise.resolve({ event: "1", type: "income" }),
    });
    render(jsx);
    expect(screen.getByText(/no income entries recorded yet/i)).toBeInTheDocument();
  });
});
