import { db } from "@/lib/db";
import { events, transactions, type Transaction } from "@/db/schema";
import { and, asc, desc, eq, sum } from "drizzle-orm";

// --- Event Queries ---

export async function getAllEvents() {
  return db.select().from(events).orderBy(desc(events.createdAt)).all();
}

export async function getEventById(id: number) {
  return db.select().from(events).where(eq(events.id, id)).get();
}

// --- Transaction Queries (scoped to event) ---

export type PaymentModeFilter = "cash" | "bank";

export async function getSummary(eventId: number, paymentModeFilter?: PaymentModeFilter) {
  const conditions = [eq(transactions.eventId, eventId)];
  if (paymentModeFilter) {
    conditions.push(eq(transactions.paymentMode, paymentModeFilter));
  }

  const result = db
    .select({
      type: transactions.type,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
    .where(and(...conditions))
    .groupBy(transactions.type)
    .all();

  const income = result.find((r) => r.type === "income")?.total ?? 0;
  const expenditure = result.find((r) => r.type === "expenditure")?.total ?? 0;

  return {
    totalIncome: income,
    totalExpenditure: expenditure,
    netTotal: income - expenditure,
  };
}

export async function getTransactionById(id: number) {
  return db.select().from(transactions).where(eq(transactions.id, id)).get();
}

export async function getRecentEntries(eventId: number, limit = 10) {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.eventId, eventId))
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .all();
}

export type DateGroupData = {
  entries: Transaction[];
  incomeTotal: number;
  expenditureTotal: number;
};

export type SortField = "date" | "amount";
export type SortOrder = "asc" | "desc";

export async function getTransactionsGroupedByDate(
  eventId: number,
  typeFilter?: "income" | "expenditure",
  sortBy: SortField = "date",
  sortOrder: SortOrder = "desc",
  paymentModeFilter?: PaymentModeFilter
) {
  const orderFn = sortOrder === "asc" ? asc : desc;

  const conditions = [eq(transactions.eventId, eventId)];
  if (typeFilter) {
    conditions.push(eq(transactions.type, typeFilter));
  }
  if (paymentModeFilter) {
    conditions.push(eq(transactions.paymentMode, paymentModeFilter));
  }
  const whereClause = and(...conditions);

  const rows = db
    .select()
    .from(transactions)
    .where(whereClause)
    .orderBy(orderFn(transactions.date), desc(transactions.createdAt))
    .all();

  if (sortBy === "amount") {
    rows.sort((a, b) =>
      sortOrder === "asc" ? a.amount - b.amount : b.amount - a.amount
    );

    return { sorted: rows, grouped: null };
  }

  const grouped = new Map<string, DateGroupData>();

  for (const row of rows) {
    if (!grouped.has(row.date)) {
      grouped.set(row.date, { entries: [], incomeTotal: 0, expenditureTotal: 0 });
    }
    const group = grouped.get(row.date)!;
    group.entries.push(row);
    if (row.type === "income") {
      group.incomeTotal += row.amount;
    } else {
      group.expenditureTotal += row.amount;
    }
  }

  return { sorted: null, grouped };
}
