// ---------------------------------------------------------------------------
// Tests for src/lib/actions.ts
// ---------------------------------------------------------------------------

import crypto from "crypto";

// --- Mocks (must be declared before imports) --------------------------------

const mockChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  get: vi.fn(),
  all: vi.fn(() => []),
  run: vi.fn(),
};

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => mockChain),
    insert: vi.fn(() => mockChain),
    update: vi.fn(() => mockChain),
    delete: vi.fn(() => mockChain),
  },
}));

vi.mock("@/db/schema", () => ({
  events: { id: "events.id" },
  transactions: { id: "txn.id", eventId: "txn.eventId" },
  users: { username: "users.username" },
}));

vi.mock("drizzle-orm", () => ({
  eq: vi.fn((a: unknown, b: unknown) => [a, b]),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  createSession: vi.fn(),
  deleteSession: vi.fn(),
  verifySession: vi.fn(),
  getSessionUser: vi.fn(),
}));

// redirect throws in Next.js to halt execution
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

// --- Imports ----------------------------------------------------------------

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  createSession,
  deleteSession,
  verifySession,
  getSessionUser,
} from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  login,
  logout,
  createEvent,
  updateEvent,
  deleteEvent,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  deleteAllTransactions,
  resetUserPassword,
  getAllUsers,
  type ActionState,
} from "@/lib/actions";

// --- Helpers ----------------------------------------------------------------

function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, val] of Object.entries(data)) fd.set(key, val);
  return fd;
}

const initialState: ActionState = { status: "idle", message: "" };

function resetChain() {
  for (const fn of Object.values(mockChain)) {
    (fn as ReturnType<typeof vi.fn>).mockClear();
  }
  mockChain.from.mockReturnThis();
  mockChain.where.mockReturnThis();
  mockChain.set.mockReturnThis();
  mockChain.values.mockReturnThis();
  mockChain.get.mockReset();
  mockChain.all.mockReset().mockReturnValue([]);
  mockChain.run.mockReset();

  for (const method of ["select", "insert", "update", "delete"] as const) {
    (db[method] as ReturnType<typeof vi.fn>).mockClear().mockReturnValue(mockChain);
  }
}

// --- Setup ------------------------------------------------------------------

beforeEach(() => {
  resetChain();
  vi.mocked(revalidatePath).mockClear();
  vi.mocked(createSession).mockClear();
  vi.mocked(deleteSession).mockClear();
  vi.mocked(verifySession).mockClear();
  vi.mocked(getSessionUser).mockClear();
  vi.mocked(redirect).mockClear().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  });
});

// ---- login -----------------------------------------------------------------

describe("login", () => {
  const validPassword = "secret123";
  const validHash = crypto.createHash("sha256").update(validPassword).digest("hex");

  it("redirects to /events on valid credentials", async () => {
    mockChain.get.mockReturnValue({
      username: "admin",
      passwordHash: validHash,
    });

    const fd = createFormData({ username: "admin", password: validPassword });

    await expect(login(initialState, fd)).rejects.toThrow("REDIRECT:/events");

    expect(db.select).toHaveBeenCalled();
    expect(createSession).toHaveBeenCalledWith("admin");
    expect(redirect).toHaveBeenCalledWith("/events");
  });

  it("returns error when user is not found", async () => {
    mockChain.get.mockReturnValue(undefined);

    const fd = createFormData({ username: "nobody", password: "pass" });
    const result = await login(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/invalid/i);
  });

  it("returns error when password is wrong", async () => {
    mockChain.get.mockReturnValue({
      username: "admin",
      passwordHash: "wrong-hash-value",
    });

    const fd = createFormData({ username: "admin", password: "badpassword" });
    const result = await login(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/invalid/i);
  });
});

// ---- logout ----------------------------------------------------------------

describe("logout", () => {
  it("calls deleteSession and redirects to /login", async () => {
    await expect(logout()).rejects.toThrow("REDIRECT:/login");

    expect(deleteSession).toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});

// ---- createEvent -----------------------------------------------------------

describe("createEvent", () => {
  it("inserts a valid event, revalidates paths, and returns success", async () => {
    const fd = createFormData({ name: "Diwali 2025", description: "Festival of lights" });
    const result = await createEvent(initialState, fd);

    expect(result.status).toBe("success");
    expect(result.message).toContain("Diwali 2025");
    expect(db.insert).toHaveBeenCalled();
    expect(mockChain.values).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/events");
    expect(revalidatePath).toHaveBeenCalledWith("/");
  });

  it("returns validation error when name is empty", async () => {
    const fd = createFormData({ name: "", description: "" });
    const result = await createEvent(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/validation/i);
    expect(result.errors).toBeDefined();
  });

  it("returns generic error when DB throws", async () => {
    mockChain.run.mockImplementation(() => {
      throw new Error("DB_FAILURE");
    });

    const fd = createFormData({ name: "Good Name", description: "" });
    const result = await createEvent(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/failed/i);
  });
});

// ---- updateEvent -----------------------------------------------------------

describe("updateEvent", () => {
  it("returns permission error for non-superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const fd = createFormData({ id: "1", name: "New Name", description: "" });
    const result = await updateEvent(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/superadmin/i);
  });

  it("updates event when user is superadmin with valid data", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const fd = createFormData({ id: "1", name: "Updated Event", description: "desc" });
    const result = await updateEvent(initialState, fd);

    expect(result.status).toBe("success");
    expect(result.message).toContain("Updated Event");
    expect(db.update).toHaveBeenCalled();
    expect(mockChain.set).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/events");
  });

  it("returns error for invalid event ID", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const fd = createFormData({ id: "abc", name: "Name", description: "" });
    const result = await updateEvent(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/invalid event id/i);
  });

  it("returns validation error for empty name", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const fd = createFormData({ id: "1", name: "", description: "" });
    const result = await updateEvent(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/validation/i);
    expect(result.errors).toBeDefined();
  });
});

// ---- deleteEvent -----------------------------------------------------------

describe("deleteEvent", () => {
  it("returns permission error for non-superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const result = await deleteEvent(1);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/superadmin/i);
  });

  it("deletes transactions then event and revalidates paths", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const result = await deleteEvent(5);

    expect(result.status).toBe("success");
    expect(result.message).toMatch(/deleted/i);

    // Should call delete twice: once for transactions, once for event
    expect(db.delete).toHaveBeenCalledTimes(2);
    expect(revalidatePath).toHaveBeenCalledWith("/events");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/entry");
    expect(revalidatePath).toHaveBeenCalledWith("/reports");
  });

  it("returns error when DB throws", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    mockChain.run.mockImplementation(() => {
      throw new Error("DB_FAILURE");
    });

    const result = await deleteEvent(1);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/failed/i);
  });
});

// ---- addTransaction --------------------------------------------------------

describe("addTransaction", () => {
  it("inserts a valid transaction and returns success with name and amount", async () => {
    const fd = createFormData({
      date: "2025-10-01",
      name: "Decorations",
      amount: "1500",
      type: "expenditure",
      description: "Lights and garlands",
      eventId: "1",
    });

    const result = await addTransaction(initialState, fd);

    expect(result.status).toBe("success");
    expect(result.message).toContain("Decorations");
    expect(result.message).toContain("1500");
    expect(db.insert).toHaveBeenCalled();
    expect(mockChain.values).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/entry");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/reports");
  });

  it("returns validation error when required fields are missing", async () => {
    const fd = createFormData({ date: "", name: "", amount: "", type: "", eventId: "" });
    const result = await addTransaction(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/validation/i);
    expect(result.errors).toBeDefined();
  });

  it("returns error when DB throws", async () => {
    mockChain.run.mockImplementation(() => {
      throw new Error("DB_FAILURE");
    });

    const fd = createFormData({
      date: "2025-10-01",
      name: "Donation",
      amount: "5000",
      type: "income",
      description: "",
      eventId: "1",
    });

    const result = await addTransaction(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/failed/i);
  });
});

// ---- updateTransaction -----------------------------------------------------

describe("updateTransaction", () => {
  it("returns unauthorized when session is not valid", async () => {
    vi.mocked(verifySession).mockResolvedValue(false);

    const fd = createFormData({
      id: "1",
      date: "2025-10-01",
      name: "Flowers",
      amount: "500",
      type: "expenditure",
      description: "",
      eventId: "1",
    });

    const result = await updateTransaction(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/unauthorized/i);
  });

  it("updates a valid transaction and returns success", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);

    const fd = createFormData({
      id: "10",
      date: "2025-10-02",
      name: "Sound System",
      amount: "8000",
      type: "expenditure",
      description: "DJ setup",
      eventId: "1",
    });

    const result = await updateTransaction(initialState, fd);

    expect(result.status).toBe("success");
    expect(result.message).toContain("Sound System");
    expect(result.message).toContain("8000");
    expect(db.update).toHaveBeenCalled();
    expect(mockChain.set).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/entry");
  });

  it("returns error for invalid transaction ID", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);

    const fd = createFormData({
      id: "abc",
      date: "2025-10-01",
      name: "Flowers",
      amount: "500",
      type: "expenditure",
      description: "",
      eventId: "1",
    });

    const result = await updateTransaction(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/invalid transaction id/i);
  });

  it("returns validation error for invalid data", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);

    const fd = createFormData({
      id: "1",
      date: "",
      name: "",
      amount: "",
      type: "",
      description: "",
      eventId: "",
    });

    const result = await updateTransaction(initialState, fd);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/validation/i);
  });
});

// ---- deleteTransaction -----------------------------------------------------

describe("deleteTransaction", () => {
  it("returns unauthorized when session is not valid", async () => {
    vi.mocked(verifySession).mockResolvedValue(false);

    const result = await deleteTransaction(1);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/unauthorized/i);
  });

  it("deletes the transaction and returns success", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);

    const result = await deleteTransaction(42);

    expect(result.status).toBe("success");
    expect(result.message).toMatch(/deleted/i);
    expect(db.delete).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/entry");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/reports");
  });

  it("returns error when DB throws", async () => {
    vi.mocked(verifySession).mockResolvedValue(true);
    mockChain.run.mockImplementation(() => {
      throw new Error("DB_FAILURE");
    });

    const result = await deleteTransaction(1);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/failed/i);
  });
});

// ---- deleteAllTransactions -------------------------------------------------

describe("deleteAllTransactions", () => {
  it("returns permission error for non-superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const result = await deleteAllTransactions(1);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/superadmin/i);
  });

  it("deletes all transactions for the event when superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const result = await deleteAllTransactions(3);

    expect(result.status).toBe("success");
    expect(result.message).toMatch(/deleted/i);
    expect(db.delete).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
    expect(revalidatePath).toHaveBeenCalledWith("/entry");
    expect(revalidatePath).toHaveBeenCalledWith("/");
    expect(revalidatePath).toHaveBeenCalledWith("/reports");
  });

  it("returns error when DB throws", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    mockChain.run.mockImplementation(() => {
      throw new Error("DB_FAILURE");
    });

    const result = await deleteAllTransactions(1);

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/failed/i);
  });
});

// ---- resetUserPassword -----------------------------------------------------

describe("resetUserPassword", () => {
  it("returns permission error for non-superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const result = await resetUserPassword("someuser");

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/superadmin/i);
  });

  it("returns error when target is superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");

    const result = await resetUserPassword("superadmin");

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/cannot reset superadmin/i);
  });

  it("returns error when user is not found", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    mockChain.get.mockReturnValue(undefined);

    const result = await resetUserPassword("ghost");

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/not found/i);
  });

  it("resets the password to the username hash and returns success", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    mockChain.get.mockReturnValue({ username: "volunteer", passwordHash: "oldhash" });

    const result = await resetUserPassword("volunteer");

    expect(result.status).toBe("success");
    expect(result.message).toMatch(/reset/i);
    expect(result.message).toContain("volunteer");
    expect(db.update).toHaveBeenCalled();
    expect(mockChain.set).toHaveBeenCalled();
    expect(mockChain.run).toHaveBeenCalled();
  });

  it("returns error when DB throws during update", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    mockChain.get.mockReturnValue({ username: "volunteer", passwordHash: "oldhash" });
    mockChain.run.mockImplementation(() => {
      throw new Error("DB_FAILURE");
    });

    const result = await resetUserPassword("volunteer");

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/failed/i);
  });
});

// ---- getAllUsers ------------------------------------------------------------

describe("getAllUsers", () => {
  it("returns empty array for non-superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("admin");

    const result = await getAllUsers();

    expect(result).toEqual([]);
  });

  it("returns empty array when getSessionUser returns null", async () => {
    vi.mocked(getSessionUser).mockResolvedValue(null);

    const result = await getAllUsers();

    expect(result).toEqual([]);
  });

  it("returns user list excluding superadmin when user is superadmin", async () => {
    vi.mocked(getSessionUser).mockResolvedValue("superadmin");
    mockChain.all.mockReturnValue([
      { username: "admin" },
      { username: "superadmin" },
      { username: "volunteer" },
    ]);

    const result = await getAllUsers();

    expect(result).toEqual([
      { username: "admin" },
      { username: "volunteer" },
    ]);
    expect(result.find((u) => u.username === "superadmin")).toBeUndefined();
  });
});
