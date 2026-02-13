import { z } from "zod/v4";

export const transactionSchema = z.object({
  date: z.string().min(1, "Date is required"),
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  type: z.enum(["income", "expenditure"], {
    error: "Please select Income or Expenditure",
  }),
  description: z.string().max(500).optional().default(""),
  eventId: z.coerce.number().int().positive("Event is required"),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const eventSchema = z.object({
  name: z.string().min(1, "Event name is required").max(200, "Name is too long"),
  description: z.string().max(500).optional().default(""),
});

export type EventFormData = z.infer<typeof eventSchema>;
