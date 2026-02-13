import { render, screen } from "@testing-library/react";
import { EventForm } from "../EventForm";
import type { Event } from "@/db/schema";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/events",
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
  createEvent: vi.fn(),
  updateEvent: vi.fn(),
}));

const mockEvent: Event = {
  id: 1,
  name: "Ayyappa Festival 2026",
  description: "Annual festival",
  isActive: true,
  createdAt: new Date("2026-01-01"),
};

describe("EventForm", () => {
  beforeEach(() => {
    mockState = { status: "idle", message: "" };
    mockIsPending = false;
    vi.clearAllMocks();
  });

  it("renders create mode by default", () => {
    render(<EventForm />);
    expect(screen.getByText("Create New Event")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Event" })).toBeInTheDocument();
  });

  it("renders edit mode with editData", () => {
    render(<EventForm editData={mockEvent} />);
    expect(screen.getByText("Edit Event")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Update Event" })).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("pre-fills fields in edit mode", () => {
    render(<EventForm editData={mockEvent} />);
    const nameInput = screen.getByLabelText(/Event Name/) as HTMLInputElement;
    expect(nameInput.defaultValue).toBe("Ayyappa Festival 2026");
  });

  it("shows pending state for create", () => {
    mockIsPending = true;
    render(<EventForm />);
    expect(screen.getByText("Creating...")).toBeInTheDocument();
  });

  it("shows pending state for edit", () => {
    mockIsPending = true;
    render(<EventForm editData={mockEvent} />);
    expect(screen.getByText("Updating...")).toBeInTheDocument();
  });

  it("shows validation errors", () => {
    mockState = {
      status: "error",
      message: "Validation failed.",
      errors: { name: ["Event name is required"] },
      timestamp: 1,
    };
    render(<EventForm />);
    expect(screen.getByText("Event name is required")).toBeInTheDocument();
  });

  it("renders hidden id field in edit mode", () => {
    const { container } = render(<EventForm editData={mockEvent} />);
    const hiddenInput = container.querySelector('input[name="id"]') as HTMLInputElement;
    expect(hiddenInput).toBeInTheDocument();
    expect(hiddenInput.value).toBe("1");
  });
});
