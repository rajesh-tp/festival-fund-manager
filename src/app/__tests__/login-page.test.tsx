import { render, screen } from "@testing-library/react";

vi.mock("@/lib/auth", () => ({
  verifySession: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { verifySession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginPage from "../login/page";

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(redirect).mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
});

describe("LoginPage", () => {
  it("redirects to /entry when already authenticated", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);

    await expect(LoginPage()).rejects.toThrow("REDIRECT:/entry");
    expect(redirect).toHaveBeenCalledWith("/entry");
  });

  it("renders login form when not authenticated", async () => {
    vi.mocked(verifySession).mockResolvedValue(false);

    const jsx = await LoginPage();
    render(jsx);
    expect(screen.getByText("Admin Login")).toBeInTheDocument();
    expect(screen.getByText(/sign in to manage transactions/i)).toBeInTheDocument();
  });
});
