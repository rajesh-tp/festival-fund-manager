import { transactionSchema, eventSchema } from "@/lib/validators";

describe("transactionSchema", () => {
  const validData = {
    date: "2025-01-15",
    name: "Donation from Rahul",
    amount: 500,
    type: "income" as const,
    description: "Monthly contribution",
    eventId: 1,
  };

  it("passes with valid complete data", () => {
    const result = transactionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when date is missing (empty string)", () => {
    const result = transactionSchema.safeParse({ ...validData, date: "" });
    expect(result.success).toBe(false);
  });

  it("fails when name is missing (empty string)", () => {
    const result = transactionSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("fails when amount is 0", () => {
    const result = transactionSchema.safeParse({ ...validData, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("fails when amount is negative", () => {
    const result = transactionSchema.safeParse({ ...validData, amount: -100 });
    expect(result.success).toBe(false);
  });

  it("coerces a string amount to a number", () => {
    const result = transactionSchema.safeParse({ ...validData, amount: "250" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.amount).toBe(250);
    }
  });

  it("fails with an invalid type value", () => {
    const result = transactionSchema.safeParse({ ...validData, type: "transfer" });
    expect(result.success).toBe(false);
  });

  it("passes with type 'income'", () => {
    const result = transactionSchema.safeParse({ ...validData, type: "income" });
    expect(result.success).toBe(true);
  });

  it("passes with type 'expenditure'", () => {
    const result = transactionSchema.safeParse({ ...validData, type: "expenditure" });
    expect(result.success).toBe(true);
  });

  it("makes description optional and defaults to empty string", () => {
    const { description, ...dataWithoutDesc } = validData;
    const result = transactionSchema.safeParse(dataWithoutDesc);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });

  it("fails when name exceeds 100 characters", () => {
    const result = transactionSchema.safeParse({
      ...validData,
      name: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("coerces eventId from a string to a number", () => {
    const result = transactionSchema.safeParse({ ...validData, eventId: "5" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.eventId).toBe(5);
    }
  });
});

describe("eventSchema", () => {
  const validData = {
    name: "Diwali Celebration",
    description: "Annual festival event",
  };

  it("passes with valid data", () => {
    const result = eventSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when name is empty", () => {
    const result = eventSchema.safeParse({ ...validData, name: "" });
    expect(result.success).toBe(false);
  });

  it("fails when name exceeds 200 characters", () => {
    const result = eventSchema.safeParse({
      ...validData,
      name: "A".repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it("makes description optional and defaults to empty string", () => {
    const result = eventSchema.safeParse({ name: "Holi Festival" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBe("");
    }
  });
});
