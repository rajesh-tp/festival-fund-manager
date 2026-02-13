import { render, screen } from "@testing-library/react";

vi.mock("@/lib/queries", () => ({
  getRecentEntries: vi.fn(),
  getTransactionById: vi.fn(),
}));

vi.mock("@/lib/actions", () => ({
  getAllUsers: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("../entry/_components/TransactionForm", () => ({
  TransactionForm: ({ editData, eventId }: { editData?: unknown; eventId: number }) => (
    <div data-testid="transaction-form">
      {editData ? "Edit Mode" : "Create Mode"} eventId={eventId}
    </div>
  ),
}));

vi.mock("../entry/_components/RecentEntries", () => ({
  RecentEntries: () => <div data-testid="recent-entries">Recent Entries</div>,
}));

vi.mock("../entry/_components/SuperadminPanel", () => ({
  SuperadminPanel: () => <div data-testid="superadmin-panel">Superadmin Panel</div>,
}));

import { getRecentEntries, getTransactionById } from "@/lib/queries";
import { getAllUsers } from "@/lib/actions";
import { getSessionUser } from "@/lib/auth";
import EntryPage from "../entry/page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("EntryPage", () => {
  it("shows select event message when no eventId", async () => {
    const jsx = await EntryPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/select an event to add transactions/i)).toBeInTheDocument();
    expect(screen.getByText("Go to Events")).toBeInTheDocument();
  });

  it("renders add transaction form with event", async () => {
    vi.mocked(getRecentEntries).mockResolvedValue([]);
    vi.mocked(getSessionUser).mockResolvedValue("admin");
    vi.mocked(getAllUsers).mockResolvedValue([]);

    const jsx = await EntryPage({ searchParams: Promise.resolve({ event: "1" }) });
    render(jsx);
    expect(screen.getByText("Add Transaction")).toBeInTheDocument();
    expect(screen.getByTestId("transaction-form")).toBeInTheDocument();
    expect(screen.getByTestId("recent-entries")).toBeInTheDocument();
  });

  it("renders edit transaction form when edit param provided", async () => {
    const mockTxn = {
      id: 5,
      date: "2025-01-15",
      name: "Flowers",
      amount: 500,
      type: "expenditure" as const,
      description: "Temple flowers",
      eventId: 1,
      createdAt: new Date(),
    };
    vi.mocked(getRecentEntries).mockResolvedValue([]);
    vi.mocked(getTransactionById).mockResolvedValue(mockTxn);
    vi.mocked(getSessionUser).mockResolvedValue("admin");
    vi.mocked(getAllUsers).mockResolvedValue([]);

    const jsx = await EntryPage({ searchParams: Promise.resolve({ event: "1", edit: "5" }) });
    render(jsx);
    expect(screen.getByText("Edit Transaction")).toBeInTheDocument();
    expect(screen.getByText(/Edit Mode/)).toBeInTheDocument();
    expect(getTransactionById).toHaveBeenCalledWith(5);
  });

  it("renders superadmin panel for superadmin user", async () => {
    vi.mocked(getRecentEntries).mockResolvedValue([]);
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    vi.mocked(getAllUsers).mockResolvedValue([{ username: "admin" }]);

    const jsx = await EntryPage({ searchParams: Promise.resolve({ event: "1" }) });
    render(jsx);
    expect(screen.getByTestId("superadmin-panel")).toBeInTheDocument();
    expect(getAllUsers).toHaveBeenCalled();
  });

  it("does not render superadmin panel for regular user", async () => {
    vi.mocked(getRecentEntries).mockResolvedValue([]);
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const jsx = await EntryPage({ searchParams: Promise.resolve({ event: "1" }) });
    render(jsx);
    expect(screen.queryByTestId("superadmin-panel")).not.toBeInTheDocument();
  });
});
