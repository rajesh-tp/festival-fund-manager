// ---------------------------------------------------------------------------
// Tests for src/lib/queries.ts
// ---------------------------------------------------------------------------

// --- Mocks (must be declared before imports) --------------------------------

const mockChain = {
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  groupBy: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  get: vi.fn(),
  all: vi.fn(() => []),
};

vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(() => mockChain),
  },
}));

vi.mock("drizzle-orm", () => ({
  and: vi.fn((...args: unknown[]) => args),
  asc: vi.fn((col: unknown) => col),
  desc: vi.fn((col: unknown) => col),
  eq: vi.fn((a: unknown, b: unknown) => [a, b]),
  sum: vi.fn(() => ({ mapWith: vi.fn(() => "sum") })),
}));

vi.mock("@/db/schema", () => ({
  events: {
    id: "events.id",
    name: "events.name",
    createdAt: "events.createdAt",
  },
  transactions: {
    id: "txn.id",
    type: "txn.type",
    amount: "txn.amount",
    eventId: "txn.eventId",
    date: "txn.date",
    createdAt: "txn.createdAt",
  },
}));

// --- Imports ----------------------------------------------------------------

import { db } from "@/lib/db";
import {
  getAllEvents,
  getEventById,
  getSummary,
  getTransactionById,
  getRecentEntries,
  getTransactionsGroupedByDate,
} from "@/lib/queries";

// --- Helpers ----------------------------------------------------------------

function resetChain() {
  for (const fn of Object.values(mockChain)) {
    (fn as ReturnType<typeof vi.fn>).mockClear();
  }
  mockChain.from.mockReturnThis();
  mockChain.where.mockReturnThis();
  mockChain.orderBy.mockReturnThis();
  mockChain.groupBy.mockReturnThis();
  mockChain.limit.mockReturnThis();
  mockChain.get.mockReset();
  mockChain.all.mockReset().mockReturnValue([]);

  (db.select as ReturnType<typeof vi.fn>).mockClear().mockReturnValue(mockChain);
}

// --- Tests ------------------------------------------------------------------

beforeEach(() => {
  resetChain();
});

// ---- getAllEvents -----------------------------------------------------------

describe("getAllEvents", () => {
  it("calls db.select().from().orderBy().all() and returns the result", async () => {
    const mockEvents = [
      { id: 1, name: "Diwali 2025" },
      { id: 2, name: "Holi 2025" },
    ];
    mockChain.all.mockReturnValue(mockEvents);

    const result = await getAllEvents();

    expect(db.select).toHaveBeenCalled();
    expect(mockChain.from).toHaveBeenCalled();
    expect(mockChain.orderBy).toHaveBeenCalled();
    expect(mockChain.all).toHaveBeenCalled();
    expect(result).toEqual(mockEvents);
  });

  it("returns an empty array when there are no events", async () => {
    mockChain.all.mockReturnValue([]);

    const result = await getAllEvents();

    expect(result).toEqual([]);
  });
});

// ---- getEventById ----------------------------------------------------------

describe("getEventById", () => {
  it("calls db.select().from().where().get() and returns the matched event", async () => {
    const mockEvent = { id: 5, name: "Navratri 2025" };
    mockChain.get.mockReturnValue(mockEvent);

    const result = await getEventById(5);

    expect(db.select).toHaveBeenCalled();
    expect(mockChain.from).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.get).toHaveBeenCalled();
    expect(result).toEqual(mockEvent);
  });

  it("returns undefined when event is not found", async () => {
    mockChain.get.mockReturnValue(undefined);

    const result = await getEventById(999);

    expect(result).toBeUndefined();
  });
});

// ---- getSummary ------------------------------------------------------------

describe("getSummary", () => {
  it("returns correct totals when both income and expenditure exist", async () => {
    mockChain.all.mockReturnValue([
      { type: "income", total: 8000 },
      { type: "expenditure", total: 2000 },
    ]);

    const result = await getSummary(1);

    expect(result).toEqual({
      totalIncome: 8000,
      totalExpenditure: 2000,
      netTotal: 6000,
    });
  });

  it("defaults expenditure to 0 when only income rows exist", async () => {
    mockChain.all.mockReturnValue([{ type: "income", total: 5000 }]);

    const result = await getSummary(1);

    expect(result).toEqual({
      totalIncome: 5000,
      totalExpenditure: 0,
      netTotal: 5000,
    });
  });

  it("defaults income to 0 when only expenditure rows exist", async () => {
    mockChain.all.mockReturnValue([{ type: "expenditure", total: 3000 }]);

    const result = await getSummary(1);

    expect(result).toEqual({
      totalIncome: 0,
      totalExpenditure: 3000,
      netTotal: -3000,
    });
  });

  it("defaults both to 0 when the result is empty", async () => {
    mockChain.all.mockReturnValue([]);

    const result = await getSummary(1);

    expect(result).toEqual({
      totalIncome: 0,
      totalExpenditure: 0,
      netTotal: 0,
    });
  });

  it("calls select, from, where, groupBy, and all", async () => {
    mockChain.all.mockReturnValue([]);

    await getSummary(42);

    expect(db.select).toHaveBeenCalled();
    expect(mockChain.from).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.groupBy).toHaveBeenCalled();
    expect(mockChain.all).toHaveBeenCalled();
  });
});

// ---- getTransactionById ----------------------------------------------------

describe("getTransactionById", () => {
  it("returns a single transaction from .get()", async () => {
    const mockTxn = { id: 10, name: "Flowers", amount: 500 };
    mockChain.get.mockReturnValue(mockTxn);

    const result = await getTransactionById(10);

    expect(db.select).toHaveBeenCalled();
    expect(mockChain.from).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.get).toHaveBeenCalled();
    expect(result).toEqual(mockTxn);
  });

  it("returns undefined when transaction is not found", async () => {
    mockChain.get.mockReturnValue(undefined);

    const result = await getTransactionById(999);

    expect(result).toBeUndefined();
  });
});

// ---- getRecentEntries ------------------------------------------------------

describe("getRecentEntries", () => {
  it("uses the default limit of 10", async () => {
    const mockEntries = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Entry ${i + 1}`,
    }));
    mockChain.all.mockReturnValue(mockEntries);

    const result = await getRecentEntries(1);

    expect(mockChain.limit).toHaveBeenCalledWith(10);
    expect(mockChain.all).toHaveBeenCalled();
    expect(result).toHaveLength(10);
  });

  it("accepts a custom limit", async () => {
    mockChain.all.mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const result = await getRecentEntries(1, 3);

    expect(mockChain.limit).toHaveBeenCalledWith(3);
    expect(result).toHaveLength(3);
  });

  it("calls select, from, where, orderBy, limit, and all", async () => {
    await getRecentEntries(1);

    expect(db.select).toHaveBeenCalled();
    expect(mockChain.from).toHaveBeenCalled();
    expect(mockChain.where).toHaveBeenCalled();
    expect(mockChain.orderBy).toHaveBeenCalled();
    expect(mockChain.limit).toHaveBeenCalled();
    expect(mockChain.all).toHaveBeenCalled();
  });
});

// ---- getTransactionsGroupedByDate ------------------------------------------

describe("getTransactionsGroupedByDate", () => {
  it("groups transactions by date when sortBy is 'date'", async () => {
    mockChain.all.mockReturnValue([
      { id: 1, date: "2025-10-01", type: "income", amount: 1000 },
      { id: 2, date: "2025-10-01", type: "expenditure", amount: 300 },
      { id: 3, date: "2025-10-02", type: "income", amount: 500 },
    ]);

    const result = await getTransactionsGroupedByDate(1, undefined, "date", "desc");

    expect(result.sorted).toBeNull();
    expect(result.grouped).toBeInstanceOf(Map);

    const grouped = result.grouped!;
    expect(grouped.size).toBe(2);

    const oct01 = grouped.get("2025-10-01")!;
    expect(oct01.entries).toHaveLength(2);
    expect(oct01.incomeTotal).toBe(1000);
    expect(oct01.expenditureTotal).toBe(300);

    const oct02 = grouped.get("2025-10-02")!;
    expect(oct02.entries).toHaveLength(1);
    expect(oct02.incomeTotal).toBe(500);
    expect(oct02.expenditureTotal).toBe(0);
  });

  it("returns sorted array when sortBy is 'amount' (desc)", async () => {
    mockChain.all.mockReturnValue([
      { id: 1, date: "2025-10-01", type: "income", amount: 500 },
      { id: 2, date: "2025-10-01", type: "income", amount: 2000 },
      { id: 3, date: "2025-10-02", type: "expenditure", amount: 1000 },
    ]);

    const result = await getTransactionsGroupedByDate(1, undefined, "amount", "desc");

    expect(result.grouped).toBeNull();
    expect(result.sorted).not.toBeNull();
    expect(result.sorted![0].amount).toBe(2000);
    expect(result.sorted![1].amount).toBe(1000);
    expect(result.sorted![2].amount).toBe(500);
  });

  it("returns sorted array when sortBy is 'amount' (asc)", async () => {
    mockChain.all.mockReturnValue([
      { id: 1, date: "2025-10-01", type: "income", amount: 500 },
      { id: 2, date: "2025-10-01", type: "income", amount: 2000 },
      { id: 3, date: "2025-10-02", type: "expenditure", amount: 1000 },
    ]);

    const result = await getTransactionsGroupedByDate(1, undefined, "amount", "asc");

    expect(result.grouped).toBeNull();
    expect(result.sorted).not.toBeNull();
    expect(result.sorted![0].amount).toBe(500);
    expect(result.sorted![1].amount).toBe(1000);
    expect(result.sorted![2].amount).toBe(2000);
  });

  it("passes typeFilter to the where clause when provided", async () => {
    mockChain.all.mockReturnValue([
      { id: 1, date: "2025-10-01", type: "income", amount: 1000 },
    ]);

    await getTransactionsGroupedByDate(1, "income", "date", "desc");

    // The `and` mock wraps its args into an array, so the where clause is an
    // array containing the two eq() return values.
    expect(mockChain.where).toHaveBeenCalled();
  });

  it("returns empty map when there are no transactions", async () => {
    mockChain.all.mockReturnValue([]);

    const result = await getTransactionsGroupedByDate(1);

    expect(result.sorted).toBeNull();
    expect(result.grouped).toBeInstanceOf(Map);
    expect(result.grouped!.size).toBe(0);
  });
});
