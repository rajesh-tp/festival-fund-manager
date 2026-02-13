import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SuperadminPanel } from "../SuperadminPanel";
import { deleteAllTransactions, resetUserPassword } from "@/lib/actions";

vi.mock("@/lib/actions", () => ({
  deleteAllTransactions: vi.fn(),
  resetUserPassword: vi.fn(),
}));

const mockUsers = [
  { username: "admin" },
  { username: "user1" },
];

describe("SuperadminPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders heading", () => {
    render(<SuperadminPanel users={mockUsers} eventId={1} />);
    expect(screen.getByText("Superadmin Actions")).toBeInTheDocument();
  });

  it("renders delete all button", () => {
    render(<SuperadminPanel users={mockUsers} eventId={1} />);
    expect(screen.getByText("Delete All")).toBeInTheDocument();
  });

  it("delete all requires confirmation", async () => {
    vi.mocked(deleteAllTransactions).mockResolvedValue({
      status: "success",
      message: "All deleted",
    });
    render(<SuperadminPanel users={mockUsers} eventId={1} />);

    fireEvent.click(screen.getByText("Delete All"));
    expect(screen.getByText("Confirm Delete All")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Confirm Delete All"));
    await waitFor(() => {
      expect(deleteAllTransactions).toHaveBeenCalledWith(1);
    });
  });

  it("renders user list", () => {
    render(<SuperadminPanel users={mockUsers} eventId={1} />);
    expect(screen.getByText("admin")).toBeInTheDocument();
    expect(screen.getByText("user1")).toBeInTheDocument();
  });

  it("shows empty users message", () => {
    render(<SuperadminPanel users={[]} eventId={1} />);
    expect(screen.getByText("No other users found.")).toBeInTheDocument();
  });

  it("calls resetUserPassword on button click", async () => {
    vi.mocked(resetUserPassword).mockResolvedValue({
      status: "success",
      message: "Password reset",
    });
    render(<SuperadminPanel users={mockUsers} eventId={1} />);

    const resetButtons = screen.getAllByText("Reset Password");
    fireEvent.click(resetButtons[0]);
    await waitFor(() => {
      expect(resetUserPassword).toHaveBeenCalledWith("admin");
    });
  });
});
