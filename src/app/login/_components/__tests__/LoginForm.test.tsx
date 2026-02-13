import { render, screen } from "@testing-library/react";
import { LoginForm } from "../LoginForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/login",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock useActionState from react
let mockState = { status: "idle" as const, message: "" };
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
  login: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    mockState = { status: "idle" as const, message: "" };
    mockIsPending = false;
    vi.clearAllMocks();
  });

  it("renders username and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("renders sign in button", () => {
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });

  it("shows pending state", () => {
    mockIsPending = true;
    render(<LoginForm />);
    expect(screen.getByText("Signing in...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows error message", () => {
    mockState = { status: "error" as const, message: "Invalid username or password.", timestamp: 1 };
    render(<LoginForm />);
    expect(screen.getByText("Invalid username or password.")).toBeInTheDocument();
  });
});
