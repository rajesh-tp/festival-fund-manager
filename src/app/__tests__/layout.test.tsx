import { render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  verifySession: vi.fn(),
}));

vi.mock("@/lib/queries", () => ({
  getAllEvents: vi.fn(),
}));

vi.mock("@/components/Navbar", () => ({
  Navbar: ({ isAuthenticated }: { isAuthenticated: boolean }) => (
    <nav data-testid="navbar">{isAuthenticated ? "Logged in" : "Logged out"}</nav>
  ),
}));

import { verifySession } from "@/lib/auth";
import { getAllEvents } from "@/lib/queries";
import RootLayout from "../layout";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("RootLayout", () => {
  it("renders children, navbar, and footer", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);
    vi.mocked(getAllEvents).mockResolvedValue([]);

    const jsx = await RootLayout({ children: <div>Test Content</div> });
    const { container } = render(jsx);
    expect(container.querySelector("footer")).toBeTruthy();
    expect(screen.getByText("Test Content")).toBeInTheDocument();
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("passes auth state to navbar", async () => {
    vi.mocked(verifySession).mockResolvedValue(false);
    vi.mocked(getAllEvents).mockResolvedValue([]);

    const jsx = await RootLayout({ children: <div>Child</div> });
    render(jsx);
    expect(screen.getByText("Logged out")).toBeInTheDocument();
  });
});
