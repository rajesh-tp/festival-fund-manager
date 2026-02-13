import {
  createSession,
  deleteSession,
  verifySession,
  getSessionUser,
} from "../auth";

// ---------------------------------------------------------------------------
// Mock cookie store
// ---------------------------------------------------------------------------
const mockCookieStore = {
  get: vi.fn() as ReturnType<typeof vi.fn>,
  set: vi.fn() as ReturnType<typeof vi.fn>,
  delete: vi.fn() as ReturnType<typeof vi.fn>,
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => mockCookieStore),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

/**
 * Calls createSession for the given username and returns the token string
 * that was passed to mockCookieStore.set.
 */
async function createAndCaptureToken(username: string): Promise<string> {
  await createSession(username);
  const [, token] = mockCookieStore.set.mock.calls.at(-1)!;
  return token as string;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
beforeEach(() => {
  vi.restoreAllMocks();
  mockCookieStore.get.mockReset();
  mockCookieStore.set.mockReset();
  mockCookieStore.delete.mockReset();
});

describe("createSession", () => {
  it("sets a cookie with the correct name, options, and a token containing the username", async () => {
    await createSession("alice");

    expect(mockCookieStore.set).toHaveBeenCalledTimes(1);

    const [cookieName, token, options] = mockCookieStore.set.mock.calls[0];

    // Cookie name
    expect(cookieName).toBe("session");

    // Token is a string with two base64url parts separated by a dot
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(2);

    // Decode the payload portion and verify username is embedded
    const payloadStr = token.split(".")[0];
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString());
    expect(payload.username).toBe("alice");
    expect(payload.exp).toBeGreaterThan(Date.now());

    // Cookie options
    expect(options).toMatchObject({
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_DURATION_MS / 1000,
    });
  });
});

describe("deleteSession", () => {
  it("calls cookieStore.delete with the session cookie name", async () => {
    await deleteSession();

    expect(mockCookieStore.delete).toHaveBeenCalledTimes(1);
    expect(mockCookieStore.delete).toHaveBeenCalledWith("session");
  });
});

describe("verifySession", () => {
  it("returns true for a valid token", async () => {
    const token = await createAndCaptureToken("bob");
    mockCookieStore.get.mockReturnValue({ value: token });

    const result = await verifySession();

    expect(result).toBe(true);
  });

  it("returns false when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const result = await verifySession();

    expect(result).toBe(false);
  });

  it("returns false for a tampered token", async () => {
    const token = await createAndCaptureToken("bob");
    // Flip the last character of the signature to tamper with it
    const tampered = token.slice(0, -1) + (token.at(-1) === "A" ? "B" : "A");
    mockCookieStore.get.mockReturnValue({ value: tampered });

    const result = await verifySession();

    expect(result).toBe(false);
  });

  it("returns false for an expired token", async () => {
    // Freeze time so the token is created with a known expiry
    const now = Date.now();
    const dateNowSpy = vi.spyOn(Date, "now").mockReturnValue(now);

    const token = await createAndCaptureToken("bob");

    // Jump forward past the 24-hour expiry
    dateNowSpy.mockReturnValue(now + SESSION_DURATION_MS + 1);

    mockCookieStore.get.mockReturnValue({ value: token });

    const result = await verifySession();

    expect(result).toBe(false);
  });
});

describe("getSessionUser", () => {
  it("returns the username from a valid token", async () => {
    const token = await createAndCaptureToken("carol");
    mockCookieStore.get.mockReturnValue({ value: token });

    const user = await getSessionUser();

    expect(user).toBe("carol");
  });

  it("returns null when no cookie is present", async () => {
    mockCookieStore.get.mockReturnValue(undefined);

    const user = await getSessionUser();

    expect(user).toBeNull();
  });

  it("returns null for a tampered token", async () => {
    const token = await createAndCaptureToken("carol");
    const tampered = token.slice(0, -1) + (token.at(-1) === "A" ? "B" : "A");
    mockCookieStore.get.mockReturnValue({ value: tampered });

    const user = await getSessionUser();

    expect(user).toBeNull();
  });
});
