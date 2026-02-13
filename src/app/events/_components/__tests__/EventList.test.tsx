import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EventList } from "../EventList";
import { deleteEvent } from "@/lib/actions";
import type { Event } from "@/db/schema";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/events",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/actions", () => ({
  deleteEvent: vi.fn(),
}));

const mockEvents: Event[] = [
  { id: 1, name: "Ayyappa Festival", description: "Annual", isActive: true, createdAt: new Date() },
  { id: 2, name: "Navratri", description: "", isActive: true, createdAt: new Date() },
];

describe("EventList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows empty state when no events", () => {
    render(<EventList events={[]} isSuperadmin={false} />);
    expect(screen.getByText(/No events yet/)).toBeInTheDocument();
  });

  it("renders all event names", () => {
    render(<EventList events={mockEvents} isSuperadmin={false} />);
    expect(screen.getByText("Ayyappa Festival")).toBeInTheDocument();
    expect(screen.getByText("Navratri")).toBeInTheDocument();
  });

  it("renders select links", () => {
    render(<EventList events={mockEvents} isSuperadmin={false} />);
    const selectLinks = screen.getAllByText("Select");
    expect(selectLinks).toHaveLength(2);
    expect(selectLinks[0].closest("a")).toHaveAttribute("href", "/?event=1");
  });

  it("hides edit and delete for non-superadmin", () => {
    render(<EventList events={mockEvents} isSuperadmin={false} />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("shows edit and delete for superadmin", () => {
    render(<EventList events={mockEvents} isSuperadmin={true} />);
    expect(screen.getAllByText("Edit")).toHaveLength(2);
    expect(screen.getAllByText("Delete")).toHaveLength(2);
  });

  it("edit links point to correct URL", () => {
    render(<EventList events={mockEvents} isSuperadmin={true} />);
    const editLinks = screen.getAllByText("Edit");
    expect(editLinks[0].closest("a")).toHaveAttribute("href", "/events?edit=1");
  });

  it("delete requires confirmation", async () => {
    vi.mocked(deleteEvent).mockResolvedValue({ status: "success", message: "Deleted" });
    render(<EventList events={mockEvents} isSuperadmin={true} />);

    const deleteButtons = screen.getAllByText("Delete");
    fireEvent.click(deleteButtons[0]);
    expect(screen.getByText("Confirm")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm"));
    await waitFor(() => {
      expect(deleteEvent).toHaveBeenCalledWith(1);
    });
  });

  it("renders event description", () => {
    render(<EventList events={mockEvents} isSuperadmin={false} />);
    expect(screen.getByText("Annual")).toBeInTheDocument();
  });
});
