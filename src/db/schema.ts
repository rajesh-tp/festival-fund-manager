import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").default(""),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;

export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    name: text("name").notNull(),
    amount: real("amount").notNull(),
    type: text("type", { enum: ["income", "expenditure"] }).notNull(),
    paymentMode: text("payment_mode", { enum: ["cash", "bank"] })
      .notNull()
      .default("cash"),
    description: text("description").default(""),
    eventId: integer("event_id").references(() => events.id),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => [
    index("idx_transactions_date").on(table.date),
    index("idx_transactions_type").on(table.type),
    index("idx_transactions_date_type").on(table.date, table.type),
    index("idx_transactions_event_id").on(table.eventId),
  ]
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export type User = typeof users.$inferSelect;
