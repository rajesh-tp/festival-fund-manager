import type { Event, Transaction } from "@/db/schema";

export const mockEvent: Event = {
  id: 1,
  name: "Ayyappa Festival 2026",
  description: "Annual festival",
  isActive: true,
  createdAt: new Date("2026-01-01"),
};

export const mockEvent2: Event = {
  id: 2,
  name: "Navratri 2026",
  description: "",
  isActive: true,
  createdAt: new Date("2026-02-01"),
};

export const mockEvents: Event[] = [mockEvent, mockEvent2];

export const mockTransaction: Transaction = {
  id: 1,
  date: "2026-01-15",
  name: "Rajesh Kumar",
  amount: 5000,
  type: "income",
  description: "Donation",
  eventId: 1,
  createdAt: new Date("2026-01-15"),
};

export const mockTransactions: Transaction[] = [
  mockTransaction,
  {
    id: 2,
    date: "2026-01-15",
    name: "Flower Shop",
    amount: 2000,
    type: "expenditure",
    description: "Flowers for pooja",
    eventId: 1,
    createdAt: new Date("2026-01-15"),
  },
  {
    id: 3,
    date: "2026-01-16",
    name: "Suresh",
    amount: 3000,
    type: "income",
    description: "",
    eventId: 1,
    createdAt: new Date("2026-01-16"),
  },
];

export const mockSummary = {
  totalIncome: 8000,
  totalExpenditure: 2000,
  netTotal: 6000,
};

export function createFormData(data: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    fd.set(key, value);
  }
  return fd;
}
