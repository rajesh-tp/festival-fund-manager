import { render, screen } from "@testing-library/react";

vi.mock("@/lib/queries", () => ({
  getSummary: vi.fn(),
  getEventById: vi.fn(),
}));

import { getSummary, getEventById } from "@/lib/queries";
import HomePage from "../page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("HomePage", () => {
  it("shows select event message when no eventId", async () => {
    const jsx = await HomePage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/select or create an event/i)).toBeInTheDocument();
    expect(screen.getByText("Go to Events")).toBeInTheDocument();
  });

  it("shows select event message when eventId is NaN", async () => {
    const jsx = await HomePage({ searchParams: Promise.resolve({ event: "abc" }) });
    render(jsx);
    expect(screen.getByText(/select or create an event/i)).toBeInTheDocument();
  });

  it("shows event not found when event does not exist", async () => {
    vi.mocked(getEventById).mockResolvedValue(undefined);

    const jsx = await HomePage({ searchParams: Promise.resolve({ event: "999" }) });
    render(jsx);
    expect(screen.getByText("Event not found.")).toBeInTheDocument();
  });

  it("renders summary cards when event exists", async () => {
    vi.mocked(getEventById).mockResolvedValue({
      id: 1,
      name: "Ayyappa Festival",
      description: "",
      isActive: true,
      createdAt: new Date(),
    });
    vi.mocked(getSummary).mockResolvedValue({
      totalIncome: 10000,
      totalExpenditure: 3000,
      netTotal: 7000,
    });

    const jsx = await HomePage({ searchParams: Promise.resolve({ event: "1" }) });
    render(jsx);
    expect(screen.getByText("Ayyappa Festival")).toBeInTheDocument();
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("Total Expenditure")).toBeInTheDocument();
    expect(screen.getByText("Net Total")).toBeInTheDocument();
    expect(screen.getByText("Add New Entry")).toBeInTheDocument();
    expect(screen.getByText("View Reports")).toBeInTheDocument();
  });
});
