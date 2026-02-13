import { render, screen } from "@testing-library/react";
import { TransactionForm } from "../TransactionForm";
import type { Transaction } from "@/db/schema";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/entry",
  useSearchParams: () => new URLSearchParams(),
}));

let mockState: Record<string, unknown> = { status: "idle", message: "" };
let mockIsPending = false;
const mockFormAction = vi.fn();

vi.mock("react", async () => {
  const actual = await vi.importActual("react");
  return {
    ...actual,
    useActionState: vi.fn(() => [mockState, mockFormAction, mockIsPending]),
  };
});

vi.mock("@/lib/actions", () => ({
  addTransaction: vi.fn(),
  updateTransaction: vi.fn(),
}));

vi.mock("@/lib/utils", async () => {
  const actual = await vi.importActual("@/lib/utils");
  return {
    ...actual,
    getTodayISO: () => "2026-02-13",
  };
});

const mockTransaction: Transaction = {
  id: 1,
  date: "2026-01-15",
  name: "Rajesh Kumar",
  amount: 5000,
  type: "income",
  description: "Donation",
  eventId: 1,
  createdAt: new Date(),
};

describe("TransactionForm", () => {
  beforeEach(() => {
    mockState = { status: "idle", message: "" };
    mockIsPending = false;
    vi.clearAllMocks();
  });

  it("renders create mode", () => {
    render(<TransactionForm eventId={1} />);
    expect(screen.getByRole("button", { name: "Add Transaction" })).toBeInTheDocument();
  });

  it("renders edit mode with editData", () => {
    render(<TransactionForm editData={mockTransaction} eventId={1} />);
    expect(screen.getByRole("button", { name: "Update Transaction" })).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("has hidden eventId input", () => {
    const { container } = render(<TransactionForm eventId={1} />);
    const hidden = container.querySelector('input[name="eventId"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.value).toBe("1");
  });

  it("has hidden id input in edit mode", () => {
    const { container } = render(<TransactionForm editData={mockTransaction} eventId={1} />);
    const hidden = container.querySelector('input[name="id"]') as HTMLInputElement;
    expect(hidden).toBeInTheDocument();
    expect(hidden.value).toBe("1");
  });

  it("defaults date to today in create mode", () => {
    render(<TransactionForm eventId={1} />);
    const dateInput = screen.getByLabelText(/Date/) as HTMLInputElement;
    expect(dateInput.defaultValue).toBe("2026-02-13");
  });

  it("pre-fills date in edit mode", () => {
    render(<TransactionForm editData={mockTransaction} eventId={1} />);
    const dateInput = screen.getByLabelText(/Date/) as HTMLInputElement;
    expect(dateInput.defaultValue).toBe("2026-01-15");
  });

  it("shows pending state for add", () => {
    mockIsPending = true;
    render(<TransactionForm eventId={1} />);
    expect(screen.getByText("Adding...")).toBeInTheDocument();
  });

  it("shows pending state for edit", () => {
    mockIsPending = true;
    render(<TransactionForm editData={mockTransaction} eventId={1} />);
    expect(screen.getByText("Updating...")).toBeInTheDocument();
  });

  it("shows field errors", () => {
    mockState = {
      status: "error",
      message: "Validation failed.",
      errors: { name: ["Name is required"], amount: ["Amount must be greater than 0"] },
      timestamp: 1,
    };
    render(<TransactionForm eventId={1} />);
    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(screen.getByText("Amount must be greater than 0")).toBeInTheDocument();
  });

  it("renders all form fields", () => {
    render(<TransactionForm eventId={1} />);
    expect(screen.getByLabelText(/Date/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name of Person/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/)).toBeInTheDocument();
    expect(screen.getByText("Income")).toBeInTheDocument();
    expect(screen.getByText("Expenditure")).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/)).toBeInTheDocument();
  });
});
