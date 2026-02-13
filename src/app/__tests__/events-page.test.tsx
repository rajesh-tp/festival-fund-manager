import { render, screen } from "@testing-library/react";

vi.mock("@/lib/queries", () => ({
  getAllEvents: vi.fn(),
  getEventById: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("../events/_components/EventForm", () => ({
  EventForm: ({ editData }: { editData?: unknown }) => (
    <div data-testid="event-form">{editData ? "Edit Mode" : "Create Mode"}</div>
  ),
}));

vi.mock("../events/_components/EventList", () => ({
  EventList: ({ events, isSuperadmin }: { events: unknown[]; isSuperadmin: boolean }) => (
    <div data-testid="event-list">
      {events.length} events {isSuperadmin && "(superadmin)"}
    </div>
  ),
}));

import { getAllEvents, getEventById } from "@/lib/queries";
import { getSessionUser } from "@/lib/auth";
import EventsPage from "../events/page";

beforeEach(() => {
  vi.clearAllMocks();
});

const mockEvents = [
  { id: 1, name: "Ayyappa Festival", description: "", isActive: true, createdAt: new Date() },
];

describe("EventsPage", () => {
  it("renders page with events list", async () => {
    vi.mocked(getAllEvents).mockResolvedValue(mockEvents);
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const jsx = await EventsPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText("Temple Events")).toBeInTheDocument();
    expect(screen.getByTestId("event-form")).toBeInTheDocument();
    expect(screen.getByTestId("event-list")).toBeInTheDocument();
  });

  it("loads edit data when edit param and superadmin", async () => {
    vi.mocked(getAllEvents).mockResolvedValue(mockEvents);
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    vi.mocked(getEventById).mockResolvedValue(mockEvents[0]);

    const jsx = await EventsPage({ searchParams: Promise.resolve({ edit: "1" }) });
    render(jsx);
    expect(getEventById).toHaveBeenCalledWith(1);
    expect(screen.getByText("Edit Mode")).toBeInTheDocument();
  });

  it("does not load edit data for non-superadmin", async () => {
    vi.mocked(getAllEvents).mockResolvedValue(mockEvents);
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const jsx = await EventsPage({ searchParams: Promise.resolve({ edit: "1" }) });
    render(jsx);
    expect(getEventById).not.toHaveBeenCalled();
    expect(screen.getByText("Create Mode")).toBeInTheDocument();
  });

  it("passes superadmin flag to EventList", async () => {
    vi.mocked(getAllEvents).mockResolvedValue(mockEvents);
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const jsx = await EventsPage({ searchParams: Promise.resolve({}) });
    render(jsx);
    expect(screen.getByText(/\(superadmin\)/)).toBeInTheDocument();
  });
});
