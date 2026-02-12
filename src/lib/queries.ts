import { db } from "@/lib/db";
import { transactions, type Transaction } from "@/db/schema";
import { desc, eq, sum } from "drizzle-orm";

export async function getSummary() {
  const result = db
    .select({
      type: transactions.type,
      total: sum(transactions.amount).mapWith(Number),
    })
    .from(transactions)
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

export async function getRecentEntries(limit = 10) {
  return db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(limit)
    .all();
}

export type DateGroupData = {
  entries: Transaction[];
  incomeTotal: number;
  expenditureTotal: number;
};

export async function getTransactionsGroupedByDate(
  typeFilter?: "income" | "expenditure"
) {
  let query = db
    .select()
    .from(transactions)
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  const rows = typeFilter
    ? query.where(eq(transactions.type, typeFilter)).all()
    : query.all();

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

  return grouped;
}
