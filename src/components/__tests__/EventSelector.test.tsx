import { render, screen, fireEvent } from "@testing-library/react";
import { EventSelector } from "@/components/EventSelector";
import type { Event } from "@/db/schema";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("event=1"),
}));

const mockEvents: Event[] = [
  { id: 1, name: "Ayyappa Festival", description: "", isActive: true, createdAt: new Date() },
  { id: 2, name: "Navratri", description: "", isActive: true, createdAt: new Date() },
];

describe("EventSelector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when events empty", () => {
    const { container } = render(<EventSelector events={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders select with all events", () => {
    render(<EventSelector events={mockEvents} />);
    expect(screen.getByText("Select Event")).toBeInTheDocument();
    expect(screen.getByText("Ayyappa Festival")).toBeInTheDocument();
    expect(screen.getByText("Navratri")).toBeInTheDocument();
  });

  it("navigates on event change", () => {
    render(<EventSelector events={mockEvents} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "2" } });
    expect(mockPush).toHaveBeenCalledWith("/?event=2");
  });

  it("navigates to pathname only when empty selected", () => {
    render(<EventSelector events={mockEvents} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "" } });
    expect(mockPush).toHaveBeenCalledWith("/");
  });
});
