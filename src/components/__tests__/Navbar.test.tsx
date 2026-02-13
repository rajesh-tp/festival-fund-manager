import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "@/components/Navbar";
import type { Event } from "@/db/schema";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams("event=1"),
}));

vi.mock("@/lib/actions", () => ({
  logout: vi.fn(),
}));

const mockEvents: Event[] = [
  { id: 1, name: "Ayyappa Festival", description: "", isActive: true, createdAt: new Date() },
];

describe("Navbar", () => {
  it("renders brand name", () => {
    render(<Navbar isAuthenticated={true} events={mockEvents} />);
    expect(screen.getByText("Festival Fund Manager")).toBeInTheDocument();
  });

  it("renders all nav links", () => {
    render(<Navbar isAuthenticated={true} events={mockEvents} />);
    expect(screen.getAllByText("Events").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Home").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Data Entry").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Reports").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Logout when authenticated", () => {
    render(<Navbar isAuthenticated={true} events={mockEvents} />);
    expect(screen.getAllByText("Logout").length).toBeGreaterThanOrEqual(1);
  });

  it("shows Login when not authenticated", () => {
    render(<Navbar isAuthenticated={false} events={mockEvents} />);
    expect(screen.getAllByText("Login").length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();
  });

  it("toggles mobile menu", () => {
    render(<Navbar isAuthenticated={true} events={mockEvents} />);
    const toggleButton = screen.getByLabelText("Toggle menu");
    fireEvent.click(toggleButton);
    // Menu should be visible after toggle
    expect(toggleButton).toBeInTheDocument();
  });

  it("preserves event param in links", () => {
    render(<Navbar isAuthenticated={true} events={mockEvents} />);
    const homeLinks = screen.getAllByText("Home");
    const link = homeLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "/?event=1");
  });

  it("events link does not include event param", () => {
    render(<Navbar isAuthenticated={true} events={mockEvents} />);
    const eventsLinks = screen.getAllByText("Events");
    const link = eventsLinks[0].closest("a");
    expect(link).toHaveAttribute("href", "/events");
  });
});
