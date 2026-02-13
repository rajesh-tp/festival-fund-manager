import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DeleteButton } from "../DeleteButton";
import { deleteTransaction } from "@/lib/actions";

vi.mock("@/lib/actions", () => ({
  deleteTransaction: vi.fn(),
}));

describe("DeleteButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders delete button", () => {
    render(<DeleteButton id={1} name="Test" />);
    expect(screen.getByTitle("Delete transaction")).toBeInTheDocument();
  });

  it("shows confirm dialog on click", () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton id={1} name="Rajesh" />);
    fireEvent.click(screen.getByTitle("Delete transaction"));
    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to delete the transaction for "Rajesh"?'
    );
    confirmSpy.mockRestore();
  });

  it("does not call delete when confirm is canceled", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<DeleteButton id={1} name="Test" />);
    fireEvent.click(screen.getByTitle("Delete transaction"));
    expect(deleteTransaction).not.toHaveBeenCalled();
    vi.restoreAllMocks();
  });

  it("calls deleteTransaction when confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(deleteTransaction).mockResolvedValue({
      status: "success",
      message: "Deleted",
    });
    render(<DeleteButton id={1} name="Test" />);
    fireEvent.click(screen.getByTitle("Delete transaction"));
    await waitFor(() => {
      expect(deleteTransaction).toHaveBeenCalledWith(1);
    });
    vi.restoreAllMocks();
  });
});
